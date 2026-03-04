const tintColorLight = '#0F172A'; // slate-900
const tintColorDark = '#F8FAFC';  // slate-50

export const Colors = {
    light: {
        backgroundColor: '#F8FAFC', // slate-50
        cardBackground: '#FFFFFF',
        text: '#0F172A', // slate-900
        textMuted: '#64748B', // slate-500
        border: '#E2E8F0', // slate-200
        tint: tintColorLight,
        icon: '#64748B',
        tabIconDefault: '#94A3B8',
        tabIconSelected: tintColorLight,
        // Chat specific
        messageUserText: '#FFFFFF',
        messageUserBg: '#0F172A', // slate-900
        messageAssistantText: '#0F172A',
        messageAssistantBg: '#FFFFFF',
        inputBg: '#FFFFFF',
        inputBorder: '#E2E8F0',
        bannerBg: '#FEF3C7', // amber-100
        bannerText: '#92400E', // amber-900
        successBg: '#F0FDF4', // green-50
        successText: '#166534', // green-800
        errorBg: '#FEF2F2', // red-50
        errorText: '#991B1B', // red-800
        shadow: '#000000',
    },
    dark: {
        backgroundColor: '#020617', // slate-950
        cardBackground: '#0F172A', // slate-900
        text: '#F8FAFC', // slate-50
        textMuted: '#94A3B8', // slate-400
        border: '#1E293B', // slate-800
        tint: tintColorDark,
        icon: '#94A3B8',
        tabIconDefault: '#475569',
        tabIconSelected: tintColorDark,
        // Chat specific
        messageUserText: '#020617', // slate-950
        messageUserBg: '#F8FAFC', // slate-50
        messageAssistantText: '#E2E8F0', // slate-200
        messageAssistantBg: '#0F172A', // slate-900
        inputBg: '#0F172A', // slate-900
        inputBorder: '#1E293B', // slate-800
        bannerBg: '#451A03', // amber-950
        bannerText: '#FDE68A', // amber-200
        successBg: '#052E16', // green-950
        successText: '#BBF7D0', // green-200
        errorBg: '#450A0A', // red-950
        errorText: '#FECACA', // red-200
        shadow: '#000000',
    },
};
