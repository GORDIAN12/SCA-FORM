'use client';
import type { Evaluation } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScoresRadarChart } from './scores-radar-chart';
import { useRef } from 'react';
import { Button } from '../ui/button';
import { Download } from 'lucide-react';
import { exportChart } from '@/lib/export-chart';

interface ScoresOverviewProps {
  evaluation: Evaluation;
}

export function ScoresOverview({ evaluation }: ScoresOverviewProps) {
  const { coffeeName, overallScore, roastLevel, cups } = evaluation;
  const chartRef = useRef<HTMLDivElement>(null);

  const averageScores = {
    aroma:
      cups.reduce((acc, cup) => acc + cup.aroma, 0) /
      cups.length,
    flavor:
      cups.reduce((acc, cup) => acc + (cup.scores.hot.flavor + cup.scores.warm.flavor + cup.scores.cold.flavor) / 3, 0) /
      cups.length,
    aftertaste:
      cups.reduce((acc, cup) => acc + (cup.scores.hot.aftertaste + cup.scores.warm.aftertaste + cup.scores.cold.aftertaste) / 3, 0) /
      cups.length,
    acidity:
      cups.reduce((acc, cup) => acc + (cup.scores.hot.acidity + cup.scores.warm.acidity + cup.scores.cold.acidity) / 3, 0) /
      cups.length,
    body:
      cups.reduce((acc, cup) => acc + (cup.scores.hot.body + cup.scores.warm.body + cup.scores.cold.body) / 3, 0) /
      cups.length,
    balance:
      cups.reduce((acc, cup) => acc + (cup.scores.hot.balance + cup.scores.warm.balance + cup.scores.cold.balance) / 3, 0) /
      cups.length,
    cupperScore:
        cups.reduce((acc, cup) => acc + cup.cupperScore, 0) /
        cups.length,
  };


  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="text-2xl">{coffeeName}</CardTitle>
                <p className="text-sm text-muted-foreground pt-2">Roast Level: {roastLevel}</p>
            </div>
            <div className='flex flex-col items-end gap-2'>
              <div className="flex flex-col items-end">
                <span className="text-3xl font-bold text-primary">
                  {overallScore.toFixed(2)}
                </span>
                <span className="text-sm text-muted-foreground">Overall Score</span>
              </div>
               <Button
                variant="outline"
                size="sm"
                onClick={() => exportChart(chartRef)}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Chart
              </Button>
            </div>
        </div>
        
      </CardHeader>
      <CardContent ref={chartRef}>
        <div className="h-80 md:h-96">
          <ScoresRadarChart scores={averageScores} />
        </div>
      </CardContent>
    </Card>
  );
}
