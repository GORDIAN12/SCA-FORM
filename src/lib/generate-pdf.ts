import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { Evaluation } from './types';

// Extend jsPDF interface for autoTable
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

export const generatePdf = (evaluation: Evaluation, t: (key: string) => string) => {
  const doc = new jsPDF() as jsPDFWithAutoTable;

  // ===== SUMMARY PAGE =====
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Cupping Compass - Coffee Evaluation', 105, 20, { align: 'center' });

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(evaluation.coffeeName, 20, 40);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`${t('roastLevel')}: ${t(`roast${evaluation.roastLevel.charAt(0).toUpperCase() + evaluation.roastLevel.slice(1).replace('-', '')}`)}`, 20, 48);
  doc.text(`${t('evaluationDate')}: ${evaluation.createdAt.toDate().toLocaleDateString()}`, 20, 56);

  doc.line(20, 62, 190, 62);

  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text(t('overallScore'), 105, 75, { align: 'center' });
  doc.setFontSize(48);
  doc.text(evaluation.overallScore.toFixed(2), 105, 95, { align: 'center' });
  
  doc.line(20, 105, 190, 105);

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(t('averageAttributeScores'), 20, 118);

  const averageScores = {
    [t('aroma')]: evaluation.cups.reduce((acc, cup) => acc + cup.aroma, 0) / evaluation.cups.length,
    [t('flavor')]: evaluation.cups.reduce((acc, cup) => acc + (cup.scores.hot.flavor + cup.scores.warm.flavor + cup.scores.cold.flavor) / 3, 0) / evaluation.cups.length,
    [t('aftertaste')]: evaluation.cups.reduce((acc, cup) => acc + (cup.scores.hot.aftertaste + cup.scores.warm.aftertaste + cup.scores.cold.aftertaste) / 3, 0) / evaluation.cups.length,
    [t('acidity')]: evaluation.cups.reduce((acc, cup) => acc + (cup.scores.hot.acidity + cup.scores.warm.acidity + cup.scores.cold.acidity) / 3, 0) / evaluation.cups.length,
    [t('body')]: evaluation.cups.reduce((acc, cup) => acc + (cup.scores.hot.body + cup.scores.warm.body + cup.scores.cold.body) / 3, 0) / evaluation.cups.length,
    [t('balance')]: evaluation.cups.reduce((acc, cup) => acc + (cup.scores.hot.balance + cup.scores.warm.balance + cup.scores.cold.balance) / 3, 0) / evaluation.cups.length,
    [t('cupperScore')]: evaluation.cups.reduce((acc, cup) => acc + cup.cupperScore, 0) / evaluation.cups.length,
  };

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  let yPos = 128;
  const scores = Object.entries(averageScores);
  const midPoint = Math.ceil(scores.length / 2);

  scores.slice(0, midPoint).forEach(([key, value], index) => {
    doc.text(`${key}:`, 30, yPos + (index * 8));
    doc.text(value.toFixed(2), 80, yPos + (index * 8));
  });

  scores.slice(midPoint).forEach(([key, value], index) => {
    doc.text(`${key}:`, 120, yPos + (index * 8));
    doc.text(value.toFixed(2), 170, yPos + (index * 8));
  });

  // ===== DETAIL PAGES PER CUP =====
  evaluation.cups.forEach((cup, index) => {
    doc.addPage();
    const cupNumber = index + 1;

    // Header for the new page
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`${t('cup')} ${cupNumber} - ${t('scores')}`, 105, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.text(`${t('score')}: ${cup.totalScore.toFixed(2)}`, 105, 30, { align: 'center' });

    doc.line(20, 40, 190, 40);

    // Scores Table
    const tableColumn = ["Attribute", t('hot'), t('warm'), t('cold')];
    const tableRows = [];

    tableRows.push([t('flavor'), cup.scores.hot.flavor.toFixed(2), cup.scores.warm.flavor.toFixed(2), cup.scores.cold.flavor.toFixed(2)]);
    tableRows.push([t('aftertaste'), cup.scores.hot.aftertaste.toFixed(2), cup.scores.warm.aftertaste.toFixed(2), cup.scores.cold.aftertaste.toFixed(2)]);
    tableRows.push([t('acidity'), cup.scores.hot.acidity.toFixed(2), cup.scores.warm.acidity.toFixed(2), cup.scores.cold.acidity.toFixed(2)]);
    tableRows.push([t('body'), cup.scores.hot.body.toFixed(2), cup.scores.warm.body.toFixed(2), cup.scores.cold.body.toFixed(2)]);
    tableRows.push([t('balance'), cup.scores.hot.balance.toFixed(2), cup.scores.warm.balance.toFixed(2), cup.scores.cold.balance.toFixed(2)]);

    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 50,
        theme: 'striped',
        headStyles: { fillColor: [4, 40, 35] }, // Dark primary color
    });

    let finalY = (doc as any).lastAutoTable.finalY || 100;
    
    // Other scores
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(t('otherScores'), 20, finalY + 20);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const otherScores = [
        { label: t('aromaScore'), value: cup.aroma.toFixed(2) },
        { label: t('cupperScore'), value: cup.cupperScore.toFixed(2) },
        { label: t('uniformity'), value: cup.uniformity ? '10.00' : '0.00' },
        { label: t('cleanCup'), value: cup.cleanCup ? '10.00' : '0.00' },
        { label: t('sweetness'), value: cup.sweetness ? '10.00' : '0.00' },
    ];
    
    let yPosOther = finalY + 30;
    otherScores.forEach(score => {
        doc.text(`${score.label}:`, 30, yPosOther);
        doc.text(score.value, 80, yPosOther);
        yPosOther += 8;
    });

    // Footer for each page
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(`${t('generatedOn')} ${new Date().toLocaleDateString()} | ${t('cup')} ${cupNumber} / ${evaluation.cups.length}`, 105, 280, { align: 'center' });
  });

  doc.save(`${evaluation.coffeeName.replace(/ /g, '_')}_Evaluation.pdf`);
};

// Add autoTable to jsPDF prototype
(jsPDF.API as any).autoTable = function () {
	// Logic is in the autoTable plugin
	return this;
};
