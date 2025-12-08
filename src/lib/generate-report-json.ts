import type { Evaluation, CupEvaluation } from './types';

const getAverage = (cups: CupEvaluation[], key: 'flavor' | 'aftertaste' | 'acidity' | 'body' | 'balance') => {
    if (!cups || cups.length === 0) return 0;
    const total = cups.reduce((acc, cup) => 
        acc + (cup.scores.hot[key] + cup.scores.warm[key] + cup.scores.cold[key]) / 3, 0);
    return total / cups.length;
};

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
        const avgFlavor = (cup.scores.hot.flavor + cup.scores.warm.flavor + cup.scores.cold.flavor) / 3;
        const avgAftertaste = (cup.scores.hot.aftertaste + cup.scores.warm.aftertaste + cup.scores.cold.aftertaste) / 3;
        const avgAcidity = (cup.scores.hot.acidity + cup.scores.warm.acidity + cup.scores.cold.acidity) / 3;
        const avgBody = (cup.scores.hot.body + cup.scores.warm.body + cup.scores.cold.body) / 3;
        const avgBalance = (cup.scores.hot.balance + cup.scores.warm.balance + cup.scores.cold.balance) / 3;

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
            radar_chart: {
                aroma: parseFloat(cup.aroma.toFixed(2)),
                sabor: parseFloat(avgFlavor.toFixed(2)),
                acidez: parseFloat(avgAcidity.toFixed(2)),
                cuerpo: parseFloat(avgBody.toFixed(2)),
                balance: parseFloat(avgBalance.toFixed(2)),
                dulzura: cup.sweetness ? 10 : 0,
                postgusto: parseFloat(avgAftertaste.toFixed(2)),
            },
        }
    }),
  };

  return report;
};
