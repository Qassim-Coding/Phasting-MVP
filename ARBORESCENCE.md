# Arborescence de Phasting

Légende : ✅ existe déjà · 🔜 prévu (pas encore créé)

Ce document liste les fichiers de l'app et ceux qui restent à créer. Un rôle marqué 🔜 décrit la cible, pas le code actuel.

Aujourd'hui l'app a un seul écran : le test du widget. Le jeûne en cours est déjà sauvé dans AsyncStorage.

## Projet `Phasting-MVP/`

```
Phasting-MVP/
├── index.ts                      ✅ point d'entrée
├── app.json                      ✅ config Expo + widget
├── package.json                  ✅ dépendances
├── eas.json                      ✅ profils de build (preview → APK)
├── assets/
│   └── images/
│       ├── icon.png              ✅ icône (sablier)
│       ├── android-icon-foreground.png  ✅ icône adaptative
│       └── splash-icon.png       ✅ écran de démarrage
├── app/                          (écrans, routage par fichiers)
│   ├── _layout.tsx               ✅ pile, en-tête masqué
│   ├── index.tsx                 ✅ écran de test du widget
│   ├── protocole.tsx             🔜 choix du protocole
│   ├── mon-jeune.tsx             🔜 fiche de phase
│   ├── craquer.tsx               🔜 écran SOS
│   ├── calendrier.tsx            🔜 calendrier mensuel
│   ├── stats.tsx                 🔜 statistiques
│   └── notes.tsx                 🔜 poids, avancées, doutes, « mon pourquoi »
├── widgets/
│   ├── fastState.ts              ✅ jeûne en cours, phases provisoires, AsyncStorage
│   ├── ElapsedWidget.tsx         ✅ widget 4×2
│   ├── DetailWidget.tsx          🔜 widget détaillé 4×4
│   └── widget-task-handler.tsx   ✅ rafraîchissement du widget
├── data/                         🔜
│   ├── protocols.ts              🔜 liste des protocoles
│   ├── phases.ts                 🔜 textes des phases + études
│   └── storage.ts                🔜 historique, notes, « mon pourquoi »
└── logic/                        🔜
    └── streak.ts                 🔜 règle de série (tenu / partiel / casse)
```

La fenêtre de repas n'a pas de fichier à part. C'est le troisième état de `app/index.tsx`, avec « prêt » et « en jeûne ».

## Rôle de chaque fichier

### Racine
| Fichier | État | Rôle |
|---|---|---|
| `index.ts` | ✅ | Lance expo-router et enregistre le gestionnaire du widget. |
| `app.json` | ✅ | Nom, identifiant Android (`com.phasting.app`), couleurs, widget `Elapsed` (4×2, rafraîchissement 30 min). |
| `package.json` | ✅ | Dépendances : Expo SDK 54, expo-router, `react-native-android-widget`, AsyncStorage. |
| `eas.json` | ✅ | `preview` (distribution interne) produit un APK de test. `development` sert au client de dev. `production` prépare le build de store. |

### `app/`
| Fichier | État | Rôle |
|---|---|---|
| `_layout.tsx` | ✅ | Pile Expo Router, en-tête masqué. La barre du bas (Jeûne, Calendrier, Stats, Notes) viendra ici. |
| `index.tsx` | ✅ | Écran de test : chrono, nom de phase, démarrer, simuler 11 h 42, forcer la mise à jour du widget, réinitialiser. Cible : le même fichier devient l'accueil à trois états (prêt, en jeûne, fenêtre de repas). |
| `protocole.tsx` | 🔜 | Liste des protocoles, avertissement médical, bouton « Choisir ». |
| `mon-jeune.tsx` | 🔜 | Phase en cours : ce que fait le corps, la science, les bienfaits, comment tenir. |
| `craquer.tsx` | 🔜 | Minuteur de 10 min, astuces, « mon pourquoi », rappel de la série. |
| `calendrier.tsx` | 🔜 | Mois avec états tenu / partiel / vide et détail du jour. |
| `stats.tsx` | 🔜 | Durée moyenne, taux de réussite, évolution. |
| `notes.tsx` | 🔜 | Carnet : poids, avancées, doutes, « mon pourquoi ». |

### `widgets/`
| Fichier | État | Rôle |
|---|---|---|
| `fastState.ts` | ✅ | `FastState` (`startedAt`, `targetHours`), `loadFast` / `saveFast` (clé `phasting:fast`), `getPhase()` et le formatage des durées. Cinq phases provisoires, seuils à 4 h, 8 h, 12 h et 16 h. Objectif par défaut : 16 h. Partagé par l'écran et le widget. |
| `ElapsedWidget.tsx` | ✅ | Dessin du widget 4×2 (anneau SVG + textes). |
| `DetailWidget.tsx` | 🔜 | Version détaillée 4×4. |
| `widget-task-handler.tsx` | ✅ | Réagit à l'ajout, la mise à jour et le redimensionnement du widget, recharge le jeûne, puis redessine `ElapsedWidget`. |

### `data/` et `logic/`
| Fichier | État | Rôle |
|---|---|---|
| `protocols.ts` | 🔜 | Les 7 protocoles (heures de jeûne et de repas) : 12:12, 14:10, 16:8, 18:6, 20:4, OMAD (23:1), 24 h. |
| `phases.ts` | 🔜 | Textes, études et niveau de preuve des 5 phases. Les noms et les seuils provisoires sont déjà dans `widgets/fastState.ts`. |
| `storage.ts` | 🔜 | Historique, notes et « mon pourquoi ». Le jeûne en cours est déjà écrit par `widgets/fastState.ts`. |
| `streak.ts` | 🔜 | Règle de série : tenu = +1 ; partiel (≥ 12 h) = série gardée sans +1 ; sous 12 h = série cassée. |

## Données

Déjà stocké, clé `phasting:fast` :

| Champ | Contenu |
|---|---|
| `startedAt` | début du jeûne en millisecondes, ou `null` s'il n'y en a pas |
| `targetHours` | objectif en heures (16 tant qu'aucun protocole n'est choisi) |

Encore à stocker :

| Donnée | Contenu |
|---|---|
| Protocole choisi | lequel des 7 protocoles, et donc l'objectif en heures |
| Historique | un enregistrement par jeûne : début, fin, **durée réellement tenue**, objectif |
| Notes | date, type (poids, avancée, doute), texte, valeur |
| « Mon pourquoi » | texte libre |

Le statut d'un jour (tenu, partiel, vide) et la série se **calculent** à partir de la durée tenue : on ne les stocke pas.

## Maquettes

Ces maquettes vivent dans le canvas Design. Elles ne sont pas des fichiers du dépôt.

| Maquette | Écran prévu |
|---|---|
| `Pret.dc.html` | `index.tsx`, état « prêt à commencer » |
| `Main.dc.html` | `index.tsx`, état « en jeûne » |
| `Repas.dc.html` | `index.tsx`, état « fenêtre de repas » |
| `Protocole.dc.html` | `protocole.tsx` |
| `MonJeune.dc.html` | `mon-jeune.tsx` |
| `Craquer.dc.html` | `craquer.tsx` |
| `Calendrier.dc.html` | `calendrier.tsx` |
| `Widget.dc.html` | `ElapsedWidget.tsx` |
| `WidgetDetail.dc.html` | `DetailWidget.tsx` |
| `Settings.dc.html` | réglages du widget (pas encore d'écran dans l'app) |
| `Icons.dc.html` | choix de l'icône (déjà tranché : le sablier dans `assets/images/`) |
| 🔜 | stats, notes |

## Navigation cible

```
Protocole → Prêt → En jeûne ⇄ Mon jeûne
                      │  ├──→ Craquer ──→ (Je tiens) En jeûne
                      │  └──→ (Terminer) Fenêtre de repas
                      └──→ (Terminer) Fenêtre de repas → En jeûne (nouveau jeûne)

Prêt, En jeûne et Fenêtre de repas = le même écran, app/index.tsx.

Barre du bas : Jeûne · Calendrier · Stats · Notes
```

Aujourd'hui, aucune de ces routes n'existe : `app/index.tsx` est seul dans la pile.
