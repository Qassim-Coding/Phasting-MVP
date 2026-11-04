import type { FastRecord } from '../data/storage';
import { dayKey } from './dates';

// Règle de série de Phasting :
//  - tenu (objectif atteint)            -> la série grandit de 1
//  - partiel (>= 12 h mais sous l'objectif) -> la série est gardée, sans grandir
//  - moins de 12 h                       -> la série casse
// Un jeûne compte pour le jour où il se TERMINE (21:00 -> 13:00 = le jour de 13:00).

export const PARTIAL_MIN_HOURS = 12;

export type DayStatus = 'done' | 'partial' | 'none';

export type DayEntry = {
  key: string;
  heldHours: number;
  targetHours: number;
  status: DayStatus;
};

export function heldHoursOf(record: FastRecord): number {
  return Math.max(0, (record.endedAt - record.startedAt) / 3600000);
}

export function statusOf(held: number, target: number): DayStatus {
  if (held >= target) return 'done';
  if (held >= PARTIAL_MIN_HOURS) return 'partial';
  return 'none';
}

const RANK: Record<DayStatus, number> = { none: 0, partial: 1, done: 2 };

// Un seul état par jour : on garde le meilleur jeûne du jour.
export function buildDayMap(history: FastRecord[]): Map<string, DayEntry> {
  const map = new Map<string, DayEntry>();
  for (const r of history) {
    const held = heldHoursOf(r);
    const entry: DayEntry = {
      key: dayKey(r.endedAt),
      heldHours: held,
      targetHours: r.targetHours,
      status: statusOf(held, r.targetHours),
    };
    const old = map.get(entry.key);
    if (
      !old ||
      RANK[entry.status] > RANK[old.status] ||
      (entry.status === old.status && entry.heldHours > old.heldHours)
    ) {
      map.set(entry.key, entry);
    }
  }
  return map;
}

// Série en cours : on remonte jour par jour depuis aujourd'hui.
// Aujourd'hui sans jeûne terminé ne casse rien (la journée n'est pas finie).
export function computeStreak(history: FastRecord[], now: number): number {
  const map = buildDayMap(history);
  const todayKey = dayKey(now);
  const cursor = new Date(now);
  let streak = 0;
  for (let i = 0; i < 4000; i++) {
    const k = dayKey(cursor.getTime());
    const status = map.get(k)?.status ?? 'none';
    if (status === 'done') streak += 1;
    else if (status === 'none' && k !== todayKey) break;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

// Meilleure série de tous les temps (même règle, en avançant dans le temps).
export function computeBestStreak(history: FastRecord[], now: number): number {
  if (history.length === 0) return 0;
  const map = buildDayMap(history);
  const first = Math.min(...history.map((r) => r.endedAt));
  const todayKey = dayKey(now);
  const cursor = new Date(first);
  let run = 0;
  let best = 0;
  for (let i = 0; i < 4000; i++) {
    const k = dayKey(cursor.getTime());
    const status = map.get(k)?.status ?? 'none';
    if (status === 'done') run += 1;
    else if (status === 'none' && k !== todayKey) run = 0;
    best = Math.max(best, run);
    if (k === todayKey) break;
    cursor.setDate(cursor.getDate() + 1);
  }
  return best;
}
