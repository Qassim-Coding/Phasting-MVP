import type { Craving, TriggerId } from '../data/storage';

export const TRIGGERS: { id: TriggerId; label: string }[] = [
  { id: 'ennui', label: 'Ennui' },
  { id: 'stress', label: 'Stress' },
  { id: 'habitude', label: 'Habitude' },
  { id: 'faim', label: 'Vraie faim' },
  { id: 'fatigue', label: 'Fatigue' },
  { id: 'social', label: 'Repas avec d’autres' },
];

export type CravingSummary = {
  total: number;
  held: number; // envies surmontées
  gaveUp: number; // fois où le jeûne s'est arrêté
  rate: number | null; // part d'envies surmontées, 0 à 1
  lastHeld: Craving | null; // dernière envie surmontée
  typicalHour: number | null; // heure de jeûne habituelle des envies (à partir de 3 envies)
  topTrigger: TriggerId | null;
};

export function summarizeCravings(cravings: Craving[]): CravingSummary {
  const held = cravings.filter((c) => c.outcome === 'tenu');
  const gaveUp = cravings.length - held.length;

  const hours = cravings
    .map((c) => c.fastHours)
    .filter((h): h is number => typeof h === 'number')
    .sort((a, b) => a - b);
  let typicalHour: number | null = null;
  if (hours.length >= 3) {
    const mid = Math.floor(hours.length / 2);
    typicalHour = hours.length % 2 === 1 ? hours[mid] : (hours[mid - 1] + hours[mid]) / 2;
  }

  const counts = new Map<TriggerId, number>();
  for (const c of cravings) if (c.trigger) counts.set(c.trigger, (counts.get(c.trigger) ?? 0) + 1);
  let topTrigger: TriggerId | null = null;
  let topCount = 0;
  for (const [id, n] of Array.from(counts.entries())) {
    if (n > topCount) {
      topCount = n;
      topTrigger = id;
    }
  }

  return {
    total: cravings.length,
    held: held.length,
    gaveUp,
    rate: cravings.length > 0 ? held.length / cravings.length : null,
    lastHeld: held.length > 0 ? held.reduce((a, b) => (b.at > a.at ? b : a)) : null,
    typicalHour: typicalHour === null ? null : Math.round(typicalHour),
    topTrigger,
  };
}

export function triggerLabel(id: TriggerId): string {
  return TRIGGERS.find((t) => t.id === id)?.label ?? id;
}
