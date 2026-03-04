import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenWrapperProps {
    children: React.ReactNode;
    style?: ViewStyle;
    contentContainerStyle?: ViewStyle;
    scrollable?: boolean;
}

export function ScreenWrapper({
    children,
    style,
    contentContainerStyle,
    scrollable = false
}: ScreenWrapperProps) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];
    const insets = useSafeAreaInsets();

    const containerStyle = [
        styles.container,
        {
            backgroundColor: theme.background,
            paddingTop: insets.top,
            paddingLeft: insets.left,
            paddingRight: insets.right,
        },
        style
    ];

    if (scrollable) {
        return (
            <View style={{ flex: 1, backgroundColor: theme.background }}>
                <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
                <ScrollView
                    style={containerStyle}
                    contentContainerStyle={[
                        { paddingBottom: insets.bottom + 20 },
                        contentContainerStyle
                    ]}
                >
                    {children}
                </ScrollView>
            </View>
        );
    }

    return (
        <View style={containerStyle}>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <View style={[{ flex: 1, paddingBottom: insets.bottom }, contentContainerStyle]}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
