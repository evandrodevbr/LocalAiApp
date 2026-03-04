import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface GlassCardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    variant?: 'default' | 'highlight';
}

export function GlassCard({ children, style, variant = 'default' }: GlassCardProps) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    return (
        <View style={[
            styles.card,
            {
                backgroundColor: variant === 'default' ? theme.surface : theme.surfaceHighlight,
                borderColor: theme.border,
            },
            style
        ]}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
        overflow: 'hidden',
    },
});
