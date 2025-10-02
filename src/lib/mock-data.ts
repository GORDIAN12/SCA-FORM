import type { CupEvaluation } from './types';

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
