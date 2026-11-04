import type { Note, WeightGoal } from '../data/storage';

export type WeightPoint = { at: number; kg: number };

export type WeightInfo = {
  points: WeightPoint[]; // pesées, de la plus ancienne à la plus récente
  current: number | null;
  start: number | null; // poids de départ (celui de l'objectif, sinon la première pesée)
  delta: number | null; // actuel − départ (négatif = perte)
  target: number | null;
  progress: number | null; // 0 à 1 vers l'objectif
  remaining: number | null; // kg restants jusqu'à l'objectif
};

export function weightInfo(notes: Note[], goal: WeightGoal | null): WeightInfo {
  const points = notes
    .filter((n) => typeof n.value === 'number')
    .map((n) => ({ at: n.at, kg: n.value as number }))
    .sort((a, b) => a.at - b.at);

  const current = points.length > 0 ? points[points.length - 1].kg : null;
  const start = goal?.startKg ?? (points.length > 0 ? points[0].kg : null);
  const target = goal?.targetKg ?? null;
  const delta = current !== null && start !== null ? current - start : null;

  let progress: number | null = null;
  let remaining: number | null = null;
  if (current !== null && start !== null && target !== null) {
    remaining = Math.abs(current - target);
    progress = start === target ? 1 : Math.max(0, Math.min(1, (start - current) / (start - target)));
  }

  return { points, current, start, delta, target, progress, remaining };
}

// 78.4 -> "78,4 kg"
export function formatKg(kg: number): string {
  return `${kg.toFixed(1).replace('.', ',')} kg`;
}

// "78,4" ou "78.4" -> 78.4 ; null si invalide
export function parseKg(input: string): number | null {
  const n = parseFloat(input.replace(',', '.').trim());
  if (!Number.isFinite(n) || n < 20 || n > 400) return null;
  return Math.round(n * 10) / 10;
}
