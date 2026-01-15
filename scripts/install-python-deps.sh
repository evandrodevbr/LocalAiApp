#!/bin/bash
# Script Bash para instalar dependências Python antes de executar

set -e

REQUIREMENTS_PATH="${1:-src-python/requirements.txt}"
PYTHON_CMD="${2:-python3}"

# Resolve caminho absoluto
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REQUIREMENTS_FILE="$SCRIPT_DIR/../$REQUIREMENTS_PATH"

if [ ! -f "$REQUIREMENTS_FILE" ]; then
    echo "[Python Deps] ERRO: Arquivo não encontrado: $REQUIREMENTS_FILE" >&2
    exit 1
fi

echo "[Python Deps] Verificando dependências em: $REQUIREMENTS_FILE"

# Verifica se pip está disponível
if ! $PYTHON_CMD -m pip --version >/dev/null 2>&1; then
    echo "[Python Deps] ERRO: pip não encontrado. Instale Python com pip." >&2
    exit 1
fi

# Instala dependências
echo "[Python Deps] Instalando dependências..."
$PYTHON_CMD -m pip install --quiet --upgrade pip
$PYTHON_CMD -m pip install --quiet -r "$REQUIREMENTS_FILE"

if [ $? -eq 0 ]; then
    echo "[Python Deps] Dependências instaladas com sucesso."
else
    echo "[Python Deps] ERRO: Falha ao instalar dependências." >&2
    exit 1
fi
