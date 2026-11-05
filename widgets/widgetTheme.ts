import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

// Réglages des widgets, enregistrés sur le téléphone et lus à chaque redessin (même sans l'app ouverte).
const KEY = 'phasting:widgetSettings';

export type AccentId = 'emeraude' | 'menthe' | 'sauge' | 'sable';
export type ThemeId = 'sombre' | 'clair' | 'auto';

export type WidgetSettings = {
  showSeconds: boolean; // secondes dans « Actualisé »
  showPhase: boolean; // nom de la phase en cours
  showNext: boolean; // « prochaine phase dans… »
  showTip: boolean; // astuce du moment (widget 4×4)
  showProgress: boolean; // frise des 5 phases (widget 4×4)
  showStreak: boolean; // série de jours (widget 4×4)
  ringThickness: number; // 4 à 16
  transparency: number; // 0 à 100 (% de transparence du fond)
  accent: AccentId;
  theme: ThemeId;
};

export const DEFAULT_WIDGET_SETTINGS: WidgetSettings = {
  showSeconds: true,
  showPhase: true,
  showNext: true,
  showTip: true,
  showProgress: true,
  showStreak: true,
  ringThickness: 10,
  transparency: 0,
  accent: 'emeraude',
  theme: 'sombre',
};

export const RING_MIN = 4;
export const RING_MAX = 16;

export const ACCENTS: { id: AccentId; label: string; swatch: string; dark: `#${string}`; light: `#${string}` }[] = [
  { id: 'emeraude', label: 'Émeraude', swatch: '#0E7C5B', dark: '#7FD6AE', light: '#0E7C5B' },
  { id: 'menthe', label: 'Menthe', swatch: '#5CC49A', dark: '#A8EBCB', light: '#2FA37A' },
  { id: 'sauge', label: 'Sauge', swatch: '#8FA998', dark: '#B7CDBE', light: '#6F8C7A' },
  { id: 'sable', label: 'Sable', swatch: '#CDB98F', dark: '#E3D3AB', light: '#A8935F' },
];

export async function loadWidgetSettings(): Promise<WidgetSettings> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) {
      const p = JSON.parse(raw);
      const d = DEFAULT_WIDGET_SETTINGS;
      const bool = (v: unknown, fallback: boolean) => (typeof v === 'boolean' ? v : fallback);
      const num = (v: unknown, fallback: number, min: number, max: number) =>
        typeof v === 'number' ? Math.max(min, Math.min(max, Math.round(v))) : fallback;
      return {
        showSeconds: bool(p.showSeconds, d.showSeconds),
        showPhase: bool(p.showPhase, d.showPhase),
        showNext: bool(p.showNext, d.showNext),
        showTip: bool(p.showTip, d.showTip),
        showProgress: bool(p.showProgress, d.showProgress),
        showStreak: bool(p.showStreak, d.showStreak),
        ringThickness: num(p.ringThickness, d.ringThickness, RING_MIN, RING_MAX),
        transparency: num(p.transparency, d.transparency, 0, 100),
        accent: ACCENTS.some((a) => a.id === p.accent) ? p.accent : d.accent,
        theme: p.theme === 'clair' || p.theme === 'auto' || p.theme === 'sombre' ? p.theme : d.theme,
      };
    }
  } catch {
    // réglages illisibles : valeurs par défaut
  }
  return DEFAULT_WIDGET_SETTINGS;
}

export async function saveWidgetSettings(settings: WidgetSettings): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(settings));
}

// --- Couleurs d'après les réglages ---
export type Palette = {
  bg: `#${string}`; // fond, avec transparence si demandée
  track: `#${string}`;
  accent: `#${string}`;
  text: `#${string}`;
  muted: `#${string}`;
  body: `#${string}`;
  dark: boolean;
};

const DARK = { bg: '#0C2E26', track: '#1F4A3E', text: '#EAF5EE', muted: '#A8C9BB', body: '#CFE3D8' } as const;
const LIGHT = { bg: '#F2F6F1', track: '#D3E4D8', text: '#12302A', muted: '#4A675C', body: '#2B4A40' } as const;

function isDark(theme: ThemeId): boolean {
  if (theme === 'sombre') return true;
  if (theme === 'clair') return false;
  try {
    return Appearance.getColorScheme() !== 'light'; // « Auto » : suit le téléphone, sombre si on ne peut pas le savoir
  } catch {
    return true;
  }
}

export function paletteFor(settings: WidgetSettings): Palette {
  const dark = isDark(settings.theme);
  const base = dark ? DARK : LIGHT;
  const accent = ACCENTS.find((a) => a.id === settings.accent) ?? ACCENTS[0];
  const alpha = Math.round((1 - settings.transparency / 100) * 255)
    .toString(16)
    .padStart(2, '0')
    .toUpperCase();
  return {
    bg: settings.transparency <= 0 ? base.bg : (`${base.bg}${alpha}` as `#${string}`),
    track: base.track,
    text: base.text,
    muted: base.muted,
    body: base.body,
    accent: dark ? accent.dark : accent.light,
    dark,
  };
}

// Anneau de progression dessiné en SVG (les widgets Android n'ont pas de composant d'anneau).
export function ringSvg(fraction: number, size: number, stroke: number, palette: Palette): string {
  const c = size / 2;
  const r = c - stroke / 2;
  const f = Math.max(0, Math.min(1, fraction));
  const track = `<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${palette.track}" stroke-width="${stroke}"/>`;
  let arc = '';
  if (f >= 0.999) {
    arc = `<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${palette.accent}" stroke-width="${stroke}"/>`;
  } else if (f > 0) {
    const angle = f * 2 * Math.PI;
    const x = (c + r * Math.sin(angle)).toFixed(2);
    const y = (c - r * Math.cos(angle)).toFixed(2);
    const large = f > 0.5 ? 1 : 0;
    arc = `<path d="M ${c} ${c - r} A ${r} ${r} 0 ${large} 1 ${x} ${y}" fill="none" stroke="${palette.accent}" stroke-width="${stroke}" stroke-linecap="round"/>`;
  }
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">${track}${arc}</svg>`;
}
