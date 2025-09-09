export interface Score {
  name: string;
  value: number;
  notes?: string;
}

export interface Evaluation {
  id: string;
  coffeeName: string;
  roastLevel: 'light' | 'medium' | 'medium-dark' | 'dark';
  waterTemperature: 'cold' | 'warm' | 'hot';
  dryFragrance: 'low' | 'medium' | 'high';
  wetAroma: 'low' | 'medium' | 'high';
  acidityIntensity: 'low' | 'medium' | 'high';
  bodyIntensity: 'low' | 'medium' | 'high';
  scores: Score[];
  uniformity: number;
  cleanCup: number;
  sweetness: number;
  defects: number;
  overallScore: number;
  notes: string;
}

export interface Session {
  id: string;
  name: string;
  date: string;
  evaluations: Evaluation[];
  newEvaluation?: Partial<Evaluation>;
}
