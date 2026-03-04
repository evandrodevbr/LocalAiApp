import { ModelSelector } from '@/components/chat/ModelSelector';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAppStore } from '@/store/useAppStore';
import { Stack, useRouter } from 'expo-router';
import { Plus, Settings } from 'lucide-react-native';
import { Platform, StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native';

export default function ChatLayout() {
    const { width } = useWindowDimensions();
    const router = useRouter();
    const clearChat = useAppStore(state => state.clearChat);
    const colors = useThemeColor();

    const isLargeScreen = width > 768;
    const containerStyle = [
        isLargeScreen ? styles.desktopContainer : styles.mobileContainer,
        { backgroundColor: isLargeScreen ? colors.border : colors.backgroundColor }
    ];
    const chatMaxWidth = isLargeScreen ? 800 : '100%';

    return (
        <View style={containerStyle}>
            <View style={[
                styles.chatWrapper,
                { maxWidth: chatMaxWidth, backgroundColor: colors.backgroundColor },
                isLargeScreen && { borderColor: colors.border, borderWidth: 1 }
            ]}>
                <Stack>
                    <Stack.Screen
                        name="index"
                        options={{
                            headerTitle: () => <ModelSelector />,
                            headerShadowVisible: false,
                            headerStyle: { backgroundColor: colors.backgroundColor },
                            headerLeft: () => (
                                <TouchableOpacity
                                    onPress={clearChat}
                                    style={[styles.headerBtn, { backgroundColor: colors.cardBackground }]}
                                    activeOpacity={0.7}
                                >
                                    <Plus size={22} color={colors.text} />
                                </TouchableOpacity>
                            ),
                            headerRight: () => (
                                <TouchableOpacity
                                    onPress={() => router.push('/settings')}
                                    style={[styles.headerBtn, { backgroundColor: colors.cardBackground }]}
                                    activeOpacity={0.7}
                                >
                                    <Settings size={22} color={colors.text} />
                                </TouchableOpacity>
                            ),
                        }}
                    />
                </Stack>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    desktopContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mobileContainer: {
        flex: 1,
    },
    chatWrapper: {
        flex: 1,
        width: '100%',
        ...Platform.select({
            web: {
                shadowColor: '#000',
                shadowOpacity: 0.1,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 4 },
            }
        })
    },
    headerBtn: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 4,
    },
});
