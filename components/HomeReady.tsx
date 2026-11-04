import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useFast } from '../data/FastContext';
import { formatHoursMinutes, relativeDayLabel } from '../logic/dates';
import { heldHoursOf } from '../logic/streak';
import { colors, titleFont } from '../theme';
import { ProgressRing } from './ProgressRing';
import { StartTimeModal } from './StartTimeModal';
import { OutlineButton, PrimaryButton } from './ui';

// Accueil, état 1 : aucun jeûne en cours, fenêtre de repas terminée.
export function HomeReady() {
  const { now, protocol, streak, lastRecord, start } = useFast();
  const [pickerOpen, setPickerOpen] = useState(false);

  const last = lastRecord
    ? `${formatHoursMinutes(heldHoursOf(lastRecord))} · ${relativeDayLabel(lastRecord.endedAt, now)}`
    : '—';

  return (
    <>
      <View style={styles.ringWrap}>
        <ProgressRing size={240} stroke={12} fraction={0}>
          <Text style={styles.small}>Objectif</Text>
          <Text style={styles.big}>{protocol.fastHours} h</Text>
          <Text style={styles.small}>Prêt quand tu l’es</Text>
        </ProgressRing>
      </View>

      <View style={styles.center}>
        <Text style={styles.title}>Prêt à commencer ?</Text>
        <Text style={styles.sub}>
          Ton jeûne démarre quand tu appuies. Tu peux aussi le lancer à une heure passée.
        </Text>
      </View>

      <View style={styles.row}>
        <View style={styles.chip}>
          <Text style={styles.chipLabel}>Dernier jeûne</Text>
          <Text style={styles.chipValue}>{last}</Text>
        </View>
        <View style={styles.chip}>
          <Text style={styles.chipLabel}>Série en cours</Text>
          <Text style={styles.chipValue}>
            {streak} {streak > 1 ? 'jours' : 'jour'}
          </Text>
        </View>
      </View>

      <PrimaryButton label="Démarrer le jeûne" onPress={() => start()} style={{ marginTop: 8 }} />
      <OutlineButton label="J’ai commencé plus tôt" onPress={() => setPickerOpen(true)} />

      <StartTimeModal
        visible={pickerOpen}
        initial={now - 60 * 60000}
        now={now}
        title="À quelle heure as-tu commencé ?"
        onCancel={() => setPickerOpen(false)}
        onConfirm={(ts) => {
          setPickerOpen(false);
          start(ts);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  ringWrap: { alignItems: 'center' },
  small: { fontSize: 13, fontWeight: '600', color: colors.muted },
  big: { fontFamily: titleFont, fontSize: 52, fontWeight: '500', color: colors.text },
  center: { alignItems: 'center', gap: 4, paddingHorizontal: 8 },
  title: { fontFamily: titleFont, fontSize: 22, fontWeight: '600', color: colors.text },
  sub: { fontSize: 13.5, lineHeight: 20, color: colors.muted, textAlign: 'center' },
  row: { flexDirection: 'row', gap: 10 },
  chip: { flex: 1, backgroundColor: colors.soft, borderRadius: 18, padding: 12, gap: 2 },
  chipLabel: { fontSize: 12, fontWeight: '600', color: colors.muted },
  chipValue: { fontSize: 15, fontWeight: '800', color: colors.text },
});
