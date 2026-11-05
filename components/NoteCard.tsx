import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from './Text';
import type { Note, NoteKind } from '../data/storage';
import { formatDayLong, formatHoursMinutes } from '../logic/dates';
import { formatKg } from '../logic/weight';
import { colors } from '../theme';

export const TAGS: Record<NoteKind, { label: string; bg: string; color: string }> = {
  victoire: { label: 'Victoire', bg: colors.partial, color: colors.emeraldText },
  doute: { label: 'Doute', bg: colors.sosTint, color: colors.sosText },
  poids: { label: 'Poids', bg: colors.soft, color: colors.body },
  avancee: { label: 'Avancée', bg: '#D7EFE3', color: colors.emeraldText },
};

// Une note : date, type, texte, poids, humeur et durée de jeûne. Utilisée par Notes, Calendrier et Mon jeûne.
export function NoteCard({ note, showDate = true }: { note: Note; showDate?: boolean }) {
  const tag = TAGS[note.kind];
  const mood = typeof note.mood === 'number' ? Math.max(1, Math.min(5, Math.round(note.mood))) : null;
  const text = note.text.trim() || (typeof note.value === 'number' ? formatKg(note.value) : '');
  const showWeightLine = typeof note.value === 'number' && note.text.trim() !== '';

  return (
    <View style={styles.note}>
      <View style={styles.noteHead}>
        <Text style={styles.label}>{showDate ? formatDayLong(new Date(note.at)) : ' '}</Text>
        <View style={[styles.tag, { backgroundColor: tag.bg }]}>
          <Text style={[styles.tagText, { color: tag.color }]}>{tag.label}</Text>
        </View>
      </View>
      <Text style={styles.noteText}>{text}</Text>
      {showWeightLine && <Text style={styles.delta}>{formatKg(note.value as number)}</Text>}
      {(mood !== null || typeof note.fastHours === 'number') && (
        <View style={styles.meta}>
          {mood !== null && (
            <Text accessibilityLabel={`Humeur ${mood} sur 5`} style={styles.dots}>
              {'●'.repeat(mood)}
              {'○'.repeat(5 - mood)}
            </Text>
          )}
          {typeof note.fastHours === 'number' && (
            <Text style={styles.label}>au bout de {formatHoursMinutes(note.fastHours)} de jeûne</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  note: { backgroundColor: colors.card, borderRadius: 20, paddingVertical: 12, paddingHorizontal: 16, gap: 4 },
  noteHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontSize: 12, fontWeight: '600', color: colors.muted },
  delta: { fontSize: 12, fontWeight: '800', color: colors.emeraldText },
  tag: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  tagText: { fontSize: 11, fontWeight: '800' },
  noteText: { fontSize: 14, lineHeight: 21, color: colors.body },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dots: { color: colors.emerald, letterSpacing: 2, fontSize: 12 },
});
