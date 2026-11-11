// Contenu des 5 phases du jeûne et astuces pour tenir.
// Les textes viennent du document « Phasting — contenu scientifique des phases » (11 nov. 2026).
// Les heures (4, 8, 12, 16) sont des repères moyens, pas des seuils mesurés : le texte le dit.
// Ce fichier est lu par l'app ET par le widget : il ne doit importer aucune bibliothèque d'interface.

// 'humain' : étude chez l'humain · 'animal' : étude chez l'animal · 'revue' : article de synthèse (humain et animal).
export type Evidence = 'humain' | 'animal' | 'revue';

export type Study = {
  title: string;
  source: string; // auteurs, année, revue
  summary: string;
  evidence: Evidence;
};

// Étiquette affichée sous une étude.
export function evidenceLabel(evidence: Evidence): string {
  return evidence === 'revue' ? 'Revue : humain et animal' : `Preuve : ${evidence}`;
}

export type Phase = {
  name: string;
  short: string; // pour les pastilles
  endHour: number | null; // null = dernière phase
  level: string; // niveau de preuve de la phase
  body: string; // « Ce qui se passe » (écrans)
  bodyShort: string; // même idée en une ou deux phrases courtes (widget)
  gainLabel: string; // titre du bloc suivant : « Ce que tu y gagnes », « Bon à savoir » ou « À savoir »
  gainLabelShort: string; // version courte pour le widget
  gain: string;
  gainShort: string;
  studies: Study[];
};

const RODEN: Omit<Study, 'summary'> = {
  title: 'Études par RMN du métabolisme du glucose dans le foie',
  source: 'Roden, Falk Petersen, Shulman, 2001, Endocrine Society',
  evidence: 'humain',
};

const DE_CABO: Omit<Study, 'summary'> = {
  title: 'Effets du jeûne intermittent sur la santé, le vieillissement et la maladie',
  source: 'de Cabo et Mattson, 2019, New England Journal of Medicine',
  evidence: 'humain',
};

export const PHASES: Phase[] = [
  {
    name: 'Digestion',
    short: 'Digestion',
    endHour: 4,
    level: 'Preuve : solide',
    body: 'Ton corps digère et absorbe ton repas. La glycémie et l’insuline sont encore élevées. Ton foie remplit ses réserves de sucre, le glycogène : elles sont au plus haut environ 5 h après un repas mixte.',
    bodyShort: 'Ton corps digère et absorbe ton repas. Ton foie remplit ses réserves de sucre.',
    gainLabel: 'Ce que tu y gagnes',
    gainLabelShort: 'Tu gagnes',
    gain: 'Ton corps se prépare à son jeûne, il commence son travail de fond.',
    gainShort: 'Ton corps se prépare à son jeûne, il commence son travail de fond.',
    studies: [
      {
        ...RODEN,
        summary:
          'Après un repas mixte, le glycogène du foie passe d’environ 207 à 316 mmol/L et atteint son maximum vers 5 h.',
      },
    ],
  },
  {
    name: 'Insuline en baisse',
    short: 'Insuline',
    endHour: 8,
    level: 'Preuve : solide',
    body: 'Ton insuline redescend. Ton foie libère peu à peu son glycogène pour garder ta glycémie stable, et fabrique aussi du glucose à partir d’autres molécules.',
    bodyShort: 'Ton insuline redescend. Ton foie libère peu à peu son glycogène pour garder ta glycémie stable.',
    gainLabel: 'Ce que tu y gagnes',
    gainLabelShort: 'Tu gagnes',
    gain: 'Une insuline plus basse qu’après le repas.',
    gainShort: 'Une insuline plus basse qu’après le repas.',
    studies: [
      {
        ...RODEN,
        summary:
          'Après un repas de 1 000 kcal, le glycogène fournit environ 45 % du glucose produit par le foie entre 5 et 12 h. Le reste vient surtout de la fabrication de glucose.',
      },
    ],
  },
  {
    name: 'Bascule vers les graisses',
    short: 'Graisses',
    endHour: 12,
    level: 'Preuve : plausible',
    body: 'Les réserves de sucre de ton foie diminuent nettement. Ton corps libère de plus en plus de graisses pour produire son énergie. Le moment exact varie d’une personne à l’autre.',
    bodyShort: 'Les réserves de sucre de ton foie diminuent. Ton corps libère de plus en plus de graisses pour son énergie.',
    gainLabel: 'Ce que tu y gagnes',
    gainLabelShort: 'Tu gagnes',
    gain: 'Une insuline basse, et tes graisses stockées commencent à servir de carburant.',
    gainShort: 'Une insuline basse, et tes graisses stockées commencent à servir de carburant.',
    studies: [
      {
        ...DE_CABO,
        summary: 'Chez l’humain, les cétones commencent à monter dans les 8 à 12 h qui suivent le début du jeûne.',
      },
      {
        title: 'Retrouver l’interrupteur métabolique : les bienfaits du jeûne',
        source: 'Anton et al., 2018, Obesity',
        summary:
          'La bascule vers les graisses se produit en général entre 12 et 36 h après le dernier repas, selon les réserves de glycogène et la dépense d’énergie.',
        evidence: 'revue',
      },
    ],
  },
  {
    name: 'Cétose légère',
    short: 'Cétose',
    endHour: 16,
    level: 'Preuve : plausible',
    body: 'Ton foie produit de plus en plus de corps cétoniques, une source d’énergie pour ton corps. Leur niveau continue de monter jusque vers 24 h.',
    bodyShort: 'Ton foie produit de plus en plus de corps cétoniques, une source d’énergie pour ton corps.',
    gainLabel: 'Bon à savoir',
    gainLabelShort: 'Bon à savoir',
    gain: 'Tiens le premier mois : la faim et l’irritabilité du début s’estompent en général, et le jeûne devient beaucoup plus facile et habituel.',
    gainShort: 'Tiens le premier mois : ensuite, le jeûne devient beaucoup plus facile et habituel.',
    studies: [
      {
        ...DE_CABO,
        summary:
          'Les cétones atteignent 2 à 5 mmol/L vers 24 h de jeûne. Les effets du début (faim, irritabilité) disparaissent en général en un mois.',
      },
    ],
  },
  {
    name: 'Jeûne prolongé',
    short: 'Prolongé',
    endHour: null,
    level: 'Preuve : solide pour le métabolisme',
    body: 'Passé 16 h, ton corps tire de plus en plus d’énergie de tes graisses et des corps cétoniques. Vers 22 h, ton foie fabrique déjà environ les deux tiers de ton glucose à partir d’autres molécules.',
    bodyShort: 'Ton corps tire de plus en plus d’énergie de tes graisses et des corps cétoniques.',
    gainLabel: 'À savoir',
    gainLabelShort: 'À savoir',
    gain: 'Les effets sur la santé de jeûnes plus longs sont encore mal connus. Écoute ton corps.',
    gainShort: 'Les effets de jeûnes plus longs sont encore mal connus. Écoute ton corps.',
    studies: [
      {
        title: 'Mesure de la production de glucose par le foie pendant le jeûne',
        source: 'Rothman et al., 1991, Science',
        summary:
          'Pendant les 22 premières heures de jeûne, la fabrication de glucose par le foie fournit 64 ± 5 % du glucose produit.',
        evidence: 'humain',
      },
      {
        ...DE_CABO,
        summary: 'Chez l’humain, les cétones atteignent 2 à 5 mmol/L vers 24 h de jeûne.',
      },
    ],
  },
];

// Astuces d'usage : elles aident beaucoup de gens, ce ne sont pas des résultats d'études (l'écran le dit).
// `icon` est un nom d'icône Ionicons ; l'écran Astuces fait la conversion de type.
// icon : nom d'icône Ionicons (chaîne, pour ne pas importer l'UI ici : le widget lit ce fichier).
// short : version courte pour le widget (sinon on utilise text). source : étude citée, affichée dans l'onglet Astuces.
export type Tip = { icon: string; title: string; text: string; short?: string; source?: string };
export type TipGroup = { title: string; tips: Tip[] };

export const TIP_GROUPS: TipGroup[] = [
  {
    title: 'Quand la faim arrive',
    tips: [
      {
        icon: 'water-outline',
        title: 'Bois de l’eau gazeuse',
        text: 'Les bulles remplissent l’estomac. Ajoute un trait de citron ou une feuille de menthe pour changer.',
      },
      { icon: 'cafe-outline', title: 'Un thé ou un café sans sucre', text: 'La faim passe souvent en quelques minutes.' },
      {
        icon: 'time-outline',
        title: 'Occupe-toi',
        text: 'La faim vient par vagues. Un appel, du rangement, un épisode : l’envie retombe souvent avant que tu t’en rendes compte.',
      },
      {
        icon: 'bed-outline',
        title: 'Dors : qui dort dîne',
        text: 'Comme le dit le dicton, qui dort dîne. Si la faim te prend le soir, va te coucher : tant que tu dors, tu ne ressens pas la faim.',
        short: 'Qui dort dîne : si la faim te prend le soir, va te coucher.',
      },
      { icon: 'walk-outline', title: 'Bouge dix minutes', text: 'Une courte marche aide à penser à autre chose.' },
      { icon: 'heart-outline', title: 'Relis ton pourquoi', text: 'Une note écrite par toi, pour les moments de doute.' },
    ],
  },
  {
    title: 'Avant de commencer le jeûne',
    tips: [
      {
        icon: 'leaf-outline',
        title: 'Des graines de chia au dernier repas',
        text: 'Riches en fibres, elles gonflent avec l’eau. Beaucoup de gens les utilisent pour tenir plus longtemps.',
      },
      {
        icon: 'restaurant-outline',
        title: 'Des protéines et des fibres dans ton repas',
        text: 'Il rassasie plus longtemps qu’un repas de sucres rapides.',
      },
      { icon: 'moon-outline', title: 'Dors assez', text: 'Quand on est fatigué, on a plus faim et moins de volonté.' },
      {
        icon: 'flask-outline',
        title: 'La ghréline, l’hormone de la faim',
        text: 'La ghréline est fabriquée surtout par ton estomac (elle a été identifiée en 1999). Elle monte quand tu n’as pas mangé depuis un moment et retombe après un repas : c’est elle qui te donne faim, pas elle qui te rassasie. Sa partenaire, la leptine, dit à ton cerveau que tu as assez mangé. Bien dormir garde les deux en équilibre : après deux nuits de 4 h seulement, des volontaires avaient 28 % de ghréline en plus, 18 % de leptine en moins et 24 % d’appétit en plus.',
        short: 'La ghréline, fabriquée par l’estomac, donne faim. Le manque de sommeil la fait monter : dors bien la veille.',
        source: 'Spiegel, Tasali, Penev et Van Cauter, Annals of Internal Medicine, 2004 : 12 hommes jeunes, 2 nuits de 4 h contre 2 nuits de 10 h.',
      },
    ],
  },
];

// Liste à plat, pour le widget (une astuce différente toutes les 30 minutes).
export const TIPS: Tip[] = TIP_GROUPS.flatMap((g) => g.tips);
