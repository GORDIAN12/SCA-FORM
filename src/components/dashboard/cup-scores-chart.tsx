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
  if (!scores) {
    return null;
  }

  return (
    <div className="h-80 md:h-96">
      <ScoresRadarChart scores={scores} />
    </div>
  );
}
