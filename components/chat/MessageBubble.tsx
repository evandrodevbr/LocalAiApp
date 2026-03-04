import { useThemeColor } from '@/hooks/useThemeColor';
import { ChatMessage } from '@/store/useAppStore';
import Markdown from '@ronradtke/react-native-markdown-display';
import * as Clipboard from 'expo-clipboard';
import { Bot, Check, Copy, User } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
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
    const colors = useThemeColor();
    const isLargeScreen = width > 768;
    const isUser = message.role === 'user';
    const [showActions, setShowActions] = useState(false);
    const [copiedText, setCopiedText] = useState<string | null>(null);

    const handleCopy = async (text: string) => {
        await Clipboard.setStringAsync(text);
        setCopiedText(text);
        setTimeout(() => setCopiedText(null), 2000);
    };

    const showingStreaming = isStreaming && isLastAssistant;
    const shouldShowActions = !isUser || showActions;

    // UseMemo for dynamic colors
    const markdownStyles = useMemo(() => ({
        body: {
            fontSize: 15,
            lineHeight: 22,
            color: colors.messageAssistantText,
        },
        strong: {
            fontWeight: '700',
            color: colors.text,
        },
        em: {
            fontStyle: 'italic',
        },
        code_inline: {
            backgroundColor: colors.backgroundColor,
            color: colors.text,
            paddingHorizontal: 5,
            paddingVertical: 1,
            borderRadius: 4,
            fontSize: 13,
            fontFamily: 'monospace',
        },
        fence: {
            backgroundColor: colors.inputBg,
            borderColor: colors.border,
            borderWidth: 1,
            color: colors.text,
            padding: 12,
            borderRadius: 8,
            fontSize: 13,
            fontFamily: 'monospace',
            marginVertical: 8,
            overflow: 'hidden',
        },
        code_block: {
            backgroundColor: colors.inputBg,
            color: colors.text,
            padding: 12,
            borderRadius: 8,
            fontSize: 13,
            fontFamily: 'monospace',
            marginVertical: 8,
        },
        blockquote: {
            borderLeftWidth: 3,
            borderLeftColor: colors.border,
            paddingLeft: 12,
            marginVertical: 4,
            color: colors.textMuted,
        },
        bullet_list: {
            marginVertical: 4,
        },
        ordered_list: {
            marginVertical: 4,
        },
        list_item: {
            marginVertical: 2,
            color: colors.messageAssistantText,
        },
        heading1: {
            fontSize: 22,
            fontWeight: '700',
            marginVertical: 8,
            color: colors.text,
        },
        heading2: {
            fontSize: 19,
            fontWeight: '700',
            marginVertical: 6,
            color: colors.text,
        },
        heading3: {
            fontSize: 17,
            fontWeight: '600',
            marginVertical: 4,
            color: colors.text,
        },
        link: {
            color: '#3B82F6',
            textDecorationLine: 'underline',
        },
        hr: {
            backgroundColor: colors.border,
            height: 1,
            marginVertical: 12,
        },
        paragraph: {
            marginVertical: 2,
        },
    } as any), [colors]); // using 'as any' to satisfy internal Markdown types if needed

    const markdownRules = useMemo(() => ({
        fence: (node: any, children: any, parent: any, parentStyles: any) => {
            const content = node.content || '';
            const language = node.sourceInfo || 'code';
            return (
                <View key={node.key} style={styles.codeBlockWrapper}>
                    <View style={styles.codeBlockHeader}>
                        <Text style={styles.codeBlockLanguage}>{language}</Text>
                        <TouchableOpacity onPress={() => handleCopy(content)} style={styles.copyButton}>
                            {copiedText === content ? <Check size={14} color="#A0A0A0" /> : <Copy size={14} color="#A0A0A0" />}
                            <Text style={styles.copyText}>{copiedText === content ? 'Copied!' : 'Copy'}</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal style={styles.codeScrollView} showsHorizontalScrollIndicator={false}>
                        <Text style={styles.codeText}>{content}</Text>
                    </ScrollView>
                </View>
            );
        },
        code_block: (node: any, children: any, parent: any, parentStyles: any) => {
            const content = node.content || '';
            return (
                <View key={node.key} style={styles.codeBlockWrapper}>
                    <View style={styles.codeBlockHeader}>
                        <Text style={styles.codeBlockLanguage}>code</Text>
                        <TouchableOpacity onPress={() => handleCopy(content)} style={styles.copyButton}>
                            {copiedText === content ? <Check size={14} color="#A0A0A0" /> : <Copy size={14} color="#A0A0A0" />}
                            <Text style={styles.copyText}>{copiedText === content ? 'Copied!' : 'Copy'}</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal style={styles.codeScrollView} showsHorizontalScrollIndicator={false}>
                        <Text style={styles.codeText}>{content}</Text>
                    </ScrollView>
                </View>
            );
        }
    }), [copiedText]);

    const renderContent = () => {
        if (isUser) {
            return (
                <Text style={[styles.text, { color: colors.messageUserText }]}>
                    {message.content}
                </Text>
            );
        }

        if (!message.content && showingStreaming) {
            return null; // TypingIndicator handled externally
        }

        return (
            <Markdown style={markdownStyles} rules={markdownRules}>
                {message.content}
            </Markdown>
        );
    };

    return (
        <View
            onTouchStart={() => isUser && setShowActions(true)}
            style={styles.outerWrap}
        >
            <View style={[
                styles.container,
                isUser ? styles.containerUser : styles.containerAssistant,
            ]}>
                {/* Avatar */}
                {!isUser && (
                    <View style={[styles.avatarAssistant, { backgroundColor: colors.border }]}>
                        <Bot size={16} color={colors.text} />
                    </View>
                )}

                <View style={[
                    styles.bubble,
                    isUser ? styles.bubbleUser : styles.bubbleAssistant,
                    { maxWidth: isLargeScreen ? '70%' : '85%' },
                    { backgroundColor: isUser ? colors.messageUserBg : colors.messageAssistantBg },
                    !isUser && { borderWidth: 1, borderColor: colors.border }
                ]}>
                    {renderContent()}
                </View>

                {isUser && (
                    <View style={[styles.avatarUser, { backgroundColor: colors.tint }]}>
                        <User size={16} color={colors.backgroundColor} />
                    </View>
                )}
            </View>

            {/* Timestamp + edited badge */}
            <View style={[styles.metaRow, isUser ? styles.metaRowUser : styles.metaRowAssistant]}>
                {!isUser && <View style={{ width: 32 }} />}
                <Text style={[styles.timestamp, { color: colors.textMuted }]}>
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
    outerWrap: {
        width: '100%',
        marginBottom: 12,
    },
    container: {
        width: '100%',
        paddingHorizontal: 16,
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
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 2,
    },
    avatarUser: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 2,
    },
    bubble: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
        // CRITICAL FOR MARKDOWN IN FLEX ROW:
        flexShrink: 1,
    },
    bubbleUser: {
        borderBottomRightRadius: 6,
    },
    bubbleAssistant: {
        borderBottomLeftRadius: 6,
    },
    text: {
        fontSize: 15,
        lineHeight: 22,
    },
    metaRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginTop: 4,
        gap: 8,
    },
    metaRowUser: {
        justifyContent: 'flex-end',
        paddingRight: 56,
    },
    metaRowAssistant: {
        justifyContent: 'flex-start',
    },
    timestamp: {
        fontSize: 11,
        fontWeight: '500',
    },
    codeBlockWrapper: {
        backgroundColor: '#1E1E1E',
        borderRadius: 8,
        marginVertical: 8,
        overflow: 'hidden',
        width: '100%',
    },
    codeBlockHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#2D2D2D',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#404040',
    },
    codeBlockLanguage: {
        color: '#A0A0A0',
        fontSize: 12,
        fontFamily: 'monospace',
        textTransform: 'lowercase',
    },
    copyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        padding: 4,
    },
    copyText: {
        color: '#A0A0A0',
        fontSize: 12,
    },
    codeScrollView: {
        padding: 12,
    },
    codeText: {
        color: '#D4D4D4',
        fontSize: 13,
        fontFamily: 'monospace',
    },
});
