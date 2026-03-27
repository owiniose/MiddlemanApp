import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';

// Maps fontWeight to the correct DM Sans variant loaded via expo-google-fonts
const FONT_MAP: Record<string, string> = {
  '100': 'DMSans_400Regular',
  '200': 'DMSans_400Regular',
  '300': 'DMSans_400Regular',
  '400': 'DMSans_400Regular',
  'normal': 'DMSans_400Regular',
  '500': 'DMSans_500Medium',
  '600': 'DMSans_600SemiBold',
  '700': 'DMSans_700Bold',
  'bold': 'DMSans_700Bold',
  '800': 'DMSans_700Bold',
  '900': 'DMSans_700Bold',
};

export default function Text({ style, ...props }: TextProps) {
  const flat = StyleSheet.flatten(style) ?? {};
  const weight = String(flat.fontWeight ?? '400');
  const fontFamily = FONT_MAP[weight] ?? 'DMSans_400Regular';
  // Spread style last so caller can still override fontFamily if needed
  return <RNText style={[{ fontFamily }, style]} {...props} />;
}
