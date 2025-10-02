'use client';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from 'recharts';

interface ScoresRadarChartProps {
  scores: {
    [key: string]: number;
  };
}

const chartConfig = {
  score: {
    label: 'Score',
    color: 'hsl(var(--chart-1))',
  },
};

export function ScoresRadarChart({ scores }: ScoresRadarChartProps) {
  const chartData = Object.keys(scores)
    .map((key) => ({
      attribute: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
      score: scores[key],
    }));

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
        <Radar
          dataKey="score"
          fill="var(--color-score)"
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
