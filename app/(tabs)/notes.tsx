import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { EditSheet } from '../../components/EditSheet';
import { NoteCard } from '../../components/NoteCard';
import { Sparkline } from '../../components/Sparkline';
import { Card, OutlineButton, Screen } from '../../components/ui';
import { type NoteKind, saveGoal, saveWhy } from '../../data/storage';
import { useNotesData } from '../../data/useNotesData';
import { formatKg, parseKg, weightInfo } from '../../logic/weight';
import { colors, titleFont } from '../../theme';

type Filter = 'tout' | 'poids' | NoteKind;

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'tout', label: 'Tout' },
  { id: 'poids', label: 'Poids' },
  { id: 'avancee', label: 'Avancées' },
  { id: 'doute', label: 'Doutes' },
  { id: 'victoire', label: 'Victoires' },
];

export default function NotesScreen() {
  const router = useRouter();
  const { notes, goal, why, reload } = useNotesData();
  const [filter, setFilter] = useState<Filter>('tout');

  const [whyOpen, setWhyOpen] = useState(false);
  const [whyDraft, setWhyDraft] = useState('');
  const [goalOpen, setGoalOpen] = useState(false);
  const [startDraft, setStartDraft] = useState('');
  const [targetDraft, setTargetDraft] = useState('');

  const weight = useMemo(() => weightInfo(notes, goal), [notes, goal]);
  const visible = useMemo(
    () =>
      notes.filter((n) => {
        if (filter === 'tout') return true;
        if (filter === 'poids') return n.kind === 'poids' || typeof n.value === 'number';
        return n.kind === filter;
      }),
    [notes, filter],
  );

  const openWhy = () => {
    setWhyDraft(why);
    setWhyOpen(true);
  };

  const openGoal = () => {
    setStartDraft(weight.start !== null ? String(weight.start).replace('.', ',') : '');
    setTargetDraft(goal ? String(goal.targetKg).replace('.', ',') : '');
    setGoalOpen(true);
  };

  const submitGoal = async () => {
    const target = parseKg(targetDraft);
    if (target === null) return;
    const start = startDraft.trim() === '' ? null : parseKg(startDraft);
    await saveGoal({ startKg: start, targetKg: target });
    setGoalOpen(false);
    await reload();
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }} keyboardShouldPersistTaps="handled">
        <View style={styles.head}>
          <Text style={styles.title}>Notes</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Nouvelle note"
            onPress={() => router.push('/nouvelle-note')}
            style={styles.add}
          >
            <Ionicons name="add" size={26} color="#FFFFFF" />
          </Pressable>
        </View>

        <Card dark style={{ borderRadius: 26, paddingVertical: 16, gap: 6 }}>
          <View style={styles.whyHead}>
            <Text style={styles.kickerDark}>Mon pourquoi</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Modifier mon pourquoi" onPress={openWhy} style={styles.iconBtn}>
              <Ionicons name="pencil" size={18} color={colors.mint} />
            </Pressable>
          </View>
          <Text style={styles.why}>{why.trim() ? why : 'Écris ce qui te donne envie de tenir. Il s’affichera quand tu voudras craquer.'}</Text>
        </Card>

        <Card style={{ borderRadius: 24, padding: 16, gap: 10 }}>
          <View style={styles.weightTop}>
            <View style={{ gap: 2, flex: 1 }}>
              <Text style={styles.label}>Poids</Text>
              {weight.current !== null ? (
                <>
                  <Text style={styles.weightValue}>{formatKg(weight.current)}</Text>
                  {weight.delta !== null && Math.abs(weight.delta) >= 0.05 && (
                    <Text style={styles.delta}>
                      {weight.delta < 0 ? '−' : '+'} {formatKg(Math.abs(weight.delta))} depuis le départ
                    </Text>
                  )}
                </>
              ) : (
                <Text style={styles.muted}>Aucune pesée pour l’instant.</Text>
              )}
            </View>
            <Sparkline values={weight.points.map((p) => p.kg)} width={140} height={64} />
          </View>

          {weight.target !== null && weight.start !== null && weight.progress !== null && weight.remaining !== null ? (
            <View style={{ gap: 6 }}>
              <View style={styles.goalRow}>
                <Text style={styles.label}>Départ {formatKg(weight.start)}</Text>
                <Text style={styles.goalTarget}>Objectif {formatKg(weight.target)}</Text>
              </View>
              <View style={styles.bar}>
                <View style={[styles.barFill, { width: `${Math.round(weight.progress * 100)}%` }]} />
              </View>
              <Text style={styles.label}>
                {weight.remaining < 0.05
                  ? 'Objectif atteint, bravo !'
                  : `Encore ${formatKg(weight.remaining)} · tu as fait ${Math.round(weight.progress * 100)} % du chemin`}
              </Text>
            </View>
          ) : (
            <Pressable accessibilityRole="button" onPress={openGoal}>
              <Text style={styles.link}>Définir un objectif de poids</Text>
            </Pressable>
          )}

          <OutlineButton label="Ajouter mon poids" onPress={() => router.push('/ajouter-poids')} />
          {weight.target !== null && (
            <Pressable accessibilityRole="button" onPress={openGoal} style={{ alignSelf: 'center', minHeight: 36, justifyContent: 'center' }}>
              <Text style={styles.link}>Modifier l’objectif</Text>
            </Pressable>
          )}
        </Card>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {FILTERS.map((f) => {
            const on = f.id === filter;
            return (
              <Pressable
                key={f.id}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                onPress={() => setFilter(f.id)}
                style={[styles.chip, on && styles.chipOn]}
              >
                <Text style={[styles.chipText, on && { color: '#FFFFFF' }]}>{f.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {visible.length === 0 ? (
          <Card style={{ borderRadius: 20 }}>
            <Text style={styles.muted}>
              {notes.length === 0
                ? 'Pas encore de note. Appuie sur « + » pour écrire une victoire, un doute ou ta pesée du jour.'
                : 'Aucune note dans cette catégorie.'}
            </Text>
          </Card>
        ) : (
          visible.map((n) => <NoteCard key={n.id} note={n} />)
        )}
      </ScrollView>

      <EditSheet visible={whyOpen} title="Mon pourquoi" onCancel={() => setWhyOpen(false)} onSave={async () => { await saveWhy(whyDraft.trim()); setWhyOpen(false); await reload(); }}>
        <TextInput
          value={whyDraft}
          onChangeText={setWhyDraft}
          multiline
          placeholder="Pourquoi je jeûne…"
          placeholderTextColor={colors.muted}
          style={[styles.input, { minHeight: 110, textAlignVertical: 'top' }]}
        />
      </EditSheet>

      <EditSheet visible={goalOpen} title="Objectif de poids" onCancel={() => setGoalOpen(false)} onSave={submitGoal}>
        <Text style={styles.label}>Poids de départ (kg), facultatif</Text>
        <TextInput value={startDraft} onChangeText={setStartDraft} keyboardType="decimal-pad" placeholder="80,2" placeholderTextColor={colors.muted} style={styles.input} />
        <Text style={styles.label}>Objectif (kg)</Text>
        <TextInput value={targetDraft} onChangeText={setTargetDraft} keyboardType="decimal-pad" placeholder="75" placeholderTextColor={colors.muted} style={styles.input} />
      </EditSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
  title: { fontFamily: titleFont, fontSize: 24, fontWeight: '600', color: colors.text },
  add: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.emerald, alignItems: 'center', justifyContent: 'center' },
  whyHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconBtn: { width: 44, height: 44, margin: -10, alignItems: 'center', justifyContent: 'center' },
  kickerDark: { fontSize: 12, fontWeight: '800', color: colors.mint },
  why: { fontFamily: titleFont, fontStyle: 'italic', fontSize: 18, lineHeight: 25, color: colors.onDeep },
  weightTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  weightValue: { fontFamily: titleFont, fontSize: 30, fontWeight: '600', color: colors.text },
  label: { fontSize: 12, fontWeight: '600', color: colors.muted },
  muted: { fontSize: 13, lineHeight: 19, color: colors.muted },
  delta: { fontSize: 12, fontWeight: '800', color: colors.emeraldText },
  goalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  goalTarget: { fontSize: 12, fontWeight: '800', color: colors.emeraldText },
  bar: { height: 8, borderRadius: 4, backgroundColor: colors.track, overflow: 'hidden' },
  barFill: { height: 8, backgroundColor: colors.emerald },
  link: { fontSize: 13, fontWeight: '800', color: colors.emeraldText },
  chip: { minHeight: 40, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  chipOn: { backgroundColor: colors.emerald, borderColor: colors.emerald },
  chipText: { fontSize: 13, fontWeight: '800', color: colors.body },
  input: { borderWidth: 1, borderColor: colors.line, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: '#F7FAF6', color: colors.text, fontSize: 16 },
});
