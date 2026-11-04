import React from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, titleFont } from '../theme';

// Briques d'interface réutilisées partout.

// `bottom` : à activer sur les écrans hors barre d'onglets (protocole, craquer, mon-jeune, nouvelle-note).
// Il garde le contenu au-dessus des boutons système d'Android. Dans les onglets, c'est la barre du bas qui s'en charge.
export function Screen({
  children,
  style,
  bottom,
}: {
  children?: React.ReactNode;
  style?: ViewStyle;
  bottom?: boolean;
}) {
  return (
    <SafeAreaView edges={bottom ? ['top', 'bottom'] : ['top']} style={[styles.screen, style]}>
      {children}
    </SafeAreaView>
  );
}

export function Card({
  children,
  dark,
  style,
}: {
  children: React.ReactNode;
  dark?: boolean;
  style?: ViewStyle;
}) {
  return <View style={[styles.card, dark && styles.cardDark, style]}>{children}</View>;
}

type ButtonProps = {
  label: string;
  onPress: () => void;
  color?: string;
  style?: ViewStyle;
};

export function PrimaryButton({ label, onPress, color = colors.emerald, style }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.primary, { backgroundColor: color }, style]}
    >
      <Text style={styles.primaryText}>{label}</Text>
    </Pressable>
  );
}

export function OutlineButton({ label, onPress, style }: ButtonProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.outline, style]}>
      <Text style={styles.outlineText}>{label}</Text>
    </Pressable>
  );
}

export function TextButton({ label, onPress, style }: ButtonProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.textButton, style]}>
      <Text style={styles.textButtonText}>{label}</Text>
    </Pressable>
  );
}

export function SectionTitle({ children, dark }: { children: string; dark?: boolean }) {
  return <Text style={[styles.sectionTitle, dark && { color: colors.onDeep }]}>{children}</Text>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  card: { backgroundColor: colors.card, borderRadius: 24, padding: 18, gap: 8 },
  cardDark: { backgroundColor: colors.deep },
  primary: {
    minHeight: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  primaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  outline: {
    minHeight: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: colors.emerald,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  outlineText: { color: colors.emeraldText, fontSize: 15, fontWeight: '800' },
  textButton: { minHeight: 46, alignItems: 'center', justifyContent: 'center' },
  textButtonText: { color: colors.muted, fontSize: 14, fontWeight: '600' },
  sectionTitle: { fontFamily: titleFont, fontSize: 19, fontWeight: '600', color: colors.text },
});
