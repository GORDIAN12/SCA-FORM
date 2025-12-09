
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { toPng } from 'html-to-image';
import { ReportRadarChart } from '@/components/history/report-radar-chart';
import React from 'react';
import { createRoot } from 'react-dom/client';
import type { RadarChartData } from '@/lib/types';


// Extend the jsPDF interface to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const renderChartToImage = async (data: RadarChartData, t: (key: string) => string): Promise<string> => {
    const chartContainer = document.createElement('div');
    chartContainer.style.position = 'absolute';
    chartContainer.style.left = '-9999px';
    chartContainer.style.width = '300px';
    chartContainer.style.height = '300px';
    chartContainer.style.backgroundColor = 'white';
    document.body.appendChild(chartContainer);

    const root = createRoot(chartContainer);
    
    return new Promise(async (resolve) => {
        root.render(React.createElement(ReportRadarChart, { scores: data, t: t }));

        // Short delay to ensure the chart is fully rendered before capturing
        await new Promise(r => setTimeout(r, 500));

        const dataUrl = await toPng(chartContainer, { 
          quality: 1.0, 
          pixelRatio: 2,
          skipFonts: true
        });
        
        root.unmount();
        document.body.removeChild(chartContainer);
        resolve(dataUrl);
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
  for (const taza of tazas) {
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

    const chartImageSize = 60; 
    const chartY = secondTableFinalY + 20;
    const chartSpacing = chartImageSize + 5;
    const totalChartsWidth = chartSpacing * 3 - 5;
    const startX = (doc.internal.pageSize.getWidth() - totalChartsWidth) / 2;

    const phases: ('hot' | 'warm' | 'cold')[] = ['hot', 'warm', 'cold'];
    for (let i = 0; i < phases.length; i++) {
        const phase = phases[i];
        const chartData = taza.radar_charts[phase];
        if (chartData) {
            const chartX = startX + (chartSpacing * i);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text(t(phase), chartX + chartImageSize / 2, chartY, { align: 'center' });

            const imageUrl = await renderChartToImage(chartData, t);
            doc.addImage(imageUrl, 'PNG', chartX, chartY + 5, chartImageSize, chartImageSize);
        }
    }
  }

  doc.save(`${cafe.nombre.replace(/ /g, '_')}_Evaluation.pdf`);
};
