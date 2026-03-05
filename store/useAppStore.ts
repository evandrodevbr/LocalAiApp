import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DEFAULT_SERVER_CONFIG, LMModel, ServerConfig } from '../services/types';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
    isEdited?: boolean;
}

export interface ChatSession {
    id: string;
    title: string;
    updatedAt: number;
    messages: ChatMessage[];
}

interface AppState {
    // Theme
    theme: 'light' | 'dark' | 'system';
    setTheme: (theme: 'light' | 'dark' | 'system') => void;

    // Server Connection
    serverConfig: ServerConfig;
    setServerConfig: (config: ServerConfig) => void;
    isConnected: boolean;
    setIsConnected: (connected: boolean) => void;

    // Models
    activeModelId: string;
    setActiveModelId: (id: string) => void;
    availableModels: LMModel[];
    setAvailableModels: (models: LMModel[]) => void;

    // Chat
    messages: ChatMessage[];
    addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => string;
    updateMessageContent: (id: string, content: string) => void;
    appendToMessage: (id: string, chunk: string) => void;
    deleteMessage: (id: string) => void;
    deleteMessagesAfter: (id: string) => void;
    editMessage: (id: string, content: string) => void;
    clearChat: () => void;

    // Streaming
    isStreaming: boolean;
    setIsStreaming: (streaming: boolean) => void;

    // Edit mode
    editingMessageId: string | null;
    setEditingMessageId: (id: string | null) => void;

    // Chat Sessions
    chatSessions: ChatSession[];
    currentChatId: string | null;
    setCurrentChatId: (id: string | null) => void;
    saveCurrentChat: () => void;
    loadChat: (id: string) => void;
    deleteChatSession: (id: string) => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            theme: 'system',
            setTheme: (theme) => set({ theme }),

            serverConfig: DEFAULT_SERVER_CONFIG,
            setServerConfig: (serverConfig) => set({ serverConfig }),
            isConnected: false,
            setIsConnected: (isConnected) => set({ isConnected }),

            activeModelId: '',
            setActiveModelId: (activeModelId) => set({ activeModelId }),
            availableModels: [],
            setAvailableModels: (availableModels) => set({ availableModels }),

            messages: [],
            addMessage: (msg) => {
                const id = Date.now().toString() + Math.random().toString(36).slice(2, 6);
                set((state) => ({
                    messages: [...state.messages, { ...msg, id, timestamp: Date.now() }],
                }));
                return id;
            },
            updateMessageContent: (id, content) =>
                set((state) => ({
                    messages: state.messages.map((m) =>
                        m.id === id ? { ...m, content } : m,
                    ),
                })),
            appendToMessage: (id, chunk) =>
                set((state) => ({
                    messages: state.messages.map((m) =>
                        m.id === id ? { ...m, content: m.content + chunk } : m,
                    ),
                })),
            deleteMessage: (id) =>
                set((state) => ({
                    messages: state.messages.filter((m) => m.id !== id),
                })),
            deleteMessagesAfter: (id) =>
                set((state) => {
                    const idx = state.messages.findIndex((m) => m.id === id);
                    if (idx === -1) return state;
                    return { messages: state.messages.slice(0, idx + 1) };
                }),
            editMessage: (id, content) =>
                set((state) => ({
                    messages: state.messages.map((m) =>
                        m.id === id ? { ...m, content, isEdited: true } : m,
                    ),
                })),
            clearChat: () => set({ messages: [], currentChatId: null }),

            isStreaming: false,
            setIsStreaming: (isStreaming) => set({ isStreaming }),

            editingMessageId: null,
            setEditingMessageId: (editingMessageId) => set({ editingMessageId }),

            chatSessions: [],
            currentChatId: null,
            setCurrentChatId: (currentChatId) => set({ currentChatId }),
            saveCurrentChat: () => {
                const { messages, currentChatId, chatSessions } = get();
                if (messages.length === 0) return;

                const firstUserMsg = messages.find((m) => m.role === 'user')?.content || 'New Chat';
                const title = firstUserMsg.length > 40 ? firstUserMsg.substring(0, 40) + '...' : firstUserMsg;
                const now = Date.now();

                if (currentChatId) {
                    set({
                        chatSessions: chatSessions.map((session) =>
                            session.id === currentChatId
                                ? { ...session, title, updatedAt: now, messages }
                                : session
                        ),
                    });
                } else {
                    const newId = Date.now().toString();
                    set({
                        chatSessions: [{ id: newId, title, updatedAt: now, messages }, ...chatSessions],
                        currentChatId: newId,
                    });
                }
            },
            loadChat: (id) => {
                const session = get().chatSessions.find((s) => s.id === id);
                if (session) {
                    set({ messages: session.messages, currentChatId: id });
                }
            },
            deleteChatSession: (id) => {
                set((state) => ({
                    chatSessions: state.chatSessions.filter((s) => s.id !== id),
                    ...(state.currentChatId === id ? { messages: [], currentChatId: null } : {}),
                }));
            },
        }),
        {
            name: 'localaiapp-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                theme: state.theme,
                serverConfig: state.serverConfig,
                chatSessions: state.chatSessions,
                messages: state.messages,
                currentChatId: state.currentChatId,
            }),
        }
    )
);
