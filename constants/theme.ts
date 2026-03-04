/**
 * ManusAI Theme - Monochromatic/Minimalist
 * 
 * Design System:
 * - Primary: White (#ffffff)
 * - Background: Deep Matte Black (#09090b)
 * - Surface: Zinc-900 (#18181b)
 * - Border: Zinc-700 (#3f3f46)
 * - Text: Zinc-50 (#fafafa)
 */

import { Platform } from 'react-native';

const ManusColors = {
  // Base
  black: '#09090b',
  zinc900: '#18181b',
  zinc800: '#27272a',
  zinc700: '#3f3f46',
  zinc400: '#a1a1aa',
  zinc50: '#fafafa',
  white: '#ffffff',

  // Semantic
  background: '#09090b',
  surface: '#18181b',
  surfaceHighlight: '#27272a',
  primary: '#ffffff',
  border: '#3f3f46',
  text: '#fafafa',
  textSecondary: '#a1a1aa',
  error: '#ef4444',
};

export const Colors = {
  light: {
    text: ManusColors.black,
    background: ManusColors.white,
    tint: ManusColors.black,
    icon: ManusColors.zinc700,
    tabIconDefault: ManusColors.zinc400,
    tabIconSelected: ManusColors.black,
    // Manus Specific
    surface: '#f4f4f5', // Zinc-100
    surfaceHighlight: '#e4e4e7', // Zinc-200
    border: '#d4d4d8', // Zinc-300
    textSecondary: ManusColors.zinc700,
    primary: ManusColors.black,
  },
  dark: {
    text: ManusColors.text,
    background: ManusColors.background,
    tint: ManusColors.primary,
    icon: ManusColors.zinc400,
    tabIconDefault: ManusColors.zinc400,
    tabIconSelected: ManusColors.primary,
    // Manus Specific
    surface: ManusColors.surface,
    surfaceHighlight: ManusColors.surfaceHighlight,
    border: ManusColors.border,
    textSecondary: ManusColors.textSecondary,
    primary: ManusColors.primary,
  },
  // Unified access for components that ignore system theme
  manus: ManusColors,
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  android: {
    sans: 'sans-serif',
    serif: 'serif',
    rounded: 'sans-serif-medium',
    mono: 'monospace',
  },
  default: {
    sans: 'system-ui',
    serif: 'serif',
    rounded: 'system-ui',
    mono: 'monospace',
  },
});
