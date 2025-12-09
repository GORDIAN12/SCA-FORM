import type { RadarChartData } from './types';

const ATTRIBUTES: (keyof RadarChartData)[] = ['aroma', 'flavor', 'aftertaste', 'acidity', 'body', 'balance', 'sweetness'];
const NUM_ATTRIBUTES = ATTRIBUTES.length;

const getPoint = (value: number, index: number, centerX: number, centerY: number, radius: number) => {
    const angle = (Math.PI / 2) - (2 * Math.PI * index / NUM_ATTRIBUTES);
    // Scale value from 6-10 range to 0-1 range for radius calculation
    const scaledValue = (value - 6) / (10 - 6);
    const currentRadius = Math.max(0, scaledValue) * radius;
    const x = centerX + currentRadius * Math.cos(angle);
    const y = centerY - currentRadius * Math.sin(angle);
    return { x, y };
};

export const generateRadarSVG = (data: RadarChartData, t: (key: string) => string): string => {
    const width = 1200;
    const height = 1200;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = width * 0.4; // 40% of width
    const fontSize = width * 0.05; // 5% of width
    const strokeWidth = width * 0.005;

    let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="background-color: white; font-family: sans-serif; font-size: ${fontSize}px;">`;

    // --- GRID AND AXES ---
    const levels = 5; // 6, 7, 8, 9, 10
    for (let level = 1; level <= levels; level++) {
        const levelRadius = (level / levels) * radius;
        const points = ATTRIBUTES.map((_, i) => {
            const angle = (Math.PI / 2) - (2 * Math.PI * i / NUM_ATTRIBUTES);
            const x = centerX + levelRadius * Math.cos(angle);
            const y = centerY - levelRadius * Math.sin(angle);
            return `${x},${y}`;
        }).join(' ');
        svg += `<polygon points="${points}" fill="none" stroke="#E5E7EB" stroke-width="${strokeWidth}" />`;
    }

    ATTRIBUTES.forEach((_, i) => {
        const endPoint = getPoint(10, i, centerX, centerY, radius);
        svg += `<line x1="${centerX}" y1="${centerY}" x2="${endPoint.x}" y2="${endPoint.y}" stroke="#E5E7EB" stroke-width="${strokeWidth}" />`;
    });

    // --- LABELS ---
    ATTRIBUTES.forEach((attr, i) => {
        const labelRadius = radius + (fontSize * 1.2);
        const angle = (Math.PI / 2) - (2 * Math.PI * i / NUM_ATTRIBUTES);
        const x = centerX + labelRadius * Math.cos(angle);
        const y = centerY - labelRadius * Math.sin(angle) + (fontSize / 3); // Adjust for better vertical alignment
        const textAnchor = (x < centerX - 10) ? 'end' : (x > centerX + 10) ? 'start' : 'middle';
        svg += `<text x="${x}" y="${y}" text-anchor="${textAnchor}" fill="#4B5563">${t(attr)}</text>`;
    });

    // --- DATA POLYGON ---
    const dataPoints = ATTRIBUTES.map((attr, i) => {
        const point = getPoint(data[attr], i, centerX, centerY, radius);
        return `${point.x},${point.y}`;
    }).join(' ');

    svg += `<polygon points="${dataPoints}" fill="rgba(139, 69, 19, 0.35)" stroke="rgba(90, 40, 10, 0.9)" stroke-width="${strokeWidth * 2}" />`;
    
    // --- DATA POINTS ---
    ATTRIBUTES.forEach((attr, i) => {
        const point = getPoint(data[attr], i, centerX, centerY, radius);
        svg += `<circle cx="${point.x}" cy="${point.y}" r="${strokeWidth * 2.5}" fill="#FF0000" />`;
    });


    svg += '</svg>';
    return svg;
};
