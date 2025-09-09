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
  scores: Score[];
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
