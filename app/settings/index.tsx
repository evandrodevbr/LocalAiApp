import { ConnectionBadge } from '@/components/ui/ConnectionBadge';
import * as api from '@/services/lmStudioApi';
import { ServerConfig } from '@/services/types';
import { useAppStore } from '@/store/useAppStore';
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
    View
} from 'react-native';

export default function SettingsScreen() {
    const { width } = useWindowDimensions();
    const theme = useAppStore(state => state.theme);
    const setTheme = useAppStore(state => state.setTheme);
    const serverConfig = useAppStore(state => state.serverConfig);
    const setServerConfig = useAppStore(state => state.setServerConfig);
    const isConnected = useAppStore(state => state.isConnected);
    const setIsConnected = useAppStore(state => state.setIsConnected);

    const [host, setHost] = useState(serverConfig.host);
    const [port, setPort] = useState(serverConfig.port.toString());
    const [apiKey, setApiKey] = useState(serverConfig.apiKey ?? '');
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState<boolean | null>(null);

    const isDarkMode = theme === 'dark' || theme === 'system';
    const toggleTheme = () => setTheme(isDarkMode ? 'light' : 'dark');

    const isLargeScreen = width > 768;

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
        setIsTesting(false);
    };

    const configChanged =
        host !== serverConfig.host ||
        port !== serverConfig.port.toString() ||
        apiKey !== (serverConfig.apiKey ?? '');

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={[
                styles.scrollContent,
                isLargeScreen && styles.desktopContent,
            ]}
        >
            {/* Server Connection */}
            <View style={[styles.card, isLargeScreen && styles.desktopCard]}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Server Connection</Text>
                    <ConnectionBadge isConnected={isConnected} />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Host</Text>
                    <TextInput
                        style={styles.textInput}
                        value={host}
                        onChangeText={setHost}
                        placeholder="localhost"
                        placeholderTextColor="#9CA3AF"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Port</Text>
                    <TextInput
                        style={styles.textInput}
                        value={port}
                        onChangeText={setPort}
                        placeholder="1234"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="numeric"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>API Key (optional)</Text>
                    <TextInput
                        style={styles.textInput}
                        value={apiKey}
                        onChangeText={setApiKey}
                        placeholder="Leave empty for local"
                        placeholderTextColor="#9CA3AF"
                        autoCapitalize="none"
                        autoCorrect={false}
                        secureTextEntry
                    />
                </View>

                <View style={styles.buttonRow}>
                    {configChanged && (
                        <TouchableOpacity style={styles.saveButton} onPress={handleSaveConfig}>
                            <Text style={styles.saveButtonText}>Save</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={[styles.testButton, isTesting && styles.testButtonDisabled]}
                        onPress={handleTestConnection}
                        disabled={isTesting}
                    >
                        {isTesting ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Text style={styles.testButtonText}>Test Connection</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {testResult !== null && (
                    <View style={[styles.resultBox, testResult ? styles.resultSuccess : styles.resultError]}>
                        <Text style={[styles.resultText, testResult ? styles.resultTextSuccess : styles.resultTextError]}>
                            {testResult
                                ? '✅ Connected successfully!'
                                : '❌ Connection failed. Check host, port, and if LM Studio is running.'}
                        </Text>
                    </View>
                )}
            </View>

            {/* Appearance */}
            <View style={[styles.card, isLargeScreen && styles.desktopCard]}>
                <Text style={styles.sectionTitle}>Appearance</Text>

                <View style={styles.row}>
                    <View style={styles.rowText}>
                        <Text style={styles.rowTitle}>Dark Mode</Text>
                        <Text style={styles.rowSubtitle}>Toggle application theme</Text>
                    </View>
                    <Switch
                        value={isDarkMode}
                        onValueChange={toggleTheme}
                        trackColor={{ false: '#D1D5DB', true: '#000000' }}
                        thumbColor={'#FFFFFF'}
                    />
                </View>
            </View>

            {/* About */}
            <View style={[styles.card, isLargeScreen && styles.desktopCard]}>
                <Text style={styles.sectionTitle}>About</Text>
                <Text style={styles.infoText}>LocalAiApp - Cross Platform Version</Text>
                <Text style={[styles.infoText, { marginTop: 4, fontSize: 13, color: '#9CA3AF' }]}>
                    Using OpenAI-compatible API (/v1)
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    desktopContent: {
        alignItems: 'center',
        paddingTop: 40,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    desktopCard: {
        width: '100%',
        maxWidth: 600,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    inputGroup: {
        marginBottom: 14,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 6,
    },
    textInput: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 15,
        color: '#111827',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 4,
    },
    saveButton: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    saveButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#374151',
    },
    testButton: {
        flex: 2,
        backgroundColor: '#000000',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    testButtonDisabled: {
        opacity: 0.6,
    },
    testButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    resultBox: {
        marginTop: 12,
        borderRadius: 8,
        padding: 12,
    },
    resultSuccess: {
        backgroundColor: '#F0FDF4',
    },
    resultError: {
        backgroundColor: '#FEF2F2',
    },
    resultText: {
        fontSize: 14,
        textAlign: 'center',
    },
    resultTextSuccess: {
        color: '#166534',
    },
    resultTextError: {
        color: '#991B1B',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    rowText: {
        flex: 1,
        paddingRight: 16,
    },
    rowTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#111827',
        marginBottom: 4,
    },
    rowSubtitle: {
        fontSize: 14,
        color: '#6B7280',
    },
    infoText: {
        fontSize: 15,
        lineHeight: 22,
        color: '#4B5563',
    },
});
