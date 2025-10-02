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

interface FlavorProfileChartProps {
  scores: {
    aroma: number;
    flavor: number;
    aftertaste: number;
    acidity: number;
    body: number;
    balance: number;
  };
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

export function FlavorProfileChart({ scores }: FlavorProfileChartProps) {
  const chartData = useMemo(() => {
    if (!scores) {
      return [];
    }
    return Object.entries(scores).map(([attribute, score]) => ({
      attribute: attribute.charAt(0).toUpperCase() + attribute.slice(1),
      score,
    }));
  }, [scores]);

  if (!scores) {
    return null;
  }

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square h-full max-h-[400px]"
    >
      <RadarChart data={chartData}>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="line" />}
        />
        <PolarAngleAxis dataKey="attribute" />
        <PolarGrid />
        <PolarRadiusAxis
          angle={90}
          domain={[6, 10]}
          tickCount={5}
          tick={false}
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
