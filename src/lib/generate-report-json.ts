'use client';

import type { Evaluation, CupEvaluation, RadarChartData, ScoreSet } from './types';

const getAverageSimple = (cups: CupEvaluation[], key: 'uniformity' | 'cleanCup' | 'sweetness') => {
    if (!cups || cups.length === 0) return 0;
    const total = cups.reduce((acc, cup) => acc + (cup[key] ? 10 : 0), 0);
    return total / cups.length;
}

const getAverageAroma = (cups: CupEvaluation[]) => {
    if (!cups || cups.length === 0) return 0;
    const total = cups.reduce((acc, cup) => acc + cup.aroma, 0);
    return total / cups.length;
}

const getAverageCupperScore = (cups: CupEvaluation[]) => {
    if (!cups || cups.length === 0) return 0;
    const total = cups.reduce((acc, cup) => acc + cup.cupperScore, 0);
    return total / cups.length;
}

const validateScore = (score: number | null | undefined): number => {
    const num = Number(score);
    if (isNaN(num) || !num || num < 6) return 8.00;
    if (num > 10) return 10.00;
    return parseFloat(num.toFixed(2));
}

const getAverageScore = (scores: (number | null | undefined)[]): number => {
    const validScores = scores.map(validateScore);
    const total = validScores.reduce((acc, score) => acc + score, 0);
    return parseFloat((total / validScores.length).toFixed(2));
};

export const generateReportJson = (evaluation: Evaluation, t: (key: string) => string) => {
  if (!evaluation) {
    return null;
  }

  const { coffeeName, roastLevel, createdAt, overallScore, cups, observations } = evaluation;
  const roastLevelKey = `roast${roastLevel.charAt(0).toUpperCase() + roastLevel.slice(1).replace('-', '')}`;


  const report = {
    cafe: {
      nombre: coffeeName || null,
      nivel_tueste: t(roastLevelKey) || null,
      fecha_evaluacion: createdAt?.toDate().toLocaleDateString() || null,
    },
    resumen_general: {
      puntuacion_general: overallScore || 0,
      fragrancia_aroma: parseFloat(getAverageAroma(cups).toFixed(2)),
      uniformidad: parseFloat(getAverageSimple(cups, 'uniformity').toFixed(2)),
      taza_limpia: parseFloat(getAverageSimple(cups, 'cleanCup').toFixed(2)),
      dulzura: parseFloat(getAverageSimple(cups, 'sweetness').toFixed(2)),
      puntaje_catador: parseFloat(getAverageCupperScore(cups).toFixed(2)),
    },
    tazas: cups.map((cup, index) => {
        const createRadarData = (phase: 'hot' | 'warm' | 'cold'): RadarChartData => ({
          aroma: validateScore(cup.aroma),
          flavor: validateScore(cup.scores[phase].flavor),
          aftertaste: validateScore(cup.scores[phase].aftertaste),
          acidity: validateScore(cup.scores[phase].acidity),
          body: validateScore(cup.scores[phase].body),
          balance: validateScore(cup.scores[phase].balance),
        });

        const combinedRadarData: RadarChartData = {
          aroma: validateScore(cup.aroma),
          flavor: getAverageScore([cup.scores.hot.flavor, cup.scores.warm.flavor, cup.scores.cold.flavor]),
          aftertaste: getAverageScore([cup.scores.hot.aftertaste, cup.scores.warm.aftertaste, cup.scores.cold.aftertaste]),
          acidity: getAverageScore([cup.scores.hot.acidity, cup.scores.warm.acidity, cup.scores.cold.acidity]),
          body: getAverageScore([cup.scores.hot.body, cup.scores.warm.body, cup.scores.cold.body]),
          balance: getAverageScore([cup.scores.hot.balance, cup.scores.warm.balance, cup.scores.cold.balance]),
        };

        return {
            numero_taza: index + 1,
            puntuacion_total: cup.totalScore || 0,
            fases: {
                sabor: { caliente: cup.scores.hot.flavor, tibio: cup.scores.warm.flavor, frio: cup.scores.cold.flavor },
                postgusto: { caliente: cup.scores.hot.aftertaste, tibio: cup.scores.warm.aftertaste, frio: cup.scores.cold.aftertaste },
                acidez: { caliente: cup.scores.hot.acidity, tibio: cup.scores.warm.acidity, frio: cup.scores.cold.acidity },
                cuerpo: { caliente: cup.scores.hot.body, tibio: cup.scores.warm.body, frio: cup.scores.cold.body },
                balance: { caliente: cup.scores.hot.balance, tibio: cup.scores.warm.balance, frio: cup.scores.cold.balance },
            },
            evaluaciones_adicionales: {
                acidez: { puntuacion: cup.scores.hot.acidity, intensidad: t(cup.scores.hot.acidityIntensity) },
                cuerpo: { puntuacion: cup.scores.hot.body, intensidad: t(cup.scores.hot.bodyIntensity) },
                fragrancia_aroma: cup.aroma,
                uniformidad: cup.uniformity ? 10 : 0,
                taza_limpia: cup.cleanCup ? 10 : 0,
                dulzura: cup.sweetness ? 10 : 0,
                puntaje_catador: cup.cupperScore,
            },
            radar_charts: {
              hot: createRadarData('hot'),
              warm: createRadarData('warm'),
              cold: createRadarData('cold'),
              combined: combinedRadarData,
            },
        }
    }),
    observaciones: observations || '',
  };

  return report;
};
