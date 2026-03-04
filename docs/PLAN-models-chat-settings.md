# Plan: Models, Chat & Settings Screens

This document outlines the implementation plan for adding the Models, Chat, and Settings screens to the LocalAiApp, following the user's choice of **Option C** (Stack Navigation with Actions in Header) and targeting the Qwen 3.5 models (0.5b, 1.5b, 4b) via HuggingFace formats.
The project is a **CROSS-PLATFORM** app built with Expo (iOS, Android, Web/Desktop).

## Overview
We will implement a responsive, cross-platform Chat interface. On mobile, it will be a full-screen Chat interface with a top-bar header. On desktop/tablet breakpoints, the UI will adapt (e.g., potentially expanding the header actions or bringing settings into a side panel if needed, but primarily focusing on a fluid Chat layout that centers the conversation on wide screens). The application will manage model state through a central store, allowing quick selection from the header.

## Success Criteria
*   The `Chat` screen acts as the primary fluid view, centering the message thread on wide desktop displays max-width to avoid excessively long text lines, while extending full-width on mobile.
*   The models (Qwen 3.5 - 0.5b, 1.5b, 4b) can be selected via a dropdown or modal directly from the Chat header. On desktop, this might behave as a popover; on mobile, a bottom sheet.
*   A `Settings` screen is accessible via an icon in the Chat header. On mobile, it pushes onto the stack. On desktop, it may appear as a modal or dedicated full-page route optimized for mouse interaction.
*   A solid context/state management foundation (e.g., Zustand) is established to hold the current selected model and chat history across screens.
*   The UI must adhere to fluid design principles: larger touch targets for mobile (> 44pt), hover states and standard cursor interactions for desktop. No standard templates; use a custom, premium aesthetic.

## Tech Stack
*   **React Native / Expo Router**: For navigation and screen structure.
*   **Zustand**: For simple, performant global state management (models state, chat history).
*   **Vanilla Stylesheet / Tailwind (if configured)**: For custom, premium UI styling without generic templates.
*   **Lucide-React-Native / Expo Vector Icons**: For crisp, recognizable icons in the header and settings.
*   *(Future Integration)* `llama.rn` or similar: For actually executing the Qwen models locally on the device (Out of scope for this UI phase, but Settings UI must account for it).

## File Structure

```
├── app/
│   ├── index.tsx              # Main entry point (Redirects to chat or is the chat)
│   ├── chat/
│   │   ├── _layout.tsx        # Defines the Stack Header (Model Selector + Settings Icon)
│   │   ├── index.tsx          # The Chat UI (Messages list, input area)
│   ├── settings/
│   │   ├── index.tsx          # Settings Screen (Model management, keys, UI prefs)
├── components/
│   ├── chat/
│   │   ├── MessageBubble.tsx  # Defines how user/AI messages look
│   │   ├── ChatInput.tsx      # The text input area
│   │   ├── ModelSelector.tsx  # The dropdown/bottom sheet to pick Qwen models
│   ├── ui/
│   │   ├── IconButton.tsx     # Reusable touch-friendly icon button
├── store/
│   ├── useAppStore.ts         # Zustand store for active model, messages, and settings
├── constants/
│   ├── Models.ts              # Definitions for Qwen 3.5 (0.5b, 1.5b, 4b) URLs/Configs
```

## Task Breakdown

### 1- Setup Global State & Constants
*   **Agent:** `mobile-developer`
*   **Skills:** `clean-code`
*   **Task:** Create `Models.ts` with configurations for the selected Qwen 3.5 models. Setup a basic Zustand store `useAppStore.ts` to hold the `activeModel`, an array of `messages`, and user preferences.
*   **INPUT→OUTPUT→VERIFY:** Input: Empty files. Output: A working Zustand store and constant file. Verify: Can import store into a simple component and read/write values.

### 2- Implement Stack Navigation Layout & Responsive Shell
*   **Agent:** `frontend-specialist` (cross-platform expert)
*   **Skills:** `frontend-design`, `react-best-practices`
*   **Task:** Update `app/_layout.tsx` (or `app/chat/_layout.tsx`) to use Expo Router's `<Stack>` navigation. Implement a responsive container that limits max width on desktop sizes to ensure readability, while remaining 100% width on mobile. Configure the header of the `chat` screen to include the `ModelSelector` and Settings icon.
*   **INPUT→OUTPUT→VERIFY:** Input: Default Expo Router layout. Output: A cross-platform layout adapting to screen width (`useWindowDimensions`). Verify: Resize browser window (Web) to test breakpoints; launch mobile to confirm header structure.

### 3- Build Chat Components (Input & Bubbles)
*   **Agent:** `frontend-specialist`
*   **Skills:** `frontend-design`
*   **Task:** Create `components/chat/MessageBubble.tsx` and `components/chat/ChatInput.tsx`. These components must be responsive: message bubbles should have a max-width (e.g., 75% on mobile, 60% on desktop) and inputs should support Enter to send on Web (Shift+Enter for newline) alongside standard mobile keyboard behavior. Add hover states for desktop interactions.
*   **INPUT→OUTPUT→VERIFY:** Input: Layout skeleton. Output: Reusable chat components functioning on both touch and mouse interfaces. Verify: Test desktop hover states and Enter-key sending; test mobile touch targets and padding.

### 4- Build the Chat Screen (List & Integration)
*   **Agent:** `mobile-developer`
*   **Skills:** `performance-profiling`
*   **Task:** Implement `app/chat/index.tsx`. Use `FlatList` (or `FlashList` if available) to render the messages from the global state. Integrate the `ChatInput` at the bottom (handling Keyboard avoiding view correctly).
*   **INPUT→OUTPUT→VERIFY:** Input: Chat components. Output: A fully scrollable chat interface that reacts to keyboard input. Verify: Type a message, send it, verify it appears in the list and the list auto-scrolls. 

### 5- Build Model Selector (Header Menu)
*   **Agent:** `mobile-developer`
*   **Skills:** `mobile-design`
*   **Task:** Implement `components/chat/ModelSelector.tsx`. This should be a touchable area in the header that opens a bottom sheet or a contextual menu to switch between the Qwen 3.5 models (0.5b, 1.5b, 4b).
*   **INPUT→OUTPUT→VERIFY:** Input: Header layout. Output: Interactive menu for model selection. Verify: Tapping the header opens the menu, selecting a model updates the global state.

### 6- Build Settings Screen
*   **Agent:** `frontend-specialist`
*   **Skills:** `frontend-design`
*   **Task:** Implement `app/settings/index.tsx`. Group settings into logical sections. On wide screens, this could be a centered card layout; on mobile, a standard list. Add toggles/inputs for configuration with proper focus states for keyboard navigation on Web/Desktop.
*   **INPUT→OUTPUT→VERIFY:** Input: Navigation setup. Output: A functional, responsive settings screen. Verify: Navigate to Settings, change sizes from mobile to desktop, check alignment and focus rings.

## Phase X: Verification Plan

To verify this cross-platform implementation, the following checklist must be executed once all tasks are complete:

- [ ] **Linting & Types:** Run `npm run lint` and `npx tsc --noEmit`. Fix any warnings/errors.
- [ ] **Cross-Platform Accessibility:** Audit touch targets for mobile (> 44pt) and verify hover/focus states are present for Desktop users (mouse/keyboard).
- [ ] **Responsive Resizing:** Run `npm run web` and resize the browser horizontally. Ensure text lines in chat don't stretch indefinitely and the input field remains centered/bounded.
- [ ] **Design Constraints Check:** Verify NO purple/violet `#8A2BE2` are used. Ensure UI feels premium on both small and large screens.
- [ ] **Keyboard Handling:** 
    - *Mobile:* Ensure Keyboard Avoiding View prevents covering the input.
    - *Desktop:* Ensure hitting `Enter` sends the message, and `Shift+Enter` adds a newline.
- [ ] **State Persistence (Basic):** Select a model -> Go to Settings -> Change a setting -> Go back to Chat -> Verify the selected model hasn't reset.
- [ ] **Build:** Run `npm run android`, `npm run ios`, and `npm run web` successfully without bundler errors.
