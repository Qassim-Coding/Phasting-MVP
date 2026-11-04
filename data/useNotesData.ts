import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { type Note, type WeightGoal, loadGoal, loadNotes, loadWhy } from './storage';

// Charge les notes, l'objectif de poids et « mon pourquoi », et les recharge
// à chaque fois qu'on revient sur l'écran (ex. après avoir ajouté une note).
export function useNotesData() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [goal, setGoal] = useState<WeightGoal | null>(null);
  const [why, setWhy] = useState('');

  const reload = useCallback(async () => {
    const [n, g, w] = await Promise.all([loadNotes(), loadGoal(), loadWhy()]);
    setNotes(n);
    setGoal(g);
    setWhy(w);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  return { notes, goal, why, reload };
}
