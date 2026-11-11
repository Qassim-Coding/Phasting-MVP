import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from './Text';
import { Card, SectionTitle } from './ui';
import { useFast } from '../data/FastContext';
import { PHASES, evidenceLabel } from '../data/phases';
import { formatHoursMinutes } from '../logic/dates';
import { colors, titleFont } from '../theme';
import { getPhase } from '../widgets/fastState';

// Onglet « Bienfaits du jeûne » de l'écran Notes : une phase à la fois (pastilles 1 à 5).
// Pour chaque phase : ce qui se passe, ce qu'on y gagne, ce que dit la science (études, niveau de preuve).
// S'ouvre sur ta phase en cours si un jeûne tourne, sinon sur la première.
export function BienfaitsView() {
  const { now, fast } = useFast();
  const running = fast.startedAt !== null;
  const elapsed = running ? Math.max(0, now - (fast.startedAt as number)) : 0;
  const current = getPhase(elapsed);
  const [selected, setSelected] = useState(running ? current.index : 0);

  const phase = PHASES[selected];
  const startHour = selected === 0 ? 0 : (PHASES[selected - 1].endHour as number);
  const here = running && selected === current.index;
  const range =
    phase.endHour === null ? `À partir de ${startHour} h de jeûne` : `De ${startHour} à ${phase.endHour} h de jeûne`;
  const isFirst = selected === 0;
  const isLast = selected === PHASES.length - 1;

  return (
    <>
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

      <Card dark style={{ borderRadius: 28, padding: 20, gap: 10 }}>
        <Text style={styles.kicker}>
          Phase {selected + 1} sur {PHASES.length}
        </Text>
        <Text style={styles.heroTitle}>{phase.name}</Text>
        <Text style={styles.heroSub}>{range}</Text>
        <View style={styles.chips}>
          <Text style={styles.levelChip}>{phase.level}</Text>
          {here && <Text style={styles.hereChip}>Tu es ici · {formatHoursMinutes(elapsed / 3600000)}</Text>}
        </View>
      </Card>

      <Card style={{ borderRadius: 26, gap: 8 }}>
        <View style={styles.titleRow}>
          <Ionicons name="flame-outline" size={20} color={colors.emerald} />
          <SectionTitle>Ce qui se passe</SectionTitle>
        </View>
        <Text style={styles.body}>{phase.body}</Text>
      </Card>

      <Card style={{ borderRadius: 26, gap: 8 }}>
        <View style={styles.titleRow}>
          <Ionicons name="checkmark-circle-outline" size={20} color={colors.emerald} />
          <SectionTitle>{phase.gainLabel}</SectionTitle>
        </View>
        <Text style={styles.body}>{phase.gain}</Text>
      </Card>

      <Card style={{ borderRadius: 26, gap: 12 }}>
        <View style={styles.titleRow}>
          <Ionicons name="book-outline" size={20} color={colors.emerald} />
          <SectionTitle>Ce que dit la science</SectionTitle>
        </View>
        {phase.studies.map((s) => (
          <View key={s.title + s.summary} style={styles.study}>
            <Text style={styles.studyTitle}>{s.title}</Text>
            <Text style={styles.muted}>{s.source}</Text>
            <Text style={styles.body}>{s.summary}</Text>
            <Text style={styles.evidence}>{evidenceLabel(s.evidence)}</Text>
          </View>
        ))}
      </Card>

      <View style={styles.navRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: isFirst }}
          disabled={isFirst}
          onPress={() => setSelected(selected - 1)}
          style={[styles.navBtn, styles.navPrev, isFirst && styles.navOff]}
        >
          <Text style={styles.navPrevText}>← Phase précédente</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: isLast }}
          disabled={isLast}
          onPress={() => setSelected(selected + 1)}
          style={[styles.navBtn, styles.navNext, isLast && styles.navOff]}
        >
          <Text style={styles.navNextText}>Phase suivante →</Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
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
  kicker: { fontSize: 12, fontWeight: '800', color: colors.mint },
  heroTitle: { fontFamily: titleFont, fontSize: 27, fontWeight: '600', color: colors.onDeep },
  heroSub: { fontSize: 13, color: colors.onDeepMuted },
  chips: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, paddingTop: 2 },
  levelChip: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.onDeep,
    backgroundColor: colors.deepTrack,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  hereChip: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.deep,
    backgroundColor: colors.mint,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  body: { fontSize: 14, lineHeight: 21, color: colors.body },
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
  navRow: { flexDirection: 'row', gap: 10 },
  navBtn: { flex: 1, minHeight: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  navPrev: { borderWidth: 1.5, borderColor: colors.emerald, backgroundColor: colors.card },
  navNext: { backgroundColor: colors.emerald },
  navOff: { opacity: 0.4 },
  navPrevText: { fontSize: 14, fontWeight: '800', color: colors.emeraldText },
  navNextText: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },
});
