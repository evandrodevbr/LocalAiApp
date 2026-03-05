import { useCallback, useRef } from 'react';
import { SYSTEM_PROMPT } from '../constants/SystemPrompt';
import * as api from '../services/lmStudioApi';
import { ChatMessage as ApiMessage } from '../services/types';
import { useAppStore } from '../store/useAppStore';

export function useLMStudio() {
    const serverConfig = useAppStore((s) => s.serverConfig);
    const isConnected = useAppStore((s) => s.isConnected);
    const setIsConnected = useAppStore((s) => s.setIsConnected);
    const availableModels = useAppStore((s) => s.availableModels);
    const setAvailableModels = useAppStore((s) => s.setAvailableModels);
    const activeModelId = useAppStore((s) => s.activeModelId);
    const setActiveModelId = useAppStore((s) => s.setActiveModelId);
    const messages = useAppStore((s) => s.messages);
    const addMessage = useAppStore((s) => s.addMessage);
    const appendToMessage = useAppStore((s) => s.appendToMessage);
    const isStreaming = useAppStore((s) => s.isStreaming);
    const setIsStreaming = useAppStore((s) => s.setIsStreaming);

    const abortRef = useRef<{ abort: () => void } | null>(null);

    const checkConnection = useCallback(async () => {
        const ok = await api.testConnection(serverConfig);
        setIsConnected(ok);
        return ok;
    }, [serverConfig, setIsConnected]);

    const fetchModels = useCallback(async () => {
        try {
            const currentConfig = useAppStore.getState().serverConfig;
            const models = await api.getModels(currentConfig);
            setAvailableModels(models);
            setIsConnected(true);

            if (!activeModelId && models.length > 0) {
                setActiveModelId(models[0].id);
            }
            return models;
        } catch {
            setIsConnected(false);
            setAvailableModels([]);
            return [];
        }
    }, [activeModelId, setAvailableModels, setIsConnected, setActiveModelId]);

    const sendMessage = useCallback(async (text: string) => {
        if (isStreaming) return;

        addMessage({ role: 'user', content: text });

        const currentMessages = useAppStore.getState().messages;
        const apiMessages: ApiMessage[] = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...currentMessages.map((m) => ({
                role: m.role,
                content: m.content,
            }))
        ];

        const modelId = useAppStore.getState().activeModelId;
        if (!modelId) {
            addMessage({
                role: 'assistant',
                content: '⚠️ No model selected. Please select a model first.',
            });
            return;
        }

        const assistantId = addMessage({ role: 'assistant', content: '' });
        setIsStreaming(true);

        try {
            abortRef.current = api.chatCompletionStream(
                serverConfig,
                modelId,
                apiMessages,
                (chunk) => {
                    appendToMessage(assistantId, chunk);
                },
                () => {
                    setIsStreaming(false);
                    abortRef.current = null;
                    useAppStore.getState().saveCurrentChat();
                },
                (error) => {
                    const errorMsg = `\n\n⚠️ Error: ${error.message}`;
                    appendToMessage(assistantId, errorMsg);
                    setIsStreaming(false);
                    abortRef.current = null;
                    useAppStore.getState().saveCurrentChat();
                },
            );
        } catch (err) {
            const errorMsg = `⚠️ Connection failed: ${(err as Error).message}`;
            appendToMessage(assistantId, errorMsg);
            setIsStreaming(false);
            useAppStore.getState().saveCurrentChat();
        }
    }, [isStreaming, serverConfig, addMessage, appendToMessage, setIsStreaming]);

    const regenerateResponse = useCallback(async () => {
        if (isStreaming) return;

        const msgs = useAppStore.getState().messages;
        // Find the last user message
        let lastUserIdx = -1;
        for (let i = msgs.length - 1; i >= 0; i--) {
            if (msgs[i].role === 'user') {
                lastUserIdx = i;
                break;
            }
        }
        if (lastUserIdx === -1) return;

        const lastUserMsg = msgs[lastUserIdx];
        // Remove messages after the last user message
        const store = useAppStore.getState();
        store.deleteMessagesAfter(lastUserMsg.id);

        // Build API messages from remaining
        const remaining = useAppStore.getState().messages;
        const apiMessages: ApiMessage[] = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...remaining.map((m) => ({
                role: m.role,
                content: m.content,
            }))
        ];

        const modelId = useAppStore.getState().activeModelId;
        if (!modelId) return;

        const assistantId = addMessage({ role: 'assistant', content: '' });
        setIsStreaming(true);

        try {
            abortRef.current = api.chatCompletionStream(
                serverConfig,
                modelId,
                apiMessages,
                (chunk) => appendToMessage(assistantId, chunk),
                () => {
                    setIsStreaming(false);
                    abortRef.current = null;
                    useAppStore.getState().saveCurrentChat();
                },
                (error) => {
                    appendToMessage(assistantId, `\n\n⚠️ Error: ${error.message}`);
                    setIsStreaming(false);
                    abortRef.current = null;
                    useAppStore.getState().saveCurrentChat();
                },
            );
        } catch (err) {
            appendToMessage(assistantId, `⚠️ Connection failed: ${(err as Error).message}`);
            setIsStreaming(false);
            useAppStore.getState().saveCurrentChat();
        }
    }, [isStreaming, serverConfig, addMessage, appendToMessage, setIsStreaming]);

    const stopStreaming = useCallback(() => {
        if (abortRef.current) {
            abortRef.current.abort();
            abortRef.current = null;
            setIsStreaming(false);
        }
    }, [setIsStreaming]);

    return {
        isConnected,
        isStreaming,
        availableModels,
        activeModelId,
        messages,
        sendMessage,
        stopStreaming,
        fetchModels,
        checkConnection,
        regenerateResponse,
    };
}
