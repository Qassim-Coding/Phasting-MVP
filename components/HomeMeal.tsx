import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from './Text';
import { useFast } from '../data/FastContext';
import type { FastRecord } from '../data/storage';
import { formatHoursMinutes } from '../logic/dates';
import { heldHoursOf, statusOf } from '../logic/streak';
import { colors, titleFont } from '../theme';
import { formatClock, formatMinutes } from '../widgets/fastState';
import { ProgressRing } from './ProgressRing';
import { Card, OutlineButton, PrimaryButton } from './ui';

// Accueil, état 3 : le jeûne vient de se terminer, la fenêtre de repas est ouverte.
export function HomeMeal({ record }: { record: FastRecord }) {
  const router = useRouter();
  const { now, protocol, streak, start } = useFast();

  const held = heldHoursOf(record);
  const status = statusOf(held, record.targetHours);
  const heldLabel = formatHoursMinutes(held);

  const eatMs = protocol.eatHours * 3600000;
  const since = Math.max(0, now - record.endedAt);
  const windowFraction = Math.min(1, since / eatMs);
  const nextFastAt = record.endedAt + eatMs;
  const minutesLeft = Math.max(1, Math.round((nextFastAt - now) / 60000));

  const headline =
    status === 'done'
      ? `Tu as tenu ${heldLabel}.`
      : status === 'partial'
        ? `Tenu partiellement : ${heldLabel} sur ${record.targetHours} h.`
        : `Tu as tenu ${heldLabel}. Chaque essai compte.`;
  const detail =
    status === 'done'
      ? `Ta série passe à ${streak} ${streak > 1 ? 'jours' : 'jour'}.`
      : status === 'partial'
        ? 'Ta série est gardée, elle ne grandit pas aujourd’hui.'
        : 'La prochaine fois sera la bonne.';

  return (
    <>
      <View style={{ alignItems: 'center' }}>
        <ProgressRing
          size={200}
          stroke={12}
          fraction={Math.min(1, held / record.targetHours)}
          color={colors.emerald}
        >
          <Text style={styles.small}>Jeûne terminé</Text>
          <Text style={styles.big}>{heldLabel}</Text>
          <Text style={styles.ok}>{status === 'done' ? 'Objectif atteint' : 'Bien joué'}</Text>
        </ProgressRing>
      </View>

      <Card dark style={{ gap: 4 }}>
        <Text style={styles.kickerDark}>{status === 'done' ? 'Bravo' : 'À retenir'}</Text>
        <Text style={styles.headline}>{headline}</Text>
        <Text style={styles.detail}>{detail}</Text>
      </Card>

      <Card style={{ borderRadius: 22, paddingVertical: 14 }}>
        <View style={styles.windowHead}>
          <Text style={styles.windowTitle}>Fenêtre de repas</Text>
          <Text style={styles.windowSub}>
            ouverte depuis {formatMinutes(Math.round(since / 60000))} sur {protocol.eatHours} h
          </Text>
        </View>
        <View style={styles.bar}>
          <View style={[styles.barFill, { width: `${Math.round(windowFraction * 100)}%` }]} />
        </View>
        <Text style={styles.windowSub}>
          Prochain jeûne dans {formatMinutes(minutesLeft)}, à {formatClock(nextFastAt)}
        </Text>
      </Card>

      <View style={styles.tip}>
        <Ionicons name="water-outline" size={18} color={colors.emerald} />
        <Text style={styles.tipText}>Reprends doucement : un repas simple, sans te presser.</Text>
      </View>

      <PrimaryButton
        label="Noter comment je me sens"
        onPress={() => router.push('/notes')}
        style={{ marginTop: 8 }}
      />
      <OutlineButton label="Démarrer un nouveau jeûne" onPress={() => start()} />
    </>
  );
}

const styles = StyleSheet.create({
  small: { fontSize: 13, fontWeight: '600', color: colors.muted },
  big: { fontFamily: titleFont, fontSize: 40, fontWeight: '500', color: colors.text },
  ok: { fontSize: 13, fontWeight: '800', color: colors.emeraldText },
  kickerDark: { fontSize: 12, fontWeight: '800', color: colors.mint },
  headline: { fontFamily: titleFont, fontSize: 21, fontWeight: '600', color: colors.onDeep },
  detail: { fontSize: 13.5, lineHeight: 20, color: colors.onDeepMuted },
  windowHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  windowTitle: { fontSize: 14, fontWeight: '800', color: colors.text },
  windowSub: { fontSize: 12.5, color: colors.muted, fontWeight: '600' },
  bar: { height: 8, borderRadius: 4, backgroundColor: colors.track, overflow: 'hidden' },
  barFill: { height: 8, backgroundColor: colors.emerald },
  tip: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingHorizontal: 4 },
  tipText: { flex: 1, fontSize: 13, lineHeight: 19, color: colors.body },
});
