import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_PROTOCOL_ID } from './protocols';

// Tout ce que l'app garde sur le téléphone. Le jeûne en cours est dans widgets/fastState.ts
// (le widget doit pouvoir le lire app fermée).

const KEYS = {
  history: 'phasting:history',
  notes: 'phasting:notes',
  why: 'phasting:why',
  protocol: 'phasting:protocol',
  goal: 'phasting:weightGoal',
} as const;

export type FastRecord = {
  id: string;
  startedAt: number;
  endedAt: number;
  targetHours: number;
  protocolId: string;
};

export type NoteKind = 'poids' | 'avancee' | 'doute' | 'victoire';

export type Note = {
  id: string;
  at: number;
  kind: NoteKind;
  text: string;
  value?: number; // poids en kg, si la note en contient un
  mood?: number; // humeur de 1 à 5
  fastHours?: number; // durée de jeûne au moment de la note, si un jeûne était en cours
};

export type WeightGoal = {
  startKg: number | null; // null = on prend la première pesée
  targetKg: number;
};

async function read<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    // stockage illisible : on repart du défaut
  }
  return fallback;
}

async function write(key: string, value: unknown): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export const loadHistory = () => read<FastRecord[]>(KEYS.history, []);

export async function addRecord(record: FastRecord): Promise<FastRecord[]> {
  const history = await loadHistory();
  const next = [...history, record];
  await write(KEYS.history, next);
  return next;
}

export const loadNotes = () => read<Note[]>(KEYS.notes, []);

// Les notes les plus récentes d'abord.
export async function addNote(note: Note): Promise<Note[]> {
  const notes = await loadNotes();
  const next = [note, ...notes].sort((a, b) => b.at - a.at);
  await write(KEYS.notes, next);
  return next;
}

export const loadWhy = () => read<string>(KEYS.why, '');
export const saveWhy = (text: string) => write(KEYS.why, text);

export const loadProtocolId = () => read<string>(KEYS.protocol, DEFAULT_PROTOCOL_ID);
export const saveProtocolId = (id: string) => write(KEYS.protocol, id);

export const loadGoal = () => read<WeightGoal | null>(KEYS.goal, null);
export const saveGoal = (goal: WeightGoal) => write(KEYS.goal, goal);
