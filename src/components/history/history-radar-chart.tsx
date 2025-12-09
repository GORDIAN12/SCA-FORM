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
import type { RadarChartData } from '@/lib/types';
import { useLanguage } from '@/context/language-context';

interface HistoryRadarChartProps {
  scores: RadarChartData;
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

export function HistoryRadarChart({ scores }: HistoryRadarChartProps) {
  const { t } = useLanguage();
  const chartData = useMemo(() => {
    if (!scores) return [];

    return [
      { attribute: t('aroma'), score: scores.aroma },
      { attribute: t('flavor'), score: scores.flavor },
      { attribute: t('aftertaste'), score: scores.aftertaste },
      { attribute: t('acidity'), score: scores.acidity },
      { attribute: t('body'), score: scores.body },
      { attribute: t('balance'), score: scores.balance },
      { attribute: t('sweetness'), score: scores.sweetness },
    ];
  }, [scores, t]);

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
          tick={{ fontSize: 12 }} 
        />
        <PolarGrid />
        <PolarRadiusAxis
          angle={90}
          domain={[6, 10]}
          tickCount={5}
          tick={{ fontSize: 10 }}
          axisLine={false}
        />
        <Radar
          dataKey="score"
          fill="var(--color-accent)"
          fillOpacity={0.35}
          stroke="var(--color-accent)"
          strokeWidth={2}
          dot={{
            r: 4,
            fillOpacity: 1,
          }}
        />
      </RadarChart>
    </ChartContainer>
  );
}
