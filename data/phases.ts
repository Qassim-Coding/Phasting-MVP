// Contenu des phases. ATTENTION : textes provisoires, à réécrire avec de vraies études (étape du 29 nov.).
// `studies` est vide tant qu'aucune source n'est ajoutée : l'écran affiche alors un emplacement.

export type Study = {
  title: string;
  source: string; // auteurs, année, revue
  summary: string;
  evidence: 'humain' | 'animal';
};

export type Phase = {
  name: string;
  short: string; // pour les pastilles
  endHour: number | null; // null = dernière phase
  body: string;
  benefits: string[];
  studies: Study[];
};

export const PHASES: Phase[] = [
  {
    name: 'Digestion',
    short: 'Digestion',
    endHour: 4,
    body: 'Ton corps digère et absorbe ton dernier repas. La glycémie et l’insuline sont encore élevées.',
    benefits: ['Un moment de repos pour ton système digestif.'],
    studies: [],
  },
  {
    name: 'Insuline en baisse',
    short: 'Insuline',
    endHour: 8,
    body: 'L’insuline redescend. Ton corps commence à puiser dans le glycogène stocké dans le foie.',
    benefits: ['Une insuline plus basse entre les repas.'],
    studies: [],
  },
  {
    name: 'Bascule vers les graisses',
    short: 'Graisses',
    endHour: 12,
    body: 'Les réserves de glycogène du foie baissent. Ton corps puise de plus en plus dans les graisses stockées pour produire de l’énergie.',
    benefits: [
      'Une insuline plus basse.',
      'Le début de la lipolyse : les graisses stockées sont libérées.',
    ],
    studies: [],
  },
  {
    name: 'Cétose légère',
    short: 'Cétose',
    endHour: 16,
    body: 'Le foie produit davantage de corps cétoniques, une source d’énergie utilisable par le cerveau et les muscles.',
    benefits: ['Une énergie plus stable chez certaines personnes.'],
    studies: [],
  },
  {
    name: 'Jeûne prolongé',
    short: 'Prolongé',
    endHour: null,
    body: 'Au-delà de 16 h, les effets deviennent plus marqués. Écoute ton corps ; pour les jeûnes longs, demande un avis médical.',
    benefits: ['À sourcer avec des études.'],
    studies: [],
  },
];

export const TIPS: { title: string; text: string }[] = [
  { title: 'Bois de l’eau ou un thé sans sucre', text: 'La faim passe souvent en quelques minutes.' },
  { title: 'Bouge dix minutes', text: 'Une courte marche aide à penser à autre chose.' },
  { title: 'Relis ton pourquoi', text: 'Une note écrite par toi, pour les moments de doute.' },
];

export const MEDICAL_NOTE =
  'Repères approximatifs, pas un avis médical. En cas de diabète, de grossesse ou de troubles alimentaires, parles-en à un médecin avant de jeûner.';
