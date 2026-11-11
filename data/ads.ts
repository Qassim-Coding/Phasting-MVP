import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants, { ExecutionEnvironment } from 'expo-constants';

import { ADS } from './monetization';

// Pubs plein écran (AdMob, via react-native-google-mobile-ads).
// - Expo Go ne contient pas le module natif des pubs : dans Expo Go, tout ce fichier ne fait rien.
//   Les pubs n'existent que dans un vrai build (EAS). Rien ne plante pendant tes tests Expo Go.
// - Le consentement RGPD (Suisse, UE, Royaume-Uni) est demandé avant la première pub.
// - Une pub n'est montrée qu'après un jeûne terminé, jamais dans « J'ai envie de craquer ».

const LAST_AD_KEY = 'phasting:lastAdAt';
const LOAD_TIMEOUT_MS = 4000;

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
        const info = await m.AdsConsent.gatherConsent();
        if (info && info.canRequestAds === false) return false;
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

// Montre une pub plein écran si les règles le permettent : assez de jeûnes terminés, délai respecté,
// consentement donné, pub chargée en moins de 4 secondes. Sinon, ne fait rien (et ne bloque jamais l'app).
export async function showInterstitialIfDue(completedFasts: number): Promise<void> {
  try {
    const m = getAds();
    if (!m) return;
    if (completedFasts < ADS.freeFasts) return;
    const last = Number(await AsyncStorage.getItem(LAST_AD_KEY)) || 0;
    if (Date.now() - last < ADS.cooldownHours * 3600000) return;
    if (!(await initAds())) return;

    const { InterstitialAd, AdEventType } = m;
    const ad = InterstitialAd.createForAdRequest(ADS.interstitialUnitId);

    await new Promise<void>((resolve) => {
      let settled = false;
      const offs: (() => void)[] = [];
      const finish = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        offs.forEach((off) => off());
        resolve();
      };
      const timer = setTimeout(finish, LOAD_TIMEOUT_MS);

      offs.push(
        ad.addAdEventListener(AdEventType.LOADED, () => {
          if (settled) return;
          clearTimeout(timer);
          AsyncStorage.setItem(LAST_AD_KEY, String(Date.now())).catch(() => {});
          ad.show().catch(finish);
        }),
        ad.addAdEventListener(AdEventType.CLOSED, finish),
        ad.addAdEventListener(AdEventType.ERROR, finish),
      );
      ad.load();
    });
  } catch {
    // Une pub qui échoue ne doit jamais gêner l'utilisateur.
  }
}
