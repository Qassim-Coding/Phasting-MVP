import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { Text } from './Text';
import { COFFEE } from '../data/monetization';
import { colors } from '../theme';

// Carte « Offre-moi un café » : ouvre ta page Buy Me a Coffee (ou Ko-fi) dans le navigateur.
// Rien n'est payé dans l'app : c'est un simple lien. Réglages dans data/monetization.ts.
export function CoffeeCard() {
  if (!COFFEE.enabled || COFFEE.url.includes('TON_PSEUDO')) return null;

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel="Offre-moi un café, ouvre une page dans le navigateur"
      onPress={() => Linking.openURL(COFFEE.url).catch(() => {})}
      style={styles.card}
    >
      <View style={styles.bubble}>
        <Ionicons name="cafe-outline" size={22} color={colors.emerald} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.title}>Offre-moi un café</Text>
        <Text style={styles.text}>Phasting est fait par une seule personne. Un café aide à le faire grandir.</Text>
      </View>
      <Ionicons name="open-outline" size={18} color={colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 72,
    backgroundColor: colors.card,
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  bubble: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.soft, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 15, fontWeight: '800', color: colors.text },
  text: { fontSize: 13, lineHeight: 18, color: colors.muted },
});
