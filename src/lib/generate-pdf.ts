
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

    // --- Draw Grid & Axes ---
    doc.setDrawColor(200, 200, 200); // Light grey for grid
    doc.setLineWidth(0.2);
    doc.setFontSize(6);
    doc.setTextColor(150, 150, 150);

    const gridLevels = [7, 8, 9, 10]; // Scores to draw rings for
    gridLevels.forEach(level => {
        const radius = ((level - 6) / 4) * size;
        if (radius > 0) { // Only draw if radius is positive
            const points: [number, number][] = [];
            for (let j = 0; j < numAxes; j++) {
                const angle = angleSlice * j - Math.PI / 2;
                points.push([centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle)]);
            }
             // Draw the polygon for the grid ring
            doc.lines(points, 0, 0, [1,1], 'S', true);

            // Draw score label on one of the axes
            const labelAngle = angleSlice * 0 - Math.PI / 2; // on the 'aroma' axis
            doc.text(level.toString(), centerX + radius * Math.cos(labelAngle), centerY + radius * Math.sin(labelAngle) - 1, { align: 'center'});
        }
    });

    
    // --- Draw Axis Lines and Labels ---
    doc.setDrawColor(200, 200, 200);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);

    attributes.forEach((attr, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const x1 = centerX;
        const y1 = centerY;
        const x2 = centerX + size * Math.cos(angle);
        const y2 = centerY + size * Math.sin(angle);
        doc.line(x1, y1, x2, y2);

        // Label
        const labelX = centerX + (size * 1.1) * Math.cos(angle);
        const labelY = centerY + (size * 1.1) * Math.sin(angle);
        doc.text(t(attr), labelX, labelY, { align: 'center', baseline: 'middle' });
    });


    // --- Draw Data Polygon ---
    const dataPoints: [number, number][] = attributes.map((attr, i) => {
        const value = data[attr];
        // Scale: value 6 -> radius > 0, value 10 -> radius 'size'
        const radius = ((Math.max(6, value) - 6) / 4) * size;
        const angle = angleSlice * i - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        return [x, y];
    });

    // Draw red dots at each vertex
    doc.setFillColor(255, 0, 0); // Red
    dataPoints.forEach(point => {
        doc.circle(point[0], point[1], 1, 'F'); // 'F' for fill
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
    const chartY = secondTableFinalY + 50;
    const pageWidth = doc.internal.pageSize.getWidth();
    const chartSpacing = (pageWidth - (chartSize * 2 * 3)) / 4;

    const phases = ['hot', 'warm', 'cold'];
    phases.forEach((phase, index) => {
        const chartData = taza.radar_charts[phase];
        if (chartData) {
            const chartX = chartSpacing * (index + 1) + (chartSize * 2 * index) + chartSize;
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text(t(phase), chartX, chartY - chartSize - 10, { align: 'center' });
            drawRadarChart(doc, chartX, chartY, chartSize, chartData, t);
        }
    });
  });

  doc.save(`${cafe.nombre.replace(/ /g, '_')}_Evaluation.pdf`);
};
