# Arborescence de Phasting

Légende : ✅ existe dans le dépôt · 📦 livré dans `phasting-ecrans.zip`, à copier · 🔜 prévu (pas encore écrit)

Ce document liste les fichiers de l'app. Un rôle marqué 🔜 décrit la cible, pas le code actuel.

## Projet `Phasting-MVP/`

```
Phasting-MVP/
├── index.ts                      ✅ point d'entrée
├── app.json                      ✅ config Expo + widget
├── package.json                  ✅ dépendances (+ react-native-svg, @expo/vector-icons à installer)
├── eas.json                      ✅ profils de build (preview → APK)
├── theme.ts                      📦 couleurs, polices (Fraunces, Manrope) et choix du fichier de police
├── assets/
│   └── images/
│       ├── icon.png              ✅ icône (sablier)
│       ├── android-icon-foreground.png  ✅ icône adaptative
│       ├── splash-icon.png       ✅ écran de démarrage
│       └── notification-icon.png 🆕 petit sablier blanc des notifications (Android veut un dessin blanc sur fond transparent)
├── app/                          (écrans, routage par fichiers)
│   ├── _layout.tsx               📦 remplace l'ancien : FastProvider + pile
│   ├── index.tsx                 ✅ ancien écran de test → À SUPPRIMER (remplacé par (tabs)/index.tsx)
│   ├── (tabs)/
│   │   ├── _layout.tsx           📦 barre du bas : Jeûne, Calendrier, Stats, Notes
│   │   ├── index.tsx             📦 accueil à 3 états (prêt, en jeûne, fenêtre de repas)
│   │   ├── calendrier.tsx        📦 calendrier mensuel
│   │   ├── stats.tsx             📦 écran complet (7/14/30 jours, barres, poids)
│   │   └── notes.tsx             📦 3 onglets : Mes notes (pourquoi, poids, filtres, notes), Bienfaits du jeûne, Astuces
│   ├── protocole.tsx             📦 choix du protocole
│   ├── mon-jeune.tsx             📦 fiche de phase + ton parcours dans cette phase
│   ├── craquer.tsx               📦 écran SOS
│   ├── reglages.tsx              🆕 accueil des réglages : une carte, une ligne par réglage (Rappels, Widget)
│   ├── reglages-widget.tsx       📦 réglages des widgets : lignes affichées, anneau, transparence, couleur, thème
│   ├── rappels.tsx               🆕 Rappels : un interrupteur par phase (2 à 5), emojis, « mon pourquoi », ma phrase, notification d'exemple
│   ├── nouvelle-note.tsx         📦 saisie d'une note (type, humeur, texte)
│   └── ajouter-poids.tsx         📦 pesée : règle graduée façon Libra, date modifiable, commentaire
├── plugins/
│   └── withPhastingTheme.js      📦 colore les dialogues natifs (calendrier, horloge) en émeraude
├── components/
│   ├── ui.tsx                    📦 Screen, Card, boutons
│   ├── ProgressRing.tsx          📦 anneau de progression
│   ├── Sparkline.tsx             📦 mini-courbe (poids)
│   ├── Text.tsx                  📦 Text thémé : Manrope partout, Fraunces pour les titres
│   ├── WeightRuler.tsx           📦 règle graduée à faire glisser (0,1 kg par graduation)
│   ├── NoteCard.tsx              📦 carte d'une note (Notes, Calendrier, Mon jeûne)
│   ├── EditSheet.tsx             📦 feuille de modification (pourquoi, objectif de poids)
│   ├── CoffeeCard.tsx            📦 carte « Offre-moi un café » (lien vers Buy Me a Coffee ou Ko-fi), en bas de Stats
│   ├── BienfaitsView.tsx         📦 onglet « Bienfaits du jeûne » : une phase à la fois, avec études et niveau de preuve
│   ├── AstucesView.tsx           📦 onglet « Astuces » : astuces pour tenir, en deux groupes, + accès à « J'ai envie de craquer »
│   ├── TopBar.tsx                📦 série + engrenage (ouvre Réglages) + pastille du protocole
│   ├── pickStartTime.ts          📦 sélecteurs natifs Android : calendrier puis horloge
│   ├── HomeReady.tsx             📦 accueil « prêt à commencer »
│   ├── HomeFasting.tsx           📦 accueil « en jeûne »
│   └── HomeMeal.tsx              📦 accueil « fenêtre de repas »
├── data/
│   ├── FastContext.tsx           📦 jeûne en cours, protocole, historique, série, actions
│   ├── protocols.ts              📦 les 7 protocoles
│   ├── monetization.ts           📦 réglages : pubs (identifiants, délai, jeûnes sans pub) et lien café
│   ├── reminders.ts              🆕 rappels de phase : réglages, texte des messages, programmation des notifications ; sans effet dans Expo Go
│   ├── ads.ts                    📦 pub plein écran après un jeûne terminé + consentement RGPD ; sans effet dans Expo Go
│   ├── phases.ts                 📦 les 5 phases (textes sourcés, études, niveau de preuve) et les astuces
│   ├── storage.ts                📦 version complète : notes (humeur, durée de jeûne), objectif de poids
│   └── useNotesData.ts           📦 charge notes, objectif et pourquoi, recharge au retour sur l'écran
├── logic/
│   ├── streak.ts                 📦 règle de série et statut des jours
│   ├── stats.ts                  📦 moyenne, record, barres par jour
│   ├── cravings.ts               📦 bilan des envies : taux tenu, heure typique, déclencheur
│   ├── phaseStats.ts             📦 historique de l'utilisateur dans une phase
│   ├── weight.ts                 📦 poids actuel, écart, progression, formats kg
│   └── dates.ts                  📦 clés de jour, dates en français
└── widgets/
    ├── fastState.ts              ✅ → 📦 version mise à jour (phases depuis phases.ts, hier/demain)
    ├── ElapsedWidget.tsx         ✅ → 📦 version mise à jour (protocole dynamique)
    ├── refreshWidget.tsx         📦 redessine les deux widgets tout de suite
    ├── DetailWidget.tsx          📦 widget détaillé 4×4 (phase, corps, 5 phases, bouton SOS)
    ├── widgetData.ts             📦 série en cours, lue pour le widget
    ├── widgetTheme.ts            📦 réglages des widgets, palette, anneau SVG
    └── widget-task-handler.tsx   ✅ → 📦 gère les deux widgets (Elapsed et Detail)
```

La fenêtre de repas n'a pas de fichier à part : c'est le troisième état de l'accueil (`(tabs)/index.tsx`), avec « prêt » et « en jeûne ».

**Point d'attention (écart avec la version précédente de ce document).** Les écrans Calendrier, Stats et Notes sont dans `app/(tabs)/` et non à plat dans `app/`. Le dossier `(tabs)` ne change pas les adresses (`/calendrier`, `/notes`…), mais c'est lui qui porte la barre du bas. L'accueil devient donc `app/(tabs)/index.tsx` : il faut supprimer `app/index.tsx`, sinon deux routes « / » entrent en conflit.

## Rôle de chaque fichier

### Racine
| Fichier | Rôle |
|---|---|
| `index.ts` | Lance expo-router et enregistre le gestionnaire du widget. |
| `app.json` | Nom, identifiant Android (`com.phasting.app`), couleurs, widgets `Elapsed` (4×2) et `Detail` (4×4), rafraîchissement 30 min. |
| `package.json` | Expo SDK 54, expo-router, react-native-android-widget, AsyncStorage. S'y ajoutent `react-native-svg`, `@expo/vector-icons` et `@react-native-community/datetimepicker` (via `npx expo install`). |
| `plugins/withPhastingTheme.js` | Plugin Expo : met le vert émeraude comme couleur d'accent des dialogues natifs. Déclaré dans `app.json`. |
| `eas.json` | `preview` produit un APK de test, `development` sert au client de dev, `production` prépare le store. |
| `theme.ts` | Palette zen, polices (Fraunces pour les titres, Manrope pour le reste) et choix du fichier Manrope d'après le fontWeight. |

### `app/`
| Fichier | Rôle |
|---|---|
| `_layout.tsx` | Enveloppe l'app dans `FastProvider` ; déclare la pile (tabs, protocole, mon-jeune, craquer et nouvelle-note en modales). |
| `(tabs)/_layout.tsx` | Barre du bas à 4 onglets. |
| `(tabs)/index.tsx` | Choisit l'état de l'accueil : jeûne en cours, sinon fenêtre de repas ouverte, sinon prêt. |
| `(tabs)/calendrier.tsx` | Mois avec états tenu / partiel / vide, point sur les jours avec note, détail du jour (jeûnes, poids, notes), bilan du mois. |
| `(tabs)/stats.tsx` | Durée moyenne, record, objectifs tenus, meilleure série, barres par jour, poids. |
| `(tabs)/notes.tsx` | Trois onglets. « Mes notes » : « Mon pourquoi », poids avec objectif, filtres, liste de notes avec humeur. « Bienfaits du jeûne » : `BienfaitsView`. « Astuces » : `AstucesView`. Un autre écran peut ouvrir un onglet : `router.push({ pathname: '/notes', params: { tab: 'astuces' } })`. |
| `reglages.tsx` | Écran Réglages (maquette `Reglages.dc.html`) : carte « Mon jeûne » avec les lignes Rappels (pastille « N actifs ») et Widget. Remplace l'ancien menu système. Pour un nouveau réglage, ajouter une `<SettingRow>`. |
| `rappels.tsx` | Écran Rappels (maquette `Rappels.dc.html`). 4 interrupteurs (phases 2 à 5, après 4, 8, 12, 16 h), « Emojis au hasard », « Rappeler mon pourquoi », champ « Ma phrase à moi », bouton « Recevoir une notification d'exemple ». Active un interrupteur → Android demande l'autorisation (13 et plus). Enregistre à chaque changement puis reprogramme les notifications. |
| `reglages-widget.tsx` | Aperçu du widget, interrupteurs d'affichage, épaisseur d'anneau et transparence (boutons − / +), couleur d'accent, thème. Redessine les widgets à chaque changement. |
| `nouvelle-note.tsx` | Type (avancée, doute, victoire), humeur (1 à 5), texte libre ; liée au jeûne en cours. |
| `ajouter-poids.tsx` | Règle graduée (0,1 kg), boutons − et +, date et heure modifiables, commentaire. Démarre sur la dernière pesée. |
| `protocole.tsx` | Liste des protocoles et bouton « Choisir ». |
| `mon-jeune.tsx` | Phase : ton parcours, ce que fait le corps, la science (études), ce que tu y gagnes, trois astuces et un lien vers toutes les astuces. Plus de note « avis médical ». |
| `craquer.tsx` | Minuteur de 10 min, déclencheurs, astuces, bilan de tes envies passées, record à battre, « mon pourquoi », série. Enregistre chaque envie (tenue ou jeûne arrêté). |

### `components/`
| Fichier | Rôle |
|---|---|
| `ui.tsx` | `Screen`, `Card`, `PrimaryButton`, `OutlineButton`, `TextButton`, `SectionTitle`. |
| `ProgressRing.tsx` | Anneau SVG réutilisé par l'accueil et le minuteur. |
| `Sparkline.tsx` | Mini-courbe SVG de l'évolution du poids. |
| `Text.tsx` | Remplace le Text de React Native : applique Manrope d'après le fontWeight, ou la police donnée (titres). |
| `WeightRuler.tsx` | Règle graduée horizontale : on la fait glisser, le repère central donne la valeur. |
| `NoteCard.tsx` | Carte de note partagée : date, type, texte, humeur, durée de jeûne. |
| `EditSheet.tsx` | Feuille du bas pour modifier une valeur (pourquoi, objectif de poids). |
| `CoffeeCard.tsx` | Carte « Offre-moi un café » : ouvre ta page de dons dans le navigateur. Cachée tant que l'adresse contient TON_PSEUDO. |
| `BienfaitsView.tsx` | Onglet « Bienfaits du jeûne » de Notes. Pastilles 1 à 5, carte de phase (heures, niveau de preuve, « Tu es ici »), « Ce qui se passe », « Ce que tu y gagnes », « Ce que dit la science », boutons phase précédente / suivante. S'ouvre sur ta phase en cours. |
| `AstucesView.tsx` | Onglet « Astuces » de Notes : astuces en deux groupes (« Quand la faim arrive », dont « Dors : qui dort dîne », et « Avant de commencer le jeûne », dont la ghréline avec sa source), mention « astuces d'usage », lien vers « J'ai envie de craquer ». |
| `TopBar.tsx` | Nom, série en jours, engrenage (ouvre l'écran Réglages), pastille du protocole. |
| `pickStartTime.ts` | Ouvre les sélecteurs natifs d'Android (date, puis heure) et renvoie l'heure choisie, ou rien si on annule. Refuse une heure dans le futur. |
| `HomeReady.tsx`, `HomeFasting.tsx`, `HomeMeal.tsx` | Les trois états de l'accueil. Dans `HomeMeal`, le mot sous la durée tenue : « Objectif atteint » (objectif tenu), « Bien joué » (12 h et plus), « Bien tenté » (moins de 12 h, avec une phrase d'encouragement). |

### `data/` et `logic/`
| Fichier | Rôle |
|---|---|
| `FastContext.tsx` | Le seul endroit qui connaît le jeûne. Expose `useFast()` : état, protocole, historique, série, et les actions (démarrer, terminer, changer l'heure, changer de protocole). Chaque action met le widget à jour. |
| `protocols.ts` | Les 7 protocoles : 12:12, 14:10, 16:8, 18:6, 20:4, OMAD (23:1), 24 h. |
| `monetization.ts` | Réglages des pubs (identifiants de test Google, une pub toutes les 20 h, 2 jeûnes sans pub, maturité maximale des pubs, mode test, téléphones de test) et adresse du café. |
| `reminders.ts` | Tout ce qui concerne les rappels. `PHASE_REMINDERS` (phases 2 à 5 et heure de début), `buildMessage()` (« Bravo, tu as bien tenu 💪 Ton corps entre en phase X : Y. Courage, plus que ZZ ! », ou « Objectif atteint, bravo » si l'objectif est déjà passé), `syncReminders()` (annule puis reprogramme selon le début du jeûne, l'objectif et les réglages), `requestReminderPermission()`, `sendTestReminder()`. Appelé par `FastContext` à chaque changement du jeûne, par `rappels.tsx` à chaque réglage et par l'onglet Notes quand « Mon pourquoi » change. |
| `ads.ts` | `initAds()` au démarrage (consentement RGPD puis AdMob), `prepareInterstitial()` quand « Terminer le jeûne ? » s'ouvre (la pub se charge pendant la lecture), `showInterstitialIfDue()` après « Terminer ». Ne fait rien dans Expo Go, n'est jamais appelé depuis Craquer. |
| `phases.ts` | Les 5 phases : noms, seuils, niveau de preuve, texte « ce qui se passe » (long pour les écrans, court pour le widget), bloc « ce que tu y gagnes » / « bon à savoir » / « à savoir », études (auteurs, année, revue, humain / animal / revue). Les astuces (`TIP_GROUPS`, `TIPS`). Sources : document « Phasting — contenu scientifique des phases ». Lu aussi par le widget : aucune bibliothèque d'interface dans ce fichier. |
| `storage.ts` | Historique, notes, envies, « mon pourquoi », protocole choisi, objectif de poids. |
| `useNotesData.ts` | Hook : charge notes, objectif et pourquoi ; recharge à chaque retour sur l'écran. |
| `cravings.ts` | `summarizeCravings` : envies surmontées, taux, heure de jeûne typique (à partir de 3), déclencheur le plus fréquent. |
| `phaseStats.ts` | `phaseHistory` : combien de fois une phase a été atteinte, dernière fois, humeur moyenne et notes à ce stade. |
| `stats.ts` | `computeStats(historique, jours, maintenant)` : barres par jour, durée moyenne, record, tenus / partiels. |
| `weight.ts` | `weightInfo` (actuel, départ, écart, progression, reste), `formatKg`, `parseKg` (20 à 400 kg). |
| `streak.ts` | Tenu = +1 ; partiel (≥ 12 h) = série gardée sans +1 ; sous 12 h = série cassée. Un jeûne compte pour le jour où il se termine. |
| `dates.ts` | Clés de jour locales, mois et jours en français, durées. |

### `widgets/`
| Fichier | Rôle |
|---|---|
| `fastState.ts` | `FastState` (début, objectif, étiquette du protocole), `loadFast` / `saveFast` (clé `phasting:fast`), `getPhase()`, formats d'heure (dont « hier » et « demain »). Partagé par l'app et le widget. |
| `ElapsedWidget.tsx` | Widget 4×2 : anneau SVG, phase, début et fin, heure d'actualisation. |
| `refreshWidget.tsx` | Demande à Android de redessiner les deux widgets tout de suite. |
| `widget-task-handler.tsx` | Réagit à l'ajout, la mise à jour et le redimensionnement : dessine `Elapsed` ou `Detail` selon le widget. |
| `DetailWidget.tsx` | Widget 4×4 : anneau, phase, « ton corps / tu gagnes / pour tenir », 5 barres de phases, série, bouton « J'ai envie de craquer » (ouvre `phasting://craquer`). |
| `widgetTheme.ts` | Réglages des widgets (lignes affichées, épaisseur d'anneau, transparence, accent, thème), enregistrés sur le téléphone ; palette et dessin de l'anneau. |
| `widgetData.ts` | Lit l'historique et calcule la série, pour le widget (qui tourne sans l'app). |

## Données stockées (AsyncStorage)

| Clé | Contenu |
|---|---|
| `phasting:fast` | Jeûne en cours : `startedAt` (ms ou null), `targetHours`, `protocolLabel`. |
| `phasting:history` | Un enregistrement par jeûne : début, fin, objectif, protocole. La durée tenue se calcule (fin − début). |
| `phasting:protocol` | Identifiant du protocole choisi. |
| `phasting:notes` | Notes : date, type (poids, avancée, doute, victoire), texte, poids (`value`), humeur 1 à 5 (`mood`), durée de jeûne au moment de la note (`fastHours`). |
| `phasting:why` | « Mon pourquoi », texte libre. |
| `phasting:cravings` | Envies de craquer : date, heure de jeûne, issue (tenu / craqué), déclencheur facultatif. |
| `phasting:weightGoal` | Objectif de poids : `targetKg` et `startKg` (null = première pesée). |

Le statut d'un jour (tenu, partiel, vide) et la série se calculent à partir de la durée tenue : on ne les stocke pas.

## Maquettes (canvas Design)

Elles vivent dans le canvas Design, pas dans le dépôt.

| Maquette | Écran |
|---|---|
| `Pret.dc.html` | accueil, état « prêt à commencer » |
| `Main.dc.html` | accueil, état « en jeûne » |
| `Repas.dc.html` | accueil, état « fenêtre de repas » |
| `Protocole.dc.html` | `protocole.tsx` |
| `MonJeune.dc.html` | `mon-jeune.tsx` |
| `Craquer.dc.html` | `craquer.tsx` |
| `Calendrier.dc.html` | `(tabs)/calendrier.tsx` |
| `Stats.dc.html` | `(tabs)/stats.tsx` |
| `Notes.dc.html` | `(tabs)/notes.tsx`, onglet « Mes notes » |
| `BienfaitsB.dc.html` | `BienfaitsView.tsx` (option B retenue : une phase à la fois) |
| `BienfaitsA.dc.html` | option A (frise), non retenue |
| `Astuces.dc.html` | `AstucesView.tsx` |
| `NouvelleNote.dc.html` | `nouvelle-note.tsx` |
| `Widget.dc.html` | `ElapsedWidget.tsx` |
| `WidgetDetail.dc.html` | `DetailWidget.tsx` |
| `Settings.dc.html` | réglages du widget (`reglages-widget.tsx`) |
| `Reglages.dc.html` | `reglages.tsx` |
| `Rappels.dc.html` | `rappels.tsx` |
| `RappelsNotifs.dc.html` | exemples de notifications (textes de `reminders.ts`) |
| `Icons.dc.html` | choix de l'icône (tranché : le sablier) |

## Navigation

```
Protocole → Prêt → En jeûne ⇄ Mon jeûne
                      │  ├──→ Craquer ──→ (Je tiens) En jeûne
                      │  │              └─→ (Terminer) Fenêtre de repas
                      │  └──→ (Terminer) Fenêtre de repas → En jeûne (nouveau jeûne)

Notes : onglets Mes notes · Bienfaits du jeûne · Astuces
Mon jeûne ──→ Notes (onglet Astuces)
Astuces ──→ Craquer
Notes ──→ Nouvelle note ──→ Notes
Notes ──→ Ajouter mon poids ──→ Notes
Stats ──→ Notes (carte Poids)

Barre du bas : Jeûne · Calendrier · Stats · Notes
```

Prêt, En jeûne et Fenêtre de repas sont le même écran : `app/(tabs)/index.tsx`.
