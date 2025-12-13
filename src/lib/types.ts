export interface ScoreSet {
  flavor: number;
  aftertaste: number;
  acidity: number;
  acidityIntensity: 'low' | 'medium' | 'high';
  body: number;
  bodyIntensity: 'low' | 'medium' | 'high';
  balance: number;
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
  scores: {
    hot: ScoreSet;
    warm: ScoreSet;
    cold: ScoreSet;
  };
  cupperScore: number;
  totalScore: number;
}

export interface Evaluation {
  id: string;
  coffeeName: string;
  roastLevel: 'light' | 'medium' | 'medium-dark' | 'dark';
  cups: CupEvaluation[];
  overallScore: number;
  createdAt: any; // Allow serverTimestamp
  userId: string;
  isFavorite?: boolean;
}

export interface ScaFormValues {
    draftId?: string;
    coffeeName: string;
    roastLevel: 'light' | 'medium' | 'medium-dark' | 'dark';
    cups: CupEvaluation[];
    lastModified?: string;
}

export interface RadarChartData {
  aroma: number;
  flavor: number;
  aftertaste: number;
  acidity: number;
  body: number;
  balance: number;
}
