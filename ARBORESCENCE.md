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
├── theme.ts                      📦 couleurs et police des titres
├── assets/
│   └── images/
│       ├── icon.png              ✅ icône (sablier)
│       ├── android-icon-foreground.png  ✅ icône adaptative
│       └── splash-icon.png       ✅ écran de démarrage
├── app/                          (écrans, routage par fichiers)
│   ├── _layout.tsx               📦 remplace l'ancien : FastProvider + pile
│   ├── index.tsx                 ✅ ancien écran de test → À SUPPRIMER (remplacé par (tabs)/index.tsx)
│   ├── (tabs)/
│   │   ├── _layout.tsx           📦 barre du bas : Jeûne, Calendrier, Stats, Notes
│   │   ├── index.tsx             📦 accueil à 3 états (prêt, en jeûne, fenêtre de repas)
│   │   ├── calendrier.tsx        📦 calendrier mensuel
│   │   ├── stats.tsx             📦 provisoire → 🔜 écran complet
│   │   └── notes.tsx             📦 provisoire → 🔜 écran complet
│   ├── protocole.tsx             📦 choix du protocole
│   ├── mon-jeune.tsx             📦 fiche de phase
│   ├── craquer.tsx               📦 écran SOS
│   └── nouvelle-note.tsx         🔜 saisie d'une note (type, humeur, texte, poids)
├── plugins/
│   └── withPhastingTheme.js      📦 colore les dialogues natifs (calendrier, horloge) en émeraude
├── components/
│   ├── ui.tsx                    📦 Screen, Card, boutons
│   ├── ProgressRing.tsx          📦 anneau de progression
│   ├── TopBar.tsx                📦 série + pastille du protocole
│   ├── pickStartTime.ts          📦 sélecteurs natifs Android : calendrier puis horloge
│   ├── HomeReady.tsx             📦 accueil « prêt à commencer »
│   ├── HomeFasting.tsx           📦 accueil « en jeûne »
│   └── HomeMeal.tsx              📦 accueil « fenêtre de repas »
├── data/
│   ├── FastContext.tsx           📦 jeûne en cours, protocole, historique, série, actions
│   ├── protocols.ts              📦 les 7 protocoles
│   ├── phases.ts                 📦 les 5 phases (textes provisoires) et astuces
│   └── storage.ts                📦 historique, notes, « mon pourquoi », protocole choisi
├── logic/
│   ├── streak.ts                 📦 règle de série et statut des jours
│   └── dates.ts                  📦 clés de jour, dates en français
└── widgets/
    ├── fastState.ts              ✅ → 📦 version mise à jour (phases depuis phases.ts, hier/demain)
    ├── ElapsedWidget.tsx         ✅ → 📦 version mise à jour (protocole dynamique)
    ├── refreshWidget.tsx         📦 redessine le widget tout de suite
    ├── DetailWidget.tsx          🔜 widget détaillé 4×4
    └── widget-task-handler.tsx   ✅ inchangé
```

La fenêtre de repas n'a pas de fichier à part : c'est le troisième état de l'accueil (`(tabs)/index.tsx`), avec « prêt » et « en jeûne ».

**Point d'attention (écart avec la version précédente de ce document).** Les écrans Calendrier, Stats et Notes sont dans `app/(tabs)/` et non à plat dans `app/`. Le dossier `(tabs)` ne change pas les adresses (`/calendrier`, `/notes`…), mais c'est lui qui porte la barre du bas. L'accueil devient donc `app/(tabs)/index.tsx` : il faut supprimer `app/index.tsx`, sinon deux routes « / » entrent en conflit.

## Rôle de chaque fichier

### Racine
| Fichier | Rôle |
|---|---|
| `index.ts` | Lance expo-router et enregistre le gestionnaire du widget. |
| `app.json` | Nom, identifiant Android (`com.phasting.app`), couleurs, widget `Elapsed` (4×2, rafraîchissement 30 min). |
| `package.json` | Expo SDK 54, expo-router, react-native-android-widget, AsyncStorage. S'y ajoutent `react-native-svg`, `@expo/vector-icons` et `@react-native-community/datetimepicker` (via `npx expo install`). |
| `plugins/withPhastingTheme.js` | Plugin Expo : met le vert émeraude comme couleur d'accent des dialogues natifs. Déclaré dans `app.json`. |
| `eas.json` | `preview` produit un APK de test, `development` sert au client de dev, `production` prépare le store. |
| `theme.ts` | Palette zen et police des titres. |

### `app/`
| Fichier | Rôle |
|---|---|
| `_layout.tsx` | Enveloppe l'app dans `FastProvider` ; déclare la pile (tabs, protocole, mon-jeune, craquer en modale). |
| `(tabs)/_layout.tsx` | Barre du bas à 4 onglets. |
| `(tabs)/index.tsx` | Choisit l'état de l'accueil : jeûne en cours, sinon fenêtre de repas ouverte, sinon prêt. |
| `(tabs)/calendrier.tsx` | Mois avec états tenu / partiel / vide, navigation de mois, détail du jour. |
| `(tabs)/stats.tsx` | Durée moyenne, record, objectifs tenus, meilleure série, barres par jour, poids. |
| `(tabs)/notes.tsx` | « Mon pourquoi », poids avec objectif, filtres, liste de notes avec humeur. |
| `nouvelle-note.tsx` | Type, humeur (1 à 5), texte libre, poids facultatif ; liée au jeûne en cours. |
| `protocole.tsx` | Liste des protocoles, avertissement médical, bouton « Choisir ». |
| `mon-jeune.tsx` | Phase : ce que fait le corps, la science, les bienfaits, comment tenir. |
| `craquer.tsx` | Minuteur de 10 min, astuces, « mon pourquoi », rappel de la série. |

### `components/`
| Fichier | Rôle |
|---|---|
| `ui.tsx` | `Screen`, `Card`, `PrimaryButton`, `OutlineButton`, `TextButton`, `SectionTitle`. |
| `ProgressRing.tsx` | Anneau SVG réutilisé par l'accueil et le minuteur. |
| `TopBar.tsx` | Nom, série en jours, pastille du protocole. |
| `pickStartTime.ts` | Ouvre les sélecteurs natifs d'Android (date, puis heure) et renvoie l'heure choisie, ou rien si on annule. Refuse une heure dans le futur. |
| `HomeReady.tsx`, `HomeFasting.tsx`, `HomeMeal.tsx` | Les trois états de l'accueil. |

### `data/` et `logic/`
| Fichier | Rôle |
|---|---|
| `FastContext.tsx` | Le seul endroit qui connaît le jeûne. Expose `useFast()` : état, protocole, historique, série, et les actions (démarrer, terminer, changer l'heure, changer de protocole). Chaque action met le widget à jour. |
| `protocols.ts` | Les 7 protocoles : 12:12, 14:10, 16:8, 18:6, 20:4, OMAD (23:1), 24 h. |
| `phases.ts` | Noms, seuils, textes, bienfaits et études des 5 phases ; astuces. Contenu provisoire jusqu'au 29 nov. |
| `storage.ts` | Historique, notes, « mon pourquoi », protocole choisi. |
| `streak.ts` | Tenu = +1 ; partiel (≥ 12 h) = série gardée sans +1 ; sous 12 h = série cassée. Un jeûne compte pour le jour où il se termine. |
| `dates.ts` | Clés de jour locales, mois et jours en français, durées. |

### `widgets/`
| Fichier | Rôle |
|---|---|
| `fastState.ts` | `FastState` (début, objectif, étiquette du protocole), `loadFast` / `saveFast` (clé `phasting:fast`), `getPhase()`, formats d'heure (dont « hier » et « demain »). Partagé par l'app et le widget. |
| `ElapsedWidget.tsx` | Widget 4×2 : anneau SVG, phase, début et fin, heure d'actualisation. |
| `refreshWidget.tsx` | Demande à Android de redessiner le widget tout de suite. |
| `widget-task-handler.tsx` | Réagit à l'ajout, la mise à jour et le redimensionnement du widget. |
| `DetailWidget.tsx` 🔜 | Version détaillée 4×4. |

## Données stockées (AsyncStorage)

| Clé | Contenu |
|---|---|
| `phasting:fast` | Jeûne en cours : `startedAt` (ms ou null), `targetHours`, `protocolLabel`. |
| `phasting:history` | Un enregistrement par jeûne : début, fin, objectif, protocole. La durée tenue se calcule (fin − début). |
| `phasting:protocol` | Identifiant du protocole choisi. |
| `phasting:notes` | Notes : date, type (poids, avancée, doute, victoire), texte, valeur. 🔜 **à compléter : humeur 1 à 5, durée de jeûne au moment de la note.** |
| `phasting:why` | « Mon pourquoi », texte libre. |
| 🔜 poids cible | Objectif de poids (ex. 75 kg) et poids de départ. |

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
| `Notes.dc.html` | `(tabs)/notes.tsx` |
| `NouvelleNote.dc.html` | `nouvelle-note.tsx` |
| `Widget.dc.html` | `ElapsedWidget.tsx` |
| `WidgetDetail.dc.html` | `DetailWidget.tsx` |
| `Settings.dc.html` | réglages du widget (pas encore d'écran) |
| `Icons.dc.html` | choix de l'icône (tranché : le sablier) |

## Navigation

```
Protocole → Prêt → En jeûne ⇄ Mon jeûne
                      │  ├──→ Craquer ──→ (Je tiens) En jeûne
                      │  │              └─→ (Terminer) Fenêtre de repas
                      │  └──→ (Terminer) Fenêtre de repas → En jeûne (nouveau jeûne)

Notes ──→ Nouvelle note ──→ Notes
Stats ──→ Notes (carte Poids)

Barre du bas : Jeûne · Calendrier · Stats · Notes
```

Prêt, En jeûne et Fenêtre de repas sont le même écran : `app/(tabs)/index.tsx`.
