import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'phasting:fast';

export const DEFAULT_TARGET_HOURS = 16;

export type FastState = {
  startedAt: number | null; // moment de début en ms, null = pas de jeûne en cours
  targetHours: number; // 16 pour le 16:8
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
      };
    }
  } catch {
    // stockage illisible : on repart d'un état vide
  }
  return { startedAt: null, targetHours: DEFAULT_TARGET_HOURS };
}

export async function saveFast(fast: FastState): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(fast));
}

// --- Phases (noms provisoires) ---
const PHASES = [
  'Digestion',
  'Insuline en baisse',
  'Bascule vers les graisses',
  'Cétose légère',
  'Jeûne prolongé',
];
const PHASE_END_HOURS = [4, 8, 12, 16]; // fin des 4 premières phases

export type PhaseInfo = {
  index: number; // 0 à 4
  name: string;
  nextName: string | null;
  minutesToNext: number | null;
};

export function getPhase(elapsedMs: number): PhaseInfo {
  const hours = elapsedMs / 3600000;
  let index = PHASE_END_HOURS.findIndex((end) => hours < end);
  if (index === -1) index = PHASES.length - 1;
  const endHours = PHASE_END_HOURS[index]; // undefined pour la dernière phase
  return {
    index,
    name: PHASES[index],
    nextName: endHours === undefined ? null : PHASES[index + 1],
    minutesToNext:
      endHours === undefined ? null : Math.max(1, Math.ceil((endHours * 3600000 - elapsedMs) / 60000)),
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