import { ConnectionBadge } from '@/components/ui/ConnectionBadge';
import { useLMStudio } from '@/hooks/useLMStudio';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAppStore } from '@/store/useAppStore';
import { Check, ChevronDown, RefreshCw } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export function ModelSelector() {
    const [modalVisible, setModalVisible] = useState(false);
    const activeModelId = useAppStore(state => state.activeModelId);
    const setActiveModelId = useAppStore(state => state.setActiveModelId);
    const { availableModels, isConnected, fetchModels } = useLMStudio();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const colors = useThemeColor();

    const handleSelect = (modelId: string) => {
        setActiveModelId(modelId);
        setModalVisible(false);
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchModels();
        setIsRefreshing(false);
    };

    const activeModelName = activeModelId || 'Select Model';

    return (
        <>
            <TouchableOpacity
                style={[styles.headerButton, { backgroundColor: colors.cardBackground }]}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.7}
            >
                <ConnectionBadge isConnected={isConnected} compact />
                <Text style={[styles.headerText, { color: colors.text }]} numberOfLines={1}>
                    {activeModelName}
                </Text>
                <ChevronDown size={16} color={colors.text} style={styles.iconOffset} />
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPressOut={() => setModalVisible(false)}
                >
                    <View style={[styles.bottomSheet, { backgroundColor: colors.backgroundColor }]} onStartShouldSetResponder={() => true}>
                        <View style={[styles.dragHandle, { backgroundColor: colors.border }]} />

                        <View style={styles.sheetHeader}>
                            <Text style={[styles.sheetTitle, { color: colors.text }]}>Select Model</Text>
                            <TouchableOpacity
                                onPress={handleRefresh}
                                style={[styles.refreshButton, { backgroundColor: colors.cardBackground }]}
                                disabled={isRefreshing}
                            >
                                {isRefreshing ? (
                                    <ActivityIndicator size="small" color={colors.textMuted} />
                                ) : (
                                    <RefreshCw size={18} color={colors.textMuted} />
                                )}
                            </TouchableOpacity>
                        </View>

                        {!isConnected && (
                            <View style={[styles.warningBox, { backgroundColor: colors.bannerBg }]}>
                                <Text style={[styles.warningText, { color: colors.bannerText }]}>
                                    Not connected to LM Studio. Configure server in Settings.
                                </Text>
                            </View>
                        )}

                        {availableModels.length === 0 && isConnected && (
                            <View style={[styles.emptyBox, { backgroundColor: colors.cardBackground }]}>
                                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                                    No models loaded. Load a model in LM Studio first.
                                </Text>
                            </View>
                        )}

                        <FlatList
                            data={availableModels}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => {
                                const isSelected = item.id === activeModelId;
                                return (
                                    <TouchableOpacity
                                        style={[
                                            styles.itemRow,
                                            { backgroundColor: colors.cardBackground, borderColor: colors.border },
                                            isSelected && { borderColor: colors.tint }
                                        ]}
                                        onPress={() => handleSelect(item.id)}
                                    >
                                        <View style={styles.itemContent}>
                                            <Text style={[styles.itemName, { color: colors.text }]}>
                                                {item.id}
                                            </Text>
                                            <View style={styles.badgeRow}>
                                                <View style={[styles.badge, { backgroundColor: colors.inputBg }]}>
                                                    <Text style={[styles.badgeText, { color: colors.textMuted }]}>API</Text>
                                                </View>
                                                {item.owned_by && (
                                                    <View style={[styles.badge, { backgroundColor: colors.inputBg }]}>
                                                        <Text style={[styles.badgeText, { color: colors.textMuted }]}>{item.owned_by}</Text>
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                        {isSelected && <Check size={20} color={colors.tint} />}
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    headerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        gap: 8,
        maxWidth: 280,
    },
    headerText: {
        fontSize: 14,
        fontWeight: '600',
        flexShrink: 1,
    },
    iconOffset: {
        marginTop: 2,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    bottomSheet: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingTop: 12,
        maxHeight: '80%',
        ...Platform.select({
            web: {
                maxWidth: 480,
                marginHorizontal: 'auto',
                borderBottomLeftRadius: 24,
                borderBottomRightRadius: 24,
                marginBottom: 24,
                maxHeight: '60%',
                alignSelf: 'center',
                width: '100%',
                shadowColor: '#000',
                shadowOpacity: 0.1,
                shadowRadius: 24,
            }
        })
    },
    dragHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 16,
        ...Platform.select({ web: { display: 'none' } })
    },
    sheetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    sheetTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    refreshButton: {
        padding: 8,
        borderRadius: 8,
    },
    warningBox: {
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    warningText: {
        fontSize: 13,
        textAlign: 'center',
    },
    emptyBox: {
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
    },
    itemContent: {
        flex: 1,
        paddingRight: 16,
    },
    itemName: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 6,
    },
    badgeRow: {
        flexDirection: 'row',
        gap: 6,
    },
    badge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '500',
    },
});
