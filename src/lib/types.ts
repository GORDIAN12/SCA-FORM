export interface Score {
  name: string;
  value: number;
  notes?: string;
}

export interface FlavorProfile {
  [key: string]: number;
}

export interface Evaluation {
  id: string;
  evaluator: string;
  coffeeName: string;
  roastLevel: 'light' | 'medium' | 'dark';
  waterTemperature: 'cold' | 'warm' | 'hot';
  scores: Score[];
  flavorProfile: FlavorProfile;
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
