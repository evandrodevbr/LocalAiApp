import { ModelSelector } from '@/components/chat/ModelSelector';
import { useAppStore } from '@/store/useAppStore';
import { Stack, useRouter } from 'expo-router';
import { Plus, Settings } from 'lucide-react-native';
import { Platform, StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native';

export default function ChatLayout() {
    const { width } = useWindowDimensions();
    const router = useRouter();
    const clearChat = useAppStore(state => state.clearChat);

    const isLargeScreen = width > 768;
    const containerStyle = isLargeScreen ? styles.desktopContainer : styles.mobileContainer;
    const chatMaxWidth = isLargeScreen ? 800 : '100%';

    return (
        <View style={containerStyle}>
            <View style={[styles.chatWrapper, { maxWidth: chatMaxWidth }]}>
                <Stack>
                    <Stack.Screen
                        name="index"
                        options={{
                            headerTitle: () => <ModelSelector />,
                            headerShadowVisible: false,
                            headerLeft: () => (
                                <TouchableOpacity
                                    onPress={clearChat}
                                    style={styles.headerBtn}
                                    activeOpacity={0.7}
                                >
                                    <Plus size={22} color="#111827" />
                                </TouchableOpacity>
                            ),
                            headerRight: () => (
                                <TouchableOpacity
                                    onPress={() => router.push('/settings')}
                                    style={styles.headerBtn}
                                    activeOpacity={0.7}
                                >
                                    <Settings size={22} color="#111827" />
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
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    mobileContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    chatWrapper: {
        flex: 1,
        width: '100%',
        backgroundColor: '#FFFFFF',
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
