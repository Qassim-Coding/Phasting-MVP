import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '../../components/Text';
import { Sparkline } from '../../components/Sparkline';
import { Card, Screen } from '../../components/ui';
import { useFast } from '../../data/FastContext';
import { useNotesData } from '../../data/useNotesData';
import { MONTHS_FR, formatHoursMinutes } from '../../logic/dates';
import { computeStats } from '../../logic/stats';
import { formatKg, weightInfo } from '../../logic/weight';
import { colors, titleFont } from '../../theme';

const PERIODS = [7, 14, 30] as const;
const WEEK_LETTER = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
const CHART_HEIGHT = 130;

const BAR_DONE = colors.emerald;
const BAR_PARTIAL = '#8FD0B3';
const BAR_SHORT = '#C5D9CC';

export default function StatsScreen() {
  const router = useRouter();
  const { now, history, protocol, streak, bestStreak } = useFast();
  const { notes, goal } = useNotesData();
  const [days, setDays] = useState<(typeof PERIODS)[number]>(14);

  const stats = useMemo(() => computeStats(history, days, now), [history, days, now]);
  const weight = useMemo(() => weightInfo(notes, goal), [notes, goal]);

  const target = protocol.fastHours;
  const scaleMax = Math.max(20, Math.ceil(Math.max(0, ...stats.bars.map((b) => b.held))));
  const targetBottom = (target / scaleMax) * CHART_HEIGHT;
  const showLetters = days <= 14;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
        <View style={styles.head}>
          <Text style={styles.title}>Stats</Text>
          <View style={styles.streak}>
            <Ionicons name="leaf-outline" size={16} color={colors.emeraldText} />
            <Text style={styles.streakText}>{streak} j</Text>
          </View>
        </View>

        <View style={styles.segment}>
          {PERIODS.map((p) => {
            const on = p === days;
            return (
              <Pressable
                key={p}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                onPress={() => setDays(p)}
                style={[styles.segmentItem, on && styles.segmentItemOn]}
              >
                <Text style={[styles.segmentText, on && { color: '#FFFFFF' }]}>{p} jours</Text>
              </Pressable>
            );
          })}
        </View>

        {stats.fasts === 0 ? (
          <Card style={{ borderRadius: 24, padding: 20 }}>
            <Text style={styles.emptyTitle}>Pas encore de jeûne terminé</Text>
            <Text style={styles.muted}>
              Termine un premier jeûne : ta durée moyenne, ton record et tes progrès apparaîtront ici.
            </Text>
          </Card>
        ) : (
          <>
            <Card dark style={styles.hero}>
              <View style={styles.heroCol}>
                <Text style={styles.heroKicker}>Durée moyenne</Text>
                <Text style={styles.heroValue}>
                  {stats.avgHeld !== null ? formatHoursMinutes(stats.avgHeld) : '—'}
                </Text>
                <Text style={styles.heroSub}>sur {target} h d’objectif</Text>
              </View>
              <View style={styles.heroDivider} />
              <View style={styles.heroCol}>
                <Text style={styles.heroKicker}>Record</Text>
                <Text style={styles.heroValue}>
                  {stats.recordHeld !== null ? formatHoursMinutes(stats.recordHeld) : '—'}
                </Text>
                <Text style={styles.heroSub}>
                  {stats.recordDate
                    ? `le ${stats.recordDate.getDate()} ${MONTHS_FR[stats.recordDate.getMonth()].slice(0, 4)}.`
                    : ''}
                </Text>
              </View>
            </Card>

            <View style={styles.row}>
              <View style={styles.tile}>
                <Text style={styles.tileLabel}>Objectifs tenus</Text>
                <Text style={styles.tileValue}>
                  {stats.done} sur {stats.days}
                </Text>
                <Text style={styles.tileSub}>
                  {stats.partial > 0
                    ? `+ ${stats.partial} ${stats.partial > 1 ? 'partiels' : 'partiel'}`
                    : 'aucun partiel'}
                </Text>
              </View>
              <View style={styles.tile}>
                <Text style={styles.tileLabel}>Meilleure série</Text>
                <Text style={styles.tileValue}>
                  {bestStreak} {bestStreak > 1 ? 'jours' : 'jour'}
                </Text>
                <Text style={styles.tileSub}>en cours : {streak}</Text>
              </View>
            </View>

            <Card style={{ borderRadius: 24, padding: 16, gap: 10 }}>
              <View style={styles.chartHead}>
                <Text style={styles.chartTitle}>Durée tenue par jour</Text>
                <Text style={styles.muted}>{Math.round(stats.totalHours)} h au total</Text>
              </View>

              <View style={{ height: CHART_HEIGHT }}>
                <View style={[styles.targetLine, { bottom: targetBottom }]} />
                <Text style={[styles.targetLabel, { bottom: targetBottom + 2 }]}>{target} h</Text>
                <View style={styles.bars}>
                  {stats.bars.map((b) => (
                    <View
                      key={b.key}
                      accessibilityLabel={
                        b.hasFast
                          ? `${b.date.getDate()} ${MONTHS_FR[b.date.getMonth()]} : ${formatHoursMinutes(b.held)}`
                          : `${b.date.getDate()} ${MONTHS_FR[b.date.getMonth()]} : aucun jeûne`
                      }
                      style={{
                        flex: 1,
                        height: b.hasFast ? Math.max(4, (b.held / scaleMax) * CHART_HEIGHT) : 3,
                        borderRadius: 4,
                        backgroundColor: !b.hasFast
                          ? '#E3EDE6'
                          : b.status === 'done'
                            ? BAR_DONE
                            : b.status === 'partial'
                              ? BAR_PARTIAL
                              : BAR_SHORT,
                      }}
                    />
                  ))}
                </View>
              </View>

              {showLetters && (
                <View style={styles.letters}>
                  {stats.bars.map((b) => (
                    <Text key={b.key} style={styles.letter}>
                      {WEEK_LETTER[b.date.getDay()]}
                    </Text>
                  ))}
                </View>
              )}

              <View style={styles.legend}>
                <LegendDot color={BAR_DONE} label="Tenu" />
                <LegendDot color={BAR_PARTIAL} label="Partiel" />
                <LegendDot color={BAR_SHORT} label="Moins de 12 h" />
              </View>
            </Card>
          </>
        )}

        <Pressable accessibilityRole="button" onPress={() => router.push('/notes')} style={styles.weightCard}>
          <View style={{ gap: 2 }}>
            <Text style={styles.tileLabel}>Poids</Text>
            {weight.current !== null ? (
              <>
                <Text style={styles.tileValue}>{formatKg(weight.current)}</Text>
                <Text style={styles.weightDelta}>
                  {weight.delta !== null && Math.abs(weight.delta) >= 0.05
                    ? `${weight.delta < 0 ? '−' : '+'} ${formatKg(Math.abs(weight.delta))}`
                    : 'stable'}
                  {weight.target !== null && weight.progress !== null
                    ? ` · objectif ${formatKg(weight.target)} (${Math.round(weight.progress * 100)} %)`
                    : ''}
                </Text>
              </>
            ) : (
              <Text style={styles.muted}>Ajoute ta première pesée dans Notes.</Text>
            )}
          </View>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Sparkline values={weight.points.map((p) => p.kg)} width={110} height={46} />
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.muted} />
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
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
  segment: { flexDirection: 'row', padding: 4, borderRadius: 24, backgroundColor: colors.soft },
  segmentItem: { flex: 1, minHeight: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  segmentItemOn: { backgroundColor: colors.emerald },
  segmentText: { fontSize: 13, fontWeight: '800', color: colors.muted },
  emptyTitle: { fontFamily: titleFont, fontSize: 18, fontWeight: '600', color: colors.text },
  muted: { fontSize: 13, lineHeight: 19, color: colors.muted },
  hero: { borderRadius: 26, padding: 18, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 16 },
  heroCol: { flex: 1, gap: 2 },
  heroDivider: { width: 1, alignSelf: 'stretch', backgroundColor: colors.deepTrack },
  heroKicker: { fontSize: 12, fontWeight: '800', color: colors.mint },
  heroValue: { fontFamily: titleFont, fontSize: 32, fontWeight: '600', color: colors.onDeep },
  heroSub: { fontSize: 12.5, color: colors.onDeepMuted },
  row: { flexDirection: 'row', gap: 10 },
  tile: { flex: 1, backgroundColor: colors.card, borderRadius: 20, padding: 14, gap: 2 },
  tileLabel: { fontSize: 12, fontWeight: '600', color: colors.muted },
  tileValue: { fontSize: 20, fontWeight: '800', color: colors.text },
  tileSub: { fontSize: 12, color: colors.muted },
  chartHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  chartTitle: { fontFamily: titleFont, fontSize: 17, fontWeight: '600', color: colors.text },
  targetLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#9CC4B1',
  },
  targetLabel: {
    position: 'absolute',
    right: 0,
    fontSize: 10,
    fontWeight: '800',
    color: colors.emeraldText,
    backgroundColor: colors.card,
    paddingLeft: 4,
  },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: CHART_HEIGHT },
  letters: { flexDirection: 'row', gap: 4 },
  letter: { flex: 1, textAlign: 'center', fontSize: 10, fontWeight: '800', color: colors.muted },
  legend: { flexDirection: 'row', gap: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendText: { fontSize: 11, fontWeight: '600', color: colors.muted },
  weightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 16,
  },
  weightDelta: { fontSize: 12, fontWeight: '800', color: colors.emeraldText },
});
