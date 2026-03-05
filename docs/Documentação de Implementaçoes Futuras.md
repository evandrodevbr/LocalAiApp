# Documentação Técnica Completa — LM Studio API

> Baseada na documentação oficial em `lmstudio.ai/docs/developer` [lmstudio](https://lmstudio.ai/docs/developer)

***

## Visão Geral

O LM Studio expõe APIs locais para inferência de LLMs com suporte a múltiplos protocolos: [lmstudio](https://lmstudio.ai/docs/developer)

- **REST API nativa** (`/api/v0`) — stateful, com stats avançados
- **OpenAI-compatible** (`/v1`) — drop-in replacement para projetos existentes
- **Anthropic-compatible** — endpoint Messages
- **SDKs oficiais** — `lmstudio-js` (TypeScript) e `lmstudio-python`
- **CLI** — `lms` para controle headless

O servidor roda por padrão em `http://localhost:1234`. [lmstudio](https://lmstudio.ai/docs/developer/rest/endpoints)

***

## Inicialização do Servidor

### Via App (GUI)
Acesse a aba **"Local Server"** no LM Studio e clique em **Start Server**.

### Via CLI (Headless)
```bash
lms server start
lms server stop
lms server status
```

Para uso em Linux como startup task (systemd), o LM Studio oferece suporte nativo a **Headless Mode**. [lmstudio](https://lmstudio.ai/docs/developer)

***

## Autenticação

A API suporta token Bearer opcional: [lmstudio](https://lmstudio.ai/docs/developer/rest/endpoints)

```bash
# Definir token via variável de ambiente
export LM_API_TOKEN="seu-token-aqui"

# Usar no header
curl http://localhost:1234/api/v0/models \
  -H "Authorization: Bearer $LM_API_TOKEN"
```

Por padrão, a API key pode ser vazia/omitida em ambiente local. [docs.litellm](https://docs.litellm.ai/docs/providers/lm_studio)

***

## REST API v0 (Nativa)

### Base URL
```
http://localhost:1234/api/v0
```

### Endpoints disponíveis [lmstudio](https://lmstudio.ai/docs/developer/rest/endpoints)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/v0/models` | Lista todos os modelos disponíveis |
| `GET` | `/api/v0/models/{model}` | Info de um modelo específico |
| `POST` | `/api/v0/chat/completions` | Chat com histórico de mensagens |
| `POST` | `/api/v0/completions` | Text completion (prompt → texto) |
| `POST` | `/api/v0/embeddings` | Geração de embeddings |

Diferencial desta API: inclui métricas como **tokens/segundo** e **TTFT (Time to First Token)**. [lmstudio](https://lmstudio.ai/docs/developer/rest/endpoints)

***

### GET /api/v0/models

```bash
curl http://localhost:1234/api/v0/models \
  -H "Authorization: Bearer $LM_API_TOKEN"
```

**Resposta:**
```json
{
  "data": [
    {
      "id": "granite-3.0-2b-instruct",
      "object": "model",
      "owned_by": "lmstudio"
    }
  ]
}
```

***

### POST /api/v0/chat/completions

```bash
curl http://localhost:1234/api/v0/chat/completions \
  -H "Authorization: Bearer $LM_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "granite-3.0-2b-instruct",
    "messages": [
      { "role": "system", "content": "Você é um assistente útil." },
      { "role": "user", "content": "Explique recursão." }
    ],
    "temperature": 0.7,
    "max_tokens": 512,
    "stream": false
  }'
```

**Parâmetros principais:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `model` | `string` | ID do modelo carregado |
| `messages` | `array` | Histórico de mensagens (role + content) |
| `temperature` | `float` | Criatividade (0.0–1.0) |
| `max_tokens` | `int` | Limite de tokens na resposta |
| `stream` | `bool` | Streaming SSE (true/false) |
| `stop` | `string\|array` | Token(s) de parada |
| `top_p` | `float` | Nucleus sampling |
| `frequency_penalty` | `float` | Penalidade de repetição |

***

### POST /api/v0/completions (Legacy/Text)

```bash
curl http://localhost:1234/api/v0/completions \
  -H "Authorization: Bearer $LM_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "granite-3.0-2b-instruct",
    "prompt": "O sentido da vida é",
    "temperature": 0.7,
    "max_tokens": 10,
    "stream": false,
    "stop": "\n"
  }'
```



***

### POST /api/v0/embeddings

```bash
curl http://localhost:1234/api/v0/embeddings \
  -H "Authorization: Bearer $LM_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "text-embedding-model",
    "input": "Texto para vetorizar"
  }'
```

**Resposta:**
```json
{
  "object": "list",
  "data": [
    {
      "object": "embedding",
      "embedding": [0.0023, -0.0142, ...],
      "index": 0
    }
  ]
}
```

***

## Streaming (SSE)

Quando `"stream": true`, a resposta retorna eventos Server-Sent Events (SSE): [lmstudio](https://lmstudio.ai/docs/developer)

```python
import httpx, json

url = "http://localhost:1234/api/v0/chat/completions"
payload = {
    "model": "granite-3.0-2b-instruct",
    "messages": [{"role": "user", "content": "Olá!"}],
    "stream": True
}

with httpx.stream("POST", url, json=payload) as r:
    for line in r.iter_lines():
        if line.startswith("data: "):
            chunk = line[6:]
            if chunk == "[DONE]":
                break
            data = json.loads(chunk)
            print(data["choices"][0]["delta"].get("content", ""), end="")
```

***

## OpenAI-Compatible Endpoints (`/v1`)

### Base URL
```
http://localhost:1234/v1
```

### Endpoints disponíveis [lmstudio](https://lmstudio.ai/docs/developer)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/v1/models` | Lista modelos |
| `POST` | `/v1/chat/completions` | Chat completions |
| `POST` | `/v1/completions` | Text completions (legacy) |
| `POST` | `/v1/embeddings` | Embeddings |
| `POST` | `/v1/responses` | Responses API (novo) |

### Uso com SDK OpenAI (Python)

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:1234/v1",
    api_key="lm-studio"  # qualquer string não-vazia
)

response = client.chat.completions.create(
    model="granite-3.0-2b-instruct",
    messages=[
        {"role": "system", "content": "Você é um assistente técnico."},
        {"role": "user", "content": "O que é Big O notation?"}
    ],
    temperature=0.3
)

print(response.choices[0].message.content)
```

### Uso com SDK OpenAI (Node.js/TypeScript)

```typescript
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "http://localhost:1234/v1",
  apiKey: "lm-studio",
});

const response = await client.chat.completions.create({
  model: "granite-3.0-2b-instruct",
  messages: [{ role: "user", content: "Explique ponteiros em C." }],
  temperature: 0.3,
});

console.log(response.choices[0].message.content);
```

***

## Anthropic-Compatible Endpoint

### Base URL
```
http://localhost:1234/anthropic
```

### POST /anthropic/v1/messages [lmstudio](https://lmstudio.ai/docs/developer)

```python
import anthropic

client = anthropic.Anthropic(
    base_url="http://localhost:1234/anthropic",
    api_key="lm-studio"
)

message = client.messages.create(
    model="seu-modelo-local",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Olá!"}]
)
print(message.content)
```

***

## Structured Output (JSON Schema)

O LM Studio suporta saída estruturada via `response_format`: [lmstudio](https://lmstudio.ai/docs/developer)

```python
from openai import OpenAI
import json

client = OpenAI(base_url="http://localhost:1234/v1", api_key="lm-studio")

schema = {
    "type": "object",
    "properties": {
        "nome": {"type": "string"},
        "linguagem": {"type": "string"},
        "complexidade": {"type": "string", "enum": ["baixa", "média", "alta"]}
    },
    "required": ["nome", "linguagem", "complexidade"]
}

response = client.chat.completions.create(
    model="granite-3.0-2b-instruct",
    messages=[{"role": "user", "content": "Descreva o algoritmo quicksort."}],
    response_format={
        "type": "json_schema",
        "json_schema": {
            "name": "algoritmo",
            "schema": schema,
            "strict": True
        }
    }
)

data = json.loads(response.choices[0].message.content)
print(data)
```

***

## Tool Calling / Function Calling

Suporte a agentes com chamada de ferramentas: [lmstudio](https://lmstudio.ai/docs/developer)

```python
tools = [
    {
        "type": "function",
        "function": {
            "name": "buscar_temperatura",
            "description": "Retorna temperatura de uma cidade",
            "parameters": {
                "type": "object",
                "properties": {
                    "cidade": {"type": "string", "description": "Nome da cidade"}
                },
                "required": ["cidade"]
            }
        }
    }
]

response = client.chat.completions.create(
    model="granite-3.0-2b-instruct",
    messages=[{"role": "user", "content": "Qual a temperatura em Garuva?"}],
    tools=tools,
    tool_choice="auto"
)

tool_call = response.choices[0].message.tool_calls[0]
print(tool_call.function.name)       # buscar_temperatura
print(tool_call.function.arguments)  # {"cidade": "Garuva"}
```

***

## Gerenciamento de Modelos via API

Além de servir inferência, a API nativa permite gerenciar modelos programaticamente: [lmstudio](https://lmstudio.ai/docs/developer)

| Ação | Método | Endpoint |
|------|--------|----------|
| Listar modelos | `GET` | `/api/v0/models` |
| Carregar modelo | `POST` | `/api/v0/models/load` |
| Descarregar modelo | `POST` | `/api/v0/models/unload` |
| Baixar modelo | `POST` | `/api/v0/models/download` |
| Status do download | `GET` | `/api/v0/models/download/status` |

```bash
# Carregar modelo
curl -X POST http://localhost:1234/api/v0/models/load \
  -H "Content-Type: application/json" \
  -d '{"model": "granite-3.0-2b-instruct"}'

# Descarregar modelo
curl -X POST http://localhost:1234/api/v0/models/unload \
  -H "Content-Type: application/json" \
  -d '{"model": "granite-3.0-2b-instruct"}'
```

***

## MCP (Model Context Protocol) via API

O LM Studio suporta MCP servers conectados via API, permitindo agentes com acesso a ferramentas externas (filesystem, banco de dados, etc.): [lmstudio](https://lmstudio.ai/docs/developer)

```typescript
// lmstudio-js SDK com MCP
import { LMStudioClient } from "@lmstudio/sdk";

const client = new LMStudioClient();
// Conectar ao MCP server e associar ao modelo carregado
```

> Para detalhes completos de MCP, consulte `lmstudio.ai/docs/developer` → **Using MCP via API**. [lmstudio](https://lmstudio.ai/docs/developer)

***

## SDK Nativo: lmstudio-python

```bash
pip install lmstudio
```

```python
import lmstudio

client = lmstudio.Client()  # conecta em localhost:1234 por padrão

# Chat simples
response = client.llm.respond(
    "granite-3.0-2b-instruct",
    [{"role": "user", "content": "O que é Docker?"}]
)
print(response.content)
```

***

## SDK Nativo: lmstudio-js

```bash
npm install @lmstudio/sdk
```

```typescript
import { LMStudioClient } from "@lmstudio/sdk";

const client = new LMStudioClient();
const model = await client.llm.load("granite-3.0-2b-instruct");

const response = await model.respond([
  { role: "user", content: "O que é recursão de cauda?" }
]);

console.log(response.content);
```

***

## Idle TTL e Auto-Evict

O LM Studio suporta configuração de **TTL por modelo** para liberar VRAM automaticamente quando inativo: [lmstudio](https://lmstudio.ai/docs/developer)

```json
{
  "model": "granite-3.0-2b-instruct",
  "ttl": 300
}
```

- `ttl`: tempo em segundos até o modelo ser descarregado automaticamente
- Útil em ambientes com múltiplos modelos e VRAM limitada

***

## Chats Stateful (Stateful Chats)

A API nativa `/api/v0` suporta sessões com histórico gerenciado pelo servidor, diferente do padrão OpenAI onde o cliente envia o histórico completo a cada requisição. [lmstudio](https://lmstudio.ai/docs/developer)

> Consulte `lmstudio.ai/docs/developer/rest` → **Stateful Chats** para o contrato completo do endpoint. [lmstudio](https://lmstudio.ai/docs/developer/rest)

***

## Referência Rápida de Portas e URLs

| Endpoint | URL |
|----------|-----|
| REST API nativa | `http://localhost:1234/api/v0` |
| OpenAI-compat | `http://localhost:1234/v1` |
| Anthropic-compat | `http://localhost:1234/anthropic` |
| Porta padrão | `1234` (configurável) |

***

## Trade-offs e Considerações

- **REST v0 nativa** → use quando precisar de métricas (TTFT, tokens/s), gerenciamento de modelos ou chats stateful [lmstudio](https://lmstudio.ai/docs/developer/rest/endpoints)
- **`/v1` OpenAI-compat** → use para máxima portabilidade e compatibilidade com SDKs existentes [lmstudio](https://lmstudio.ai/docs/developer)
- **Anthropic-compat** → use se seu projeto já usa o SDK `anthropic` [lmstudio](https://lmstudio.ai/docs/developer)
- **lmstudio-js / lmstudio-python** → use para acesso a features exclusivas como MCP e controle granular de modelos [lmstudio](https://lmstudio.ai/docs/developer)
- **LM Studio não é licenciado para uso comercial** — verifique os termos antes de deploy em produção [youtube](https://www.youtube.com/watch?v=Flz2oy8D5Uw)