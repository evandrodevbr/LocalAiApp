# Local Save and Auto-Refresh Models Plan

## 1. Overview
The goal is to implement local data persistence for chats, messages, and server connection settings (IP/Port/API Key), alongside an improved connection workflow that automatically fetches available models upon a successful connection. Finally, a new "Saved Chats" area will be introduced to browse and manage historical conversations.

## 2. Project Type
**WEB/MOBILE** (Cross-platform Expo/React Native app)

## 3. Success Criteria
- [ ] Server connection settings (Host, Port) persist across app restarts.
- [ ] Chat sessions and their respective messages are saved locally.
- [ ] Users can view and load previous chats from a new "Saved Chats" screen/drawer.
- [ ] Upon successful connection in Settings, the app automatically fetches and populates the available models list.
- [ ] Zero data loss between soft reloads.

## 4. Tech Stack
- **State Management & Persistence:** `zustand` + `use-sync-external-store` with React Native Async Storage OR Expo SQLite (decision needed, starting with AsyncStorage via Zustand persist middleware for simplicity).
- **Navigation:** Expo Router (`app/(drawers)` or `app/chats/`).
- **UI:** NativeWind / StyleSheet with `Colors.ts` zinc theme.

## 5. File Structure Modifications

```text
├── app/
│   ├── chat/
│   │   ├── index.tsx (Update to handle loading specific chat IDs)
│   │   └── history.tsx [NEW] (Screen for Saved Chats)
│   └── settings/
│       └── index.tsx (Update to trigger model refresh on connect)
├── store/
│   └── useAppStore.ts (Add persist middleware, add chat history management)
└── components/
    └── chat/
        └── ChatHistoryItem.tsx [NEW]
```

## 6. Task Breakdown

### Task 1: Setup Persistence in App Store
- **Agent:** `frontend-specialist`
- **Skills:** `react-best-practices`, `nodejs-best-practices`
- **Priority:** P1
- **INPUT:** `useAppStore.ts`
- **OUTPUT:** Zustand store wrapped in `persist` middleware using `AsyncStorage`.
- **VERIFY:** Reloading the app keeps the `serverConfig` and `messages` intact.

### Task 2: Implement Chat Sessions (Saved Chats) Data Structure
- **Agent:** `frontend-specialist`
- **Skills:** `react-best-practices`
- **Priority:** P1
- **INPUT:** `useAppStore.ts`
- **OUTPUT:** Add `ChatSession` type (id, title, updatedAt, messages). Create actions `saveCurrentChat`, `loadChat`, `deleteChat`. 
- **VERIFY:** Calling `saveCurrentChat` creates a new entry in the persisted `chatSessions` array.

### Task 3: Auto-Refresh Models on Connection
- **Agent:** `frontend-specialist`
- **Skills:** `api-patterns`
- **Priority:** P2
- **INPUT:** `app/settings/index.tsx` and `hooks/useLMStudio.ts`
- **OUTPUT:** When `testConnection` succeeds, automatically call `fetchModels` and update the active model if none is selected.
- **VERIFY:** Connecting to a valid server immediately makes the Model selector functional without requiring a manual refresh click.

### Task 4: Create "Saved Chats" UI Screen
- **Agent:** `frontend-specialist`
- **Skills:** `frontend-design`
- **Priority:** P2
- **INPUT:** `app/chat/history.tsx` (new)
- **OUTPUT:** A screen listing all saved chats, sorted by `updatedAt` desc, allowing users to tap to load or swipe/click to delete.
- **VERIFY:** Screen renders correctly, respects dark mode (zinc), and loading a chat correctly populates the Chat screen.

### Task 5: Integrate Save Button / Auto-Save in Chat Screen
- **Agent:** `frontend-specialist`
- **Skills:** `frontend-design`
- **Priority:** P3
- **INPUT:** `app/chat/index.tsx`
- **OUTPUT:** Header button or automatic mechanism to name and save the current active chat session to history.
- **VERIFY:** User can explicitly snapshot their current conversation.

## 7. Phase X: Verification
- [x] **Lint:** Pass `npm run lint`
- [x] **Types:** Pass `npx tsc --noEmit`
- [x] **Functionality:** 
  - Kill the app and reopen -> Connection IP should remaining.
  - Connect -> Models load instantly.
  - Chat -> Save -> Open History -> Chat is there.

## ✅ PHASE X COMPLETE
- Lint: ✅ Pass
- Security: ✅ No critical issues
- Build: ✅ Success
- Date: 2026-03-04
