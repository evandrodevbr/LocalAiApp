import { useThemeColor } from '@/hooks/useThemeColor';
import { ChatSession, useAppStore } from '@/store/useAppStore';
import { useRouter } from 'expo-router';
import { ArrowLeft, MessageSquare, Trash2 } from 'lucide-react-native';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HistoryScreen() {
    const colors = useThemeColor();
    const router = useRouter();
    const chatSessions = useAppStore(state => state.chatSessions);
    const loadChat = useAppStore(state => state.loadChat);
    const deleteChatSession = useAppStore(state => state.deleteChatSession);

    const handleLoadChat = (id: string) => {
        loadChat(id);
        router.back();
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.backgroundColor }]}>
            <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.backgroundColor }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>Chat History</Text>
            </View>

            {chatSessions.length === 0 ? (
                <View style={styles.emptyState}>
                    <MessageSquare size={48} color={colors.textMuted} />
                    <Text style={[styles.emptyText, { color: colors.textMuted }]}>No saved chats yet.</Text>
                </View>
            ) : (
                <FlatList
                    data={chatSessions}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }: { item: ChatSession }) => (
                        <TouchableOpacity
                            style={[
                                styles.chatItem,
                                { backgroundColor: colors.cardBackground, borderColor: colors.border }
                            ]}
                            onPress={() => handleLoadChat(item.id)}
                        >
                            <View style={styles.chatInfo}>
                                <Text style={[styles.chatTitle, { color: colors.text }]} numberOfLines={1}>
                                    {item.title}
                                </Text>
                                <Text style={[styles.chatDate, { color: colors.textMuted }]}>
                                    {new Date(item.updatedAt).toLocaleString()} · {item.messages.length} msgs
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() => deleteChatSession(item.id)}
                            >
                                <Trash2 size={20} color={colors.errorText} />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
    },
    backButton: {
        marginRight: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
    },
    listContent: {
        padding: 16,
        gap: 12,
    },
    chatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    chatInfo: {
        flex: 1,
        marginRight: 16,
    },
    chatTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    chatDate: {
        fontSize: 12,
    },
    deleteButton: {
        padding: 8,
    },
});
