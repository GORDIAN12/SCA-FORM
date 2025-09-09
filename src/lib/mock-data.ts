import type { Session } from './types';

export const mockSessions: Session[] = [
  {
    id: 'session-1',
    name: 'Ethiopia Yirgacheffe Tasting',
    date: '2024-07-20',
    evaluations: [
      {
        id: 'eval-1a',
        coffeeName: 'Ethiopia Yirgacheffe Washed',
        scores: [
          { name: 'Aroma', value: 8.75 },
          { name: 'Flavor', value: 8.5 },
          { name: 'Aftertaste', value: 8.25 },
          { name: 'Acidity', value: 8.75 },
          { name: 'Body', value: 8.0 },
          { name: 'Balance', value: 8.5 },
        ],
        flavorProfile: {
          Floral: 9,
          Fruity: 8,
          'Sweet Spice': 7,
          Nutty: 4,
          Toasted: 3,
          'Rich Chocolate': 5,
        },
        overallScore: 88.5,
        notes:
          'Bright, citrusy acidity with strong floral notes of jasmine and bergamot. Delicate body. Clean and sweet finish.',
      },
      {
        id: 'eval-1b',
        coffeeName: 'Ethiopia Yirgacheffe Natural',
        scores: [
          { name: 'Aroma', value: 8.5 },
          { name: 'Flavor', value: 8.75 },
          { name: 'Aftertaste', value: 8.5 },
          { name: 'Acidity', value: 8.25 },
          { name: 'Body', value: 8.5 },
          { name: 'Balance', value: 8.75 },
        ],
        flavorProfile: {
          Floral: 7,
          Fruity: 9,
          'Sweet Spice': 6,
          Nutty: 3,
          Toasted: 2,
          'Rich Chocolate': 6,
        },
        overallScore: 89.25,
        notes:
          'Intense berry-like fruitiness, especially blueberry. Heavier body than the washed process. Winey acidity and a complex, lingering aftertaste.',
      },
    ],
  },
  {
    id: 'session-2',
    name: 'Colombia Supremo Analysis',
    date: '2024-07-18',
    evaluations: [
      {
        id: 'eval-2a',
        coffeeName: 'Colombia Supremo, Finca La Esmeralda',
        scores: [
          { name: 'Aroma', value: 8.25 },
          { name: 'Flavor', value: 8.5 },
          { name: 'Aftertaste', value: 8.0 },
          { name: 'Acidity', value: 8.25 },
          { name: 'Body', value: 8.5 },
          { name: 'Balance', value: 8.75 },
        ],
        flavorProfile: {
          Floral: 5,
          Fruity: 7,
          'Sweet Spice': 7,
          Nutty: 8,
          Toasted: 6,
          'Rich Chocolate': 9,
        },
        overallScore: 86.75,
        notes:
          'Classic Colombian profile. Notes of caramel, milk chocolate, and a hint of orange. Medium, pleasant acidity and a round body. Very balanced and clean.',
      },
    ],
  },
  {
    id: 'session-3',
    name: 'Sumatra Mandheling Review',
    date: '2024-07-15',
    evaluations: [
      {
        id: 'eval-3a',
        coffeeName: 'Sumatra Mandheling Grade 1',
        scores: [
          { name: 'Aroma', value: 8.0 },
          { name: 'Flavor', value: 8.25 },
          { name: 'Aftertaste', value: 8.5 },
          { name: 'Acidity', value: 7.5 },
          { name: 'Body', value: 9.0 },
          { name: 'Balance', value: 8.0 },
        ],
        flavorProfile: {
          Floral: 3,
          Fruity: 4,
          'Sweet Spice': 8,
          Nutty: 6,
          Toasted: 7,
          'Rich Chocolate': 9,
        },
        overallScore: 85.5,
        notes:
          'Earthy and herbaceous aroma. Full, syrupy body with low acidity. Flavors of dark chocolate, cedar, and sweet tobacco. Long, persistent aftertaste.',
      },
    ],
  },
];
