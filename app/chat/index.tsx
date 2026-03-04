import { ChatInput } from '@/components/chat/ChatInput';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { useLMStudio } from '@/hooks/useLMStudio';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAppStore } from '@/store/useAppStore';
import { MessageSquare, Sparkles } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const PROMPT_SUGGESTIONS = [
    'Explain recursion in simple terms',
    'Write a short poem about coding',
    'What are the best practices for React Native?',
    'Help me debug a JavaScript error',
];

export default function ChatScreen() {
    const colors = useThemeColor(); // Dynamic theme
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
            editMessage(editingMessageId, text);
            deleteMessagesAfter(editingMessageId);
            setEditingMessageId(null);

            setTimeout(() => {
                const store = useAppStore.getState();
                const msgs = store.messages;
                // Add system prompt before mapped messages
                const { SYSTEM_PROMPT } = require('@/constants/SystemPrompt');
                const apiMsgs = [
                    { role: 'system', content: SYSTEM_PROMPT },
                    ...msgs.map(m => ({ role: m.role, content: m.content }))
                ];

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

    const handleEdit = useCallback((id: string) => setEditingMessageId(id), [setEditingMessageId]);
    const handleCancelEdit = useCallback(() => setEditingMessageId(null), [setEditingMessageId]);
    const handleDelete = useCallback((id: string) => deleteMessage(id), [deleteMessage]);

    const lastAssistantId = messages.length > 0
        ? [...messages].reverse().find(m => m.role === 'assistant')?.id
        : null;

    useEffect(() => {
        if (messages.length > 0 && flatListRef.current) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: !isStreaming });
            }, 100);
        }
    }, [messages.length, messages[messages.length - 1]?.content?.length, isStreaming]);

    const showTypingIndicator = isStreaming &&
        messages.length > 0 &&
        messages[messages.length - 1]?.role === 'assistant' &&
        messages[messages.length - 1]?.content === '';

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.backgroundColor }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            {!isConnected && (
                <View style={[styles.banner, { backgroundColor: colors.bannerBg, borderBottomColor: colors.bannerBg }]}>
                    <Text style={[styles.bannerText, { color: colors.bannerText }]}>
                        ⚠️ Server offline. Check Settings → Server Connection.
                    </Text>
                </View>
            )}

            {messages.length === 0 ? (
                <View style={[styles.emptyState, { backgroundColor: colors.backgroundColor }]}>
                    <View style={[styles.emptyIconWrap, { backgroundColor: colors.cardBackground, shadowColor: colors.shadow }]}>
                        <MessageSquare size={40} color={colors.textMuted} />
                    </View>
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>Start a conversation</Text>
                    <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                        Send a message to begin chatting with your local AI model.
                    </Text>

                    <View style={styles.suggestionsWrap}>
                        {PROMPT_SUGGESTIONS.map((prompt, i) => (
                            <TouchableOpacity
                                key={i}
                                style={[styles.suggestionChip, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
                                onPress={() => sendMessage(prompt)}
                                activeOpacity={0.7}
                            >
                                <Sparkles size={14} color={colors.textMuted} />
                                <Text style={[styles.suggestionText, { color: colors.text }]} numberOfLines={1}>{prompt}</Text>
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
                        renderItem={({ item, index }) => (
                            <Animated.View entering={FadeInDown.duration(300).delay(index > messages.length - 4 ? 100 : 0)}>
                                <MessageBubble
                                    message={item}
                                    onEdit={() => handleEdit(item.id)}
                                    onRegenerate={regenerateResponse}
                                    onDelete={() => handleDelete(item.id)}
                                    isStreaming={isStreaming}
                                    isLastAssistant={item.id === lastAssistantId}
                                />
                            </Animated.View>
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
    },
    listContent: {
        paddingTop: 16,
        paddingBottom: 24,
    },
    banner: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
    },
    bannerText: {
        fontSize: 13,
        textAlign: 'center',
        fontWeight: '500',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        paddingBottom: 80,
    },
    emptyIconWrap: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
    },
    suggestionsWrap: {
        width: '100%',
        maxWidth: 400,
        gap: 12,
    },
    suggestionChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    suggestionText: {
        fontSize: 15,
        flex: 1,
        fontWeight: '500',
    },
});
