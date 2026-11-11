import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from './Text';
import { TIP_GROUPS } from '../data/phases';
import { colors, titleFont } from '../theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

// Onglet « Astuces » de l'écran Notes : des astuces pour tenir plus longtemps, en deux groupes,
// et un accès direct à « J'ai envie de craquer ». Le contenu est dans data/phases.ts (TIP_GROUPS).
export function AstucesView() {
  const router = useRouter();

  return (
    <>
      <Text style={styles.intro}>
        Des astuces pour tenir plus longtemps. Ce sont surtout des astuces d’usage : elles aident beaucoup de gens, mais
        ce ne sont pas des résultats d’études. Quand une étude existe, elle est citée.
      </Text>

      {TIP_GROUPS.map((group) => (
        <View key={group.title} style={{ gap: 10 }}>
          <Text style={styles.groupTitle}>{group.title}</Text>
          {group.tips.map((tip) => (
            <View key={tip.title} style={styles.tip}>
              <View style={styles.bubble}>
                <Ionicons name={tip.icon as IconName} size={20} color={colors.emerald} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipText}>{tip.text}</Text>
                {tip.source && <Text style={styles.tipSource}>{tip.source}</Text>}
              </View>
            </View>
          ))}
        </View>
      ))}

      <Pressable accessibilityRole="button" onPress={() => router.push('/craquer')} style={styles.sos}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={styles.sosTitle}>Une envie trop forte ?</Text>
          <Text style={styles.sosText}>Ouvre « J’ai envie de craquer » : on la traverse ensemble, sans jugement.</Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color={colors.sosText} />
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 13, lineHeight: 19, color: colors.muted },
  groupTitle: { fontFamily: titleFont, fontSize: 19, fontWeight: '600', color: colors.text, paddingTop: 6 },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    backgroundColor: colors.card,
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  bubble: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.soft, alignItems: 'center', justifyContent: 'center' },
  tipTitle: { fontSize: 14, fontWeight: '800', color: colors.text, lineHeight: 19 },
  tipText: { fontSize: 13, lineHeight: 19, color: colors.muted },
  tipSource: { fontSize: 12, lineHeight: 17, color: colors.emeraldText, fontWeight: '600', paddingTop: 4 },
  sos: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 64,
    backgroundColor: colors.sosTint,
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  sosTitle: { fontSize: 15, fontWeight: '800', color: colors.sosText },
  sosText: { fontSize: 13, lineHeight: 18, color: colors.sosText },
});
