import { loadHistory } from '../data/storage';
import { computeStreak } from '../logic/streak';

// Série en cours, lue depuis le stockage : le widget tourne sans l'app, il ne peut pas utiliser useFast().
export async function loadStreak(now: number): Promise<number> {
  try {
    return computeStreak(await loadHistory(), now);
  } catch {
    return 0;
  }
}
