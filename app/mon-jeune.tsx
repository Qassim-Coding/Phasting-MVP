import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { NoteCard } from '../components/NoteCard';
import { Card, PrimaryButton, Screen, SectionTitle } from '../components/ui';
import { useFast } from '../data/FastContext';
import { MEDICAL_NOTE, PHASES, TIPS } from '../data/phases';
import { useNotesData } from '../data/useNotesData';
import { formatHoursMinutes, relativeDayLabel } from '../logic/dates';
import { phaseHistory } from '../logic/phaseStats';
import { colors, titleFont } from '../theme';
import { formatMinutes, getPhase } from '../widgets/fastState';

// Fiche de phase : ce que fait le corps, la science, les bienfaits, comment tenir.
export default function MonJeuneScreen() {
  const router = useRouter();
  const { now, fast, protocol, history } = useFast();
  const { notes } = useNotesData();

  const running = fast.startedAt !== null;
  const elapsed = running ? Math.max(0, now - (fast.startedAt as number)) : 0;
  const current = getPhase(elapsed);
  const [selected, setSelected] = useState(current.index);

  const phase = PHASES[selected];
  const startHour = selected === 0 ? 0 : (PHASES[selected - 1].endHour as number);
  const isCurrent = running && selected === current.index;
  const mine = useMemo(
    () => phaseHistory(history, notes, startHour, phase.endHour),
    [history, notes, startHour, phase.endHour],
  );
  const elapsedHours = elapsed / 3600000;
  const reachedNow = running && elapsedHours >= startHour;
  const range =
    phase.endHour === null ? `Au-delà de ${startHour} h de jeûne` : `De ${startHour} h à ${phase.endHour} h de jeûne`;

  return (
    <Screen bottom>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }}>
        <View style={styles.head}>
          <View style={styles.headLeft}>
            <Pressable accessibilityLabel="Retour" onPress={() => router.back()} style={styles.back}>
              <Ionicons name="chevron-back" size={22} color={colors.text} />
            </Pressable>
            <Text style={styles.title}>Mon jeûne</Text>
          </View>
          <View style={styles.protocolPill}>
            <Text style={styles.protocolText}>{protocol.label}</Text>
          </View>
        </View>

        <Card dark style={{ borderRadius: 28, padding: 20, gap: 10 }}>
          <Text style={styles.kicker}>
            Phase {selected + 1} sur {PHASES.length}
          </Text>
          <Text style={styles.heroTitle}>{phase.name}</Text>
          <Text style={styles.heroSub}>
            {range}
            {isCurrent ? ` · tu es à ${formatHoursMinutes(elapsed / 3600000)}` : ''}
          </Text>
          {isCurrent && (
            <View style={{ gap: 6, paddingTop: 4 }}>
              <View style={styles.bar}>
                <View style={[styles.barFill, { width: `${Math.round(current.progress * 100)}%` }]} />
              </View>
              <Text style={styles.heroNext}>
                {current.nextName && current.minutesToNext !== null
                  ? `Phase suivante dans ${formatMinutes(current.minutesToNext)} : ${current.nextName}`
                  : 'Tu es dans la dernière phase'}
              </Text>
            </View>
          )}
        </Card>

        <View style={styles.pills}>
          {PHASES.map((p, i) => {
            const on = i === selected;
            return (
              <Pressable
                key={p.name}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                onPress={() => setSelected(i)}
                style={[styles.pill, on && styles.pillOn]}
              >
                <Text style={[styles.pillText, on && { color: '#FFFFFF' }]}>
                  {i + 1} · {p.short}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Card style={{ borderRadius: 26, gap: 10 }}>
          <SectionTitle>Ton parcours dans cette phase</SectionTitle>
          {mine.reached > 0 || reachedNow ? (
            <>
              <View style={styles.tiles}>
                <View style={styles.tile}>
                  <Text style={styles.tileValue}>{mine.reached + (reachedNow ? 1 : 0)}</Text>
                  <Text style={styles.tileLabel}>fois atteinte</Text>
                </View>
                <View style={styles.tile}>
                  <Text style={styles.tileValue}>{mine.lastAt !== null ? relativeDayLabel(mine.lastAt, now) : 'en cours'}</Text>
                  <Text style={styles.tileLabel}>dernière fois</Text>
                </View>
              </View>
              <Text style={styles.muted}>
                {mine.reached} jeûne{mine.reached > 1 ? 's' : ''} terminé{mine.reached > 1 ? 's' : ''} sur {mine.total}
                {reachedNow ? ', et tu y es en ce moment.' : '.'}
              </Text>
            </>
          ) : running ? (
            <Text style={styles.body}>
              Tu y seras dans <Text style={styles.strong}>{formatHoursMinutes(Math.max(0, startHour - elapsedHours))}</Text>.
              {mine.recordHeld !== null ? ` Ton record est de ${formatHoursMinutes(mine.recordHeld)}.` : ''}
            </Text>
          ) : (
            <Text style={styles.body}>
              Tu n’as pas encore atteint cette phase.
              {mine.recordHeld !== null
                ? ` Ton plus long jeûne : ${formatHoursMinutes(mine.recordHeld)}, il te manque ${formatHoursMinutes(Math.max(0, startHour - mine.recordHeld))}.`
                : ' Termine un premier jeûne pour voir ton parcours.'}
            </Text>
          )}
          {mine.avgMood !== null && (
            <Text style={styles.muted}>
              Ton humeur moyenne à ce stade :{' '}
              <Text style={styles.strong}>{mine.avgMood.toFixed(1).replace('.', ',')} sur 5</Text> ({mine.notes.length}{' '}
              note{mine.notes.length > 1 ? 's' : ''}).
            </Text>
          )}
        </Card>

        {mine.notes.length > 0 && (
          <View style={{ gap: 8 }}>
            <Text style={styles.sectionLabel}>Tes notes à ce stade</Text>
            {mine.notes.slice(0, 2).map((n) => (
              <NoteCard key={n.id} note={n} />
            ))}
          </View>
        )}

        <Card style={{ borderRadius: 26 }}>
          <SectionTitle>Ce que fait ton corps</SectionTitle>
          <Text style={styles.body}>{phase.body}</Text>
        </Card>

        <Card style={{ borderRadius: 26, gap: 12 }}>
          <SectionTitle>Ce que dit la science</SectionTitle>
          <Text style={styles.muted}>
            Chaque affirmation sera reliée à son étude, avec le niveau de preuve : humain ou animal.
          </Text>
          {phase.studies.length === 0 ? (
            <View style={styles.study}>
              <Text style={styles.studyTitle}>[Étude à ajouter]</Text>
              <Text style={styles.muted}>Auteurs, année, revue</Text>
              <Text style={styles.body}>Résumé en une phrase, tiré de l’étude.</Text>
            </View>
          ) : (
            phase.studies.map((s) => (
              <View key={s.title} style={styles.study}>
                <Text style={styles.studyTitle}>{s.title}</Text>
                <Text style={styles.muted}>{s.source}</Text>
                <Text style={styles.body}>{s.summary}</Text>
                <Text style={styles.evidence}>Preuve : {s.evidence}</Text>
              </View>
            ))
          )}
        </Card>

        <Card style={{ borderRadius: 26 }}>
          <SectionTitle>Les bienfaits</SectionTitle>
          {phase.benefits.map((b) => (
            <View key={b} style={styles.bullet}>
              <View style={styles.dot} />
              <Text style={styles.body}>{b}</Text>
            </View>
          ))}
        </Card>

        <Card style={{ borderRadius: 26, gap: 12 }}>
          <SectionTitle>Comment tenir</SectionTitle>
          {TIPS.map((t, i) => (
            <View key={t.title} style={{ gap: 2 }}>
              {i > 0 && <View style={styles.sep} />}
              <Text style={styles.tipTitle}>{t.title}</Text>
              <Text style={styles.muted}>{t.text}</Text>
            </View>
          ))}
        </Card>

        <PrimaryButton label="Noter un doute ou une victoire" onPress={() => router.push('/notes')} />
        <Text style={styles.disclaimer}>{MEDICAL_NOTE}</Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 48 },
  headLeft: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  back: { width: 44, height: 44, marginLeft: -12, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: titleFont, fontSize: 22, fontWeight: '600', color: colors.text },
  protocolPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
  },
  protocolText: { fontSize: 13, fontWeight: '800', color: colors.text },
  kicker: { fontSize: 12, fontWeight: '800', color: colors.mint },
  heroTitle: { fontFamily: titleFont, fontSize: 27, fontWeight: '600', color: colors.onDeep },
  heroSub: { fontSize: 13, color: colors.onDeepMuted },
  heroNext: { fontSize: 12, fontWeight: '600', color: colors.onDeep },
  bar: { height: 6, borderRadius: 3, backgroundColor: colors.deepTrack, overflow: 'hidden' },
  barFill: { height: 6, backgroundColor: colors.mint },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillOn: { backgroundColor: colors.emerald, borderColor: colors.emerald },
  pillText: { fontSize: 13, fontWeight: '800', color: colors.body },
  body: { fontSize: 14, lineHeight: 21, color: colors.body },
  strong: { fontWeight: '800', color: colors.text },
  sectionLabel: { fontSize: 13, fontWeight: '800', color: colors.muted, paddingHorizontal: 4 },
  tiles: { flexDirection: 'row', gap: 10 },
  tile: { flex: 1, backgroundColor: '#F2F8F3', borderRadius: 18, padding: 14, gap: 2 },
  tileValue: { fontFamily: titleFont, fontSize: 24, fontWeight: '600', color: colors.text },
  tileLabel: { fontSize: 12, fontWeight: '600', color: colors.muted },
  muted: { fontSize: 13, lineHeight: 19, color: colors.muted },
  study: { gap: 4, backgroundColor: '#EAF3EC', borderRadius: 18, padding: 14 },
  studyTitle: { fontSize: 13, fontWeight: '800', color: colors.text },
  evidence: {
    alignSelf: 'flex-start',
    marginTop: 4,
    fontSize: 11,
    fontWeight: '800',
    color: colors.body,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  bullet: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.emerald, marginTop: 7 },
  sep: { height: 1, backgroundColor: '#E2EDE5', marginBottom: 10 },
  tipTitle: { fontSize: 14, fontWeight: '800', color: colors.text },
  disclaimer: { fontSize: 11, lineHeight: 16, color: colors.muted, textAlign: 'center' },
});
