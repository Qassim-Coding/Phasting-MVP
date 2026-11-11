// Réglages de la monétisation : pub plein écran après un jeûne terminé + lien « Offre-moi un café ».
// Un seul endroit à modifier. Les identifiants ci-dessous sont les identifiants de TEST de Google :
// ils affichent de fausses pubs, sans risque pour ton compte AdMob.

export const ADS = {
  // Mettre false pour couper toutes les pubs (par exemple pour une version sans pub).
  enabled: true,
  // Mode test : tant que c'est true, on affiche de fausses pubs et on ignore le blocage du consentement RGPD
  // (le message de consentement n'existe pas encore chez AdMob). À passer à false le jour où tu mets de vrais
  // identifiants : dès lors, pas de consentement = pas de pub.
  testMode: true,
  // Identifiant de TEST d'une pub plein écran (« interstitielle »). À remplacer par ton vrai identifiant AdMob
  // seulement quand l'app est publiée (étape 7 du guide).
  interstitialUnitId: 'ca-app-pub-3940256099942544/1033173712',
  // Au plus une pub toutes les 20 heures : un jeûne par jour = une pub par jour maximum.
  cooldownHours: 20,
  // Aucune pub avant que tu aies terminé 2 jeûnes : on laisse d'abord découvrir l'app.
  freeFasts: 2,
  // Maturité maximale des pubs : 'G' (tout public), 'PG', 'T' (ados) ou 'MA' (adultes). Avec 'PG', Google écarte
  // les pubs à caractère suggestif. Plus c'est strict, moins il y a de pubs disponibles (donc un peu moins de revenus).
  maxRating: 'PG' as 'G' | 'PG' | 'T' | 'MA',
  // Identifiants de ton téléphone pour ne jamais voir (ni cliquer) de vraies pubs avec ton compte.
  // Le vrai identifiant s'affiche dans les journaux Android (logcat) au premier lancement.
  testDevices: [] as string[],
};

export const COFFEE = {
  enabled: true,
  // Adresse de ta page Buy Me a Coffee. À VÉRIFIER : ouvre ce lien dans un navigateur, ta page doit s'afficher.
  // Si tu remets le texte TON_PSEUDO dans l'adresse, la carte « café » se cache (on ne publie pas un lien faux).
  url: 'https://buymeacoffee.com/QassimCoding',
};
