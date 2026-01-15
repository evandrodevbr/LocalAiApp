import os
import yaml
import psutil
from abc import ABC, abstractmethod
from concurrent.futures import ThreadPoolExecutor
from huggingface_hub import hf_hub_download
from llama_cpp import Llama

# --- Camada de Abstração (Interface) ---
class AIModelEngine(ABC):
    @abstractmethod
    def generate_stream(self, prompt: str):
        pass

    @abstractmethod
    def reset_context(self):
        pass

# --- Gerenciador de Recursos de Engenharia ---
class ResourceManager:
    @staticmethod
    def get_optimal_threads() -> int:
        # Prioriza núcleos físicos para evitar perdas por troca de contexto de hardware (SMT/Hyper-Threading)
        physical_cores = psutil.cpu_count(logical=False)
        return max(1, physical_cores - 1)

    @staticmethod
    def get_available_ram_mb() -> int:
        return psutil.virtual_memory().available // (1024 * 1024)

# --- Implementação Llama-CPP ---
class LlamaCPPEngine(AIModelEngine):
    def __init__(self, config: dict, model_path: str):
        threads = ResourceManager.get_optimal_threads()
        
        self.llm = Llama(
            model_path=model_path,
            n_ctx=config.get('context_window', 2048),
            n_threads=threads,
            n_gpu_layers=0,  # Auto-ajuste para estabilidade inicial
            n_batch=512,
            verbose=False
        )
        self.history = []
        self.config = config

    def generate_stream(self, user_input: str):
        self.history.append({"role": "user", "content": user_input})
        
        # Implementação de Sliding Window rudimentar (mantém últimos 5 turnos)
        if len(self.history) > 10:
            self.history = self.history[-10:]

        try:
            stream = self.llm.create_chat_completion(
                messages=self.history,
                stream=True,
                temperature=self.config.get('temperature', 0.1),
                max_tokens=self.config.get('max_tokens', 512)
            )
            
            full_response = ""
            for chunk in stream:
                delta = chunk['choices'][0].get('delta', {})
                if 'content' in delta:
                    token = delta['content']
                    full_response += token
                    yield token
            
            self.history.append({"role": "assistant", "content": full_response})
            
        except Exception as e:
            self.reset_context()
            yield f"\n[ERRO CRÍTICO]: {str(e)}. Memória de contexto limpa."

    def reset_context(self):
        self.history = []
        self.llm.reset()

# --- Engine Factory ---
class EngineFactory:
    @staticmethod
    def create_engine(model_key: str, config_path: str, models_dir: str) -> AIModelEngine:
        with open(config_path, 'r') as f:
            config = yaml.safe_load(f)['models'][model_key]

        model_path = hf_hub_download(
            repo_id=config['repo_id'],
            filename=config['filename'],
            local_dir=models_dir
        )

        if config['type'] == 'llama-cpp':
            return LlamaCPPEngine(config, model_path)
        raise ValueError("Tipo de modelo não suportado.")

# --- Loop Principal com Threading ---
def main():
    MODELS_DIR = "./src-python/app/models"
    CONFIG_FILE = "modelConfig.yaml"
    
    print(f"[Sistema]: Detectando Hardware... Threads Otimizadas: {ResourceManager.get_optimal_threads()}")
    print(f"[Sistema]: RAM Disponível: {ResourceManager.get_available_ram_mb()} MB")

    engine = EngineFactory.create_engine('lfm_2.5_1.2b', CONFIG_FILE, MODELS_DIR)
    
    # Executor para gerenciar inferência fora da Main Thread
    with ThreadPoolExecutor(max_workers=1) as executor:
        while True:
            try:
                user_in = input("\n[Você]: ").strip()
                if user_in.lower() in ['sair', 'exit']: break
                if user_in.lower() == 'clear':
                    engine.reset_context()
                    print("Contexto resetado.")
                    continue
                if not user_in: continue

                print("[IA]: ", end="", flush=True)
                
                # Executa a geração em thread separada para não bloquear o poll de IO do sistema
                future = executor.submit(list, engine.generate_stream(user_in))
                
                # Enquanto a thread processa, podemos exibir o stream
                # Nota: Para stream real em thread, usaríamos filas (Queue), 
                # aqui simplificamos o consumo do gerador.
                for token in engine.generate_stream(user_in):
                    print(token, end="", flush=True)
                print()

            except KeyboardInterrupt:
                break

if __name__ == "__main__":
    main()