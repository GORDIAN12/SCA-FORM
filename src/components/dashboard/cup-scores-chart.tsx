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
  // If scores are not available, don't render the chart.
  if (!scores) {
    return null;
  }

  // Robust check to ensure scores and its properties are valid
  if (!scores.hot || !scores.warm || !scores.cold) {
    return null; // Also don't render anything if data is incomplete
  }

  return (
    <div className="h-80 md:h-96">
      <ScoresRadarChart scores={scores} />
    </div>
  );
}
