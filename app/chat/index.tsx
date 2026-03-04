import { ChatInput } from '@/components/chat/ChatInput';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { useLMStudio } from '@/hooks/useLMStudio';
import { useAppStore } from '@/store/useAppStore';
import { MessageSquare, Sparkles } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const PROMPT_SUGGESTIONS = [
    'Explain recursion in simple terms',
    'Write a short poem about coding',
    'What are the best practices for React Native?',
    'Help me debug a JavaScript error',
];

export default function ChatScreen() {
    const messages = useAppStore(state => state.messages);
    const editingMessageId = useAppStore(state => state.editingMessageId);
    const setEditingMessageId = useAppStore(state => state.setEditingMessageId);
    const deleteMessagesAfter = useAppStore(state => state.deleteMessagesAfter);
    const deleteMessage = useAppStore(state => state.deleteMessage);
    const editMessage = useAppStore(state => state.editMessage);
    const { sendMessage, stopStreaming, regenerateResponse, isStreaming, isConnected } = useLMStudio();
    const flatListRef = useRef<FlatList>(null);

    // Find the editing message content
    const editingMessage = editingMessageId
        ? messages.find(m => m.id === editingMessageId)
        : null;

    const handleSend = useCallback((text: string) => {
        if (editingMessageId && editingMessage) {
            // Edit mode: update message, delete all after, and resend
            editMessage(editingMessageId, text);
            // Get updated messages, delete everything after the edited message
            deleteMessagesAfter(editingMessageId);
            setEditingMessageId(null);

            // Now send the edited message for a new response
            // Small delay to allow state update
            setTimeout(() => {
                const store = useAppStore.getState();
                const msgs = store.messages;
                const apiMsgs = msgs.map(m => ({ role: m.role, content: m.content }));
                const modelId = store.activeModelId;
                if (!modelId) return;

                const assistantId = store.addMessage({ role: 'assistant', content: '' });
                store.setIsStreaming(true);

                const { chatCompletionStream } = require('@/services/lmStudioApi');
                chatCompletionStream(
                    store.serverConfig,
                    modelId,
                    apiMsgs,
                    (chunk: string) => store.appendToMessage(assistantId, chunk),
                    () => { store.setIsStreaming(false); },
                    (error: Error) => {
                        store.appendToMessage(assistantId, `\n\n⚠️ Error: ${error.message}`);
                        store.setIsStreaming(false);
                    },
                );
            }, 100);
        } else {
            sendMessage(text);
        }
    }, [editingMessageId, editingMessage, editMessage, deleteMessagesAfter, setEditingMessageId, sendMessage]);

    const handleEdit = useCallback((id: string) => {
        setEditingMessageId(id);
    }, [setEditingMessageId]);

    const handleCancelEdit = useCallback(() => {
        setEditingMessageId(null);
    }, [setEditingMessageId]);

    const handleDelete = useCallback((id: string) => {
        deleteMessage(id);
    }, [deleteMessage]);

    // Find the last assistant message id
    const lastAssistantId = messages.length > 0
        ? [...messages].reverse().find(m => m.role === 'assistant')?.id
        : null;

    // Auto-scroll
    useEffect(() => {
        if (messages.length > 0 && flatListRef.current) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages.length, messages[messages.length - 1]?.content?.length]);

    // Show typing indicator when streaming and last assistant message is empty
    const showTypingIndicator = isStreaming &&
        messages.length > 0 &&
        messages[messages.length - 1]?.role === 'assistant' &&
        messages[messages.length - 1]?.content === '';

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            {!isConnected && (
                <View style={styles.banner}>
                    <Text style={styles.bannerText}>
                        ⚠️ Not connected to LM Studio. Check Settings → Server Connection.
                    </Text>
                </View>
            )}

            {messages.length === 0 ? (
                <View style={styles.emptyState}>
                    <View style={styles.emptyIconWrap}>
                        <MessageSquare size={40} color="#D1D5DB" />
                    </View>
                    <Text style={styles.emptyTitle}>Start a conversation</Text>
                    <Text style={styles.emptySubtitle}>
                        Send a message to begin chatting with your local AI model.
                    </Text>

                    <View style={styles.suggestionsWrap}>
                        {PROMPT_SUGGESTIONS.map((prompt, i) => (
                            <TouchableOpacity
                                key={i}
                                style={styles.suggestionChip}
                                onPress={() => sendMessage(prompt)}
                                activeOpacity={0.7}
                            >
                                <Sparkles size={14} color="#6B7280" />
                                <Text style={styles.suggestionText} numberOfLines={1}>{prompt}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            ) : (
                <>
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <MessageBubble
                                message={item}
                                onEdit={() => handleEdit(item.id)}
                                onRegenerate={regenerateResponse}
                                onDelete={() => handleDelete(item.id)}
                                isStreaming={isStreaming}
                                isLastAssistant={item.id === lastAssistantId}
                            />
                        )}
                        contentContainerStyle={styles.listContent}
                    />
                    {showTypingIndicator && <TypingIndicator />}
                </>
            )}

            <ChatInput
                onSend={handleSend}
                onStop={stopStreaming}
                isLoading={isStreaming}
                editingText={editingMessage?.content ?? null}
                onCancelEdit={handleCancelEdit}
            />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    listContent: {
        paddingTop: 8,
        paddingBottom: 16,
    },
    banner: {
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#FDE68A',
    },
    bannerText: {
        fontSize: 13,
        color: '#92400E',
        textAlign: 'center',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        paddingBottom: 80,
    },
    emptyIconWrap: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 15,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 28,
    },
    suggestionsWrap: {
        width: '100%',
        maxWidth: 400,
        gap: 8,
    },
    suggestionChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    suggestionText: {
        fontSize: 14,
        color: '#374151',
        flex: 1,
    },
});
