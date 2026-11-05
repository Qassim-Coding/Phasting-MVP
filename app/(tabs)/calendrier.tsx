import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '../../components/Text';
import { NoteCard } from '../../components/NoteCard';
import { Card, Screen } from '../../components/ui';
import { useFast } from '../../data/FastContext';
import { getProtocol } from '../../data/protocols';
import type { FastRecord } from '../../data/storage';
import { useNotesData } from '../../data/useNotesData';
import { MONTHS_FR, capitalize, dayKey, formatDayLong, formatHoursMinutes } from '../../logic/dates';
import { type DayStatus, buildDayMap, heldHoursOf, statusOf } from '../../logic/streak';
import { formatKg } from '../../logic/weight';
import { colors, titleFont } from '../../theme';
import { formatClock } from '../../widgets/fastState';

const WEEK = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

type Cell = { date: Date; key: string; inMonth: boolean };

// 6 semaines complètes, en commençant le lundi.
function buildCells(year: number, month: number): Cell[] {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  const cells: Cell[] = [];
  for (let i = 0; i < 42; i++) {
    const date = new Date(year, month, 1 - offset + i);
    cells.push({ date, key: dayKey(date.getTime()), inMonth: date.getMonth() === month });
  }
  return cells;
}

export default function CalendrierScreen() {
  const { now, fast, history, streak } = useFast();
  const { notes } = useNotesData();
  const today = new Date(now);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedKey, setSelectedKey] = useState(dayKey(now));

  const dayMap = useMemo(() => buildDayMap(history), [history]);
  const cells = useMemo(() => buildCells(year, month), [year, month]);
  const todayKey = dayKey(now);

  const goMonth = (delta: number) => {
    const d = new Date(year, month + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  };

  const selectedDate = cells.find((c) => c.key === selectedKey)?.date ?? new Date(`${selectedKey}T12:00:00`);
  const selected = dayMap.get(selectedKey);

  // Tout ce qui s'est passé le jour choisi.
  const dayRecords = useMemo(
    () => history.filter((r) => dayKey(r.endedAt) === selectedKey).sort((a, b) => a.startedAt - b.startedAt),
    [history, selectedKey],
  );
  const dayNotes = useMemo(() => notes.filter((n) => dayKey(n.at) === selectedKey), [notes, selectedKey]);
  const dayWeight = useMemo(() => {
    const weights = dayNotes.filter((n) => typeof n.value === 'number').sort((a, b) => b.at - a.at);
    return weights.length > 0 ? (weights[0].value as number) : null;
  }, [dayNotes]);
  const noteDays = useMemo(() => new Set(notes.map((n) => dayKey(n.at))), [notes]);
  const runningToday = fast.startedAt !== null && selectedKey === todayKey;
  const isFuture = selectedKey > todayKey;

  // Bilan du mois affiché.
  const monthStats = useMemo(() => {
    let done = 0;
    let partial = 0;
    let short = 0;
    let total = 0;
    let best = 0;
    for (const c of cells) {
      if (!c.inMonth) continue;
      const e = dayMap.get(c.key);
      if (!e) continue;
      if (e.status === 'done') done += 1;
      else if (e.status === 'partial') partial += 1;
      else short += 1;
      total += e.heldHours;
      best = Math.max(best, e.heldHours);
    }
    const days = done + partial + short;
    return { done, partial, days, avg: days > 0 ? total / days : null, best: days > 0 ? best : null };
  }, [cells, dayMap]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
        <View style={styles.head}>
          <Text style={styles.title}>Calendrier</Text>
          <View style={styles.streak}>
            <Ionicons name="leaf-outline" size={16} color={colors.emeraldText} />
            <Text style={styles.streakText}>{streak} j</Text>
          </View>
        </View>

        <View style={styles.monthRow}>
          <Pressable accessibilityLabel="Mois précédent" onPress={() => goMonth(-1)} style={styles.nav}>
            <Ionicons name="chevron-back" size={20} color={colors.text} />
          </Pressable>
          <Text style={styles.month}>
            {capitalize(MONTHS_FR[month])} {year}
          </Text>
          <Pressable accessibilityLabel="Mois suivant" onPress={() => goMonth(1)} style={styles.nav}>
            <Ionicons name="chevron-forward" size={20} color={colors.text} />
          </Pressable>
        </View>

        <Card style={{ borderRadius: 24, paddingHorizontal: 8, gap: 4 }}>
          <View style={styles.week}>
            {WEEK.map((d, i) => (
              <Text key={i} style={styles.weekDay}>
                {d}
              </Text>
            ))}
          </View>
          <View style={styles.grid}>
            {cells.map((c) => (
              <DayCell
                key={c.key}
                n={c.date.getDate()}
                faded={!c.inMonth}
                isToday={c.key === todayKey}
                isSelected={c.key === selectedKey}
                status={dayMap.get(c.key)?.status ?? 'none'}
                hasNote={noteDays.has(c.key)}
                onPress={() => setSelectedKey(c.key)}
              />
            ))}
          </View>
        </Card>

        <View style={styles.legend}>
          <LegendItem color={colors.emerald} label="Tenu" />
          <LegendItem color={colors.partial} border={colors.emerald} label="Partiel (12 h et plus) : série gardée" />
          <LegendItem color="#FFFFFF" border={colors.emerald} label="Aujourd’hui" />
        </View>

        <Card style={{ borderRadius: 22, paddingVertical: 14, gap: 10 }}>
          <View style={styles.detailHead}>
            <Text style={styles.detailTitle}>{formatDayLong(selectedDate)}</Text>
            {selected && selected.status !== 'none' && (
              <View style={[styles.badge, selected.status === 'done' && { backgroundColor: colors.emerald }]}>
                <Text style={[styles.badgeText, selected.status === 'done' && { color: '#FFFFFF' }]}>
                  {selected.status === 'done' ? 'Tenu' : 'Partiel'}
                </Text>
              </View>
            )}
          </View>

          {runningToday && (
            <View style={styles.runRow}>
              <Ionicons name="hourglass-outline" size={20} color={colors.emerald} />
              <Text style={styles.detailText}>
                Jeûne en cours depuis {formatClock(fast.startedAt as number)} :{' '}
                <Text style={{ fontWeight: '800' }}>
                  {formatHoursMinutes(Math.max(0, now - (fast.startedAt as number)) / 3600000)}
                </Text>{' '}
                sur {fast.targetHours} h.
              </Text>
            </View>
          )}

          {dayRecords.map((r) => (
            <FastRow key={r.id} record={r} />
          ))}

          {dayRecords.length === 0 && !runningToday && (
            <Text style={styles.detailText}>
              {isFuture
                ? 'Ce jour n’est pas encore arrivé.'
                : selectedKey === todayKey
                  ? 'Pas encore de jeûne terminé aujourd’hui.'
                  : 'Aucun jeûne enregistré ce jour-là.'}
            </Text>
          )}

          {dayRecords.length > 0 && <Text style={styles.detailText}>{detailText(selected)}</Text>}

          {dayWeight !== null && (
            <View style={styles.runRow}>
              <Ionicons name="scale-outline" size={20} color={colors.emerald} />
              <Text style={styles.detailText}>
                Poids : <Text style={{ fontWeight: '800' }}>{formatKg(dayWeight)}</Text>
              </Text>
            </View>
          )}
        </Card>

        {dayNotes.length > 0 && (
          <View style={{ gap: 8 }}>
            <Text style={styles.sectionLabel}>
              {dayNotes.length > 1 ? `Notes du jour (${dayNotes.length})` : 'Note du jour'}
            </Text>
            {dayNotes.map((n) => (
              <NoteCard key={n.id} note={n} showDate={false} />
            ))}
          </View>
        )}

        <Card dark style={{ borderRadius: 22, paddingVertical: 16, gap: 10 }}>
          <Text style={styles.monthKicker}>{capitalize(MONTHS_FR[month])} en un coup d’œil</Text>
          {monthStats.days === 0 ? (
            <Text style={styles.monthEmpty}>Aucun jeûne terminé ce mois-ci.</Text>
          ) : (
            <View style={styles.monthRow2}>
              <MonthStat value={String(monthStats.done)} label="tenus" />
              <MonthStat value={String(monthStats.partial)} label="partiels" />
              <MonthStat value={monthStats.avg !== null ? formatHoursMinutes(monthStats.avg) : '—'} label="en moyenne" />
              <MonthStat value={monthStats.best !== null ? formatHoursMinutes(monthStats.best) : '—'} label="meilleur" />
            </View>
          )}
        </Card>
      </ScrollView>
    </Screen>
  );
}

function detailText(entry: { heldHours: number; targetHours: number; status: DayStatus } | undefined): string {
  if (!entry) return '';
  if (entry.status === 'done') return 'Objectif atteint, ta série grandit.';
  if (entry.status === 'partial') return 'Ta série est gardée, elle ne grandit simplement pas ce jour-là.';
  return 'Sous 12 h, la série ne continue pas.';
}

function startLabel(r: FastRecord): string {
  const same = dayKey(r.startedAt) === dayKey(r.endedAt);
  if (same) return formatClock(r.startedAt);
  const d = new Date(r.startedAt);
  return `${d.getDate()} ${MONTHS_FR[d.getMonth()].slice(0, 4)}. ${formatClock(r.startedAt)}`;
}

function FastRow({ record }: { record: FastRecord }) {
  const held = heldHoursOf(record);
  const status = statusOf(held, record.targetHours);
  const fraction = Math.max(0, Math.min(1, held / record.targetHours));
  const label = status === 'done' ? 'Tenu' : status === 'partial' ? 'Partiel' : 'Court';
  return (
    <View style={styles.fastRow}>
      <View style={styles.fastTop}>
        <Text style={styles.fastTimes}>
          {startLabel(record)} → {formatClock(record.endedAt)}
        </Text>
        <View style={[styles.badge, status === 'done' && { backgroundColor: colors.emerald }, status === 'none' && { backgroundColor: '#E3EDE6' }]}>
          <Text style={[styles.badgeText, status === 'done' && { color: '#FFFFFF' }]}>{label}</Text>
        </View>
      </View>
      <Text style={styles.detailText}>
        <Text style={{ fontWeight: '800' }}>{formatHoursMinutes(held)}</Text> sur {record.targetHours} h ·{' '}
        {getProtocol(record.protocolId).label}
      </Text>
      <View style={styles.bar}>
        <View style={[styles.barFill, { width: `${Math.round(fraction * 100)}%` }]} />
      </View>
    </View>
  );
}

function MonthStat({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 2 }}>
      <Text style={styles.monthValue}>{value}</Text>
      <Text style={styles.monthLabel}>{label}</Text>
    </View>
  );
}

function DayCell({
  n,
  faded,
  isToday,
  isSelected,
  status,
  hasNote,
  onPress,
}: {
  n: number;
  faded: boolean;
  isToday: boolean;
  isSelected: boolean;
  status: DayStatus;
  hasNote: boolean;
  onPress: () => void;
}) {
  let bg = 'transparent';
  let color: string = faded ? colors.line : colors.text;
  let border: string = 'transparent';
  if (status === 'done') {
    bg = faded ? '#5FA88E' : colors.emerald;
    color = '#FFFFFF';
  } else if (status === 'partial') {
    bg = colors.partial;
    color = colors.emeraldText;
    border = colors.emerald;
  }
  if (isToday) {
    border = colors.emerald;
    if (status === 'none') bg = '#FFFFFF';
  }
  if (isSelected) border = colors.text;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.cell, { backgroundColor: bg, borderColor: border }]}
    >
      <Text style={{ fontSize: 14, fontWeight: '800', color }}>{n}</Text>
      {hasNote && (
        <View style={[styles.noteDot, { backgroundColor: status === 'done' ? '#FFFFFF' : colors.emerald }]} />
      )}
    </Pressable>
  );
}

function LegendItem({ color, border, label }: { color: string; border?: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View
        style={{
          width: 12,
          height: 12,
          borderRadius: 6,
          backgroundColor: color,
          borderWidth: border ? 1.5 : 0,
          borderColor: border,
        }}
      />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
  title: { fontFamily: titleFont, fontSize: 24, fontWeight: '600', color: colors.text },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 36,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: colors.soft,
  },
  streakText: { fontSize: 13, fontWeight: '800', color: colors.emeraldText },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  nav: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  month: { fontFamily: titleFont, fontSize: 19, fontWeight: '600', color: colors.text },
  week: { flexDirection: 'row' },
  weekDay: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '800', color: colors.muted },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    maxHeight: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legend: { gap: 6, paddingHorizontal: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendText: { fontSize: 12, fontWeight: '600', color: colors.muted },
  detailHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  detailTitle: { fontFamily: titleFont, fontSize: 18, fontWeight: '600', color: colors.text },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: colors.partial },
  badgeText: { fontSize: 11, fontWeight: '800', color: colors.emeraldText },
  detailText: { fontSize: 14, lineHeight: 20, color: colors.body },
  runRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionLabel: { fontSize: 13, fontWeight: '800', color: colors.muted, paddingHorizontal: 4 },
  noteDot: { position: 'absolute', bottom: 5, width: 5, height: 5, borderRadius: 3 },
  fastRow: { gap: 6, backgroundColor: '#F2F8F3', borderRadius: 16, padding: 12 },
  fastTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  fastTimes: { fontSize: 15, fontWeight: '800', color: colors.text },
  bar: { height: 6, borderRadius: 3, backgroundColor: colors.track, overflow: 'hidden' },
  barFill: { height: 6, backgroundColor: colors.emerald },
  monthKicker: { fontSize: 12, fontWeight: '800', color: colors.mint },
  monthEmpty: { fontSize: 14, color: colors.onDeepMuted },
  monthRow2: { flexDirection: 'row' },
  monthValue: { fontFamily: titleFont, fontSize: 20, fontWeight: '600', color: colors.onDeep },
  monthLabel: { fontSize: 11, fontWeight: '600', color: colors.onDeepMuted },
});
