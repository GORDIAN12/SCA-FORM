'use client';
import type { Evaluation } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScoresRadarChart } from './scores-radar-chart';

interface ScoresOverviewProps {
  evaluation: Evaluation;
}

export function ScoresOverview({ evaluation }: ScoresOverviewProps) {
  const { coffeeName, overallScore, roastLevel, cups } = evaluation;

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
        <CardTitle className="flex justify-between items-center">
          <span className="text-2xl">{coffeeName}</span>
          <div className="flex flex-col items-end">
            <span className="text-3xl font-bold text-primary">
              {overallScore.toFixed(2)}
            </span>
            <span className="text-sm text-muted-foreground">Overall Score</span>
          </div>
        </CardTitle>
        <p className="text-sm text-muted-foreground">Roast Level: {roastLevel}</p>
      </CardHeader>
      <CardContent>
        <div className="h-80 md:h-96">
          <ScoresRadarChart scores={averageScores} />
        </div>
      </CardContent>
    </Card>
  );
}
