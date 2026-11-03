import React, { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { requestWidgetUpdate } from 'react-native-android-widget';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ElapsedWidget } from '../widgets/ElapsedWidget';
import {
    DEFAULT_TARGET_HOURS,
    type FastState,
    formatHMS,
    getPhase,
    loadFast,
    saveFast,
} from '../widgets/fastState';

export default function HomeScreen() {
  const [fast, setFast] = useState<FastState>({
    startedAt: null,
    targetHours: DEFAULT_TARGET_HOURS,
  });
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    loadFast().then(setFast);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const apply = useCallback(async (next: FastState) => {
    setFast(next);
    await saveFast(next);
    if (Platform.OS !== 'android') return;
    try {
      await requestWidgetUpdate({
        widgetName: 'Elapsed',
        renderWidget: () => <ElapsedWidget fast={next} now={Date.now()} />,
        widgetNotFound: () => {},
      });
    } catch {
      // pas de widget posé : rien à faire
    }
  }, []);

  const elapsed = fast.startedAt === null ? 0 : Math.max(0, now - fast.startedAt);
  const phase = getPhase(elapsed);

  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.title}>Phasting · test du widget</Text>
      <View style={styles.card}>
        <Text style={styles.label}>
          {fast.startedAt === null ? 'Pas de jeûne en cours' : 'En jeûne depuis'}
        </Text>
        <Text style={styles.big}>{formatHMS(elapsed)}</Text>
        {fast.startedAt !== null && <Text style={styles.label}>{phase.name}</Text>}
      </View>

      <Button
        label="Démarrer le jeûne maintenant"
        onPress={() => apply({ startedAt: Date.now(), targetHours: DEFAULT_TARGET_HOURS })}
      />
      <Button
        label="Simuler 11 h 42 de jeûne"
        onPress={() =>
          apply({
            startedAt: Date.now() - (11 * 60 + 42) * 60000,
            targetHours: DEFAULT_TARGET_HOURS,
          })
        }
      />
      <Button label="Forcer la mise à jour du widget" onPress={() => apply(fast)} />
      <Button
        label="Réinitialiser"
        onPress={() => apply({ startedAt: null, targetHours: DEFAULT_TARGET_HOURS })}
      />
    </SafeAreaView>
  );
}

function Button({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F2F6F1', padding: 20, gap: 12 },
  title: { fontSize: 22, fontWeight: '700', color: '#12302A', marginBottom: 8 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, alignItems: 'center', gap: 4 },
  label: { fontSize: 14, color: '#4A675C' },
  big: { fontSize: 44, fontWeight: '600', color: '#12302A' },
  button: {
    minHeight: 52,
    borderRadius: 26,
    backgroundColor: '#0E7C5B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});