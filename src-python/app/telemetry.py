import psutil
import os
import shutil

# GPUtil é opcional (requer distutils, removido no Python 3.12+)
try:
    import GPUtil
    HAS_GPUTIL = True
except ImportError:
    HAS_GPUTIL = False

class SystemTelemetry:
    @staticmethod
    def get_stats():
        # CPU
        cpu_usage = psutil.cpu_percent(interval=None)
        
        # RAM
        ram = psutil.virtual_memory()
        
        # GPU (Pega a primeira disponível)
        gpu_data = {"usage": 0, "vram_used": 0, "vram_total": 0}
        if HAS_GPUTIL:
            try:
                gpus = GPUtil.getGPUs()
                if gpus:
                    gpu_data = {
                        "usage": gpus[0].load * 100,
                        "vram_used": gpus[0].memoryUsed,
                        "vram_total": gpus[0].memoryTotal
                    }
            except Exception:
                pass  # Fallback silencioso se GPUtil falhar

        # Armazenamento (Partição do App)
        total, used, free = shutil.disk_usage("./")

        return {
            "cpu": cpu_usage,
            "ram_used": ram.used / (1024**3),
            "ram_total": ram.total / (1024**3),
            "gpu": gpu_data,
            "disk_free_gb": free / (1024**3)
        }