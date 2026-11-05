import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';

import { ProgressRing } from '../components/ProgressRing';
import { Text } from '../components/Text';
import { Card, OutlineButton, Screen } from '../components/ui';
import { useFast } from '../data/FastContext';
import { colors, titleFont } from '../theme';
import { formatHM, getPhase } from '../widgets/fastState';
import { refreshWidget } from '../widgets/refreshWidget';
import {
  ACCENTS,
  DEFAULT_WIDGET_SETTINGS,
  RING_MAX,
  RING_MIN,
  type ThemeId,
  type WidgetSettings,
  loadWidgetSettings,
  paletteFor,
  saveWidgetSettings,
} from '../widgets/widgetTheme';

type ToggleKey = 'showSeconds' | 'showPhase' | 'showNext' | 'showTip' | 'showProgress' | 'showStreak';

const TOGGLES: { key: ToggleKey; label: string }[] = [
  { key: 'showSeconds', label: 'Afficher les secondes' },
  { key: 'showPhase', label: 'Phase en cours' },
  { key: 'showNext', label: 'Prochaine phase' },
  { key: 'showTip', label: 'Astuce du moment' },
  { key: 'showProgress', label: 'Barre de progression' },
  { key: 'showStreak', label: 'Série de jours' },
];

const THEMES: { id: ThemeId; label: string }[] = [
  { id: 'sombre', label: 'Sombre' },
  { id: 'clair', label: 'Clair' },
  { id: 'auto', label: 'Auto' },
];

// Réglages des widgets : lignes affichées, épaisseur de l'anneau, transparence, couleur, thème.
// Chaque changement est enregistré, puis les widgets posés sur l'écran d'accueil sont redessinés.
export default function ReglagesWidgetScreen() {
  const router = useRouter();
  const { now, fast, protocol } = useFast();
  const [settings, setSettings] = useState<WidgetSettings>(DEFAULT_WIDGET_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadWidgetSettings().then((s) => {
      setSettings(s);
      setLoaded(true);
    });
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const update = (patch: Partial<WidgetSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveWidgetSettings(next).then(() => {
      // On attend un peu : si on enchaîne les changements, un seul redessin suffit.
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        refreshWidget({ ...fast, protocolLabel: protocol.label });
      }, 500);
    });
  };

  // Aperçu : le vrai jeûne s'il y en a un, sinon un exemple.
  const running = fast.startedAt !== null;
  const elapsedMs = running ? Math.max(0, now - (fast.startedAt as number)) : 11.7 * 3600000;
  const targetHours = running ? fast.targetHours : 16;
  const phase = getPhase(elapsedMs);
  const P = paletteFor(settings);

  return (
    <Screen bottom>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }}>
        <View style={styles.head}>
          <Pressable accessibilityLabel="Retour" onPress={() => router.back()} style={styles.back}>
            <Ionicons name="chevron-back" size={26} color={colors.text} />
          </Pressable>
          <Text style={styles.title}>Réglages du widget</Text>
        </View>

        <View style={styles.wallpaper}>
          <View style={[styles.preview, { backgroundColor: P.bg }]}>
            <ProgressRing
              size={84}
              stroke={Math.round(settings.ringThickness * 0.75)}
              fraction={elapsedMs / (targetHours * 3600000)}
              color={P.accent}
              track={P.track}
            >
              <Text style={[styles.pTime, { color: P.text }]}>{formatHM(elapsedMs)}</Text>
              <Text style={[styles.pSub, { color: P.muted }]}>sur {targetHours} h</Text>
            </ProgressRing>
            <View style={{ flex: 1, gap: 1 }}>
              <Text style={[styles.pMuted, { color: P.muted }]}>Phasting · {protocol.label}</Text>
              {settings.showPhase && (
                <Text style={[styles.pTitle, { color: P.accent }]}>{phase.name}</Text>
              )}
              {settings.showNext && phase.nextName && phase.minutesToNext !== null && (
                <Text style={[styles.pLine, { color: P.text }]}>
                  {phase.nextName} dans {Math.floor(phase.minutesToNext / 60)} h {String(phase.minutesToNext % 60).padStart(2, '0')}
                </Text>
              )}
              <Text style={[styles.pTiny, { color: P.muted }]}>
                Actualisé 12:42{settings.showSeconds ? ':10' : ''}
              </Text>
            </View>
          </View>
        </View>
        <Text style={styles.hint}>
          Aperçu du widget compact. Le widget 4×4 suit les mêmes réglages. Les widgets se redessinent tout de suite,
          puis toutes les 30 minutes.
        </Text>

        <Card style={{ borderRadius: 26, paddingVertical: 6, paddingHorizontal: 18 }}>
          <Text style={styles.kicker}>Affichage</Text>
          {TOGGLES.map((t) => (
            <View key={t.key} style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>{t.label}</Text>
              <Switch
                accessibilityLabel={t.label}
                value={settings[t.key]}
                onValueChange={(v) => update({ [t.key]: v } as Partial<WidgetSettings>)}
                trackColor={{ false: '#B9CEC0', true: colors.emerald }}
                thumbColor="#FFFFFF"
              />
            </View>
          ))}
        </Card>

        <Card style={{ borderRadius: 26, paddingVertical: 6, paddingHorizontal: 18, gap: 4 }}>
          <Text style={styles.kicker}>Apparence</Text>

          <Stepper
            label="Épaisseur de l’anneau"
            value={String(settings.ringThickness)}
            onMinus={() => update({ ringThickness: Math.max(RING_MIN, settings.ringThickness - 1) })}
            onPlus={() => update({ ringThickness: Math.min(RING_MAX, settings.ringThickness + 1) })}
            disabledMinus={settings.ringThickness <= RING_MIN}
            disabledPlus={settings.ringThickness >= RING_MAX}
          />
          <Stepper
            label="Transparence du fond"
            value={`${settings.transparency} %`}
            onMinus={() => update({ transparency: Math.max(0, settings.transparency - 10) })}
            onPlus={() => update({ transparency: Math.min(100, settings.transparency + 10) })}
            disabledMinus={settings.transparency <= 0}
            disabledPlus={settings.transparency >= 100}
          />

          <View style={{ gap: 6, paddingTop: 6 }}>
            <Text style={styles.toggleLabel}>Couleur d’accent</Text>
            <View style={styles.swatches}>
              {ACCENTS.map((a) => {
                const on = a.id === settings.accent;
                return (
                  <Pressable
                    key={a.id}
                    accessibilityRole="button"
                    accessibilityLabel={`${a.label}${on ? ', sélectionné' : ''}`}
                    onPress={() => update({ accent: a.id })}
                    style={[styles.swatch, { backgroundColor: a.swatch }, on && styles.swatchOn]}
                  />
                );
              })}
            </View>
          </View>

          <View style={{ gap: 6, paddingTop: 10, paddingBottom: 12 }}>
            <Text style={styles.toggleLabel}>Thème</Text>
            <View style={styles.segment}>
              {THEMES.map((t) => {
                const on = t.id === settings.theme;
                return (
                  <Pressable
                    key={t.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    onPress={() => update({ theme: t.id })}
                    style={[styles.segmentItem, on && styles.segmentItemOn]}
                  >
                    <Text style={[styles.segmentText, on && { color: colors.text, fontWeight: '800' }]}>{t.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Card>

        {loaded && <OutlineButton label="Rétablir les valeurs par défaut" onPress={() => update(DEFAULT_WIDGET_SETTINGS)} />}
      </ScrollView>
    </Screen>
  );
}

function Stepper({
  label,
  value,
  onMinus,
  onPlus,
  disabledMinus,
  disabledPlus,
}: {
  label: string;
  value: string;
  onMinus: () => void;
  onPlus: () => void;
  disabledMinus: boolean;
  disabledPlus: boolean;
}) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <View style={styles.stepper}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Diminuer : ${label}`}
          disabled={disabledMinus}
          onPress={onMinus}
          style={[styles.stepBtn, disabledMinus && { opacity: 0.35 }]}
        >
          <Ionicons name="remove" size={20} color={colors.emeraldText} />
        </Pressable>
        <Text style={styles.stepValue}>{value}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Augmenter : ${label}`}
          disabled={disabledPlus}
          onPress={onPlus}
          style={[styles.stepBtn, disabledPlus && { opacity: 0.35 }]}
        >
          <Ionicons name="add" size={20} color={colors.emeraldText} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 48 },
  back: { width: 44, height: 44, marginLeft: -12, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: titleFont, fontSize: 23, fontWeight: '600', color: colors.text },
  wallpaper: { borderRadius: 30, backgroundColor: '#A9C4B5', padding: 16 },
  preview: { borderRadius: 26, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 14 },
  pTime: { fontFamily: titleFont, fontSize: 19, fontWeight: '600' },
  pSub: { fontSize: 10, fontWeight: '600' },
  pMuted: { fontSize: 12 },
  pTitle: { fontSize: 16, fontWeight: '800' },
  pLine: { fontSize: 13 },
  pTiny: { fontSize: 10 },
  hint: { fontSize: 12.5, lineHeight: 18, color: colors.muted, paddingHorizontal: 4 },
  kicker: { fontSize: 12, fontWeight: '800', color: colors.emerald, paddingTop: 12, paddingBottom: 2 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 52,
    borderTopWidth: 1,
    borderTopColor: '#E2EDE5',
  },
  toggleLabel: { fontSize: 15, color: colors.text, flexShrink: 1 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stepBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.soft, alignItems: 'center', justifyContent: 'center' },
  stepValue: { minWidth: 48, textAlign: 'center', fontSize: 15, fontWeight: '800', color: colors.text },
  swatches: { flexDirection: 'row', gap: 6 },
  swatch: { width: 44, height: 44, borderRadius: 22, borderWidth: 3, borderColor: 'transparent' },
  swatchOn: { borderColor: colors.text },
  segment: { flexDirection: 'row', backgroundColor: colors.soft, borderRadius: 18, padding: 4, gap: 4 },
  segmentItem: { flex: 1, minHeight: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  segmentItemOn: { backgroundColor: '#FFFFFF' },
  segmentText: { fontSize: 14, fontWeight: '600', color: colors.muted },
});
