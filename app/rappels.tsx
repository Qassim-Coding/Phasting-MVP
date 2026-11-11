import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';

import { Text } from '../components/Text';
import { Card, OutlineButton, Screen } from '../components/ui';
import { useFast } from '../data/FastContext';
import {
  DEFAULT_REMINDERS,
  MAX_CUSTOM_LENGTH,
  PHASE_REMINDERS,
  type ReminderSettings,
  loadReminderSettings,
  openNotificationSettings,
  remindersAvailable,
  requestReminderPermission,
  saveReminderSettings,
  sendTestReminder,
  syncReminders,
} from '../data/reminders';
import { loadWhy } from '../data/storage';
import { colors, titleFont } from '../theme';

// Rappels : une notification à chaque changement de phase (2 à 5), et mes encouragements.
// Chaque changement est enregistré tout de suite, puis les notifications sont reprogrammées.
export default function RappelsScreen() {
  const router = useRouter();
  const { fast } = useFast();
  const [settings, setSettings] = useState<ReminderSettings>(DEFAULT_REMINDERS);
  const [loaded, setLoaded] = useState(false);
  const [why, setWhy] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef(settings);
  latest.current = settings;

  useEffect(() => {
    Promise.all([loadReminderSettings(), loadWhy()]).then(([s, w]) => {
      setSettings(s);
      setWhy(w);
      setLoaded(true);
    });
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const apply = async (next: ReminderSettings) => {
    setSettings(next);
    await saveReminderSettings(next);
    await syncReminders(fast);
  };

  // Sur Android 13 et plus, la première activation déclenche la demande d'autorisation.
  const askPermissionOr = async (onGranted: () => void) => {
    if (!remindersAvailable()) {
      Alert.alert('Rappels indisponibles ici', 'Les rappels fonctionnent dans l’app installée (build), pas dans Expo Go.');
      return;
    }
    if (await requestReminderPermission()) {
      onGranted();
      return;
    }
    Alert.alert(
      'Notifications bloquées',
      'Autorise les notifications de Phasting dans les réglages d’Android pour recevoir tes rappels.',
      [
        { text: 'Plus tard', style: 'cancel' },
        { text: 'Ouvrir les réglages', onPress: () => openNotificationSettings() },
      ],
    );
  };

  const togglePhase = (index: number, value: boolean) => {
    const phases = settings.phases.map((v, i) => (i === index ? value : v));
    const next = { ...settings, phases };
    if (value) askPermissionOr(() => apply(next));
    else apply(next);
  };

  const onCustomChange = (text: string) => {
    const next = { ...latest.current, custom: text.slice(0, MAX_CUSTOM_LENGTH) };
    setSettings(next);
    // On enregistre une fois la frappe terminée, pas à chaque lettre.
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      apply(latest.current);
    }, 700);
  };

  const sendTest = async () => {
    if (!remindersAvailable()) {
      Alert.alert('Rappels indisponibles ici', 'Les rappels fonctionnent dans l’app installée (build), pas dans Expo Go.');
      return;
    }
    const ok = await sendTestReminder(fast.targetHours);
    if (ok) Alert.alert('C’est parti', 'Tu reçois un exemple dans quelques secondes. Ferme l’app pour voir la vraie notification.');
    else
      Alert.alert('Notifications bloquées', 'Autorise les notifications de Phasting dans les réglages d’Android.', [
        { text: 'Plus tard', style: 'cancel' },
        { text: 'Ouvrir les réglages', onPress: () => openNotificationSettings() },
      ]);
  };

  return (
    <Screen bottom>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }} keyboardShouldPersistTaps="handled">
        <View style={styles.head}>
          <Pressable accessibilityLabel="Retour" onPress={() => router.back()} style={styles.back}>
            <Ionicons name="chevron-back" size={26} color={colors.text} />
          </Pressable>
          <Text style={styles.title}>Rappels</Text>
        </View>

        <Text style={styles.intro}>
          Une notification quand ton corps change de phase, pour t’aider à tenir. Rien n’est envoyé tant que tu ne l’as
          pas activé.
        </Text>

        <Card style={styles.card}>
          <Text style={styles.kicker}>Quand ton corps change de phase</Text>
          {PHASE_REMINDERS.map((r, i) => (
            <Row
              key={r.phaseNumber}
              label={`Phase ${r.phaseNumber} · ${r.name}`}
              desc={`Après ${r.hour} h de jeûne`}
              value={settings.phases[i]}
              onChange={(v) => togglePhase(i, v)}
            />
          ))}
        </Card>

        <Card style={{ ...styles.card, paddingBottom: 16 }}>
          <Text style={styles.kicker}>Mes encouragements</Text>
          <Row
            label="Emojis au hasard"
            desc="Flamme, muscle ou bravo 🔥 💪 👏"
            value={settings.emoji}
            onChange={(v) => apply({ ...settings, emoji: v })}
          />
          <Row
            label="Rappeler mon pourquoi"
            desc={
              settings.includeWhy && loaded && why.trim() === ''
                ? 'Tu n’as pas encore écrit ton pourquoi : écris-le dans l’onglet Notes.'
                : 'Ajoute ta note « pourquoi » de l’onglet Notes'
            }
            value={settings.includeWhy}
            onChange={(v) => apply({ ...settings, includeWhy: v })}
          />
          <View style={styles.phraseBlock}>
            <Text style={styles.label}>Ma phrase à moi</Text>
            <TextInput
              accessibilityLabel="Ma phrase d’encouragement"
              value={settings.custom}
              onChangeText={onCustomChange}
              placeholder="Ex. : Tu t’étais dit que tu le ferais. Tu le fais."
              placeholderTextColor={colors.muted}
              multiline
              maxLength={MAX_CUSTOM_LENGTH}
              style={styles.input}
            />
            <Text style={styles.desc}>Ajoutée à la fin de chaque notification. Laisse vide pour ne rien ajouter.</Text>
          </View>
        </Card>

        <OutlineButton label="Recevoir une notification d’exemple" onPress={sendTest} />

        <Text style={styles.foot}>
          Les heures comptent depuis le début de ton jeûne, quelle que soit l’heure de la journée. Ce sont des repères
          moyens, pas des seuils mesurés. Les rappels sont programmés sur ton téléphone ; Android te demandera ton
          accord à la première activation. Si tu corriges l’heure de début, ils sont recalculés.
        </Text>
      </ScrollView>
    </Screen>
  );
}

function Row({
  label,
  desc,
  value,
  onChange,
}: {
  label: string;
  desc: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1, gap: 1 }}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.desc}>{desc}</Text>
      </View>
      <Switch
        accessibilityLabel={label}
        value={value}
        onValueChange={onChange}
        trackColor={{ false: '#B9CEC0', true: colors.emerald }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 48 },
  back: { width: 44, height: 44, marginLeft: -12, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: titleFont, fontSize: 23, fontWeight: '600', color: colors.text },
  intro: { fontSize: 14, lineHeight: 20, color: colors.muted },
  card: { borderRadius: 26, paddingVertical: 6, paddingHorizontal: 18, gap: 2 },
  kicker: { fontSize: 12, fontWeight: '800', color: colors.emerald, paddingTop: 12, paddingBottom: 2 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    minHeight: 60,
    borderTopWidth: 1,
    borderTopColor: '#E2EDE5',
    paddingVertical: 6,
  },
  label: { fontSize: 15, fontWeight: '800', color: colors.text },
  desc: { fontSize: 12.5, lineHeight: 17, color: colors.muted },
  phraseBlock: { gap: 6, borderTopWidth: 1, borderTopColor: '#E2EDE5', paddingTop: 10 },
  input: {
    minHeight: 64,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 16,
    backgroundColor: '#F7FAF6',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
    textAlignVertical: 'top',
  },
  foot: { fontSize: 11.5, lineHeight: 17, color: colors.muted, textAlign: 'center', paddingHorizontal: 4 },
});
