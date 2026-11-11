import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Linking, Platform } from 'react-native';

import { PHASES } from './phases';
import { loadWhy } from './storage';
import { formatHoursMinutes } from '../logic/dates';
import { type FastState, loadFast } from '../widgets/fastState';

// Rappels de phase : une notification quand ton corps entre en phase 2, 3, 4 puis 5.
// - Elles sont programmées sur le téléphone (expo-notifications), sans compte ni connexion.
// - L'heure compte depuis le DÉBUT du jeûne, quelle que soit l'heure de la journée (un OMAD passe aussi par les phases).
// - Tout est reprogrammé quand le jeûne démarre, s'arrête, change d'heure de début, ou quand tu changes un réglage.
// - Expo Go : ce fichier ne fait rien (le module est chargé à la demande, comme pour les pubs).

const KEY = 'phasting:reminders';
const CHANNEL_ID = 'phases';
const HOUR_MS = 3600000;
const MAX_WHY_LENGTH = 140;
export const MAX_CUSTOM_LENGTH = 120;

export type ReminderSettings = {
  phases: boolean[]; // 4 interrupteurs : phases 2, 3, 4, 5
  emoji: boolean; // un emoji au hasard : flamme, muscle ou bravo
  custom: string; // ma phrase, ajoutée à la fin
  includeWhy: boolean; // ajoute la note « pourquoi » de l'onglet Notes
};

export const DEFAULT_REMINDERS: ReminderSettings = {
  phases: [false, false, false, false],
  emoji: true,
  custom: '',
  includeWhy: false,
};

// Ce qui « travaille » dans chaque phase (phases 2 à 5), repris du contenu de data/phases.ts.
const WORKING = [
  'ton insuline baisse et ton foie libère son sucre en réserve',
  'ce sont maintenant tes graisses qui travaillent',
  'la cétose démarre, tes cétones prennent le relais',
  'graisses et cétones travaillent à plein',
];

const EMOJIS = ['🔥', '💪', '👏'];

export type PhaseReminder = {
  phaseNumber: number; // 2 à 5
  name: string; // nom de la phase
  hour: number; // heures de jeûne au moment où elle commence
  working: string;
};

// Les 4 phases qui ont un rappel (la phase 1 est trop facile, on ne la fête pas).
export const PHASE_REMINDERS: PhaseReminder[] = PHASES.slice(1).map((phase, i) => ({
  phaseNumber: i + 2,
  name: phase.name,
  hour: PHASES[i].endHour as number,
  working: WORKING[i],
}));

export async function loadReminderSettings(): Promise<ReminderSettings> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) {
      const p = JSON.parse(raw);
      return {
        phases: PHASE_REMINDERS.map((_, i) => Array.isArray(p.phases) && p.phases[i] === true),
        emoji: p.emoji !== false,
        custom: typeof p.custom === 'string' ? p.custom.slice(0, MAX_CUSTOM_LENGTH) : '',
        includeWhy: p.includeWhy === true,
      };
    }
  } catch {
    // réglages illisibles : on repart des valeurs par défaut
  }
  return DEFAULT_REMINDERS;
}

export async function saveReminderSettings(settings: ReminderSettings): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(settings));
}

function formatRest(hours: number): string {
  return Number.isInteger(hours) ? `${hours} h` : formatHoursMinutes(hours);
}

// Construit le texte d'une notification.
// « Bravo, tu as bien tenu. Ton corps entre en phase X : Y travaille. Courage, plus que ZZ ! »
// Si l'objectif est déjà atteint : « Objectif atteint, bravo. … Tu peux manger quand tu veux, ou continuer. »
export function buildMessage(
  reminder: PhaseReminder,
  targetHours: number,
  settings: ReminderSettings,
  why: string,
  emoji: string = EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
): { title: string; body: string } {
  const rest = targetHours - reminder.hour;
  const reached = rest <= 0;
  const mark = settings.emoji ? ` ${emoji}` : '';
  const title = reached ? `Objectif atteint, bravo${mark}` : `Bravo, tu as bien tenu${mark}`;

  let body = `Ton corps entre en phase ${reminder.phaseNumber} : ${reminder.working}. `;
  body += reached
    ? 'Tu peux manger quand tu veux, ou continuer si tu te sens bien.'
    : `Courage, plus que ${formatRest(rest)} !`;

  const custom = settings.custom.trim();
  if (custom) body += ` ${custom}`;
  const reason = why.trim();
  if (settings.includeWhy && reason) {
    const short = reason.length > MAX_WHY_LENGTH ? `${reason.slice(0, MAX_WHY_LENGTH - 1)}…` : reason;
    body += ` Ton pourquoi : « ${short} »`;
  }
  return { title, body };
}

// --- Module de notifications (chargé à la demande, protégé) ---
const inExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let notifModule: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getNotifications(): any {
  if (inExpoGo) return null;
  if (!notifModule) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      notifModule = require('expo-notifications');
    } catch {
      notifModule = null;
    }
  }
  return notifModule;
}

// Disponible seulement dans un vrai build (pas Expo Go) : l'écran Rappels s'en sert pour prévenir.
export const remindersAvailable = (): boolean => getNotifications() !== null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function ensureChannel(N: any): Promise<void> {
  if (Platform.OS !== 'android') return;
  // Sur Android 13 et plus, le canal doit exister AVANT la demande d'autorisation.
  await N.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Changements de phase',
    importance: N.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 200, 100, 200],
    lightColor: '#0E7C5B',
  });
}

// À appeler une fois au démarrage : affiche aussi la notification si l'app est ouverte, prépare le canal.
export async function initReminders(): Promise<void> {
  const N = getNotifications();
  if (!N) return;
  try {
    N.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
    await ensureChannel(N);
  } catch {
    // jamais bloquant
  }
}

// Demande l'autorisation d'envoyer des notifications. Renvoie true si elle est accordée.
export async function requestReminderPermission(): Promise<boolean> {
  const N = getNotifications();
  if (!N) return false;
  try {
    await ensureChannel(N);
    const current = await N.getPermissionsAsync();
    if (current.granted) return true;
    if (current.canAskAgain === false) return false;
    const asked = await N.requestPermissionsAsync();
    return asked.granted === true;
  } catch {
    return false;
  }
}

export const openNotificationSettings = () => Linking.openSettings();

// Reprogramme les notifications de phase pour le jeûne en cours. Sans jeûne en cours : tout est annulé.
// Une phase déjà passée (par exemple si tu corriges l'heure de début) n'est pas annoncée.
export async function syncReminders(fastArg?: FastState): Promise<void> {
  const N = getNotifications();
  if (!N) return;
  try {
    const [settings, fast, why] = await Promise.all([
      loadReminderSettings(),
      fastArg ? Promise.resolve(fastArg) : loadFast(),
      loadWhy(),
    ]);
    await N.cancelAllScheduledNotificationsAsync();
    if (fast.startedAt === null || !settings.phases.some(Boolean)) return;
    const permission = await N.getPermissionsAsync();
    if (!permission.granted) return;
    await ensureChannel(N);

    const now = Date.now();
    for (let i = 0; i < PHASE_REMINDERS.length; i++) {
      if (!settings.phases[i]) continue;
      const reminder = PHASE_REMINDERS[i];
      const at = fast.startedAt + reminder.hour * HOUR_MS;
      if (at <= now + 5000) continue;
      const { title, body } = buildMessage(reminder, fast.targetHours, settings, why);
      await N.scheduleNotificationAsync({
        identifier: `phase-${reminder.phaseNumber}`,
        content: { title, body, color: '#0E7C5B' },
        trigger: { type: N.SchedulableTriggerInputTypes.DATE, date: new Date(at), channelId: CHANNEL_ID },
      });
    }
  } catch {
    // Les rappels ne doivent jamais faire échouer le jeûne.
  }
}

// Envoie tout de suite (dans 3 secondes) un exemple de notification de la phase 3, avec tes réglages.
export async function sendTestReminder(targetHours: number): Promise<boolean> {
  const N = getNotifications();
  if (!N) return false;
  try {
    if (!(await requestReminderPermission())) return false;
    const [settings, why] = await Promise.all([loadReminderSettings(), loadWhy()]);
    const { title, body } = buildMessage(PHASE_REMINDERS[1], targetHours, settings, why);
    await N.scheduleNotificationAsync({
      content: { title, body, color: '#0E7C5B' },
      trigger: { type: N.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 3, channelId: CHANNEL_ID },
    });
    return true;
  } catch {
    return false;
  }
}
