import type { Session, CupEvaluation } from './types';

const createMockCup = (id: string, overrides: Partial<CupEvaluation> = {}): CupEvaluation => ({
  id,
  aromaCategory: 'Frutal',
  dryFragrance: 'high',
  wetAroma: 'high',
  uniformity: true,
  cleanCup: true,
  sweetness: true,
  aroma: 8.75,
  flavor: 8.5,
  aftertaste: 8.25,
  acidity: 8.75,
  acidityIntensity: 'high',
  body: 8.0,
  bodyIntensity: 'low',
  balance: 8.5,
  cupperScore: 8.5,
  totalScore: 88.5,
  ...overrides,
});

export const mockSessions: Session[] = [
  {
    id: 'session-1',
    name: 'Ethiopia Yirgacheffe Tasting',
    date: '2024-07-20',
    evaluations: [
      {
        id: 'eval-1a',
        coffeeName: 'Ethiopia Yirgacheffe Washed',
        roastLevel: 'light',
        cups: [
          createMockCup('cup-1'),
          createMockCup('cup-2', { aroma: 8.5, flavor: 8.75, totalScore: 89.0 }),
          createMockCup('cup-3'),
          createMockCup('cup-4'),
          createMockCup('cup-5'),
        ],
        overallScore: 88.6,
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
        roastLevel: 'medium',
        cups: [
          createMockCup('cup-1', {
            dryFragrance: 'medium',
            wetAroma: 'medium',
            acidityIntensity: 'medium',
            bodyIntensity: 'high',
            aroma: 8.25,
            flavor: 8.5,
            aftertaste: 8.0,
            acidity: 8.25,
            body: 8.5,
            balance: 8.75,
            cupperScore: 8.5,
            totalScore: 86.75,
          }),
          createMockCup('cup-2'),
          createMockCup('cup-3'),
          createMockCup('cup-4'),
          createMockCup('cup-5'),
        ],
        overallScore: 86.75,
      },
    ],
  },
];
