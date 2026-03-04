import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Copy, Pencil, RefreshCw, Trash2 } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface MessageActionsProps {
    role: 'user' | 'assistant' | 'system';
    content: string;
    onEdit?: () => void;
    onRegenerate?: () => void;
    onDelete?: () => void;
    isStreaming?: boolean;
}

export function MessageActions({
    role,
    content,
    onEdit,
    onRegenerate,
    onDelete,
    isStreaming,
}: MessageActionsProps) {
    const handleCopy = async () => {
        await Clipboard.setStringAsync(content);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    const handleEdit = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onEdit?.();
    };

    const handleRegenerate = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onRegenerate?.();
    };

    const handleDelete = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onDelete?.();
    };

    if (isStreaming) return null;

    const isUser = role === 'user';

    return (
        <View style={[styles.container, isUser ? styles.containerUser : styles.containerAssistant]}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleCopy} activeOpacity={0.6}>
                <Copy size={14} color="#9CA3AF" />
            </TouchableOpacity>

            {isUser && onEdit && (
                <TouchableOpacity style={styles.actionBtn} onPress={handleEdit} activeOpacity={0.6}>
                    <Pencil size={14} color="#9CA3AF" />
                </TouchableOpacity>
            )}

            {!isUser && onRegenerate && (
                <TouchableOpacity style={styles.actionBtn} onPress={handleRegenerate} activeOpacity={0.6}>
                    <RefreshCw size={14} color="#9CA3AF" />
                </TouchableOpacity>
            )}

            {onDelete && (
                <TouchableOpacity style={styles.actionBtn} onPress={handleDelete} activeOpacity={0.6}>
                    <Trash2 size={14} color="#9CA3AF" />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: 2,
        marginTop: 4,
        paddingHorizontal: 16,
    },
    containerUser: {
        justifyContent: 'flex-end',
    },
    containerAssistant: {
        justifyContent: 'flex-start',
    },
    actionBtn: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
});
