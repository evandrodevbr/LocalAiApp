import { ChatMessage } from '@/store/useAppStore';
import Markdown from '@ronradtke/react-native-markdown-display';
import { Bot, User } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { MessageActions } from './MessageActions';

interface MessageBubbleProps {
    message: ChatMessage;
    onEdit?: () => void;
    onRegenerate?: () => void;
    onDelete?: () => void;
    isStreaming?: boolean;
    isLastAssistant?: boolean;
}

export function MessageBubble({
    message,
    onEdit,
    onRegenerate,
    onDelete,
    isStreaming,
    isLastAssistant,
}: MessageBubbleProps) {
    const { width } = useWindowDimensions();
    const isLargeScreen = width > 768;
    const isUser = message.role === 'user';
    const [showActions, setShowActions] = useState(false);

    const showingStreaming = isStreaming && isLastAssistant;
    const shouldShowActions = !isUser || showActions;

    const renderContent = () => {
        if (isUser) {
            return (
                <Text style={[styles.text, styles.textUser]}>
                    {message.content}
                </Text>
            );
        }

        if (!message.content && showingStreaming) {
            return null; // TypingIndicator handled externally
        }

        return (
            <Markdown style={markdownStyles}>
                {message.content}
            </Markdown>
        );
    };

    return (
        <View
            onTouchStart={() => isUser && setShowActions(true)}
        >
            <View style={[
                styles.container,
                isUser ? styles.containerUser : styles.containerAssistant,
            ]}>
                {/* Avatar */}
                {!isUser && (
                    <View style={styles.avatarAssistant}>
                        <Bot size={16} color="#6B7280" />
                    </View>
                )}

                <View style={[
                    styles.bubble,
                    isUser ? styles.bubbleUser : styles.bubbleAssistant,
                    { maxWidth: isLargeScreen ? '70%' : '85%' },
                ]}>
                    {renderContent()}
                </View>

                {isUser && (
                    <View style={styles.avatarUser}>
                        <User size={16} color="#FFFFFF" />
                    </View>
                )}
            </View>

            {/* Timestamp + edited badge */}
            <View style={[styles.metaRow, isUser ? styles.metaRowUser : styles.metaRowAssistant]}>
                {!isUser && <View style={{ width: 32 }} />}
                <Text style={styles.timestamp}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {message.isEdited ? ' · edited' : ''}
                </Text>
            </View>

            {/* Action buttons */}
            {(shouldShowActions || !isUser) && message.content.length > 0 && (
                <MessageActions
                    role={message.role}
                    content={message.content}
                    onEdit={isUser ? onEdit : undefined}
                    onRegenerate={!isUser && isLastAssistant ? onRegenerate : undefined}
                    onDelete={onDelete}
                    isStreaming={showingStreaming}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: 16,
        marginTop: 12,
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 8,
    },
    containerUser: {
        justifyContent: 'flex-end',
    },
    containerAssistant: {
        justifyContent: 'flex-start',
    },
    avatarAssistant: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 2,
    },
    avatarUser: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#374151',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 2,
    },
    bubble: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 18,
    },
    bubbleUser: {
        backgroundColor: '#111827',
        borderBottomRightRadius: 4,
    },
    bubbleAssistant: {
        backgroundColor: '#F3F4F6',
        borderBottomLeftRadius: 4,
    },
    text: {
        fontSize: 15,
        lineHeight: 22,
    },
    textUser: {
        color: '#FFFFFF',
    },
    metaRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginTop: 2,
        gap: 8,
    },
    metaRowUser: {
        justifyContent: 'flex-end',
        paddingRight: 52,
    },
    metaRowAssistant: {
        justifyContent: 'flex-start',
    },
    timestamp: {
        fontSize: 11,
        color: '#9CA3AF',
    },
});

const markdownStyles = StyleSheet.create({
    body: {
        fontSize: 15,
        lineHeight: 22,
        color: '#111827',
    },
    strong: {
        fontWeight: '700',
    },
    em: {
        fontStyle: 'italic',
    },
    code_inline: {
        backgroundColor: '#E5E7EB',
        color: '#1F2937',
        paddingHorizontal: 5,
        paddingVertical: 1,
        borderRadius: 4,
        fontSize: 13,
        fontFamily: 'monospace',
    },
    fence: {
        backgroundColor: '#1F2937',
        color: '#E5E7EB',
        padding: 12,
        borderRadius: 8,
        fontSize: 13,
        fontFamily: 'monospace',
        marginVertical: 8,
        overflow: 'hidden',
    },
    code_block: {
        backgroundColor: '#1F2937',
        color: '#E5E7EB',
        padding: 12,
        borderRadius: 8,
        fontSize: 13,
        fontFamily: 'monospace',
        marginVertical: 8,
    },
    blockquote: {
        borderLeftWidth: 3,
        borderLeftColor: '#D1D5DB',
        paddingLeft: 12,
        marginVertical: 4,
        color: '#6B7280',
    },
    bullet_list: {
        marginVertical: 4,
    },
    ordered_list: {
        marginVertical: 4,
    },
    list_item: {
        marginVertical: 2,
    },
    heading1: {
        fontSize: 22,
        fontWeight: '700',
        marginVertical: 8,
        color: '#111827',
    },
    heading2: {
        fontSize: 19,
        fontWeight: '700',
        marginVertical: 6,
        color: '#111827',
    },
    heading3: {
        fontSize: 17,
        fontWeight: '600',
        marginVertical: 4,
        color: '#111827',
    },
    link: {
        color: '#2563EB',
        textDecorationLine: 'underline',
    },
    hr: {
        backgroundColor: '#E5E7EB',
        height: 1,
        marginVertical: 12,
    },
    paragraph: {
        marginVertical: 2,
    },
});
