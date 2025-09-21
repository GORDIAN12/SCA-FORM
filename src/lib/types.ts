export interface Score {
  name: string;
  value: number;
  notes?: string;
}

export interface Evaluation {
  id: string;
  coffeeName: string;
  roastLevel: 'light' | 'medium' | 'medium-dark' | 'dark';
  dryFragrance: 'low' | 'medium' | 'high';
  wetAroma: 'low' | 'medium' | 'high';
  aromaCategory?:
    | 'Floral'
    | 'Frutal'
    | 'Especiado'
    | 'Nueces/Cacao'
    | 'Caramelizado'
    | 'Herbal'
    | 'Tierra'
    | 'Otros';
  acidityIntensity: 'low' | 'medium' | 'high';
  bodyIntensity: 'low' | 'medium' | 'high';
  scores: Score[];
  uniformity: number;
  cleanCup: number;
  sweetness: number;
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

    