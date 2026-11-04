import type { FastRecord } from '../data/storage';
import { dayKey } from './dates';
import { type DayStatus, buildDayMap } from './streak';

export type DayBar = {
  key: string;
  date: Date;
  held: number; // heures tenues ce jour-là (0 si aucun jeûne)
  status: DayStatus;
  hasFast: boolean;
};

export type Stats = {
  bars: DayBar[];
  fasts: number; // nombre de jours avec un jeûne terminé
  avgHeld: number | null;
  recordHeld: number | null;
  recordDate: Date | null;
  done: number; // jours « tenu »
  partial: number; // jours « partiel »
  days: number;
  totalHours: number;
};

// Statistiques sur les `days` derniers jours, aujourd'hui compris.
export function computeStats(history: FastRecord[], days: number, now: number): Stats {
  const map = buildDayMap(history);
  const bars: DayBar[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = dayKey(d.getTime());
    const entry = map.get(key);
    bars.push({
      key,
      date: d,
      held: entry?.heldHours ?? 0,
      status: entry?.status ?? 'none',
      hasFast: entry !== undefined,
    });
  }

  const withFast = bars.filter((b) => b.hasFast);
  const totalHours = withFast.reduce((sum, b) => sum + b.held, 0);
  const record = withFast.reduce<DayBar | null>((best, b) => (best === null || b.held > best.held ? b : best), null);

  return {
    bars,
    fasts: withFast.length,
    avgHeld: withFast.length > 0 ? totalHours / withFast.length : null,
    recordHeld: record ? record.held : null,
    recordDate: record ? record.date : null,
    done: withFast.filter((b) => b.status === 'done').length,
    partial: withFast.filter((b) => b.status === 'partial').length,
    days,
    totalHours,
  };
}
