export type Protocol = {
  id: string;
  label: string; // affiché dans la pastille et le widget
  name: string;
  fastHours: number; // durée du jeûne = objectif
  eatHours: number; // durée de la fenêtre de repas
  note: string;
};

export const PROTOCOLS: Protocol[] = [
  {
    id: '12-12',
    label: '12:12',
    name: 'Doux',
    fastHours: 12,
    eatHours: 12,
    note: 'Un bon début : la nuit et un peu plus.',
  },
  {
    id: '14-10',
    label: '14:10',
    name: 'Progressif',
    fastHours: 14,
    eatHours: 10,
    note: 'Un cran au-dessus, facile à tenir.',
  },
  {
    id: '16-8',
    label: '16:8',
    name: 'Classique',
    fastHours: 16,
    eatHours: 8,
    note: 'Le plus courant : sauter un repas, garder une fenêtre de 8 h.',
  },
  {
    id: '18-6',
    label: '18:6',
    name: 'Soutenu',
    fastHours: 18,
    eatHours: 6,
    note: 'Pour ceux qui tiennent déjà bien le 16:8.',
  },
  {
    id: '20-4',
    label: '20:4',
    name: 'Guerrier',
    fastHours: 20,
    eatHours: 4,
    note: 'Fenêtre courte : à aborder avec progressivité.',
  },
  {
    id: '23-1',
    label: '23:1',
    name: 'OMAD',
    fastHours: 23,
    eatHours: 1,
    note: 'Un seul repas par jour.',
  },
  {
    id: '24h',
    label: '24 h',
    name: 'Jeûne complet',
    fastHours: 24,
    eatHours: 0,
    note: 'Une journée entière sans manger.',
  },
];

export const DEFAULT_PROTOCOL_ID = '16-8';

export function getProtocol(id: string | null | undefined): Protocol {
  return PROTOCOLS.find((p) => p.id === id) ?? PROTOCOLS.find((p) => p.id === DEFAULT_PROTOCOL_ID)!;
}
