import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { computeBestStreak, computeStreak } from '../logic/streak';
import { type FastState, loadFast, saveFast } from '../widgets/fastState';
import { refreshWidget } from '../widgets/refreshWidget';
import { DEFAULT_PROTOCOL_ID, type Protocol, getProtocol } from './protocols';
import { syncReminders } from './reminders';
import {
  type FastRecord,
  addRecord,
  loadHistory,
  loadProtocolId,
  saveProtocolId,
} from './storage';

// Le "cerveau" de l'app : un seul endroit qui connaît le jeûne en cours, le protocole choisi,
// l'historique et la série. Tous les écrans le lisent avec useFast().

type FastContextValue = {
  ready: boolean;
  now: number; // mis à jour chaque seconde
  fast: FastState;
  protocol: Protocol;
  history: FastRecord[];
  lastRecord: FastRecord | null;
  streak: number;
  bestStreak: number;
  start: (startedAt?: number) => Promise<void>;
  setStartedAt: (startedAt: number) => Promise<void>;
  stop: () => Promise<FastRecord | null>;
  chooseProtocol: (id: string) => Promise<void>;
};

const FastContext = createContext<FastContextValue | null>(null);

export function useFast(): FastContextValue {
  const ctx = useContext(FastContext);
  if (!ctx) throw new Error('useFast doit être utilisé dans <FastProvider>');
  return ctx;
}

export function FastProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [fast, setFast] = useState<FastState>({ startedAt: null, targetHours: 16 });
  const [protocolId, setProtocolId] = useState(DEFAULT_PROTOCOL_ID);
  const [history, setHistory] = useState<FastRecord[]>([]);

  useEffect(() => {
    Promise.all([loadFast(), loadProtocolId(), loadHistory()]).then(([f, p, h]) => {
      setFast(f);
      setProtocolId(p);
      setHistory(h);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const protocol = getProtocol(protocolId);

  // Rappels de phase : reprogrammés au lancement, au démarrage, à l'arrêt et quand l'heure de début change.
  useEffect(() => {
    if (!ready) return;
    void syncReminders(fast);
  }, [ready, fast]);

  const persist = useCallback(async (next: FastState) => {
    setFast(next);
    await saveFast(next);
    // Le widget se met à jour en arrière-plan : s'il est lent, absent ou indisponible (Expo Go),
    // ça ne doit jamais bloquer ni faire échouer l'écran.
    void refreshWidget(next).catch(() => {});
  }, []);

  const start = useCallback(
    async (startedAt: number = Date.now()) => {
      await persist({ startedAt, targetHours: protocol.fastHours, protocolLabel: protocol.label });
    },
    [persist, protocol],
  );

  const setStartedAt = useCallback(
    async (startedAt: number) => {
      await persist({ ...fast, startedAt });
    },
    [persist, fast],
  );

  const stop = useCallback(async (): Promise<FastRecord | null> => {
    if (fast.startedAt === null) return null;
    const endedAt = Date.now();
    const record: FastRecord = {
      id: String(endedAt),
      startedAt: fast.startedAt,
      endedAt,
      targetHours: fast.targetHours,
      protocolId,
    };
    setHistory(await addRecord(record));
    await persist({ startedAt: null, targetHours: protocol.fastHours, protocolLabel: protocol.label });
    return record;
  }, [fast, persist, protocol, protocolId]);

  const chooseProtocol = useCallback(
    async (id: string) => {
      const next = getProtocol(id);
      setProtocolId(next.id);
      await saveProtocolId(next.id);
      // Un jeûne en cours garde son objectif ; sinon on met le widget à jour.
      if (fast.startedAt === null) {
        await persist({ startedAt: null, targetHours: next.fastHours, protocolLabel: next.label });
      }
    },
    [fast.startedAt, persist],
  );

  const lastRecord = history.length > 0 ? history.reduce((a, b) => (b.endedAt > a.endedAt ? b : a)) : null;
  const streak = useMemo(() => computeStreak(history, now), [history, now]);
  const bestStreak = useMemo(() => computeBestStreak(history, now), [history, now]);

  const value: FastContextValue = {
    ready,
    now,
    fast,
    protocol,
    history,
    lastRecord,
    streak,
    bestStreak,
    start,
    setStartedAt,
    stop,
    chooseProtocol,
  };

  return <FastContext.Provider value={value}>{children}</FastContext.Provider>;
}
