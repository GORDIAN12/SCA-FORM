import jsPDF from 'jspdf';
import type { Evaluation } from './types';

export const generatePdf = (evaluation: Evaluation, t: (key: string) => string) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Cupping Compass - Coffee Evaluation', 105, 20, { align: 'center' });

  // Coffee Info
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(evaluation.coffeeName, 20, 40);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`${t('roastLevel')}: ${evaluation.roastLevel.charAt(0).toUpperCase() + evaluation.roastLevel.slice(1)}`, 20, 48);
  doc.text(`${t('evaluationDate')}: ${evaluation.createdAt.toDate().toLocaleDateString()}`, 20, 56);

  doc.line(20, 62, 190, 62); // Separator

  // Overall Score
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text(t('overallScore'), 105, 75, { align: 'center' });
  doc.setFontSize(48);
  doc.text(evaluation.overallScore.toFixed(2), 105, 95, { align: 'center' });
  
  doc.line(20, 105, 190, 105); // Separator

  // Average Scores
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(t('averageAttributeScores'), 20, 118);

  const averageScores = {
    [t('aroma')]:
      evaluation.cups.reduce((acc, cup) => acc + cup.aroma, 0) /
      evaluation.cups.length,
    [t('flavor')]:
      evaluation.cups.reduce((acc, cup) => acc + (cup.scores.hot.flavor + cup.scores.warm.flavor + cup.scores.cold.flavor) / 3, 0) /
      evaluation.cups.length,
    [t('aftertaste')]:
      evaluation.cups.reduce((acc, cup) => acc + (cup.scores.hot.aftertaste + cup.scores.warm.aftertaste + cup.scores.cold.aftertaste) / 3, 0) /
      evaluation.cups.length,
    [t('acidity')]:
      evaluation.cups.reduce((acc, cup) => acc + (cup.scores.hot.acidity + cup.scores.warm.acidity + cup.scores.cold.acidity) / 3, 0) /
      evaluation.cups.length,
    [t('body')]:
      evaluation.cups.reduce((acc, cup) => acc + (cup.scores.hot.body + cup.scores.warm.body + cup.scores.cold.body) / 3, 0) /
      evaluation.cups.length,
    [t('balance')]:
      evaluation.cups.reduce((acc, cup) => acc + (cup.scores.hot.balance + cup.scores.warm.balance + cup.scores.cold.balance) / 3, 0) /
      evaluation.cups.length,
    [t('cupperScore')]:
        evaluation.cups.reduce((acc, cup) => acc + cup.cupperScore, 0) /
        evaluation.cups.length,
  };

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  let yPos = 128;
  const scores = Object.entries(averageScores);
  const midPoint = Math.ceil(scores.length / 2);

  scores.slice(0, midPoint).forEach(([key, value], index) => {
    const formattedKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
    doc.text(`${formattedKey}:`, 30, yPos + (index * 8));
    doc.text(value.toFixed(2), 80, yPos + (index * 8));
  });

  scores.slice(midPoint).forEach(([key, value], index) => {
    const formattedKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
    doc.text(`${formattedKey}:`, 120, yPos + (index * 8));
    doc.text(value.toFixed(2), 170, yPos + (index * 8));
  });


  // Footer
  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text(`${t('generatedOn')} ${new Date().toLocaleDateString()}`, 105, 280, { align: 'center' });


  // Save the PDF
  doc.save(`${evaluation.coffeeName.replace(/ /g, '_')}_Evaluation.pdf`);
};
