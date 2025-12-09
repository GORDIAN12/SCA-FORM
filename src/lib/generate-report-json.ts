import type { Evaluation, CupEvaluation } from './types';

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

export const generateReportJson = (evaluation: Evaluation, t: (key: string) => string) => {
  if (!evaluation) {
    return null;
  }

  const { coffeeName, roastLevel, createdAt, overallScore, cups } = evaluation;
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
        const createRadarData = (phase: 'hot' | 'warm' | 'cold') => ({
          aroma: parseFloat(cup.aroma.toFixed(2)),
          flavor: parseFloat(cup.scores[phase].flavor.toFixed(2)),
          aftertaste: parseFloat(cup.scores[phase].aftertaste.toFixed(2)),
          acidity: parseFloat(cup.scores[phase].acidity.toFixed(2)),
          body: parseFloat(cup.scores[phase].body.toFixed(2)),
          balance: parseFloat(cup.scores[phase].balance.toFixed(2)),
          sweetness: cup.sweetness ? 10 : 0,
        });

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
            },
        }
    }),
  };

  return report;
};
