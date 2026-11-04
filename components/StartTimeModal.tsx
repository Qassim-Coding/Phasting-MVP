import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { formatClockWithDay, formatMinutes } from '../widgets/fastState';
import { colors, titleFont } from '../theme';
import { OutlineButton, PrimaryButton } from './ui';

type Props = {
  visible: boolean;
  initial: number; // heure proposée au départ (ms)
  now: number;
  title: string;
  onConfirm: (startedAt: number) => void;
  onCancel: () => void;
};

const STEPS: { label: string; minutes: number }[] = [
  { label: '−1 h', minutes: -60 },
  { label: '−15 min', minutes: -15 },
  { label: '+15 min', minutes: 15 },
  { label: '+1 h', minutes: 60 },
];

// Choix de l'heure de début sans bibliothèque : on part d'une heure et on la décale.
export function StartTimeModal({ visible, initial, now, title, onConfirm, onCancel }: Props) {
  const [value, setValue] = useState(initial);

  useEffect(() => {
    if (visible) setValue(initial);
  }, [visible, initial]);

  const shift = (minutes: number) => setValue((v) => Math.min(Date.now(), v + minutes * 60000));
  const agoMinutes = Math.max(0, Math.round((now - value) / 60000));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.time}>{formatClockWithDay(value, now)}</Text>
          <Text style={styles.ago}>
            {agoMinutes === 0 ? 'À l’instant' : `Il y a ${formatMinutes(agoMinutes)}`}
          </Text>
          <View style={styles.steps}>
            {STEPS.map((s) => (
              <Pressable
                key={s.label}
                accessibilityRole="button"
                onPress={() => shift(s.minutes)}
                style={styles.step}
              >
                <Text style={styles.stepText}>{s.label}</Text>
              </Pressable>
            ))}
          </View>
          <PrimaryButton label="Valider" onPress={() => onConfirm(value)} />
          <OutlineButton label="Annuler" onPress={onCancel} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(12,46,38,0.5)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    gap: 12,
  },
  title: { fontFamily: titleFont, fontSize: 20, fontWeight: '600', color: colors.text },
  time: { fontFamily: titleFont, fontSize: 44, fontWeight: '500', color: colors.text, textAlign: 'center' },
  ago: { fontSize: 14, color: colors.muted, textAlign: 'center' },
  steps: { flexDirection: 'row', gap: 8 },
  step: {
    flex: 1,
    minHeight: 48,
    borderRadius: 24,
    backgroundColor: colors.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { fontSize: 14, fontWeight: '800', color: colors.emeraldText },
});
