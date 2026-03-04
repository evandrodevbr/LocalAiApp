import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ConnectionBadgeProps {
    isConnected: boolean;
    compact?: boolean;
}

export function ConnectionBadge({ isConnected, compact }: ConnectionBadgeProps) {
    return (
        <View style={styles.container}>
            <View style={[styles.dot, isConnected ? styles.dotConnected : styles.dotDisconnected]} />
            {!compact && (
                <Text style={[styles.text, isConnected ? styles.textConnected : styles.textDisconnected]}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    dotConnected: {
        backgroundColor: '#22C55E',
    },
    dotDisconnected: {
        backgroundColor: '#EF4444',
    },
    text: {
        fontSize: 12,
        fontWeight: '500',
    },
    textConnected: {
        color: '#22C55E',
    },
    textDisconnected: {
        color: '#EF4444',
    },
});
