import { ConnectionBadge } from '@/components/ui/ConnectionBadge';
import { useLMStudio } from '@/hooks/useLMStudio';
import { useThemeColor } from '@/hooks/useThemeColor';
import * as api from '@/services/lmStudioApi';
import { ServerConfig } from '@/services/types';
import { useAppStore } from '@/store/useAppStore';
import { Info, MonitorCog, Moon, Network } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native';

export default function SettingsScreen() {
    const { width } = useWindowDimensions();
    const colors = useThemeColor(); // Get current theme colors

    // Global State
    const themePreference = useAppStore(state => state.theme);
    const setTheme = useAppStore(state => state.setTheme);
    const serverConfig = useAppStore(state => state.serverConfig);
    const setServerConfig = useAppStore(state => state.setServerConfig);
    const isConnected = useAppStore(state => state.isConnected);
    const setIsConnected = useAppStore(state => state.setIsConnected);
    const { fetchModels } = useLMStudio();

    // Local State
    const [host, setHost] = useState(serverConfig.host);
    const [port, setPort] = useState(serverConfig.port.toString());
    const [apiKey, setApiKey] = useState(serverConfig.apiKey ?? '');
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState<boolean | null>(null);

    const isLargeScreen = width > 768;
    const isDarkMode = themePreference === 'dark' || (themePreference === 'system' && colors.backgroundColor === '#09090B'); // Hacky check but robust given our Colors.ts
    const toggleTheme = () => setTheme(isDarkMode ? 'light' : 'dark');

    const currentConfig: ServerConfig = {
        host: host.trim() || 'localhost',
        port: parseInt(port, 10) || 1234,
        apiKey: apiKey.trim() || undefined,
    };

    const handleSaveConfig = () => {
        setServerConfig(currentConfig);
        setTestResult(null);
    };

    const handleTestConnection = async () => {
        handleSaveConfig();
        setIsTesting(true);
        setTestResult(null);

        const ok = await api.testConnection(currentConfig);
        setTestResult(ok);
        setIsConnected(ok);
        if (ok) {
            await fetchModels();
        }
        setIsTesting(false);
    };

    const configChanged =
        host !== serverConfig.host ||
        port !== serverConfig.port.toString() ||
        apiKey !== (serverConfig.apiKey ?? '');

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.backgroundColor }]}
            contentContainerStyle={[
                styles.scrollContent,
                isLargeScreen && styles.desktopContent,
            ]}
        >
            {/* Server Connection Section */}
            <View style={[styles.section, isLargeScreen && styles.desktopSection]}>
                <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>SERVER CONNECTION</Text>

                <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                    <View style={styles.cardHeader}>
                        <View style={styles.cardHeaderTitle}>
                            <Network size={20} color={colors.text} style={styles.headerIcon} />
                            <Text style={[styles.cardTitle, { color: colors.text }]}>LM Studio API</Text>
                        </View>
                        <ConnectionBadge isConnected={isConnected} />
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.textMuted }]}>Host IP / Address</Text>
                        <TextInput
                            style={[
                                styles.textInput,
                                { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }
                            ]}
                            value={host}
                            onChangeText={setHost}
                            placeholder="localhost"
                            placeholderTextColor={colors.textMuted}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.textMuted }]}>Port Number</Text>
                        <TextInput
                            style={[
                                styles.textInput,
                                { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }
                            ]}
                            value={port}
                            onChangeText={setPort}
                            placeholder="1234"
                            placeholderTextColor={colors.textMuted}
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.textMuted }]}>API Key (optional)</Text>
                        <TextInput
                            style={[
                                styles.textInput,
                                { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }
                            ]}
                            value={apiKey}
                            onChangeText={setApiKey}
                            placeholder="Leave empty for local"
                            placeholderTextColor={colors.textMuted}
                            autoCapitalize="none"
                            autoCorrect={false}
                            secureTextEntry
                        />
                    </View>

                    <View style={styles.buttonRow}>
                        {configChanged && (
                            <TouchableOpacity
                                style={[styles.saveButton, { borderColor: colors.border, backgroundColor: colors.cardBackground }]}
                                onPress={handleSaveConfig}
                            >
                                <Text style={[styles.saveButtonText, { color: colors.text }]}>Save Changes</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={[
                                styles.testButton,
                                { backgroundColor: colors.tint },
                                isTesting && styles.testButtonDisabled
                            ]}
                            onPress={handleTestConnection}
                            disabled={isTesting}
                        >
                            {isTesting ? (
                                <ActivityIndicator size="small" color={colors.backgroundColor} />
                            ) : (
                                <Text style={[styles.testButtonText, { color: colors.backgroundColor }]}>Test Connection</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {testResult !== null && (
                        <View style={[
                            styles.resultBox,
                            { backgroundColor: testResult ? colors.successBg : colors.errorBg }
                        ]}>
                            <Text style={[
                                styles.resultText,
                                { color: testResult ? colors.successText : colors.errorText }
                            ]}>
                                {testResult
                                    ? 'Connection successful. API is ready.'
                                    : 'Connection failed. Verify host and port.'}
                            </Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Appearance Section */}
            <View style={[styles.section, isLargeScreen && styles.desktopSection]}>
                <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>APPEARANCE</Text>
                <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                    <View style={styles.row}>
                        <View style={styles.rowIconWrap}>
                            <Moon size={20} color={colors.text} />
                        </View>
                        <View style={styles.rowText}>
                            <Text style={[styles.rowTitle, { color: colors.text }]}>Dark Mode</Text>
                            <Text style={[styles.rowSubtitle, { color: colors.textMuted }]}>Toggle sleek dark theme</Text>
                        </View>
                        <Switch
                            value={isDarkMode}
                            onValueChange={toggleTheme}
                            trackColor={{ false: '#E2E8F0', true: colors.tint }}
                            thumbColor={'#FFFFFF'}
                        />
                    </View>
                </View>
            </View>

            {/* About Section */}
            <View style={[styles.section, isLargeScreen && styles.desktopSection]}>
                <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>ABOUT</Text>
                <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                    <View style={styles.rowGroup}>
                        <Info size={18} color={colors.textMuted} style={styles.infoIcon} />
                        <Text style={[styles.infoText, { color: colors.text }]}>LocalAiApp - Cross Platform Version</Text>
                    </View>
                    <View style={[styles.rowGroup, { marginTop: 8 }]}>
                        <MonitorCog size={18} color={colors.textMuted} style={styles.infoIcon} />
                        <Text style={[styles.infoText, { color: colors.textMuted, fontSize: 13 }]}>
                            Connected via OpenAPI `/v1/chat/completions` specs
                        </Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    desktopContent: {
        alignItems: 'center',
        paddingTop: 40,
    },
    section: {
        marginBottom: 24,
    },
    desktopSection: {
        width: '100%',
        maxWidth: 600,
    },
    sectionLabel: {
        fontSize: 13,
        fontWeight: '600',
        marginLeft: 16,
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    card: {
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    cardHeaderTitle: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerIcon: {
        marginRight: 8,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    divider: {
        height: 1,
        width: '100%',
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    textInput: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    saveButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
    },
    saveButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },
    testButton: {
        flex: 2,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    testButtonDisabled: {
        opacity: 0.7,
    },
    testButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },
    resultBox: {
        marginTop: 16,
        borderRadius: 12,
        padding: 14,
    },
    resultText: {
        fontSize: 14,
        textAlign: 'center',
        fontWeight: '500',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    rowIconWrap: {
        marginRight: 12,
    },
    rowText: {
        flex: 1,
    },
    rowTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    rowSubtitle: {
        fontSize: 14,
    },
    rowGroup: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoIcon: {
        marginRight: 10,
    },
    infoText: {
        fontSize: 15,
        lineHeight: 22,
    },
});
