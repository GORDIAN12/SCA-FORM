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
  comparisonScores?: RadarChartData;
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
  comparison: {
      label: 'Comparison',
      color: 'hsl(var(--chart-2))',
  }
};

export function HistoryRadarChart({ scores, comparisonScores }: HistoryRadarChartProps) {
  const { t } = useLanguage();
  
  const chartData = useMemo(() => {
    if (!scores) return [];

    const attributes: (keyof RadarChartData)[] = ['aroma', 'flavor', 'aftertaste', 'acidity', 'body', 'balance', 'sweetness'];
    
    return attributes.map(attr => ({
        attribute: t(attr),
        score: scores[attr],
        comparison: comparisonScores ? comparisonScores[attr] : undefined,
    }));

  }, [scores, comparisonScores, t]);

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
          tick={{ fontSize: 12, fill: 'black' }} 
        />
        <PolarGrid />
        <PolarRadiusAxis
          angle={90}
          domain={[6, 10]}
          tickCount={5}
          tick={{ fontSize: 10, fill: 'black' }}
          axisLine={false}
        />
        <Radar
          name="Phase Score"
          dataKey="score"
          fill="var(--color-accent)"
          fillOpacity={0.6}
          stroke="var(--color-accent)"
          strokeWidth={2}
          dot={{
            r: 4,
            fillOpacity: 1,
          }}
        />
        {comparisonScores && (
             <Radar
                name="Combined Average"
                dataKey="comparison"
                fill="var(--color-comparison)"
                fillOpacity={0.3}
                stroke="var(--color-comparison)"
                strokeWidth={2.5}
                dot={false}
            />
        )}
      </RadarChart>
    </ChartContainer>
  );
}
