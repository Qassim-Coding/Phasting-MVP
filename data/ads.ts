import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants, { ExecutionEnvironment } from 'expo-constants';

import { ADS } from './monetization';

// Pubs plein écran (AdMob, via react-native-google-mobile-ads).
// - Expo Go ne contient pas le module natif des pubs : dans Expo Go, tout ce fichier ne fait rien.
//   Les pubs n'existent que dans un vrai build (EAS). Rien ne plante pendant tes tests Expo Go.
// - Le consentement RGPD (Suisse, UE, Royaume-Uni) est demandé avant la première pub.
// - La pub est préparée à l'avance (quand tu ouvres « Terminer le jeûne ? »), puis montrée juste après
//   « Terminer ». Une pub préparée trop longtemps (plus de 50 min) est rechargée : Google les périme après 1 h.
// - Une pub n'est montrée qu'après un jeûne terminé depuis l'accueil, jamais dans « J'ai envie de craquer ».

const LAST_AD_KEY = 'phasting:lastAdAt';
const MAX_AGE_MS = 50 * 60 * 1000;
const WAIT_FOR_LOAD_MS = 2500;

const inExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// Le module est chargé à la demande (et protégé) pour ne jamais faire planter l'app s'il est absent.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let adsModule: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getAds(): any {
  if (!ADS.enabled || inExpoGo) return null;
  if (!adsModule) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      adsModule = require('react-native-google-mobile-ads');
    } catch {
      adsModule = null;
    }
  }
  return adsModule;
}

let ready: Promise<boolean> | null = null;

// À appeler une fois au démarrage de l'app. Renvoie true si on a le droit de demander des pubs.
export function initAds(): Promise<boolean> {
  if (!ready) {
    ready = (async () => {
      const m = getAds();
      if (!m) return false;
      try {
        // Affiche le message de consentement si la loi l'exige pour cet utilisateur, puis mémorise son choix.
        // Si cette étape échoue, Google conseille de continuer avec le choix de la session précédente.
        try {
          await m.AdsConsent.gatherConsent();
        } catch {
          // on lit simplement le statut connu juste après
        }
        let canRequestAds = false;
        try {
          canRequestAds = (await m.AdsConsent.getConsentInfo()).canRequestAds === true;
        } catch {
          canRequestAds = false;
        }
        // En mode test, le consentement n'empêche pas la fausse pub (pas encore de message chez AdMob).
        if (!canRequestAds && !ADS.testMode) return false;

        await m.default().setRequestConfiguration({
          testDeviceIdentifiers: ['EMULATOR', ...ADS.testDevices],
          maxAdContentRating: m.MaxAdContentRating?.[ADS.maxRating],
        });
        await m.default().initialize();
        return true;
      } catch {
        return false;
      }
    })();
  }
  return ready;
}

// Vrai si les règles autorisent une pub maintenant : assez de jeûnes terminés, délai depuis la dernière pub respecté.
async function isDue(completedFasts: number): Promise<boolean> {
  if (completedFasts < ADS.freeFasts) return false;
  const last = Number(await AsyncStorage.getItem(LAST_AD_KEY)) || 0;
  return Date.now() - last >= ADS.cooldownHours * 3600000;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let loadedAd: any = null;
let loadedAt = 0;
let loading = false;

const isFresh = () => loadedAd !== null && Date.now() - loadedAt < MAX_AGE_MS;

// Charge une pub à l'avance si les règles l'autorisent. Sans attente : on l'appelle quand l'écran de
// confirmation « Terminer le jeûne ? » s'ouvre, la pub est prête quand l'utilisateur appuie sur « Terminer ».
export async function prepareInterstitial(completedFasts: number): Promise<void> {
  try {
    const m = getAds();
    if (!m || loading || isFresh()) return;
    if (!(await isDue(completedFasts))) return;
    if (!(await initAds())) return;

    loading = true;
    loadedAd = null;
    // Sécurité : si Google ne répond jamais, on libère le verrou après 15 secondes.
    setTimeout(() => {
      loading = false;
    }, 15000);

    const { InterstitialAd, AdEventType } = m;
    const ad = InterstitialAd.createForAdRequest(ADS.interstitialUnitId);
    const offs: (() => void)[] = [];
    const cleanup = () => offs.forEach((off) => off());
    offs.push(
      ad.addAdEventListener(AdEventType.LOADED, () => {
        loadedAd = ad;
        loadedAt = Date.now();
        loading = false;
      }),
      ad.addAdEventListener(AdEventType.ERROR, () => {
        loadedAd = null;
        loading = false;
        cleanup();
      }),
      ad.addAdEventListener(AdEventType.CLOSED, () => {
        loadedAd = null;
        cleanup();
      }),
    );
    ad.load();
  } catch {
    loading = false;
  }
}

// Montre la pub préparée si les règles le permettent. Attend au plus 2,5 secondes une pub encore en chargement.
// Ne bloque jamais l'app : sans pub prête, il ne se passe rien.
export async function showInterstitialIfDue(completedFasts: number): Promise<void> {
  try {
    const m = getAds();
    if (!m) return;
    if (!(await isDue(completedFasts))) return;

    const start = Date.now();
    while (!isFresh() && loading && Date.now() - start < WAIT_FOR_LOAD_MS) {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    if (!isFresh()) {
      void prepareInterstitial(completedFasts);
      return;
    }

    const ad = loadedAd;
    loadedAd = null;
    await AsyncStorage.setItem(LAST_AD_KEY, String(Date.now()));
    await ad.show();
  } catch {
    // Une pub qui échoue ne doit jamais gêner l'utilisateur.
  }
}
