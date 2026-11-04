import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton, Screen } from '../components/ui';
import { useFast } from '../data/FastContext';
import { type NoteKind, addNote } from '../data/storage';
import { formatHoursMinutes } from '../logic/dates';
import { colors, titleFont } from '../theme';
import { getPhase } from '../widgets/fastState';

const KINDS: { id: NoteKind; label: string }[] = [
  { id: 'avancee', label: 'Avancée' },
  { id: 'doute', label: 'Doute' },
  { id: 'victoire', label: 'Victoire' },
];

const MOOD_LABELS = ['Très bas', 'Bas', 'Moyen', 'Plutôt bien', 'Au top'];

// Saisie d'une note : type, humeur de 1 à 5, texte libre. (Le poids a son propre écran : ajouter-poids.)
// Si un jeûne est en cours, la note garde la durée de jeûne au moment où elle est écrite.
export default function NouvelleNoteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ kind?: string }>();
  const { now, fast } = useFast();

  const initialKind = KINDS.find((k) => k.id === params.kind)?.id ?? 'victoire';
  const [kind, setKind] = useState<NoteKind>(initialKind);
  const [mood, setMood] = useState(3);
  const [text, setText] = useState('');

  const running = fast.startedAt !== null;
  const elapsedMs = running ? Math.max(0, now - (fast.startedAt as number)) : 0;
  const phase = getPhase(elapsedMs);

  const canSave = text.trim() !== '';

  const save = async () => {
    if (!canSave) return;
    await addNote({
      id: String(Date.now()),
      at: Date.now(),
      kind,
      text: text.trim(),
      mood,
      ...(running ? { fastHours: elapsedMs / 3600000 } : {}),
    });
    router.back();
  };

  return (
    <Screen bottom>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }} keyboardShouldPersistTaps="handled">
        <View style={styles.head}>
          <Pressable accessibilityLabel="Fermer" onPress={() => router.back()} style={styles.close}>
            <Ionicons name="close" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.title}>Nouvelle note</Text>
        </View>

        <View style={{ gap: 8 }}>
          <Text style={styles.label}>Type</Text>
          <View style={styles.kinds}>
            {KINDS.map((k) => {
              const on = k.id === kind;
              return (
                <Pressable
                  key={k.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  onPress={() => setKind(k.id)}
                  style={[styles.kind, on && styles.kindOn]}
                >
                  <Text style={[styles.kindText, on && { color: '#FFFFFF' }]}>{k.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.moodHead}>
            <Text style={styles.cardTitle}>Comment tu te sens ?</Text>
            <Text style={styles.moodValue}>
              {mood} · {MOOD_LABELS[mood - 1]}
            </Text>
          </View>
          <View style={styles.moods}>
            {[1, 2, 3, 4, 5].map((m) => {
              const on = m === mood;
              return (
                <Pressable
                  key={m}
                  accessibilityRole="button"
                  accessibilityLabel={`${m} sur 5, ${MOOD_LABELS[m - 1]}`}
                  accessibilityState={{ selected: on }}
                  onPress={() => setMood(m)}
                  style={[styles.mood, on && styles.moodOn]}
                >
                  <Text style={[styles.moodText, on && { color: '#FFFFFF' }]}>{m}</Text>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.moodScale}>
            <Text style={styles.scaleText}>Bas</Text>
            <Text style={styles.scaleText}>Au top</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Ta note</Text>
          <TextInput
            value={text}
            onChangeText={setText}
            multiline
            placeholder="Écris librement…"
            placeholderTextColor={colors.muted}
            style={[styles.input, { minHeight: 104, textAlignVertical: 'top' }]}
          />
        </View>

        {running && (
          <View style={styles.context}>
            <Ionicons name="time-outline" size={22} color={colors.emerald} />
            <Text style={styles.contextText}>
              Liée à ton jeûne en cours : <Text style={{ fontWeight: '800' }}>{formatHoursMinutes(elapsedMs / 3600000)}</Text>,
              phase {phase.index + 1}. Ça te servira à comprendre ce qui t’aide à tenir.
            </Text>
          </View>
        )}

        <PrimaryButton
          label="Enregistrer la note"
          onPress={save}
          color={canSave ? colors.emerald : '#9CC4B1'}
          style={{ marginTop: 4 }}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 48 },
  close: { width: 44, height: 44, marginLeft: -12, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: titleFont, fontSize: 22, fontWeight: '600', color: colors.text },
  label: { fontSize: 13, fontWeight: '800', color: colors.muted },
  kinds: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  kind: { minHeight: 44, paddingHorizontal: 16, borderRadius: 22, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  kindOn: { backgroundColor: colors.emerald, borderColor: colors.emerald },
  kindText: { fontSize: 13, fontWeight: '800', color: colors.body },
  card: { backgroundColor: colors.card, borderRadius: 24, padding: 16, gap: 10 },
  cardTitle: { fontFamily: titleFont, fontSize: 18, fontWeight: '600', color: colors.text },
  moodHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  moodValue: { fontSize: 13, fontWeight: '800', color: colors.emeraldText },
  moods: { flexDirection: 'row', gap: 8 },
  mood: { flex: 1, minHeight: 52, borderRadius: 26, borderWidth: 2, borderColor: colors.line, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  moodOn: { backgroundColor: colors.emerald, borderColor: colors.emerald },
  moodText: { fontSize: 17, fontWeight: '800', color: colors.body },
  moodScale: { flexDirection: 'row', justifyContent: 'space-between' },
  scaleText: { fontSize: 11, fontWeight: '600', color: colors.muted },
  input: { borderWidth: 1, borderColor: colors.line, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: '#F7FAF6', color: colors.text, fontSize: 16 },
  context: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 4 },
  contextText: { flex: 1, fontSize: 13, lineHeight: 19, color: colors.body },
});
