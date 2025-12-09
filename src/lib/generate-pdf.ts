import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { jsPDF as jsPDFType } from 'jspdf';
import { toPng } from 'html-to-image';

// Extend the jsPDF interface to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const generatePdf = async (reportJson: any, chartNodes: HTMLElement[], t: (key: string) => string) => {
  if (!reportJson || chartNodes.length === 0) {
    console.error('Missing report data or chart nodes for PDF generation.');
    return;
  }

  const doc = new jsPDF();
  const { cafe, resumen_general, tazas } = reportJson;

  // --- CHART IMAGE GENERATION ---
  const chartImagePromises = chartNodes.map(node => 
    toPng(node, { 
      backgroundColor: 'white',
      fontEmbedCSS: '' 
    })
  );
  const chartImages = await Promise.all(chartImagePromises);

  // --- PAGE 1: SUMMARY ---
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
  
  const summaryData = [
    [t('fragranceAroma'), resumen_general.fragrancia_aroma.toFixed(2)],
    [t('uniformity'), resumen_general.uniformidad.toFixed(2)],
    [t('cleanCup'), resumen_general.taza_limpia.toFixed(2)],
    [t('sweetness'), resumen_general.dulzura.toFixed(2)],
    [t('cupperScore'), resumen_general.puntaje_catador.toFixed(2)],
  ];

  doc.autoTable({
      startY: 65,
      head: [[t('attribute'), t('score')]],
      body: summaryData,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [74, 44, 42] },
  });


  doc.setFontSize(10);
  doc.text(`${t('generatedOn')}: ${new Date().toLocaleDateString()}`, 20, doc.internal.pageSize.getHeight() - 10);

  // --- PAGES PER CUP ---
  let chartImageIndex = 0;
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
    
    const tableFinalY = (doc as any).autoTable.previous.finalY;

    // Additional Evaluations
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(t('additionalEvaluations'), 14, tableFinalY + 15);

    const additionalBody = [
        [t('acidity'), `${taza.evaluaciones_adicionales.acidez.puntuacion.toFixed(2)} (${taza.evaluaciones_adicionales.acidez.intensidad})`],
        [t('body'), `${taza.evaluaciones_adicionales.cuerpo.puntuacion.toFixed(2)} (${taza.evaluaciones_adicionales.cuerpo.intensidad})`],
        [t('fragranceAroma'), taza.evaluaciones_adicionales.fragrancia_aroma.toFixed(2)],
        [t('uniformity'), taza.evaluaciones_adicionales.uniformidad.toFixed(2)],
        [t('cleanCup'), taza.evaluaciones_adicionales.taza_limpia.toFixed(2)],
        [t('sweetness'), taza.evaluaciones_adicionales.dulzura.toFixed(2)],
        [t('cupperScore'), taza.evaluaciones_adicionales.puntaje_catador.toFixed(2)],
    ];

    doc.autoTable({
        startY: tableFinalY + 20,
        head: [[t('attribute'), t('score')]],
        body: additionalBody,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [74, 44, 42] },
    });
    
    const secondTableFinalY = (doc as any).autoTable.previous.finalY;

    // Radar Charts
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(t('flavorProfile'), doc.internal.pageSize.getWidth() / 2, secondTableFinalY + 15, { align: 'center'});

    const chartSize = 60;
    const chartY = secondTableFinalY + 20;
    const chartSpacing = (doc.internal.pageSize.getWidth() - (chartSize * 3)) / 4;

    const phases = ['hot', 'warm', 'cold'];
    phases.forEach((phase, index) => {
        const chartX = chartSpacing * (index + 1) + chartSize * index;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(t(phase), chartX + chartSize / 2, chartY, { align: 'center' });
        doc.addImage(chartImages[chartImageIndex], 'PNG', chartX, chartY + 5, chartSize, chartSize);
        chartImageIndex++;
    });
  });

  doc.save(`${cafe.nombre.replace(/ /g, '_')}_Evaluation.pdf`);
};
