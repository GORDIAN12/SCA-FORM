import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { jsPDF as jsPDFType } from 'jspdf';
import { toPng } from 'html-to-image';
import { useLanguage } from '@/context/language-context';

// Extend the jsPDF interface to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const generatePdf = async (reportJson: any, chartNode: HTMLElement, t: (key: string) => string) => {
  if (!reportJson || !chartNode) {
    console.error('Missing report data or chart node for PDF generation.');
    return;
  }

  const doc = new jsPDF();
  const { cafe, resumen_general, tazas } = reportJson;

  // --- CHART GENERATION ---
  const dataUrl = await toPng(chartNode, { backgroundColor: 'white' });

  // --- PAGE 1: SUMMARY / COVER PAGE ---
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(cafe.nombre, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`${t('roastLevel')}: ${cafe.nivel_tueste}`, 20, 35);
  doc.text(`${t('evaluationDate')}: ${cafe.fecha_evaluacion}`, 20, 42);

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`${t('overallScore')}: ${resumen_general.puntuacion_general.toFixed(2)}`, 20, 55);

  doc.setFontSize(14);
  doc.text(t('averageAttributeScores'), 20, 68);

  const summaryData = [
      [t('aroma'), resumen_general.fragrancia_aroma.toFixed(2)],
      [t('uniformity'), resumen_general.uniformidad.toFixed(2)],
      [t('cleanCup'), resumen_general.taza_limpia.toFixed(2)],
      [t('sweetness'), resumen_general.dulzura.toFixed(2)],
      [t('cupperScore'), resumen_general.puntaje_catador.toFixed(2)],
  ];

  doc.autoTable({
      startY: 75,
      head: [[t('attribute'), t('score')]],
      body: summaryData,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [74, 44, 42] },
  });

  const chartWidth = 120;
  const chartHeight = 120;
  const chartX = (doc.internal.pageSize.getWidth() - chartWidth) / 2;
  const chartY = doc.autoTable.previous.finalY + 15;

  if (dataUrl) {
    doc.addImage(dataUrl, 'PNG', chartX, chartY, chartWidth, chartHeight);
  }

  doc.setFontSize(10);
  doc.text(`${t('generatedOn')}: ${new Date().toLocaleDateString()}`, 20, doc.internal.pageSize.getHeight() - 10);

  // --- PAGES PER CUP ---
  tazas.forEach((taza: any) => {
    doc.addPage();
    
    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`${t('cup')} #${taza.numero_taza} - ${t('overallScore')}: ${taza.puntuacion_total.toFixed(2)}`, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

    // Phases Table
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(t('scores'), 14, 40);

    const phasesBody = [
        [t('flavor'), taza.fases.sabor.caliente, taza.fases.sabor.tibio, taza.fases.sabor.frio],
        [t('aftertaste'), taza.fases.postgusto.caliente, taza.fases.postgusto.tibio, taza.fases.postgusto.frio],
        [t('acidity'), taza.fases.acidez.caliente, taza.fases.acidez.tibio, taza.fases.acidez.frio],
        [t('body'), taza.fases.cuerpo.caliente, taza.fases.cuerpo.tibio, taza.fases.cuerpo.frio],
        [t('balance'), taza.fases.balance.caliente, taza.fases.balance.tibio, taza.fases.balance.frio],
    ];

    doc.autoTable({
        startY: 45,
        head: [[t('attribute'), t('hot'), t('warm'), t('cold')]],
        body: phasesBody,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [74, 44, 42] },
    });

    // Additional Evaluations
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(t('additionalEvaluations'), 14, doc.autoTable.previous.finalY + 15);

    const additionalBody = [
        [t('acidity'), `${taza.evaluaciones_adicionales.acidez.puntuacion} (${taza.evaluaciones_adicionales.acidez.intensidad})`],
        [t('body'), `${taza.evaluaciones_adicionales.cuerpo.puntuacion} (${taza.evaluaciones_adicionales.cuerpo.intensidad})`],
        [t('fragranceAroma'), taza.evaluaciones_adicionales.fragrancia_aroma],
        [t('uniformity'), taza.evaluaciones_adicionales.uniformidad],
        [t('cleanCup'), taza.evaluaciones_adicionales.taza_limpia],
        [t('sweetness'), taza.evaluaciones_adicionales.dulzura],
        [t('cupperScore'), taza.evaluaciones_adicionales.puntaje_catador],
    ];

    doc.autoTable({
        startY: doc.autoTable.previous.finalY + 20,
        head: [[t('attribute'), t('score')]],
        body: additionalBody,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [74, 44, 42] },
    });
  });

  doc.save(`${cafe.nombre.replace(/ /g, '_')}_Evaluation.pdf`);
};
