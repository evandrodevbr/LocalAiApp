# Script PowerShell para instalar dependências Python antes de executar
param(
    [string]$RequirementsPath = "src-python\requirements.txt",
    [string]$PythonCmd = "python"
)

$ErrorActionPreference = "Stop"

# Resolve caminho absoluto
$RequirementsFile = Join-Path $PSScriptRoot "..\$RequirementsPath" | Resolve-Path -ErrorAction Stop

Write-Host "[Python Deps] Verificando dependências em: $RequirementsFile" -ForegroundColor Cyan

# Verifica se pip está disponível
try {
    $pipVersion = & $PythonCmd -m pip --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[Python Deps] ERRO: pip não encontrado. Instale Python com pip." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "[Python Deps] ERRO: Python não encontrado. Verifique se está no PATH." -ForegroundColor Red
    exit 1
}

# Instala dependências
Write-Host "[Python Deps] Instalando dependências..." -ForegroundColor Yellow
& $PythonCmd -m pip install --quiet --upgrade pip
& $PythonCmd -m pip install --quiet -r $RequirementsFile

if ($LASTEXITCODE -eq 0) {
    Write-Host "[Python Deps] Dependências instaladas com sucesso." -ForegroundColor Green
} else {
    Write-Host "[Python Deps] ERRO: Falha ao instalar dependências." -ForegroundColor Red
    exit 1
}
