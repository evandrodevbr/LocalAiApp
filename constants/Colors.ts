const tintColorLight = '#0F172A'; // slate-900
const tintColorDark = '#FAFAFA';  // zinc-50

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
        backgroundColor: '#09090B', // zinc-950
        cardBackground: '#18181B', // zinc-900
        text: '#FAFAFA', // zinc-50
        textMuted: '#A1A1AA', // zinc-400
        border: '#27272A', // zinc-800
        tint: tintColorDark,
        icon: '#A1A1AA',
        tabIconDefault: '#52525B', // zinc-600
        tabIconSelected: tintColorDark,
        // Chat specific
        messageUserText: '#09090B', // zinc-950
        messageUserBg: '#FAFAFA', // zinc-50
        messageAssistantText: '#F4F4F5', // zinc-100
        messageAssistantBg: '#18181B', // zinc-900
        inputBg: '#18181B', // zinc-900
        inputBorder: '#27272A', // zinc-800
        bannerBg: '#451A03', // amber-950
        bannerText: '#FDE68A', // amber-200
        successBg: '#052E16', // green-950
        successText: '#BBF7D0', // green-200
        errorBg: '#450A0A', // red-950
        errorText: '#FECACA', // red-200
        shadow: '#000000',
    },
};
