import React from 'react';
import { StyleSheet, View } from 'react-native';

export function TypingIndicator() {
    return (
        <View style={styles.container}>
            <View style={styles.bubble}>
                <View style={styles.dotsRow}>
                    <View style={[styles.dot, styles.dot1]} />
                    <View style={[styles.dot, styles.dot2]} />
                    <View style={[styles.dot, styles.dot3]} />
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
        backgroundColor: '#F3F4F6',
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
        backgroundColor: '#9CA3AF',
        opacity: 0.6,
    },
    dot1: { opacity: 1.0 },
    dot2: { opacity: 0.7 },
    dot3: { opacity: 0.4 },
});
