import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    icon?: React.ReactNode;
}

export function Button({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    style,
    textStyle,
    icon
}: ButtonProps) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    const getBackgroundColor = () => {
        if (disabled) return theme.surfaceHighlight;
        switch (variant) {
            case 'primary': return theme.primary;
            case 'secondary': return theme.surfaceHighlight;
            case 'outline': return 'transparent';
            case 'ghost': return 'transparent';
            default: return theme.primary;
        }
    };

    const getTextColor = () => {
        if (disabled) return theme.textSecondary;
        switch (variant) {
            case 'primary': return theme.background; // Black text on white bg
            case 'secondary': return theme.text;
            case 'outline': return theme.text;
            case 'ghost': return theme.textSecondary;
            default: return theme.background;
        }
    };

    const getBorder = () => {
        if (variant === 'outline') return { borderWidth: 1, borderColor: theme.border };
        return {};
    };

    const getPadding = () => {
        switch (size) {
            case 'sm': return { paddingVertical: 8, paddingHorizontal: 12 };
            case 'lg': return { paddingVertical: 16, paddingHorizontal: 24 };
            default: return { paddingVertical: 12, paddingHorizontal: 20 };
        }
    };

    const getFontSize = () => {
        switch (size) {
            case 'sm': return 13;
            case 'lg': return 17;
            default: return 15;
        }
    };

    return (
        <Pressable
            onPress={onPress}
            disabled={disabled || loading}
            style={({ pressed }) => [
                styles.button,
                { backgroundColor: getBackgroundColor() },
                getBorder(),
                getPadding(),
                { opacity: pressed ? 0.8 : 1 },
                style
            ]}
        >
            {loading ? (
                <ActivityIndicator color={getTextColor()} />
            ) : (
                <>
                    {icon}
                    <Text style={[
                        styles.text,
                        { color: getTextColor(), fontSize: getFontSize() },
                        icon ? { marginLeft: 8 } : {},
                        textStyle
                    ]}>
                        {title}
                    </Text>
                </>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontWeight: '600',
        letterSpacing: 0.5,
    },
});
