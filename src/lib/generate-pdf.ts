import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { Evaluation } from './types';
import { toPng } from 'html-to-image';

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

export const generatePdf = async (
  evaluation: Evaluation,
  t: (key: string) => string,
  chartNode: HTMLElement
) => {
  const doc = new jsPDF() as jsPDFWithAutoTable;

  // --- CHART GENERATION ---
  const dataUrl = await toPng(chartNode, { backgroundColor: 'white' });

  // --- PAGE 1: SUMMARY / COVER PAGE ---
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Cupping Compass - Coffee Evaluation Report', 105, 20, { align: 'center' });

  doc.setFontSize(16);
  doc.text(evaluation.coffeeName, 20, 40);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  const roastLevelKey = `roast${evaluation.roastLevel.charAt(0).toUpperCase() + evaluation.roastLevel.slice(1).replace('-', '')}`;
  doc.text(`${t('roastLevel')}: ${t(roastLevelKey)}`, 20, 48);
  doc.text(`${t('evaluationDate')}: ${evaluation.createdAt.toDate().toLocaleDateString()}`, 20, 56);
  
  doc.line(20, 62, 190, 62);

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(t('overallScore'), 105, 75, { align: 'center' });
  doc.setFontSize(48);
  doc.text(evaluation.overallScore.toFixed(2), 105, 95, { align: 'center' });
  
  // Add Radar Chart
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(t('flavorProfile'), 105, 118, { align: 'center' });
  
  const imgWidth = 100;
  const imgHeight = 100;
  const x = (doc.internal.pageSize.getWidth() - imgWidth) / 2;
  doc.addImage(dataUrl, 'PNG', x, 125, imgWidth, imgHeight);


  // --- DETAIL PAGES PER CUP ---
  evaluation.cups.forEach((cup, index) => {
    doc.addPage();
    const cupNumber = index + 1;

    // Header for the new page
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`${t('cup')} ${cupNumber} - ${t('evaluation')}`, 105, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.text(`${t('score')}: ${cup.totalScore.toFixed(2)}`, 105, 30, { align: 'center' });

    doc.line(20, 40, 190, 40);

    // Scores by Phase Table
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(t('scores'), 20, 50);

    const phaseTableColumns = [t('attribute'), t('hot'), t('warm'), t('cold')];
    const phaseTableRows = [
      [t('flavor'), cup.scores.hot.flavor.toFixed(2), cup.scores.warm.flavor.toFixed(2), cup.scores.cold.flavor.toFixed(2)],
      [t('aftertaste'), cup.scores.hot.aftertaste.toFixed(2), cup.scores.warm.aftertaste.toFixed(2), cup.scores.cold.aftertaste.toFixed(2)],
      [t('acidity'), cup.scores.hot.acidity.toFixed(2), cup.scores.warm.acidity.toFixed(2), cup.scores.cold.acidity.toFixed(2)],
      [t('body'), cup.scores.hot.body.toFixed(2), cup.scores.warm.body.toFixed(2), cup.scores.cold.body.toFixed(2)],
      [t('balance'), cup.scores.hot.balance.toFixed(2), cup.scores.warm.balance.toFixed(2), cup.scores.cold.balance.toFixed(2)],
    ];
    
    doc.autoTable({
        head: [phaseTableColumns],
        body: phaseTableRows,
        startY: 55,
        theme: 'grid',
        headStyles: { fillColor: [4, 40, 35] },
    });

    let finalY = (doc as any).lastAutoTable.finalY || 100;

    // Additional Evaluations
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(t('additionalEvaluations'), 20, finalY + 15);

    const additionalEvals = [
        [t('acidity'), `${cup.scores.hot.acidity.toFixed(2)} (${t(cup.scores.hot.acidityIntensity)})`],
        [t('body'), `${cup.scores.hot.body.toFixed(2)} (${t(cup.scores.hot.bodyIntensity)})`],
        [t('fragranceAroma'), cup.aroma.toFixed(2)],
        [t('uniformity'), cup.uniformity ? '10.00' : '0.00'],
        [t('cleanCup'), cup.cleanCup ? '10.00' : '0.00'],
        [t('sweetness'), cup.sweetness ? '10.00' : '0.00'],
        [t('cupperScore'), cup.cupperScore.toFixed(2)],
    ];

    doc.autoTable({
        body: additionalEvals,
        startY: finalY + 20,
        theme: 'grid',
        styles: {
            fillColor: [245, 245, 245] // Light gray for the body
        },
        columnStyles: {
            0: { fontStyle: 'bold' }
        }
    });

    // Footer for each page
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(`${t('generatedOn')} ${new Date().toLocaleDateString()} | Cupping Compass`, 105, 285, { align: 'center' });
  });

  doc.save(`${evaluation.coffeeName.replace(/ /g, '_')}_Evaluation.pdf`);
};

(jsPDF.API as any).autoTable = function () {
	// Logic is in the autoTable plugin
	return this;
};
