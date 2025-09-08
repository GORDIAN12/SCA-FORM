'use client';

import type { Evaluation } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Star, TrendingUp, Scale, Droplets } from 'lucide-react';

interface ScoresOverviewProps {
  evaluation: Evaluation;
}

export function ScoresOverview({ evaluation }: ScoresOverviewProps) {
  const getScore = (name: string) =>
    evaluation.scores.find((s) => s.name === name)?.value || 0;

  const overviewScores = [
    {
      title: 'Overall Score',
      value: evaluation.overallScore.toFixed(2),
      icon: <Star className="size-6 text-amber-500" />,
    },
    {
      title: 'Acidity',
      value: getScore('Acidity').toFixed(2),
      icon: <TrendingUp className="size-6 text-lime-500" />,
    },
    {
      title: 'Body',
      value: getScore('Body').toFixed(2),
      icon: <Droplets className="size-6 text-blue-500" />,
    },
    {
      title: 'Balance',
      value: getScore('Balance').toFixed(2),
      icon: <Scale className="size-6 text-violet-500" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {overviewScores.map((score) => (
        <Card key={score.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{score.title}</CardTitle>
            {score.icon}
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{score.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
