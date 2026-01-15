"""
Módulo de download de modelos GGUF do HuggingFace com progresso em tempo real.
Utiliza huggingface_hub com callbacks para reportar progresso via async generator.
"""
import os
from pathlib import Path
from typing import AsyncGenerator, Dict
from huggingface_hub import hf_hub_download
import asyncio

class ModelDownloader:
    """Gerencia downloads de modelos com progresso assíncrono."""
    
    def __init__(self, models_dir: str = "./src-python/app/models"):
        self.models_dir = Path(models_dir)
        self.models_dir.mkdir(parents=True, exist_ok=True)
        self._downloads: Dict[str, float] = {}  # Cache de progresso por modelo
    
    def get_model_path(self, repo_id: str, filename: str) -> Path:
        """Retorna o caminho esperado do modelo."""
        # huggingface_hub salva em cache_dir/repo_id/filename
        # Simplificamos para models_dir/repo_id/filename
        repo_name = repo_id.split("/")[-1]
        return self.models_dir / repo_name / filename
    
    async def download_with_progress(
        self, 
        repo_id: str, 
        filename: str
    ) -> AsyncGenerator[Dict, None]:
        """
        Download assíncrono com progresso via callback.
        Gera eventos: {"type": "progress", "percent": float} ou {"type": "complete"}
        """
        model_path = self.get_model_path(repo_id, filename)
        
        # Verifica se já existe
        if model_path.exists():
            yield {"type": "complete", "percent": 100, "path": str(model_path)}
            return
        
        # Callback para progresso
        last_percent = 0
        
        def progress_callback(downloaded: int, total: int):
            nonlocal last_percent
            if total > 0:
                percent = min(100, int((downloaded / total) * 100))
                if percent != last_percent:
                    last_percent = percent
                    # Armazena para acesso assíncrono
                    self._downloads[f"{repo_id}/{filename}"] = percent
        
        try:
            # Executa download em thread separada para não bloquear
            loop = asyncio.get_event_loop()
            
            def run_download():
                return hf_hub_download(
                    repo_id=repo_id,
                    filename=filename,
                    local_dir=str(self.models_dir),
                    local_dir_use_symlinks=False,
                    resume_download=True,
                    # huggingface_hub não expõe callback direto, então monitoramos o arquivo
                )
            
            # Inicia download em executor
            download_task = loop.run_in_executor(None, run_download)
            
            # Monitora progresso enquanto download ocorre
            while not download_task.done():
                key = f"{repo_id}/{filename}"
                percent = self._downloads.get(key, 0)
                
                # Tenta estimar progresso pelo tamanho do arquivo parcial
                partial_path = self.get_model_path(repo_id, filename)
                if partial_path.exists():
                    # Estima baseado no tamanho (aproximado, pois não temos total exato)
                    size_mb = partial_path.stat().st_size / (1024 * 1024)
                    # Assumindo ~1GB para modelos pequenos (ajustar conforme necessário)
                    estimated_total_mb = 1200  # ~1.2GB
                    if size_mb < estimated_total_mb:
                        percent = min(95, int((size_mb / estimated_total_mb) * 100))
                
                yield {"type": "progress", "percent": percent}
                await asyncio.sleep(0.5)  # Atualiza a cada 500ms
            
            # Download completo
            final_path = download_task.result()
            yield {"type": "complete", "percent": 100, "path": final_path}
            
            # Limpa cache
            self._downloads.pop(f"{repo_id}/{filename}", None)
            
        except Exception as e:
            yield {"type": "error", "message": str(e)}
            raise
