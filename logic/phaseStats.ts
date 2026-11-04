import type { FastRecord, Note } from '../data/storage';
import { heldHoursOf } from './streak';

export type PhaseHistory = {
  total: number; // jeûnes terminés
  reached: number; // jeûnes qui ont atteint cette phase
  lastAt: number | null; // fin du dernier jeûne qui l'a atteinte
  recordHeld: number | null; // plus long jeûne, toutes phases confondues
  notes: Note[]; // notes écrites pendant cette phase, les plus récentes d'abord
  avgMood: number | null;
};

// Ce que l'historique de l'utilisateur dit d'une phase (de startHour à endHour, en heures de jeûne).
export function phaseHistory(
  history: FastRecord[],
  notes: Note[],
  startHour: number,
  endHour: number | null,
): PhaseHistory {
  const reachedRecords = history.filter((r) => heldHoursOf(r) >= startHour && heldHoursOf(r) > 0);
  const lastAt = reachedRecords.length > 0 ? Math.max(...reachedRecords.map((r) => r.endedAt)) : null;
  const recordHeld = history.length > 0 ? Math.max(...history.map(heldHoursOf)) : null;

  const inPhase = notes
    .filter((n) => typeof n.fastHours === 'number' && n.fastHours >= startHour && (endHour === null || n.fastHours < endHour))
    .sort((a, b) => b.at - a.at);
  const moods = inPhase.map((n) => n.mood).filter((m): m is number => typeof m === 'number');

  return {
    total: history.length,
    reached: reachedRecords.length,
    lastAt,
    recordHeld,
    notes: inPhase,
    avgMood: moods.length > 0 ? moods.reduce((a, b) => a + b, 0) / moods.length : null,
  };
}
