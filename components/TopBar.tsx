import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from './Text';
import { useFast } from '../data/FastContext';
import { colors, titleFont } from '../theme';

// Barre du haut de l'accueil : nom, série, engrenage vers l'écran Réglages, pastille du protocole (ouvre le choix du protocole).
export function TopBar() {
  const router = useRouter();
  const { streak, protocol } = useFast();

  return (
    <View style={styles.row}>
      <Text style={styles.brand}>Phasting</Text>
      <View style={styles.right}>
        <View style={styles.streak}>
          <Ionicons name="leaf-outline" size={16} color={colors.emeraldText} />
          <Text style={styles.streakText}>{streak} j</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Réglages"
          onPress={() => router.push('/reglages')}
          style={styles.gear}
        >
          <Ionicons name="settings-outline" size={22} color={colors.emeraldText} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Changer de protocole, actuellement ${protocol.label}`}
          onPress={() => router.push('/protocole')}
          style={styles.protocol}
        >
          <Text style={styles.protocolText}>{protocol.label}</Text>
          <Ionicons name="chevron-down" size={14} color={colors.muted} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
  brand: { fontFamily: titleFont, fontSize: 24, fontWeight: '600', color: colors.text },
  right: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 36,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: colors.soft,
  },
  streakText: { fontSize: 13, fontWeight: '800', color: colors.emeraldText },
  gear: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.soft },
  protocol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
  },
  protocolText: { fontSize: 14, fontWeight: '600', color: colors.text },
});
