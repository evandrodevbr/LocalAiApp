"""
Servidor FastAPI para expor telemetria e download de modelos.
Utiliza Server-Sent Events (SSE) para streaming de progresso em tempo real.
"""
import sys
import os
import json
from pathlib import Path
from typing import Dict, List
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio

# Detecta se está rodando como binário ou script
if getattr(sys, 'frozen', False):
    # Caminho do executável (PyInstaller)
    BASE_DIR = os.path.dirname(sys.executable)
    CONFIG_PATH = os.path.join(BASE_DIR, "modelConfig.yaml")
    MODELS_DIR = os.path.join(BASE_DIR, "models")
else:
    # Rodando como script Python
    # Ajusta PYTHONPATH antes dos imports relativos
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(os.path.dirname(script_dir))  # Sobe para raiz do projeto
    if project_root not in sys.path:
        sys.path.insert(0, project_root)
    
    BASE_DIR = project_root
    CONFIG_PATH = os.path.join(BASE_DIR, "modelConfig.yaml")
    MODELS_DIR = os.path.join(BASE_DIR, "src-python", "app", "models")

# Importações relativas (funcionam quando executado como módulo)
from .telemetry import SystemTelemetry
from .model_downloader import ModelDownloader

app = FastAPI(title="LocalAI API", version="1.0.0")

# CORS para permitir comunicação com frontend Tauri
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, restringir ao localhost
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Instâncias globais
downloader = ModelDownloader(models_dir=MODELS_DIR)

# Modelos de dados
class ModelInfo(BaseModel):
    id: str
    name: str
    quant: str
    size_gb: float
    repo: str
    filename: str
    description: str

class DownloadRequest(BaseModel):
    model_id: str
    repo_id: str
    filename: str

# Cache de modelos disponíveis (pode ser carregado de JSON)
MODELS_REGISTRY: List[Dict] = [
    {
        "id": "lfm-2.5-1.2b",
        "name": "Liquid LFM 2.5",
        "quant": "Q6_K",
        "size_gb": 1.12,
        "repo": "LiquidAI/LFM2.5-1.2B-Instruct-GGUF",
        "filename": "LFM2.5-1.2B-Instruct-Q6_K.gguf",
        "description": "Otimizado para arquitetura sequencial de alta performance."
    }
]

@app.get("/api/telemetry")
async def get_telemetry():
    """Retorna telemetria do sistema em tempo real."""
    return SystemTelemetry.get_stats()

@app.get("/api/models")
async def list_models():
    """Lista todos os modelos disponíveis com status de download."""
    models_with_status = []
    for model in MODELS_REGISTRY:
        model_path = downloader.get_model_path(model["repo"], model["filename"])
        model_copy = model.copy()
        model_copy["downloaded"] = model_path.exists() if model_path else False
        models_with_status.append(model_copy)
    return {"models": models_with_status}

@app.post("/api/models/download")
async def download_model(request: DownloadRequest):
    """
    Inicia download de modelo com progresso via SSE.
    O frontend deve consumir como EventSource.
    """
    async def generate_progress():
        try:
            async for progress_event in downloader.download_with_progress(
                repo_id=request.repo_id,
                filename=request.filename
            ):
                yield f"data: {json.dumps(progress_event)}\n\n"
        except Exception as e:
            error_event = {"type": "error", "message": str(e)}
            yield f"data: {json.dumps(error_event)}\n\n"
    
    return StreamingResponse(
        generate_progress(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@app.get("/api/models/{model_id}/status")
async def get_model_status(model_id: str):
    """Verifica se um modelo específico está baixado."""
    model = next((m for m in MODELS_REGISTRY if m["id"] == model_id), None)
    if not model:
        raise HTTPException(status_code=404, detail="Modelo não encontrado")
    
    model_path = downloader.get_model_path(model["repo"], model["filename"])
    return {
        "model_id": model_id,
        "downloaded": model_path.exists() if model_path else False,
        "path": str(model_path) if model_path else None
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
