import os
import subprocess
import platform
import shutil
import sys

def get_target_triple():
    # Retorna o sufixo exigido pelo Tauri baseado no SO e Arquitetura
    system = platform.system().lower()
    arch = platform.machine().lower()
    
    if system == "windows":
        return "x86_64-pc-windows-msvc"
    elif system == "linux":
        return "x86_64-unknown-linux-gnu"
    return None

def check_pyinstaller():
    """Verifica se PyInstaller está instalado, instala se necessário."""
    try:
        # Tenta usar python -m PyInstaller (sempre funciona se instalado)
        subprocess.run([sys.executable, "-m", "PyInstaller", "--version"], 
                      check=True, 
                      stdout=subprocess.DEVNULL, 
                      stderr=subprocess.DEVNULL)
        return True
    except (FileNotFoundError, subprocess.CalledProcessError):
        print("[Build] PyInstaller não encontrado. Instalando...")
        try:
            subprocess.run([sys.executable, "-m", "pip", "install", "pyinstaller"], 
                          check=True)
            return True
        except subprocess.CalledProcessError:
            print("[Erro] Falha ao instalar PyInstaller")
            return False

def compile():
    triple = get_target_triple()
    if not triple:
        print("[Erro] Sistema operacional não suportado")
        sys.exit(1)
    
    if not check_pyinstaller():
        print("[Erro] PyInstaller não disponível")
        sys.exit(1)
    
    binary_name = f"engine-backend-{triple}"
    if platform.system() == "Windows":
        binary_name += ".exe"

    print(f"[Build] Compilando sidecar para: {triple}...")
    
    # Executa PyInstaller via python -m (garante que funciona mesmo sem PATH)
    cmd = [
        sys.executable,
        "-m", "PyInstaller",
        "--onefile",
        "--name", binary_name,
        "src-python/app/api_server.py"
    ]
    
    try:
        subprocess.run(cmd, check=True)
    except subprocess.CalledProcessError as e:
        print(f"[Erro] Falha ao compilar: {e}")
        sys.exit(1)

    # Garante que a pasta de destino existe
    target_dir = os.path.join("src-tauri", "binaries")
    os.makedirs(target_dir, exist_ok=True)

    # Move o binário da pasta dist para a pasta binaries do Tauri
    source_path = os.path.join("dist", binary_name)
    target_path = os.path.join(target_dir, binary_name)
    
    if os.path.exists(source_path):
        if os.path.exists(target_path):
            os.remove(target_path)
        shutil.move(source_path, target_path)
        print(f"[Success] Sidecar compilado e movido para: {target_path}")
    else:
        print(f"[Erro] Binário não encontrado em: {source_path}")
        sys.exit(1)

if __name__ == "__main__":
    compile()
