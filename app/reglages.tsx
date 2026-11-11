import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '../components/Text';
import { Card, Screen } from '../components/ui';
import { loadReminderSettings } from '../data/reminders';
import { colors, titleFont } from '../theme';

// Accueil des réglages (maquette Reglages.dc.html) : une carte avec une ligne par réglage.
// Remplace l'ancien petit menu système. Pour ajouter un réglage, ajoute une ligne dans <Card>.
export default function ReglagesScreen() {
  const router = useRouter();
  const [activeReminders, setActiveReminders] = useState(0);

  // On recompte à chaque retour sur l'écran : tu viens peut-être de changer tes rappels.
  useFocusEffect(
    useCallback(() => {
      loadReminderSettings().then((s) => setActiveReminders(s.phases.filter(Boolean).length));
    }, []),
  );

  return (
    <Screen bottom>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }}>
        <View style={styles.head}>
          <Pressable accessibilityLabel="Retour" onPress={() => router.back()} style={styles.back}>
            <Ionicons name="chevron-back" size={26} color={colors.text} />
          </Pressable>
          <Text style={styles.title}>Réglages</Text>
        </View>

        <Text style={styles.intro}>Ajuste Phasting à ta façon.</Text>

        <Card style={{ borderRadius: 26, paddingVertical: 4, paddingHorizontal: 18 }}>
          <Text style={styles.kicker}>Mon jeûne</Text>
          <SettingRow
            icon="notifications-outline"
            title="Rappels"
            sub="Une notification à chaque nouvelle phase, avec tes encouragements."
            chip={activeReminders > 0 ? `${activeReminders} ${activeReminders > 1 ? 'actifs' : 'actif'}` : 'Désactivés'}
            chipOn={activeReminders > 0}
            onPress={() => router.push('/rappels')}
          />
          <SettingRow
            icon="options-outline"
            title="Widget"
            sub="Lignes affichées, anneau, transparence, couleur et thème."
            chip="Aperçu"
            onPress={() => router.push('/reglages-widget')}
          />
        </Card>

        <Text style={styles.version}>Phasting · version 0.1.0</Text>
      </ScrollView>
    </Screen>
  );
}

function SettingRow({
  icon,
  title,
  sub,
  chip,
  chipOn,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  sub: string;
  chip: string;
  chipOn?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={onPress} style={styles.row}>
      <View style={styles.bubble}>
        <Ionicons name={icon} size={22} color={colors.emeraldText} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSub}>{sub}</Text>
      </View>
      <View style={[styles.chip, chipOn && styles.chipOn]}>
        <Text style={[styles.chipText, chipOn && { color: '#FFFFFF' }]}>{chip}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 48 },
  back: { width: 44, height: 44, marginLeft: -12, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: titleFont, fontSize: 23, fontWeight: '600', color: colors.text },
  intro: { fontSize: 14, lineHeight: 20, color: colors.muted },
  kicker: { fontSize: 12, fontWeight: '800', color: colors.emerald, paddingTop: 12, paddingBottom: 6 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 76,
    borderTopWidth: 1,
    borderTopColor: '#E2EDE5',
    paddingVertical: 10,
  },
  bubble: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  rowSub: { fontSize: 12.5, lineHeight: 17, color: colors.muted },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: colors.soft },
  chipOn: { backgroundColor: colors.emerald },
  chipText: { fontSize: 11, fontWeight: '800', color: '#2B4A40' },
  version: { fontSize: 12, color: colors.muted, textAlign: 'center', paddingTop: 8 },
});
