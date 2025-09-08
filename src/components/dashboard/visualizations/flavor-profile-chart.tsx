'use client';
import {
  PolarGrid,
  PolarAngleAxis,
  Radar,
  RadarChart,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { Evaluation } from '@/lib/types';

interface FlavorProfileChartProps {
  evaluation: Evaluation;
}

export function FlavorProfileChart({ evaluation }: FlavorProfileChartProps) {
  const chartData = Object.entries(evaluation.flavorProfile).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  const chartConfig = {
    value: {
      label: 'Score',
      color: 'hsl(var(--chart-1))',
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Flavor Profile</CardTitle>
        <CardDescription>
          Sensory analysis based on the SCA flavor wheel categories.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[350px]"
        >
          <RadarChart data={chartData}>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <PolarAngleAxis dataKey="name" />
            <PolarGrid />
            <Radar
              dataKey="value"
              fill="var(--color-value)"
              fillOpacity={0.6}
              stroke="var(--color-value)"
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
