import { useThemeColor } from '@/hooks/useThemeColor';
import * as Haptics from 'expo-haptics';
import { Send, Square, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface ChatInputProps {
    onSend: (text: string) => void;
    onStop?: () => void;
    isLoading?: boolean;
    editingText?: string | null;
    onCancelEdit?: () => void;
}

export function ChatInput({ onSend, onStop, isLoading, editingText, onCancelEdit }: ChatInputProps) {
    const [text, setText] = useState('');
    const colors = useThemeColor();

    // When editingText changes, fill the input
    useEffect(() => {
        if (editingText !== null && editingText !== undefined) {
            setText(editingText);
        }
    }, [editingText]);

    const handleSend = () => {
        if (text.trim() && !isLoading) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSend(text.trim());
            setText('');
        }
    };

    const handleStop = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onStop?.();
    };

    const handleCancelEdit = () => {
        setText('');
        onCancelEdit?.();
    };

    const handleKeyPress = (e: any) => {
        if (Platform.OS === 'web') {
            if (e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
                e.preventDefault();
                handleSend();
            }
        }
    };

    const isEditing = editingText !== null && editingText !== undefined;

    return (
        <View style={[styles.outerContainer, { backgroundColor: colors.backgroundColor, borderTopColor: colors.border }]}>
            {/* Edit mode banner */}
            {isEditing && (
                <View style={[styles.editBanner, { backgroundColor: colors.bannerBg, borderBottomColor: colors.border }]}>
                    <Text style={[styles.editBannerText, { color: colors.bannerText }]}>Editing message</Text>
                    <TouchableOpacity onPress={handleCancelEdit} style={styles.editCancelBtn}>
                        <X size={16} color={colors.textMuted} />
                    </TouchableOpacity>
                </View>
            )}

            <View style={styles.container}>
                <View style={[
                    styles.inputWrapper,
                    { backgroundColor: colors.inputBg, borderColor: colors.border, borderWidth: 1 },
                    isEditing && { borderColor: colors.tint, borderWidth: 1.5 }
                ]}>
                    <TextInput
                        style={[styles.input, { color: colors.text }]}
                        placeholder="Send a message..."
                        placeholderTextColor={colors.textMuted}
                        value={text}
                        onChangeText={setText}
                        multiline
                        onKeyPress={handleKeyPress}
                        editable={!isLoading}
                    />

                    {/* Send or Stop button */}
                    {isLoading ? (
                        <TouchableOpacity
                            style={[styles.stopButton, { backgroundColor: colors.errorText }]}
                            onPress={handleStop}
                            activeOpacity={0.7}
                        >
                            <Square size={16} color={colors.backgroundColor} />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={[
                                styles.sendButton,
                                { backgroundColor: text.trim() ? colors.tint : colors.border }
                            ]}
                            onPress={handleSend}
                            disabled={!text.trim()}
                            activeOpacity={0.7}
                        >
                            <Send size={18} color={text.trim() ? colors.backgroundColor : colors.textMuted} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    outerContainer: {
        borderTopWidth: 1,
    },
    editBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderBottomWidth: 1,
    },
    editBannerText: {
        fontSize: 13,
        fontWeight: '500',
    },
    editCancelBtn: {
        padding: 4,
    },
    container: {
        padding: 12,
        paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 6,
        minHeight: 44,
        maxHeight: 120,
    },
    input: {
        flex: 1,
        fontSize: 15,
        lineHeight: 22,
        paddingTop: 8,
        paddingBottom: 8,
    },
    sendButton: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
        marginBottom: 2,
    },
    stopButton: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
        marginBottom: 2,
    },
});
