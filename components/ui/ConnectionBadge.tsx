import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ConnectionBadgeProps {
    isConnected: boolean;
    compact?: boolean;
}

export function ConnectionBadge({ isConnected, compact }: ConnectionBadgeProps) {
    const colors = useThemeColor();

    return (
        <View style={styles.container}>
            <View style={[
                styles.dot,
                { backgroundColor: isConnected ? colors.successText : colors.errorText }
            ]} />
            {!compact && (
                <Text style={[
                    styles.text,
                    { color: isConnected ? colors.successText : colors.errorText }
                ]}>
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
    text: {
        fontSize: 12,
        fontWeight: '500',
    },
});
