'use client';

import { useMemo } from 'react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  PolarRadiusAxis,
} from 'recharts';
import type { Evaluation } from '@/lib/types';

interface HistoryRadarChartProps {
  evaluation: Evaluation;
  t: (key: string) => string;
}

const chartConfig = {
  score: {
    label: 'Score',
    color: 'hsl(var(--chart-1))',
  },
  accent: {
    label: 'Score',
    color: 'hsl(var(--accent))',
  },
};

export function HistoryRadarChart({ evaluation, t }: HistoryRadarChartProps) {
    const averageScores = useMemo(() => {
        if (!evaluation) return null;

        const numCups = evaluation.cups.length;
        if (numCups === 0) return null;
        
        const getAverage = (key: 'flavor' | 'aftertaste' | 'acidity' | 'body' | 'balance') => 
            evaluation.cups.reduce((acc, cup) => 
                acc + (cup.scores.hot[key] + cup.scores.warm[key] + cup.scores.cold[key]) / 3, 0) / numCups;
        
        const getAverageSimple = (key: 'uniformity' | 'cleanCup' | 'sweetness') =>
            evaluation.cups.reduce((acc, cup) => acc + (cup[key] ? 10 : 0), 0) / numCups;

        return {
            [t('aroma')]: evaluation.cups.reduce((acc, cup) => acc + cup.aroma, 0) / numCups,
            [t('flavor')]: getAverage('flavor'),
            [t('aftertaste')]: getAverage('aftertaste'),
            [t('acidity')]: getAverage('acidity'),
            [t('body')]: getAverage('body'),
            [t('balance')]: getAverage('balance'),
            [t('sweetness')]: getAverageSimple('sweetness'),
        };
    }, [evaluation, t]);


  const chartData = useMemo(() => {
    if (!averageScores) {
      return [];
    }
    return Object.entries(averageScores).map(([attribute, score]) => ({
      attribute,
      score,
    }));
  }, [averageScores]);

  if (!averageScores) {
    return null;
  }

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square h-full w-full bg-background"
    >
      <RadarChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="line" />}
        />
        <PolarAngleAxis dataKey="attribute" tick={{ fill: 'hsl(var(--foreground))' }} />
        <PolarGrid />
        <PolarRadiusAxis
          angle={90}
          domain={[6, 10]}
          tickCount={5}
          stroke="hsl(var(--foreground))"
          tick={{ fill: 'hsl(var(--foreground))' }}
        />
        <Radar
          dataKey="score"
          fill="hsl(var(--accent))"
          fillOpacity={0.6}
          stroke="hsl(var(--chart-1))"
          dot={{
            r: 4,
            fillOpacity: 1,
          }}
        />
      </RadarChart>
    </ChartContainer>
  );
}
