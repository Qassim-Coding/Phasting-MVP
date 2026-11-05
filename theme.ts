// Palette zen de Phasting (la même que dans les maquettes).
export const colors = {
  bg: '#F2F6F1',
  card: '#FFFFFF',
  soft: '#E5EEE6',
  line: '#CFE0D4',
  track: '#D3E4D8',
  emerald: '#0E7C5B',
  emeraldText: '#0B5E45',
  mint: '#7FD6AE',
  deep: '#0C2E26',
  deepTrack: '#1F4A3E',
  text: '#12302A',
  body: '#2B4A40',
  muted: '#4A675C',
  onDeep: '#EAF5EE',
  onDeepMuted: '#A8C9BB',
  sos: '#C9431F',
  sosTint: '#FBE9E2',
  sosText: '#8F2E12',
  partial: '#CFE9DC',
} as const;

// Polices : Fraunces pour les titres, Manrope pour le reste (chargées dans app/_layout.tsx avec expo-font).
export const titleFont = 'Fraunces_600SemiBold';

export const bodyFonts = {
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semibold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
  extrabold: 'Manrope_800ExtraBold',
} as const;

// Choisit le fichier Manrope qui correspond à un fontWeight.
export function bodyFontFor(weight?: string | number): string {
  const w = weight === 'bold' ? 700 : weight === 'normal' || weight === undefined ? 400 : Number(weight);
  if (w >= 800) return bodyFonts.extrabold;
  if (w >= 700) return bodyFonts.bold;
  if (w >= 600) return bodyFonts.semibold;
  if (w >= 500) return bodyFonts.medium;
  return bodyFonts.regular;
}
