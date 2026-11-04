import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { useFast } from '../data/FastContext';
import { formatHoursMinutes } from '../logic/dates';
import { colors, titleFont } from '../theme';
import { formatClockWithDay, formatHM, formatMinutes, getPhase } from '../widgets/fastState';
import { ProgressRing } from './ProgressRing';
import { pickStartTime } from './pickStartTime';
import { OutlineButton } from './ui';

// Accueil, état 2 : un jeûne est en cours.
export function HomeFasting() {
  const router = useRouter();
  const { now, fast, stop, setStartedAt } = useFast();

  const startedAt = fast.startedAt ?? now;
  const elapsed = Math.max(0, now - startedAt);
  const targetMs = fast.targetHours * 3600000;
  const fraction = elapsed / targetMs;
  const phase = getPhase(elapsed);

  const confirmStop = () => {
    const held = elapsed / 3600000;
    const message =
      held >= fast.targetHours
        ? `Tu as tenu ${formatHoursMinutes(held)}. Objectif atteint !`
        : `Tu as tenu ${formatHoursMinutes(held)} sur ${fast.targetHours} h.`;
    Alert.alert('Terminer le jeûne ?', message, [
      { text: 'Continuer', style: 'cancel' },
      { text: 'Terminer', onPress: () => void stop() },
    ]);
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Voir le détail de mon jeûne"
        onPress={() => router.push('/mon-jeune')}
        style={styles.ringWrap}
      >
        <ProgressRing size={240} stroke={12} fraction={fraction}>
          <Text style={styles.small}>En jeûne depuis</Text>
          <Text style={styles.big}>{formatHM(elapsed)}</Text>
          <Text style={styles.small}>
            sur {fast.targetHours} h · {Math.round(fraction * 100)} %
          </Text>
        </ProgressRing>
      </Pressable>

      <View style={styles.row}>
        <View style={[styles.chip, styles.chipWithButton]}>
          <View style={{ gap: 2 }}>
            <Text style={styles.chipLabel}>Débuté</Text>
            <Text style={styles.chipValue}>{formatClockWithDay(startedAt, now)}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Modifier l’heure de début"
            onPress={async () => {
              const ts = await pickStartTime(startedAt);
              if (ts !== null) await setStartedAt(ts);
            }}
            style={styles.pencil}
          >
            <Ionicons name="pencil" size={18} color={colors.emeraldText} />
          </Pressable>
        </View>
        <View style={[styles.chip, { justifyContent: 'center' }]}>
          <Text style={styles.chipLabel}>Fin prévue</Text>
          <Text style={styles.chipValue}>{formatClockWithDay(startedAt + targetMs, now)}</Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/mon-jeune')}
        style={styles.phaseCard}
      >
        <View style={{ gap: 2, flex: 1 }}>
          <Text style={styles.phaseKicker}>Phase {phase.index + 1} sur 5</Text>
          <Text style={styles.phaseName}>{phase.name}</Text>
          <Text style={styles.chipLabel}>
            {phase.nextName && phase.minutesToNext !== null
              ? `${phase.nextName} dans ${formatMinutes(phase.minutesToNext)}`
              : 'Dernière phase atteinte'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.muted} />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/craquer')}
        style={styles.sos}
      >
        <Ionicons name="flame" size={20} color="#FFFFFF" />
        <Text style={styles.sosText}>J’ai envie de craquer</Text>
      </Pressable>
      <OutlineButton label="Terminer le jeûne" onPress={confirmStop} />
    </>
  );
}

const styles = StyleSheet.create({
  ringWrap: { alignItems: 'center', alignSelf: 'center' },
  small: { fontSize: 13, fontWeight: '600', color: colors.muted },
  big: {
    fontFamily: titleFont,
    fontSize: 52,
    fontWeight: '500',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  row: { flexDirection: 'row', gap: 10 },
  chip: { flex: 1, backgroundColor: colors.soft, borderRadius: 18, paddingVertical: 8, paddingHorizontal: 14, gap: 2 },
  chipWithButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 6 },
  chipLabel: { fontSize: 12, fontWeight: '600', color: colors.muted },
  chipValue: { fontSize: 15, fontWeight: '800', color: colors.text },
  pencil: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  phaseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 16,
  },
  phaseKicker: { fontSize: 12, fontWeight: '800', color: colors.emerald },
  phaseName: { fontFamily: titleFont, fontSize: 18, fontWeight: '600', color: colors.text },
  sos: {
    minHeight: 54,
    borderRadius: 27,
    backgroundColor: colors.sos,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 8,
  },
  sosText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});
