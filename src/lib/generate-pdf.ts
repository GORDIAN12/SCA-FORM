
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

    doc.setDrawColor(220, 220, 220); // Lighter grey for grid
    doc.setLineWidth(0.2);

    // --- Draw Grid Levels (from 6 to 10) ---
    const gridLevels = 5; // for scores 6, 7, 8, 9, 10
    for (let i = 1; i <= gridLevels; i++) {
        // The radius for score 6 is 0, for 10 is `size`
        const radius = (i / gridLevels) * size;
        const gridPoints: [number, number][] = [];
        for (let j = 0; j < numAxes; j++) {
            const angle = angleSlice * j - Math.PI / 2;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            gridPoints.push([x, y]);
        }
        doc.lines(gridPoints, 0, 0, [1,1], 'S', true);
    }
    
    // --- Draw Axes and Labels ---
    for (let i = 0; i < numAxes; i++) {
        const angle = angleSlice * i - Math.PI / 2;
        const x = centerX + size * Math.cos(angle);
        const y = centerY + size * Math.sin(angle);
        doc.line(centerX, centerY, x, y);

        const labelX = centerX + (size + 5) * Math.cos(angle);
        const labelY = centerY + (size + 5) * Math.sin(angle);
        doc.setFontSize(7);
        doc.text(t(attributes[i]), labelX, labelY, { align: 'center', baseline: 'middle' });
    }
    
    // --- Draw Score Labels (6, 7, 8, 9, 10) on one axis ---
    doc.setFontSize(6);
    doc.setTextColor(150, 150, 150);
    const labelAxisIndex = 0; // Draw on the first axis (top one)
    const angle = angleSlice * labelAxisIndex - Math.PI / 2;
    for(let i=1; i <= gridLevels; i++) {
      const radius = (i / gridLevels) * size;
      const score = 6 + i;
      const labelX = centerX + radius * Math.cos(angle + 0.1); // slight offset
      const labelY = centerY + radius * Math.sin(angle + 0.1);
      doc.text(String(score), labelX, labelY, {align: 'center'});
    }
    doc.setTextColor(0, 0, 0);


    // --- Calculate and Draw Data Points ---
    const dataPoints: [number, number][] = attributes.map((attr, i) => {
        const value = data[attr] || 6.0;
        // Scale from 6-10 range to 0-size range
        // A score of 6 should be on the first ring (radius > 0), not at the center.
        const radius = ((value - 6.0) / 4.0) * size;
        const angle = angleSlice * i - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        return [x, y];
    });

    // --- Draw Red Dots ---
    doc.setFillColor(255, 0, 0); // Red color
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

    const chartSize = 25;
    const chartY = secondTableFinalY + 55;
    const chartSpacing = 65; 
    const totalChartsWidth = chartSpacing * 2;
    const startX = (doc.internal.pageSize.getWidth() - totalChartsWidth) / 2;

    const phases = ['hot', 'warm', 'cold'];
    phases.forEach((phase, index) => {
        const chartData = taza.radar_charts[phase];
        if (chartData) {
            const chartX = startX + (chartSpacing * index);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text(t(phase), chartX, chartY - chartSize - 15, { align: 'center' });
            drawRadarChart(doc, chartX, chartY, chartSize, chartData, t);
        }
    });
  });

  doc.save(`${cafe.nombre.replace(/ /g, '_')}_Evaluation.pdf`);
};
