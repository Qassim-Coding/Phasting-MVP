import { Platform } from 'react-native';

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

// Police des titres. Fraunces viendra plus tard (expo-font) ; en attendant, une serif système.
export const titleFont = Platform.select({ ios: 'Georgia', default: 'serif' }) as string;
