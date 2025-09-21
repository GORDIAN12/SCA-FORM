export interface Score {
  name: string;
  value: number;
  notes?: string;
}

export interface CupEvaluation {
  id: string;
  aromaCategory?:
    | 'Floral'
    | 'Frutal'
    | 'Especiado'
    | 'Nueces/Cacao'
    | 'Caramelizado'
    | 'Herbal'
    | 'Tierra'
    | 'Otros';
  dryFragrance: 'low' | 'medium' | 'high';
  wetAroma: 'low' | 'medium' | 'high';
  uniformity: boolean;
  cleanCup: boolean;
  sweetness: boolean;
  aroma: number;
  flavor: number;
  aftertaste: number;
  acidity: number;
  acidityIntensity: 'low' | 'medium' | 'high';
  body: number;
  bodyIntensity: 'low' | 'medium' | 'high';
  balance: number;
  cupperScore: number;
  totalScore: number;
}

export interface Evaluation {
  id: string;
  coffeeName: string;
  roastLevel: 'light' | 'medium' | 'medium-dark' | 'dark';
  cups: CupEvaluation[];
  overallScore: number;
}

export interface Session {
  id: string;
  name: string;
  date: string;
  evaluations: Evaluation[];
  newEvaluation?: Partial<Evaluation>;
}
