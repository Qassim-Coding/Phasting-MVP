import AsyncStorage from '@react-native-async-storage/async-storage';

import { PHASES } from '../data/phases';

const KEY = 'phasting:fast';

export const DEFAULT_TARGET_HOURS = 16;
export const DEFAULT_PROTOCOL_LABEL = '16:8';

export type FastState = {
  startedAt: number | null; // moment de début en ms, null = pas de jeûne en cours
  targetHours: number; // 16 pour le 16:8
  protocolLabel?: string; // "16:8", affiché dans le widget
};

export async function loadFast(): Promise<FastState> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        startedAt: typeof parsed.startedAt === 'number' ? parsed.startedAt : null,
        targetHours:
          typeof parsed.targetHours === 'number' ? parsed.targetHours : DEFAULT_TARGET_HOURS,
        protocolLabel:
          typeof parsed.protocolLabel === 'string' ? parsed.protocolLabel : DEFAULT_PROTOCOL_LABEL,
      };
    }
  } catch {
    // stockage illisible : on repart d'un état vide
  }
  return {
    startedAt: null,
    targetHours: DEFAULT_TARGET_HOURS,
    protocolLabel: DEFAULT_PROTOCOL_LABEL,
  };
}

export async function saveFast(fast: FastState): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(fast));
}

// --- Phases (les noms et seuils viennent de data/phases.ts) ---
export type PhaseInfo = {
  index: number; // 0 à 4
  name: string;
  nextName: string | null;
  minutesToNext: number | null;
  progress: number; // 0 à 1 dans la phase en cours
};

export function getPhase(elapsedMs: number): PhaseInfo {
  const hours = elapsedMs / 3600000;
  let index = PHASES.findIndex((p) => p.endHour !== null && hours < p.endHour);
  if (index === -1) index = PHASES.length - 1;
  const phase = PHASES[index];
  const startHour = index === 0 ? 0 : (PHASES[index - 1].endHour as number);
  const endHour = phase.endHour;
  return {
    index,
    name: phase.name,
    nextName: endHour === null ? null : PHASES[index + 1].name,
    minutesToNext:
      endHour === null ? null : Math.max(1, Math.ceil((endHour * 3600000 - elapsedMs) / 60000)),
    progress:
      endHour === null ? 1 : Math.max(0, Math.min(1, (hours - startHour) / (endHour - startHour))),
  };
}

// --- Formats d'heure ---
const pad2 = (n: number) => String(n).padStart(2, '0');

export function formatHM(ms: number): string {
  const totalMin = Math.floor(ms / 60000);
  return `${pad2(Math.floor(totalMin / 60))}:${pad2(totalMin % 60)}`;
}

export function formatHMS(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  return `${pad2(Math.floor(totalSec / 3600))}:${pad2(Math.floor((totalSec % 3600) / 60))}:${pad2(totalSec % 60)}`;
}

export function formatClock(timestamp: number, withSeconds = false): string {
  const d = new Date(timestamp);
  const base = `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  return withSeconds ? `${base}:${pad2(d.getSeconds())}` : base;
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} h ${pad2(minutes % 60)}`;
}

// "21:00", "hier 21:00" ou "demain 13:00" selon le jour par rapport à `now`.
export function formatClockWithDay(timestamp: number, now: number): string {
  const day = (ts: number) => {
    const d = new Date(ts);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  };
  const diffDays = Math.round((day(timestamp) - day(now)) / 86400000);
  const prefix = diffDays === 0 ? '' : diffDays === -1 ? 'hier ' : diffDays === 1 ? 'demain ' : '';
  return `${prefix}${formatClock(timestamp)}`;
}
