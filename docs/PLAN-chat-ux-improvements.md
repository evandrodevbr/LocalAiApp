# PLAN: Chat UX Improvements + Streaming Fix

> 🤖 **Agentes:** `@frontend-specialist` + `@mobile-developer`
> **Data:** 2026-03-04

---

## 🐛 Bug Crítico: ReadableStream not supported

**Causa raiz:** O `fetch` nativo do React Native (Hermes) não suporta `response.body.getReader()`. A implementação atual usa a Web Streams API que só funciona em navegadores.

**Solução:** Usar o pacote `react-native-sse` — cliente SSE leve feito para React Native, que usa `XMLHttpRequest` internamente (sem polyfills pesados).

```bash
pnpm add react-native-sse
```

Reescrever `chatCompletionStream()` em `services/lmStudioApi.ts` para usar `EventSource` do `react-native-sse` no mobile e manter `ReadableStream` no web via `Platform.OS`.

---

## 🧠 Brainstorm: Rendering de Markdown

### Contexto
Respostas de LLMs vêm em Markdown (code blocks, bold, listas, etc). Atualmente renderizamos como `<Text>` puro.

### Option A: `react-native-markdown-display`
- ✅ Leve, customizável por StyleSheet, suporta code blocks
- ❌ Manutenção irregular
- 📊 **Effort:** Low

### Option B: `@ronradtke/react-native-markdown-display` (fork mantido)
- ✅ Fork ativo e mantido, API idêntica, melhor suporte Expo
- ✅ Customização completa de estilos
- ❌ Sem syntax highlighting nativo (adicionável)
- 📊 **Effort:** Low

### Option C: Custom parser com regex
- ✅ Zero dependências, 100% controle
- ❌ Muito trabalho, bugs com edge cases
- 📊 **Effort:** High

### 💡 Recomendação
**Option B** (`@ronradtke/react-native-markdown-display`) — fork mantido, baixo esforço e cobre 95% dos casos.

---

## 📋 Plano de Implementação

### Fase 1: Bug Fix — Streaming (Prioridade Máxima)

#### [MODIFY] `services/lmStudioApi.ts`
- Instalar `react-native-sse`
- Reescrever `chatCompletionStream()` com dual strategy:
  - **Web:** Manter `ReadableStream` (funciona nativamente)
  - **Native (iOS/Android):** Usar SSE via `react-native-sse`
- Handling robusto de erros e abort

---

### Fase 2: Markdown Rendering

#### [ADD] Dependência
```bash
pnpm add @ronradtke/react-native-markdown-display
```

#### [MODIFY] `components/chat/MessageBubble.tsx`
- Substituir `<Text>` por `<Markdown>` nas mensagens do assistant
- Manter `<Text>` para mensagens do user (são texto simples)
- Estilizar code blocks com fundo escuro, fonte mono
- Estilizar bold, italic, listas, links
- Suporte a inline code com badge de destaque

---

### Fase 3: Message Actions (Copy, Edit, Resend)

#### [MODIFY] `components/chat/MessageBubble.tsx`
- Adicionar toolbar de ações abaixo de cada mensagem (aparece via long-press ou sempre visível para assistant)
- **Actions do Assistant:**
  - 📋 Copy — copia conteúdo para clipboard (`Clipboard.setStringAsync`)
  - 🔄 Regenerate — reenvia a última mensagem do user
- **Actions do User:**
  - 📋 Copy — copia conteúdo
  - ✏️ Edit — abre o texto no input para edição + reenvio
  - 🗑️ Delete — remove mensagem

#### [MODIFY] `store/useAppStore.ts`
- Adicionar `deleteMessage(id)`
- Adicionar `editMessage(id, content)` — edita e reprocess
- Adicionar `regenerateLastResponse()` — remove última resposta + reenvia

#### [MODIFY] `components/chat/ChatInput.tsx`
- Suportar modo "edit" — pré-preencher input com texto da mensagem selecionada
- Mostrar indicador visual de que está editando (ex: badge "Editing" + botão cancelar)

#### [NEW] `components/chat/MessageActions.tsx`
- Componente de ações reutilizável
- Botões com ícones (Lucide): `Copy`, `Pencil`, `RefreshCw`, `Trash2`
- Touch targets 44px+ (Fitts' Law compliance)
- Haptic feedback nos botões (`expo-haptics`)

---

### Fase 4: UI/UX Polish

#### [MODIFY] `components/chat/MessageBubble.tsx`
- Avatar/ícone para assistant (Bot icon) e user
- Timestamp discreto abaixo da bolha
- Animação de entrada (fade in + slide up com `react-native-reanimated`)

#### [MODIFY] `app/chat/index.tsx`
- Empty state quando não há mensagens (ícone + texto de boas-vindas + sugestões de prompts clicáveis)
- Typing indicator animado (3 dots pulsando) enquanto `isStreaming` e conteúdo ainda vazio

#### [MODIFY] `components/chat/ChatInput.tsx`
- Auto-grow do input (já faz multiline, melhorar visual)
- Botão de "stop generation" (⏹️) visível durante streaming, substituindo o botão send
- Contador de caracteres sutil para mensagens longas

#### [MODIFY] `app/chat/_layout.tsx`
- Botão "New Chat" no header (limpa conversa)

---

## 💡 Sugestões Adicionais (Simples de Implementar)

1. **Sugestões de Prompts no Empty State** — 3-4 cards clicáveis com prompts exemplo ("Explique recursão", "Escreva um haiku") que preenchem o input ao tocar. Melhora onboarding e ajuda o user a começar.

2. **Persistência de Chat com AsyncStorage** — Salvar mensagens no dispositivo para não perder ao fechar o app. Usar `zustand/middleware` com `persist`.

3. **Haptic Feedback nas ações** — Vibração leve ao enviar mensagem, copiar, e deletar. Premium feel. (`expo-haptics` já está disponível no Expo).

4. **Scroll-to-bottom FAB** — Quando o user rola para cima e chega mensagem nova, mostrar um FAB "↓" no canto inferior para voltar ao final. Evita perder mensagens novas.

5. **Configuração de Temperature/Max Tokens no Chat** — Adicionar um menu de "Model Parameters" acessível pelo header (ícone de slider). Permite ajustar temperatura e max_tokens sem ir em Settings.

6. **Tema Dark Mode funcional** — O theme toggle existe mas as telas usam cores hardcoded (#FFFFFF, #F3F4F6). Conectar com o sistema `Colors` de `constants/theme.ts` para dark mode real.

7. **Indicador de tokens usados** — Mostrar contagem de tokens da resposta (retornado pelo `usage` da API) abaixo de cada mensagem assistant. Informativo para quem está testando modelos.

8. **System Prompt configurável** — Input nas Settings para definir o system prompt padrão que é enviado em toda conversa. Permite personalizar o "comportamento" do modelo.

---

## Verificação

1. Enviar mensagem → resposta deve aparecer via streaming (sem erro ReadableStream)
2. Resposta do assistant → renderizada com formatação markdown (code blocks, bold, listas)
3. Long-press em mensagem → botões de ação aparecem
4. Copiar → conteúdo no clipboard
5. Editar mensagem do user → input preenchido, reenvio funciona
6. Empty state → sugestões de prompt visíveis
7. Stop generation → streaming para imediatamente
8. Dark mode → todas as telas respeitam o tema

---

## Ordem de Execução Recomendada

| Fase | Prioridade | Esforço |
|------|-----------|---------|
| 1. Fix Streaming | 🔴 Crítico | Baixo |
| 2. Markdown | 🟠 Alto | Baixo |
| 3. Message Actions | 🟡 Médio | Médio |
| 4. UI/UX Polish | 🟢 Normal | Médio |
| 5+ Sugestões | 🔵 Nice-to-have | Baixo cada |
