# localaiapp

O **localaiapp** é um orquestrador de inteligência artificial local de alta performance, construído sobre a stack **Tauri (Rust)** para o core, **Preact** para a interface de usuário de baixo footprint, e **Python (Llama)** como motor de inferência via Sidecar.

---

## 1. Abordagem de Princípios Primeiros (Arquitetura)

A escolha do modelo **Sidecar** em detrimento de um servidor local (HTTP) baseia-se na **eficiência de IPC (Inter-Process Communication)** e **gestão de ciclo de vida**:

- **Isolamento de Processo:** O motor de IA (Python) roda como um processo filho binário. Se a inferência travar, o core em Rust pode reiniciá-lo sem derrubar a UI.
- **Segurança de Memória:** O Rust atua como um "vigia", garantindo que os recursos de GPU/RAM consumidos pelo Llama sejam liberados imediatamente após o encerramento do app.
- **Distribuição:** Ao compilar o Python com Nuitka ou PyInstaller, eliminamos a necessidade de o usuário final ter o Python instalado no sistema.

---

## 2. Setup do Ambiente de Desenvolvimento

### Pré-requisitos de Engenharia

| Componente          | Windows (PowerShell)           | Manjaro Linux (Pacman/Pamac)    |
| ------------------- | ------------------------------ | ------------------------------- |
| **Rust**            | `rustup` (MSVC toolchain)      | `rustup` ou `pacman -S rust`    |
| **Node.js**         | `winget install OpenJS.NodeJS` | `sudo pacman -S nodejs npm`     |
| **C++ Build Tools** | Visual Studio Build Tools 2022 | `sudo pacman -S base-devel`     |
| **Webview Engine**  | WebView2 (Nativo)              | `sudo pacman -S webkit2gtk-4.1` |
| **Python Tooling**  | `python -m pip install nuitka` | `sudo pacman -S python-pip`     |

### Instalação e Inicialização

1. **Clone o repositório:**

```bash
git clone https://github.com/seu-usuario/localaiapp.git
cd localaiapp

```

2. **Instale as dependências do Frontend:**

```bash
npm install

```

3. **Preparação do Sidecar (Python):**
   > **Nota Crítica:** O Tauri exige que o binário sidecar siga a nomenclatura `[nome]-[target-triple]`.

```bash
# Exemplo de comando para gerar o binário (dentro da pasta /src-python)
python -m Nuitka --standalone --onefile main.py

```

---

## 3. Estrutura do Projeto

```plaintext
localaiapp/
├── src/                # Frontend (Preact + Typescript)
│   ├── components/     # Componentes atômicos
│   └── main.tsx        # Entry point do Preact
├── src-tauri/          # Core do Sistema (Rust)
│   ├── bin/            # Binários Sidecar (Python compilado)
│   ├── src/            # Lógica de ponte Rust-UI
│   └── tauri.conf.json # Configuração de permissões e sidecars
├── src-python/         # Motor de IA (Llama-cpp-python)
│   ├── main.py         # Script principal de inferência
│   └── requirements.txt
└── public/             # Assets estáticos

```

---

## 4. Fluxo de Execução (Engenharia de Dados)

1. **Frontend (Preact):** Dispara um evento `invoke('start_inference', { prompt: '...' })`.
2. **Bridge (Rust):** O Tauri recebe o comando, valida os parâmetros e comunica-se via `stdin` ou `localhost socket` com o processo Sidecar.
3. **Sidecar (Python):** O Llama processa os tensores, gera o stream de tokens e devolve ao Rust.
4. **Update (UI):** O Preact utiliza **Signals** para atualizar a interface em tempo real com o mínimo de re-renders.

---

## 5. Roadmap de Desenvolvimento

- [x] Setup Inicial (Tauri + Preact + TS)
- [ ] Implementação do Sidecar Llama (C++ Bindings)
- [ ] Suporte a Aceleração de Hardware (CUDA/Vulkan)
- [ ] **Futuro:** Módulo de Web Search (Integração de busca via Python e extração de contexto).

---

## 6. Verificação de Lacunas (Common Pitfalls)

- **PATH no Windows:** Certifique-se de que o compilador C++ está no PATH, ou o Tauri não conseguirá compilar os bindings do Rust.
- **Permissões no Linux:** No Manjaro, o WebKitGTK pode exigir permissões específicas de sandbox dependendo da versão do Kernel.
- **Sidecar Naming:** O erro mais comum é não incluir o _target triple_ (ex: `x86_64-unknown-linux-gnu`) no nome do binário dentro de `src-tauri/bin`.

---

**Como você é um engenheiro e estamos no início, gostaria que eu criasse o script inicial em Python para o Sidecar já com as tipagens básicas ou prefere focar na configuração do `tauri.conf.json` para reconhecer o binário?**
