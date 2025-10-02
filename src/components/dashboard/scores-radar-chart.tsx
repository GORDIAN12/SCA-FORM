'use client';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import type { ScoreSet } from '@/lib/types';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from 'recharts';
import { useMemo } from 'react';

interface ScoresRadarChartProps {
  scores:
    | {
        [key: string]: number;
      }
    | {
        hot: Partial<ScoreSet>;
        warm: Partial<ScoreSet>;
        cold: Partial<ScoreSet>;
      } | null;
}

const chartConfig = {
  score: {
    label: 'Score',
    color: 'hsl(var(--chart-1))',
  },
  hot: {
    label: 'Hot',
    color: 'hsl(var(--chart-temp-hot))',
  },
  warm: {
    label: 'Warm',
    color: 'hsl(var(--chart-temp-warm))',
  },
  cold: {
    label: 'Cold',
    color: 'hsl(var(--chart-temp-cold))',
  },
};

const ATTRIBUTES_TO_SHOW = ['flavor', 'aftertaste', 'acidity', 'body', 'balance'];

export function ScoresRadarChart({ scores }: ScoresRadarChartProps) {
  const isMultiSeries = scores && 'hot' in scores && 'warm' in scores && 'cold' in scores;

  const chartData = useMemo(() => {
    // CRITICAL FIX: If scores are null or undefined at any point, return an empty array.
    // recharts can handle an empty array, but not null/undefined.
    if (!scores) {
      return [];
    }
    
    if (isMultiSeries) {
      const multiScores = scores as {
        hot: Partial<ScoreSet>;
        warm: Partial<ScoreSet>;
        cold: Partial<ScoreSet>;
      };
      
      // Ensure nested properties are not undefined
      if (!multiScores.hot || !multiScores.warm || !multiScores.cold) {
        return [];
      }

      return ATTRIBUTES_TO_SHOW.map((attribute) => {
        const key = attribute as keyof ScoreSet;
        return {
          attribute: attribute.charAt(0).toUpperCase() + attribute.slice(1),
          hot: multiScores.hot[key] ? Number(multiScores.hot[key]) : 0,
          warm: multiScores.warm[key] ? Number(multiScores.warm[key]) : 0,
          cold: multiScores.cold[key] ? Number(multiScores.cold[key]) : 0,
        };
      });
    } else {
        const singleScores = scores as { [key: string]: number };
        return Object.keys(singleScores)
        .filter(key => ATTRIBUTES_TO_SHOW.includes(key) || key === "aroma" || key === "cupperScore")
        .map((key) => ({
          attribute: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
          score: parseFloat(singleScores[key].toFixed(2)),
        }));
    }
  }, [scores, isMultiSeries]);


  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto w-full h-full"
    >
      <RadarChart data={chartData}>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="line" />}
        />
        <PolarGrid />
        <PolarAngleAxis dataKey="attribute" tick={{ fontSize: 12 }} />

        {isMultiSeries ? (
          <>
            <Radar
              dataKey="hot"
              fill="var(--color-hot)"
              fillOpacity={0.4}
              stroke="var(--color-hot)"
              dot={{ r: 4, fillOpacity: 1 }}
            />
            <Radar
              dataKey="warm"
              fill="var(--color-warm)"
              fillOpacity={0.4}
              stroke="var(--color-warm)"
              dot={{ r: 4, fillOpacity: 1 }}
            />
            <Radar
              dataKey="cold"
              fill="var(--color-cold)"
              fillOpacity={0.4}
              stroke="var(--color-cold)"
              dot={{ r: 4, fillOpacity: 1 }}
            />
             <ChartLegend content={<ChartLegendContent />} />
          </>
        ) : (
          <Radar
            dataKey="score"
            fill="var(--color-score)"
            fillOpacity={0.6}
            stroke="var(--color-score)"
            dot={{ r: 4, fillOpacity: 1 }}
          />
        )}
      </RadarChart>
    </ChartContainer>
  );
}
