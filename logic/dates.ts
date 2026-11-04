export const pad2 = (n: number) => String(n).padStart(2, '0');

// Clé de jour locale, ex. "2026-11-04".
export function dayKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export const MONTHS_FR = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
];

export const DAYS_FR = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// "Jeudi 29 octobre"
export function formatDayLong(date: Date): string {
  return `${capitalize(DAYS_FR[date.getDay()])} ${date.getDate()} ${MONTHS_FR[date.getMonth()]}`;
}

// "aujourd'hui", "hier" ou "29 oct."
export function relativeDayLabel(ts: number, now: number): string {
  const d = new Date(ts);
  const day = (t: number) => {
    const x = new Date(t);
    return new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  };
  const diff = Math.round((day(now) - day(ts)) / 86400000);
  if (diff === 0) return 'aujourd’hui';
  if (diff === 1) return 'hier';
  return `${d.getDate()} ${MONTHS_FR[d.getMonth()].slice(0, 4)}.`;
}

// "13 h 05" à partir d'une durée en heures décimales
export function formatHoursMinutes(hours: number): string {
  const totalMin = Math.round(hours * 60);
  return `${Math.floor(totalMin / 60)} h ${pad2(totalMin % 60)}`;
}
