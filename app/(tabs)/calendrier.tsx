import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, Screen } from '../../components/ui';
import { useFast } from '../../data/FastContext';
import { MONTHS_FR, capitalize, dayKey, formatDayLong, formatHoursMinutes } from '../../logic/dates';
import { type DayStatus, buildDayMap } from '../../logic/streak';
import { colors, titleFont } from '../../theme';

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
  const { now, history, streak } = useFast();
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

        <Card style={{ borderRadius: 22, paddingVertical: 14 }}>
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
          <Text style={styles.detailText}>{detailText(selected, selectedKey === todayKey)}</Text>
        </Card>
      </ScrollView>
    </Screen>
  );
}

function detailText(
  entry: { heldHours: number; targetHours: number; status: DayStatus } | undefined,
  isToday: boolean,
): string {
  if (!entry) return isToday ? 'Pas encore de jeûne terminé aujourd’hui.' : 'Aucun jeûne enregistré ce jour-là.';
  const held = formatHoursMinutes(entry.heldHours);
  if (entry.status === 'done') return `Tu as tenu ${held} sur ${entry.targetHours} h. Objectif atteint.`;
  if (entry.status === 'partial')
    return `Tu as tenu ${held} sur ${entry.targetHours} h. Ta série est gardée, elle ne grandit simplement pas ce jour-là.`;
  return `Tu as tenu ${held} sur ${entry.targetHours} h. Sous 12 h, la série ne continue pas.`;
}

function DayCell({
  n,
  faded,
  isToday,
  isSelected,
  status,
  onPress,
}: {
  n: number;
  faded: boolean;
  isToday: boolean;
  isSelected: boolean;
  status: DayStatus;
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
});
