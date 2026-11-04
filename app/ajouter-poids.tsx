import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { WeightRuler } from '../components/WeightRuler';
import { pickStartTime } from '../components/pickStartTime';
import { PrimaryButton, Screen } from '../components/ui';
import { useFast } from '../data/FastContext';
import { addNote, loadGoal, loadNotes } from '../data/storage';
import { formatDayLong } from '../logic/dates';
import { formatKg, weightInfo } from '../logic/weight';
import { colors, titleFont } from '../theme';
import { formatClock } from '../widgets/fastState';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const round1 = (n: number) => Math.round(n * 10) / 10;

// Ajout d'une pesée : on fait glisser la règle (ou on touche − / +), comme dans Libra.
export default function AjouterPoidsScreen() {
  const router = useRouter();
  const { now, fast } = useFast();

  const [ready, setReady] = useState(false);
  const [range, setRange] = useState({ min: 45, max: 105 });
  const [value, setValue] = useState(75);
  const [previous, setPrevious] = useState<number | null>(null);
  const [at, setAt] = useState(Date.now());
  const [comment, setComment] = useState('');

  // Point de départ : la dernière pesée, sinon le poids de départ de l'objectif, sinon 75 kg.
  useEffect(() => {
    (async () => {
      const [notes, goal] = await Promise.all([loadNotes(), loadGoal()]);
      const info = weightInfo(notes, goal);
      const initial = round1(info.current ?? goal?.startKg ?? 75);
      const min = Math.max(20, Math.round(initial) - 30);
      setRange({ min, max: min + 60 });
      setValue(clamp(initial, min, min + 60));
      setPrevious(info.current);
      setReady(true);
    })();
  }, []);

  const step = (delta: number) => setValue((v) => clamp(round1(v + delta), range.min, range.max));

  const changeDate = async () => {
    const picked = await pickStartTime(at);
    if (picked !== null) setAt(picked);
  };

  const save = async () => {
    const linked = fast.startedAt !== null && Math.abs(at - now) < 10 * 60000;
    await addNote({
      id: String(Date.now()),
      at,
      kind: 'poids',
      text: comment.trim(),
      value,
      ...(linked ? { fastHours: Math.max(0, at - (fast.startedAt as number)) / 3600000 } : {}),
    });
    router.back();
  };

  const diff = previous !== null ? round1(value - previous) : null;

  return (
    <Screen bottom>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }} keyboardShouldPersistTaps="handled">
        <View style={styles.head}>
          <Pressable accessibilityLabel="Fermer" onPress={() => router.back()} style={styles.close}>
            <Ionicons name="close" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.title}>Ajouter mon poids</Text>
        </View>

        <Pressable accessibilityRole="button" accessibilityLabel="Changer la date et l’heure" onPress={changeDate} style={styles.datePill}>
          <Ionicons name="calendar-outline" size={20} color={colors.emeraldText} />
          <Text style={styles.dateText}>{formatDayLong(new Date(at))}</Text>
          <Text style={styles.timeText}>{formatClock(at)}</Text>
          <Ionicons name="pencil" size={16} color={colors.muted} />
        </Pressable>

        <View style={styles.display}>
          <Pressable accessibilityRole="button" accessibilityLabel="Moins 0,1 kilo" onPress={() => step(-0.1)} style={styles.stepBtn}>
            <Ionicons name="remove" size={26} color={colors.mint} />
          </Pressable>
          <View style={{ alignItems: 'center', minWidth: 150 }}>
            <Text style={styles.big}>
              {value.toFixed(1).replace('.', ',')}
              <Text style={styles.unit}> kg</Text>
            </Text>
            <Text style={styles.sub}>
              {diff === null
                ? 'Première pesée'
                : Math.abs(diff) < 0.05
                  ? `Comme ta dernière pesée (${formatKg(previous as number)})`
                  : `${diff < 0 ? '−' : '+'} ${formatKg(Math.abs(diff))} depuis ta dernière pesée`}
            </Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Plus 0,1 kilo" onPress={() => step(0.1)} style={styles.stepBtn}>
            <Ionicons name="add" size={26} color={colors.mint} />
          </Pressable>
        </View>

        {ready ? (
          <WeightRuler value={value} min={range.min} max={range.max} onChange={setValue} />
        ) : (
          <View style={{ height: 88 }} />
        )}
        <Text style={styles.hint}>Fais glisser la règle : une graduation = 0,1 kg</Text>

        <TextInput
          value={comment}
          onChangeText={setComment}
          placeholder="Commentaire (facultatif)"
          placeholderTextColor={colors.muted}
          style={styles.input}
        />

        <PrimaryButton label="Ajouter" onPress={save} style={{ marginTop: 4 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 48 },
  close: { width: 44, height: 44, marginLeft: -12, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: titleFont, fontSize: 22, fontWeight: '600', color: colors.text },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 52,
    paddingHorizontal: 18,
    borderRadius: 26,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
  },
  dateText: { flex: 1, fontSize: 15, fontWeight: '800', color: colors.text },
  timeText: { fontSize: 15, fontWeight: '800', color: colors.emeraldText },
  display: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.deep,
    borderRadius: 28,
    paddingVertical: 22,
    paddingHorizontal: 12,
  },
  stepBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.deepTrack, alignItems: 'center', justifyContent: 'center' },
  big: { fontFamily: titleFont, fontSize: 54, fontWeight: '600', color: colors.onDeep },
  unit: { fontSize: 18, fontWeight: '700', color: colors.onDeepMuted },
  sub: { fontSize: 12, fontWeight: '600', color: colors.onDeepMuted, textAlign: 'center' },
  hint: { fontSize: 12, fontWeight: '600', color: colors.muted, textAlign: 'center' },
  input: {
    minHeight: 52,
    borderRadius: 18,
    paddingHorizontal: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    color: colors.text,
    fontSize: 16,
  },
});
