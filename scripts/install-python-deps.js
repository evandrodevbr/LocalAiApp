// Script cross-platform Node.js para instalar dependências Python
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isWindows = process.platform === 'win32';
const pythonCmd = isWindows ? 'python' : 'python3';
const requirementsPath = path.join(__dirname, '..', 'src-python', 'requirements.txt');

if (!fs.existsSync(requirementsPath)) {
  console.error(`[Python Deps] ERRO: Arquivo não encontrado: ${requirementsPath}`);
  process.exit(1);
}

console.log(`[Python Deps] Verificando dependências em: ${requirementsPath}`);

try {
  // Verifica pip
  execSync(`${pythonCmd} -m pip --version`, { stdio: 'ignore' });
  
  // Atualiza pip
  console.log('[Python Deps] Atualizando pip...');
  execSync(`${pythonCmd} -m pip install --quiet --upgrade pip`, { stdio: 'inherit' });
  
  // Instala dependências
  console.log('[Python Deps] Instalando dependências...');
  execSync(`${pythonCmd} -m pip install --quiet -r "${requirementsPath}"`, { stdio: 'inherit' });
  
  console.log('[Python Deps] Dependências instaladas com sucesso.');
} catch (error) {
  console.error('[Python Deps] ERRO: Falha ao instalar dependências.');
  process.exit(1);
}
