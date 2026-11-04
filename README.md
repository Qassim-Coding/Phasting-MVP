# Phasting

> Le jeûne intermittent, sans te perdre : ton temps de jeûne sur l'écran d'accueil, et une app qui t'explique ce que fait ton corps, heure après heure.

Phasting est une application Android de suivi du jeûne intermittent. Le nom est un jeu de mots entre *fasting* (jeûne) et *phase* : l'app découpe le jeûne en phases et te dit où tu en es.

- **Statut** : projet personnel d'entraînement, en construction
- **Plateforme** : Android en premier (tests), iOS plus tard
- **Cible V1** : fin novembre 2026 (30 nov.)
- **Stack** : Expo / React Native (SDK 54), expo-router, `react-native-android-widget`, AsyncStorage

---

## Le but

Aider une personne qui pratique le jeûne intermittent à **tenir dans la durée**, en lui donnant en un coup d'œil :

1. où elle en est (temps écoulé, phase en cours, prochaine phase),
2. pourquoi ça vaut la peine (ce que fait le corps, ce qu'elle gagne),
3. comment tenir quand c'est dur.

Les applis existantes se limitent souvent à un chrono et un pourcentage. Phasting vise un suivi plus riche et plus encourageant, sans devenir compliqué.

## L'intérêt : ce qui rend Phasting différent

### 1. Un widget riche sur l'écran d'accueil
Le widget est la raison d'être de l'app. Sans ouvrir Phasting, tu vois :
- le temps de jeûne écoulé (anneau de progression),
- la phase en cours et la prochaine phase,
- une astuce courte pour tenir,
- l'heure de début et de fin prévue.

Il existe en plusieurs tailles (4×1, 2×2, 4×2) et en version détaillée (4×4) : un résumé court mais encourageant. Android rafraîchit un widget au mieux toutes les ~30 minutes ; le widget affiche donc des informations qui ne vieillissent pas vite (phase, début, fin), et l'écran de l'app reste la référence en temps réel.

### 2. Un jeûne expliqué, phase par phase
Pour chaque phase (provisoirement : Digestion, Insuline en baisse, Bascule vers les graisses, Cétose légère, Jeûne prolongé) :
- **ce que fait ton corps**,
- **ce que dit la science**, chaque affirmation reliée à une étude avec son niveau de preuve (humain ou animal),
- **les bienfaits**,
- **comment tenir**.

Les repères sont approximatifs et ne remplacent pas un avis médical.

### 3. Un bouton « J'ai envie de craquer »
Un bouton rouge-orangé, toujours accessible depuis l'accueil. Il ouvre un écran de secours : un minuteur de 10 minutes, des astuces concrètes, ton « pourquoi » écrit par toi, et un rappel de ta série.

### 4. Plusieurs protocoles
12:12, 14:10, 16:8, 18:6, 20:4, OMAD (23:1) et 24 h. Le 16:8 sert de protocole de test ; les jeûnes longs s'accompagnent d'avertissements renforcés.

### 5. Une progression qui motive, sans punir
- **Série** de jours tenus, affichée partout.
- **Calendrier** mensuel avec trois états : tenu, partiel, vide.
- **Règle de tolérance** : un jour tenu partiellement (12 h ou plus, sous l'objectif) **garde la série sans la faire grandir**. Sous 12 h, la série casse.
- **Stats** (durée moyenne, taux de réussite) et **Notes** (poids, avancées, doutes, « mon pourquoi ») pour voir le chemin parcouru.

## Parcours type

1. Choisir un protocole.
2. Appuyer sur « Démarrer le jeûne » (ou indiquer qu'on a commencé plus tôt).
3. Suivre l'anneau et les phases ; ouvrir « Mon jeûne » pour comprendre.
4. En cas de coup dur : « J'ai envie de craquer ».
5. Terminer : message de félicitations, fenêtre de repas, prochain jeûne.
6. Retrouver l'historique dans le calendrier, les stats et les notes.

## Direction artistique

Zen : vert clair et vert émeraude, ambiance yoga et sérénité. Titres en Fraunces, texte en Manrope. Icône : un sablier.

| Rôle | Couleur |
|---|---|
| Fond | `#F2F6F1` |
| Émeraude (principal) | `#0E7C5B` |
| Vert profond | `#0C2E26` |
| Menthe | `#7FD6AE` |
| Texte | `#12302A` |
| Bouton SOS | `#C9431F` |

## Ce que Phasting n'est pas

Ce n'est pas un dispositif médical. Le jeûne n'est pas adapté à tout le monde (diabète, grossesse, troubles alimentaires, traitements…) : demander un avis médical avant de jeûner.

## Feuille de route

| Étape | Contenu | Échéance |
|---|---|---|
| Maquettes | Accueil (3 états), protocoles, phases, SOS, calendrier, widgets | en cours |
| Widget | Fiabiliser, protocole dynamique, widget détaillé 4×4 | novembre |
| App | Choix du protocole, démarrage et arrêt du jeûne, stockage local | début novembre |
| Écrans | Calendrier, stats, notes | novembre |
| Contenu | Rédiger les phases avec de vraies études sourcées | 29 nov. |
| V1 | APK de test complet | 30 nov. |
| Monétisation | Session de réflexion | sam. 7 nov. |
