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
        <View style={styles.outerContainer}>
            {/* Edit mode banner */}
            {isEditing && (
                <View style={styles.editBanner}>
                    <Text style={styles.editBannerText}>Editing message</Text>
                    <TouchableOpacity onPress={handleCancelEdit} style={styles.editCancelBtn}>
                        <X size={16} color="#6B7280" />
                    </TouchableOpacity>
                </View>
            )}

            <View style={styles.container}>
                <View style={[styles.inputWrapper, isEditing && styles.inputWrapperEditing]}>
                    <TextInput
                        style={styles.input}
                        placeholder="Send a message..."
                        placeholderTextColor="#9CA3AF"
                        value={text}
                        onChangeText={setText}
                        multiline
                        onKeyPress={handleKeyPress}
                        editable={!isLoading}
                    />

                    {/* Send or Stop button */}
                    {isLoading ? (
                        <TouchableOpacity
                            style={styles.stopButton}
                            onPress={handleStop}
                            activeOpacity={0.7}
                        >
                            <Square size={16} color="#FFFFFF" />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={[styles.sendButton, !text.trim() && styles.sendButtonDisabled]}
                            onPress={handleSend}
                            disabled={!text.trim()}
                            activeOpacity={0.7}
                        >
                            <Send size={18} color={text.trim() ? '#FFFFFF' : '#9CA3AF'} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    outerContainer: {
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    editBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#EFF6FF',
        borderBottomWidth: 1,
        borderBottomColor: '#DBEAFE',
    },
    editBannerText: {
        fontSize: 13,
        color: '#2563EB',
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
        backgroundColor: '#F3F4F6',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 6,
        minHeight: 44,
        maxHeight: 120,
    },
    inputWrapperEditing: {
        borderWidth: 1.5,
        borderColor: '#2563EB',
    },
    input: {
        flex: 1,
        fontSize: 15,
        lineHeight: 22,
        paddingTop: 8,
        paddingBottom: 8,
        color: '#111827',
    },
    sendButton: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: '#111827',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
        marginBottom: 2,
    },
    sendButtonDisabled: {
        backgroundColor: '#E5E7EB',
    },
    stopButton: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: '#EF4444',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
        marginBottom: 2,
    },
});
