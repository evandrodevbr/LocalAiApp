import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export function TypingIndicator() {
    const colors = useThemeColor();

    return (
        <View style={styles.container}>
            <View style={[styles.bubble, { backgroundColor: colors.messageAssistantBg }]}>
                <View style={styles.dotsRow}>
                    <View style={[styles.dot, styles.dot1, { backgroundColor: colors.textMuted }]} />
                    <View style={[styles.dot, styles.dot2, { backgroundColor: colors.textMuted }]} />
                    <View style={[styles.dot, styles.dot3, { backgroundColor: colors.textMuted }]} />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: 16,
        marginVertical: 4,
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    bubble: {
        borderRadius: 20,
        borderTopLeftRadius: 4,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    dotsRow: {
        flexDirection: 'row',
        gap: 4,
        alignItems: 'center',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        opacity: 0.6,
    },
    dot1: { opacity: 1.0 },
    dot2: { opacity: 0.7 },
    dot3: { opacity: 0.4 },
});
