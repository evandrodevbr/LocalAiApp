import { ConnectionBadge } from '@/components/ui/ConnectionBadge';
import { useLMStudio } from '@/hooks/useLMStudio';
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
                style={styles.headerButton}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.7}
            >
                <ConnectionBadge isConnected={isConnected} compact />
                <Text style={styles.headerText} numberOfLines={1}>
                    {activeModelName}
                </Text>
                <ChevronDown size={16} color="#111827" style={styles.iconOffset} />
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
                    <View style={styles.bottomSheet} onStartShouldSetResponder={() => true}>
                        <View style={styles.dragHandle} />

                        <View style={styles.sheetHeader}>
                            <Text style={styles.sheetTitle}>Select Model</Text>
                            <TouchableOpacity
                                onPress={handleRefresh}
                                style={styles.refreshButton}
                                disabled={isRefreshing}
                            >
                                {isRefreshing ? (
                                    <ActivityIndicator size="small" color="#6B7280" />
                                ) : (
                                    <RefreshCw size={18} color="#6B7280" />
                                )}
                            </TouchableOpacity>
                        </View>

                        {!isConnected && (
                            <View style={styles.warningBox}>
                                <Text style={styles.warningText}>
                                    Not connected to LM Studio. Configure server in Settings.
                                </Text>
                            </View>
                        )}

                        {availableModels.length === 0 && isConnected && (
                            <View style={styles.emptyBox}>
                                <Text style={styles.emptyText}>
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
                                        style={[styles.itemRow, isSelected && styles.itemRowSelected]}
                                        onPress={() => handleSelect(item.id)}
                                    >
                                        <View style={styles.itemContent}>
                                            <Text style={[styles.itemName, isSelected && styles.itemNameSelected]}>
                                                {item.id}
                                            </Text>
                                            <View style={styles.badgeRow}>
                                                <View style={styles.badge}>
                                                    <Text style={styles.badgeText}>API</Text>
                                                </View>
                                                {item.owned_by && (
                                                    <View style={[styles.badge, styles.badgeSecondary]}>
                                                        <Text style={styles.badgeText}>{item.owned_by}</Text>
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                        {isSelected && <Check size={20} color="#000000" />}
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
        backgroundColor: '#F3F4F6',
        gap: 8,
        maxWidth: 280,
    },
    headerText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        flexShrink: 1,
    },
    iconOffset: {
        marginTop: 2,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    bottomSheet: {
        backgroundColor: '#FFFFFF',
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
        backgroundColor: '#E5E7EB',
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
        color: '#111827',
    },
    refreshButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
    },
    warningBox: {
        backgroundColor: '#FEF3C7',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    warningText: {
        fontSize: 13,
        color: '#92400E',
        textAlign: 'center',
    },
    emptyBox: {
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 14,
        color: '#6B7280',
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
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    itemRowSelected: {
        borderColor: '#000000',
        backgroundColor: '#F9FAFB',
    },
    itemContent: {
        flex: 1,
        paddingRight: 16,
    },
    itemName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 6,
    },
    itemNameSelected: {
        color: '#000000',
    },
    badgeRow: {
        flexDirection: 'row',
        gap: 6,
    },
    badge: {
        alignSelf: 'flex-start',
        backgroundColor: '#DBEAFE',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    badgeSecondary: {
        backgroundColor: '#F3F4F6',
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '500',
        color: '#4B5563',
    },
});
