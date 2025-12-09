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
import { useLanguage } from '@/context/language-context';

interface HistoryRadarChartProps {
  evaluation: Evaluation;
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

export function HistoryRadarChart({ evaluation }: HistoryRadarChartProps) {
  const { t } = useLanguage();
  const chartData = useMemo(() => {
    if (!evaluation || !evaluation.cups || evaluation.cups.length === 0) {
      return [];
    }

    const numCups = evaluation.cups.length;
    const avgAroma = evaluation.cups.reduce((acc, cup) => acc + cup.aroma, 0) / numCups;
    const avgFlavor = evaluation.cups.reduce((acc, cup) => acc + (cup.scores.hot.flavor + cup.scores.warm.flavor + cup.scores.cold.flavor) / 3, 0) / numCups;
    const avgAftertaste = evaluation.cups.reduce((acc, cup) => acc + (cup.scores.hot.aftertaste + cup.scores.warm.aftertaste + cup.scores.cold.aftertaste) / 3, 0) / numCups;
    const avgAcidity = evaluation.cups.reduce((acc, cup) => acc + (cup.scores.hot.acidity + cup.scores.warm.acidity + cup.scores.cold.acidity) / 3, 0) / numCups;
    const avgBody = evaluation.cups.reduce((acc, cup) => acc + (cup.scores.hot.body + cup.scores.warm.body + cup.scores.cold.body) / 3, 0) / numCups;
    const avgBalance = evaluation.cups.reduce((acc, cup) => acc + (cup.scores.hot.balance + cup.scores.warm.balance + cup.scores.cold.balance) / 3, 0) / numCups;
    const avgSweetness = evaluation.cups.reduce((acc, cup) => acc + (cup.sweetness ? 10 : 0), 0) / numCups;

    return [
      { attribute: t('aroma'), score: parseFloat(avgAroma.toFixed(2)) },
      { attribute: t('flavor'), score: parseFloat(avgFlavor.toFixed(2)) },
      { attribute: t('aftertaste'), score: parseFloat(avgAftertaste.toFixed(2)) },
      { attribute: t('acidity'), score: parseFloat(avgAcidity.toFixed(2)) },
      { attribute: t('body'), score: parseFloat(avgBody.toFixed(2)) },
      { attribute: t('balance'), score: parseFloat(avgBalance.toFixed(2)) },
      { attribute: t('sweetness'), score: parseFloat(avgSweetness.toFixed(2)) },
    ];
  }, [evaluation, t]);

  if (chartData.length === 0) {
    return null;
  }

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square h-full max-h-[500px]"
    >
      <RadarChart data={chartData}>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="line" />}
        />
        <PolarAngleAxis 
            dataKey="attribute" 
        />
        <PolarGrid />
        <PolarRadiusAxis
          angle={90}
          domain={[6, 10]}
          tickCount={5}
          axisLine={false}
        />
        <Radar
          dataKey="score"
          fill="var(--color-accent)"
          fillOpacity={0.6}
          stroke="var(--color-score)"
          dot={{
            r: 4,
            fillOpacity: 1,
          }}
        />
      </RadarChart>
    </ChartContainer>
  );
}
