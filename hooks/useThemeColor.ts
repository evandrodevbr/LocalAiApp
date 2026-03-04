import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAppStore } from '@/store/useAppStore';

type ThemeType = 'light' | 'dark';
type ColorObj = typeof Colors.light & typeof Colors.dark;

// Overloads para resolver o erro TSC
export function useThemeColor(props: { light?: string; dark?: string }, colorName: keyof ColorObj): string;
export function useThemeColor(): ColorObj;
export function useThemeColor(
    props?: { light?: string; dark?: string },
    colorName?: keyof ColorObj
): string | ColorObj {
    const themePreference = useAppStore((state) => state.theme);
    const systemColorScheme = useColorScheme() ?? 'light';

    const theme: ThemeType = themePreference === 'system'
        ? systemColorScheme
        : (themePreference as ThemeType);

    if (props && props[theme]) {
        return props[theme] as string;
    }

    if (colorName) {
        return Colors[theme][colorName];
    }

    return Colors[theme];
}
