'use client';
import {
  PolarGrid,
  PolarAngleAxis,
  Radar,
  RadarChart,
  PolarRadiusAxis,
} from 'recharts';
import { CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { ScoreSet } from '@/lib/types';

interface ScoresRadarChartProps {
  scores: ScoreSet & { aroma: number; cupperScore: number };
}

const chartConfig = {
  value: {
    label: 'Score',
    color: 'hsl(var(--chart-1))',
  },
};

const scoreKeys = ['aroma', 'flavor', 'aftertaste', 'acidity', 'body', 'balance'];

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function ScoresRadarChart({ scores }: ScoresRadarChartProps) {
  const chartData = scoreKeys.map((key) => ({
    name: capitalize(key),
    value: scores[key as keyof typeof scores] as number,
  }));

  return (
    <>
      <CardHeader className="items-center pb-4">
        <CardTitle>Flavor Profile</CardTitle>
      </CardHeader>
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square max-h-[300px]"
      >
        <RadarChart
          data={chartData}
          margin={{ top: 10, right: 30, bottom: 10, left: 30 }}
        >
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="line" />}
          />
          <PolarAngleAxis dataKey="name" tick={{ fontSize: 12 }} />
          <PolarRadiusAxis
            angle={30}
            domain={[6, 10]}
            tick={false}
            axisLine={false}
          />
          <PolarGrid />
          <Radar
            dataKey="value"
            fill="var(--color-value)"
            fillOpacity={0.6}
            stroke="var(--color-value)"
          />
        </RadarChart>
      </ChartContainer>
    </>
  );
}
