
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

interface ReportRadarChartProps {
  scores: RadarChartData;
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

export function ReportRadarChart({ scores, t }: ReportRadarChartProps) {
  const chartData = useMemo(() => {
    if (!scores) return [];

    const attributes: (keyof RadarChartData)[] = ['aroma', 'flavor', 'aftertaste', 'acidity', 'body', 'balance', 'sweetness'];
    
    return attributes.map(attr => ({
        attribute: t(attr),
        score: scores[attr],
    }));

  }, [scores, t]);

  if (chartData.length === 0) {
    return null;
  }

  return (
    <div style={{ width: '100%', height: '100%', background: 'white' }}>
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square w-full h-full"
      >
        <RadarChart data={chartData}>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="line" />}
          />
          <PolarAngleAxis 
            dataKey="attribute" 
            tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }} 
          />
          <PolarGrid />
          <PolarRadiusAxis
            angle={90}
            domain={[6, 10]}
            tickCount={5}
            tick={{ fontSize: 10 }}
          />
          <Radar
            name={t('score')}
            dataKey="score"
            fill="hsl(var(--accent))"
            fillOpacity={0.6}
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{
              r: 4,
              fill: 'hsl(var(--primary))',
              stroke: 'hsl(var(--background))',
              strokeWidth: 1,
            }}
          />
        </RadarChart>
      </ChartContainer>
    </div>
  );
}
