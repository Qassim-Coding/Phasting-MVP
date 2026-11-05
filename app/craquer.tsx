import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '../components/Text';
import { ProgressRing } from '../components/ProgressRing';
import { Card, PrimaryButton, Screen, SectionTitle, TextButton } from '../components/ui';
import { useFast } from '../data/FastContext';
import { type Craving, type TriggerId, addCraving, loadCravings, loadWhy } from '../data/storage';
import { TRIGGERS, summarizeCravings, triggerLabel } from '../logic/cravings';
import { relativeDayLabel, formatHoursMinutes } from '../logic/dates';
import { heldHoursOf } from '../logic/streak';
import { colors, titleFont } from '../theme';
import { formatClockWithDay, formatMinutes, getPhase } from '../widgets/fastState';

const WAIT_SECONDS = 10 * 60;

const HELP: { icon: React.ComponentProps<typeof Ionicons>['name']; title: string; text: string }[] = [
  { icon: 'water-outline', title: 'Un grand verre d’eau ou un thé sans sucre', text: 'Ça occupe la bouche et calme l’estomac.' },
  { icon: 'walk-outline', title: 'Sors marcher dix minutes', text: 'Changer d’air aide à penser à autre chose.' },
  { icon: 'exit-outline', title: 'Quitte la cuisine', text: 'Éloigne-toi de la nourriture et occupe tes mains.' },
  { icon: 'leaf-outline', title: 'Respire lentement', text: 'Inspire 4 secondes, souffle 6 secondes, six fois de suite.' },
  { icon: 'happy-outline', title: 'Brosse-toi les dents', text: 'Le goût de menthe coupe l’envie de grignoter.' },
  { icon: 'chatbubble-outline', title: 'Écris-moi un message à toi-même', text: 'Une phrase dans Notes : tu verras plus tard ce qui t’a aidé.' },
];

// Écran de secours : "J'ai envie de craquer".
export default function CraquerScreen() {
  const router = useRouter();
  const { now, fast, streak, history, stop } = useFast();
  // Ouvert depuis le widget, il n'y a pas d'écran précédent : on retourne à l'accueil.
  const leave = () => (router.canGoBack() ? router.back() : router.replace('/'));
  const [secondsLeft, setSecondsLeft] = useState(WAIT_SECONDS);
  const [running, setRunning] = useState(false);
  const [why, setWhy] = useState('');
  const [cravings, setCravings] = useState<Craving[]>([]);
  const [trigger, setTrigger] = useState<TriggerId | null>(null);

  useEffect(() => {
    loadWhy().then(setWhy);
    loadCravings().then(setCravings);
  }, []);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const fasting = fast.startedAt !== null;
  const startedAt = fast.startedAt ?? now;
  const elapsed = Math.max(0, now - startedAt);
  const targetMs = fast.targetHours * 3600000;
  const remaining = Math.max(0, targetMs - elapsed);
  const phase = getPhase(elapsed);
  const elapsedHours = elapsed / 3600000;

  const summary = useMemo(() => summarizeCravings(cravings), [cravings]);
  const recordHeld = useMemo(() => (history.length > 0 ? Math.max(...history.map(heldHoursOf)) : null), [history]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');
  const timerLabel = running ? 'Pause' : secondsLeft === WAIT_SECONDS ? 'Lancer 10 minutes' : secondsLeft === 0 ? 'Recommencer' : 'Reprendre';

  const onTimerPress = () => {
    if (secondsLeft === 0) {
      setSecondsLeft(WAIT_SECONDS);
      setRunning(true);
    } else {
      setRunning((r) => !r);
    }
  };

  // On garde une trace de chaque envie : elle servira à comprendre quand et pourquoi elles arrivent.
  const logCraving = async (outcome: Craving['outcome']) => {
    await addCraving({
      id: String(Date.now()),
      at: Date.now(),
      fastHours: fasting ? elapsedHours : null,
      outcome,
      ...(trigger ? { trigger } : {}),
    });
  };

  const confirmStop = () => {
    Alert.alert(
      'Terminer le jeûne ici ?',
      `Tu as tenu ${formatHoursMinutes(elapsed / 3600000)}. Sans jugement : chaque heure compte.`,
      [
        { text: 'Je continue', style: 'cancel' },
        {
          text: 'Terminer',
          onPress: async () => {
            await logCraving('craque');
            await stop();
            router.replace('/');
          },
        },
      ],
    );
  };

  return (
    <Screen bottom>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }}>
        <Pressable accessibilityLabel="Fermer" onPress={leave} style={styles.close}>
          <Ionicons name="close" size={24} color={colors.text} />
        </Pressable>

        <Card style={{ backgroundColor: colors.sosTint, borderRadius: 28, padding: 22, gap: 10 }}>
          <Text style={styles.kicker}>Respire un instant</Text>
          <Text style={styles.heroTitle}>{fasting ? 'Tu y es presque.' : 'Tu peux y arriver.'}</Text>
          {fasting ? (
            <Text style={styles.heroText}>
              Tu tiens depuis <Text style={styles.strong}>{formatHoursMinutes(elapsed / 3600000)}</Text>.
              {remaining > 0 ? (
                <>
                  {' '}Il ne reste que{' '}
                  <Text style={styles.strong}>{formatHoursMinutes(remaining / 3600000)}</Text> jusqu’à ton objectif.
                </>
              ) : (
                ' Ton objectif est déjà atteint.'
              )}
            </Text>
          ) : (
            <Text style={styles.heroText}>La faim vient par vagues et retombe d’elle-même.</Text>
          )}
          {fasting && recordHeld !== null && recordHeld > 0 && (
            <View style={styles.chip}>
              <Ionicons name="trophy-outline" size={16} color={colors.sos} />
              <Text style={styles.chipText}>
                {elapsedHours >= recordHeld
                  ? 'Tu es en train de battre ton record !'
                  : `Ton record : ${formatHoursMinutes(recordHeld)}, encore ${formatHoursMinutes(recordHeld - elapsedHours)}`}
              </Text>
            </View>
          )}
          {fasting && phase.nextName && phase.minutesToNext !== null && (
            <View style={styles.chip}>
              <Ionicons name="time-outline" size={16} color={colors.sos} />
              <Text style={styles.chipText}>
                Dans {formatMinutes(phase.minutesToNext)} : {phase.nextName.toLowerCase()}
              </Text>
            </View>
          )}
        </Card>

        <Card style={{ borderRadius: 26, gap: 14 }}>
          <View style={{ gap: 4 }}>
            <Text style={styles.cardTitle}>Attends 10 minutes avant de décider</Text>
            <Text style={styles.muted}>La faim vient souvent par vagues et retombe d’elle-même.</Text>
          </View>
          <View style={styles.timerRow}>
            <ProgressRing size={92} stroke={8} fraction={secondsLeft / WAIT_SECONDS}>
              <Text style={styles.timerText}>
                {mm}:{ss}
              </Text>
            </ProgressRing>
            <PrimaryButton label={timerLabel} onPress={onTimerPress} style={{ flex: 1, minHeight: 48 }} />
          </View>
        </Card>

        {secondsLeft === 0 && !running && (
          <Card style={{ borderRadius: 22, backgroundColor: '#D7EFE3' }}>
            <Text style={styles.cardTitle}>Dix minutes passées.</Text>
            <Text style={styles.muted}>L’envie est-elle retombée ? Si oui, tu viens de la laisser passer toi-même.</Text>
          </Card>
        )}

        <Card style={{ borderRadius: 26, gap: 12 }}>
          <View style={{ gap: 2 }}>
            <Text style={styles.cardTitle}>Qu’est-ce qui te donne envie ?</Text>
            <Text style={styles.muted}>Facultatif. Ça t’aidera à repérer tes déclencheurs.</Text>
          </View>
          <View style={styles.triggers}>
            {TRIGGERS.map((t) => {
              const on = trigger === t.id;
              return (
                <Pressable
                  key={t.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  onPress={() => setTrigger(on ? null : t.id)}
                  style={[styles.trigger, on && styles.triggerOn]}
                >
                  <Text style={[styles.triggerText, on && { color: '#FFFFFF' }]}>{t.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <Card style={{ borderRadius: 26, gap: 14 }}>
          <SectionTitle>Pour te sortir de là</SectionTitle>
          {HELP.map((h) => (
            <View key={h.title} style={styles.helpRow}>
              <View style={styles.helpIcon}>
                <Ionicons name={h.icon} size={22} color={colors.emeraldText} />
              </View>
              <View style={{ flex: 1, gap: 1 }}>
                <Text style={styles.helpTitle}>{h.title}</Text>
                <Text style={styles.muted}>{h.text}</Text>
              </View>
            </View>
          ))}
        </Card>

        <Card style={{ borderRadius: 26, gap: 12 }}>
          <SectionTitle>Tes envies passées</SectionTitle>
          {summary.total === 0 ? (
            <Text style={styles.muted}>
              Ta première envie surmontée apparaîtra ici. Appuie sur « Je tiens » quand elle sera passée.
            </Text>
          ) : (
            <>
              <View style={styles.tiles}>
                <View style={styles.tile}>
                  <Text style={styles.tileValue}>{summary.held}</Text>
                  <Text style={styles.tileLabel}>{summary.held > 1 ? 'envies surmontées' : 'envie surmontée'}</Text>
                </View>
                <View style={styles.tile}>
                  <Text style={styles.tileValue}>{summary.rate !== null ? `${Math.round(summary.rate * 100)} %` : '—'}</Text>
                  <Text style={styles.tileLabel}>tenues sur {summary.total}</Text>
                </View>
              </View>
              {summary.lastHeld && (
                <Text style={styles.muted}>
                  Dernière fois que tu as tenu : {relativeDayLabel(summary.lastHeld.at, now)}
                  {summary.lastHeld.fastHours !== null
                    ? `, après ${formatHoursMinutes(summary.lastHeld.fastHours)} de jeûne`
                    : ''}
                  .
                </Text>
              )}
              {summary.typicalHour !== null && (
                <Text style={styles.muted}>
                  Tes envies arrivent souvent vers <Text style={styles.strong}>{summary.typicalHour} h de jeûne</Text>.
                </Text>
              )}
              {summary.topTrigger && (
                <Text style={styles.muted}>
                  Ton déclencheur le plus fréquent : <Text style={styles.strong}>{triggerLabel(summary.topTrigger).toLowerCase()}</Text>.
                </Text>
              )}
            </>
          )}
        </Card>

        <Card dark style={{ borderRadius: 26 }}>
          <Text style={styles.kickerDark}>Ton pourquoi</Text>
          <Text style={styles.why}>{why.trim() ? why : 'Écris ton pourquoi dans Notes : il apparaîtra ici.'}</Text>
          <TextButton
            label="Modifier dans Notes"
            onPress={() => router.push('/notes')}
            style={{ alignSelf: 'flex-start', minHeight: 44 }}
          />
        </Card>

        {fasting && (
          <View style={styles.streakCard}>
            <Ionicons name="leaf-outline" size={24} color={colors.emerald} />
            <Text style={styles.streakText}>
              {streak > 0 ? (
                <>
                  Ta série de <Text style={styles.strong}>{streak} {streak > 1 ? 'jours' : 'jour'}</Text> continue si tu
                  tiens jusqu’à {formatClockWithDay(startedAt + targetMs, now)}.
                </>
              ) : (
                <>Tiens jusqu’à {formatClockWithDay(startedAt + targetMs, now)} pour lancer ta série.</>
              )}
            </Text>
          </View>
        )}

        <PrimaryButton
          label="Je tiens"
          onPress={async () => {
            await logCraving('tenu');
            leave();
          }}
          style={{ marginTop: 4 }}
        />
        {fasting && <TextButton label="Terminer le jeûne ici, sans jugement" onPress={confirmStop} />}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  close: { width: 44, height: 44, marginLeft: -12, alignItems: 'center', justifyContent: 'center' },
  kicker: { fontSize: 12, fontWeight: '800', color: colors.sosText },
  heroTitle: { fontFamily: titleFont, fontSize: 30, fontWeight: '600', color: colors.text },
  heroText: { fontSize: 15, lineHeight: 22, color: colors.text },
  strong: { fontWeight: '800' },
  chip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
  },
  chipText: { fontSize: 13, fontWeight: '800', color: colors.text },
  cardTitle: { fontFamily: titleFont, fontSize: 19, fontWeight: '600', color: colors.text },
  muted: { fontSize: 13, lineHeight: 19, color: colors.muted },
  timerRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  timerText: { fontFamily: titleFont, fontSize: 22, fontWeight: '500', color: colors.text },
  helpRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  helpIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpTitle: { fontSize: 14, fontWeight: '800', color: colors.text },
  kickerDark: { fontSize: 12, fontWeight: '800', color: colors.mint },
  why: { fontFamily: titleFont, fontStyle: 'italic', fontSize: 19, lineHeight: 26, color: colors.onDeep },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 16,
  },
  streakText: { flex: 1, fontSize: 13.5, lineHeight: 20, color: colors.body },
  triggers: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  trigger: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  triggerOn: { backgroundColor: colors.emerald, borderColor: colors.emerald },
  triggerText: { fontSize: 13, fontWeight: '800', color: colors.body },
  tiles: { flexDirection: 'row', gap: 10 },
  tile: { flex: 1, backgroundColor: '#F2F8F3', borderRadius: 18, padding: 14, gap: 2 },
  tileValue: { fontFamily: titleFont, fontSize: 28, fontWeight: '600', color: colors.text },
  tileLabel: { fontSize: 12, fontWeight: '600', color: colors.muted },
});
