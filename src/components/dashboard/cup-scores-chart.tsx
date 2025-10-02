'use client';

import type { ScoreSet } from '@/lib/types';
import { ScoresRadarChart } from './scores-radar-chart';

interface CupScoresChartProps {
  scores: {
    hot: Partial<ScoreSet>;
    warm: Partial<ScoreSet>;
    cold: Partial<ScoreSet>;
  } | null | undefined;
}

export function CupScoresChart({ scores }: CupScoresChartProps) {
  // Robust check to ensure scores and its properties are valid
  if (!scores || !scores.hot || !scores.warm || !scores.cold) {
    return null; // Don't render anything if data is incomplete
  }

  return (
    <div className="h-80 md:h-96">
      <ScoresRadarChart scores={scores} />
    </div>
  );
}
