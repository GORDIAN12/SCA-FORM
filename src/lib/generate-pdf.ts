
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extend the jsPDF interface to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const drawRadarChart = (doc: jsPDF, centerX: number, centerY: number, size: number, data: any, t: (key: string) => string) => {
    const attributes = ['aroma', 'flavor', 'aftertaste', 'acidity', 'body', 'balance', 'sweetness'];
    const numAxes = attributes.length;
    const angleSlice = (2 * Math.PI) / numAxes;

    // --- Calculate Data Points ---
    const dataPoints: [number, number][] = attributes.map((attr, i) => {
        const value = data[attr] || 6.0; // Default to 6 if value is missing
        const radius = (((value - 6.0) / 4.0) * (size * 0.9)) + (size * 0.1); 
        const angle = angleSlice * i - Math.PI / 2; // Start from the top
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        return [x, y];
    });
    
    // --- Draw only the red dots ---
    doc.setFillColor(255, 0, 0); // Red color for the dots
    dataPoints.forEach(point => {
        doc.circle(point[0], point[1], 1, 'F'); // Draw a filled circle of radius 1
    });
};


export const generatePdf = async (reportJson: any, t: (key: string) => string) => {
  if (!reportJson) {
    console.error('Missing report data for PDF generation.');
    return;
  }

  const doc = new jsPDF();
  const { cafe, resumen_general, tazas } = reportJson;

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
  tazas.forEach((taza: any) => {
    doc.addPage();
    
    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`${t('cup')} #${taza.numero_taza} - ${t('score')}: ${taza.puntuacion_total.toFixed(2)}`, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

    // Phases Table
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(t('scores'), 14, 40);

    const phasesBody = [
        [t('flavor'), taza.fases.sabor.caliente.toFixed(2), taza.fases.sabor.tibio.toFixed(2), taza.fases.sabor.frio.toFixed(2)],
        [t('aftertaste'), taza.fases.postgusto.caliente.toFixed(2), taza.fases.postgusto.tibio.toFixed(2), taza.fases.postgusto.frio.toFixed(2)],
        [t('acidity'), taza.fases.acidez.caliente.toFixed(2), taza.fases.acidez.tibio.toFixed(2), taza.fases.acidez.frio.toFixed(2)],
        [t('body'), taza.fases.cuerpo.caliente.toFixed(2), taza.fases.cuerpo.tibio.toFixed(2), taza.fases.cuerpo.frio.toFixed(2)],
        [t('balance'), taza.fases.balance.caliente.toFixed(2), taza.fases.balance.tibio.toFixed(2), taza.fases.balance.frio.toFixed(2)],
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

    const chartSize = 35; // Predetermined size (radius) for the chart
    const chartY = secondTableFinalY + 60; // Y position for the charts
    const chartSpacing = 65; // Space between the center of each chart
    const totalChartsWidth = chartSpacing * 2;
    const startX = (doc.internal.pageSize.getWidth() - totalChartsWidth) / 2;

    const phases = ['hot', 'warm', 'cold'];
    phases.forEach((phase, index) => {
        const chartData = taza.radar_charts[phase];
        if (chartData) {
            const chartX = startX + (chartSpacing * index);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text(t(phase), chartX, chartY - chartSize - 5, { align: 'center' });
            drawRadarChart(doc, chartX, chartY, chartSize, chartData, t);
        }
    });
  });

  doc.save(`${cafe.nombre.replace(/ /g, '_')}_Evaluation.pdf`);
};
