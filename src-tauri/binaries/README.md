# Binários do Sidecar

Esta pasta contém os binários compilados do engine-backend (Python).

## Compilação

### Linux (Manjaro)
```bash
pip install pyinstaller
pyinstaller --onefile --name engine-backend-x86_64-unknown-linux-gnu src-python/app/api_server.py
mv dist/engine-backend-x86_64-unknown-linux-gnu binaries/
```

### Windows
```powershell
pip install pyinstaller
pyinstaller --onefile --name engine-backend-x86_64-pc-windows-msvc src-python/app/api_server.py
move dist\engine-backend-x86_64-pc-windows-msvc.exe binaries\
```

**Nota:** O Tauri adicionará automaticamente a extensão `.exe` no Windows durante o build.
