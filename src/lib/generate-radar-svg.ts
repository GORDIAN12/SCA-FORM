import type { RadarChartData } from './types';

const ATTRIBUTES: (keyof RadarChartData)[] = ['aroma', 'flavor', 'aftertaste', 'acidity', 'body', 'balance', 'sweetness'];
const NUM_ATTRIBUTES = ATTRIBUTES.length;

const getPoint = (value: number, index: number, maxValue: number, radius: number, centerX: number, centerY: number) => {
    const angle = (Math.PI / 2) - (2 * Math.PI * index / NUM_ATTRIBUTES);
    const currentRadius = Math.max(0, ((value - 6) / (10 - 6))) * radius;
    const x = centerX + currentRadius * Math.cos(angle);
    const y = centerY - currentRadius * Math.sin(angle);
    return { x, y };
};

export const generateRadarSVG = (data: RadarChartData, t: (key: string) => string): string => {
    const width = 100;
    const height = 100;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 40;

    let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="background-color: white; font-family: sans-serif; font-size: 6px;">`;

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
        svg += `<polygon points="${points}" fill="none" stroke="#E5E7EB" stroke-width="0.5" />`;
    }

    ATTRIBUTES.forEach((_, i) => {
        const endPoint = getPoint(10, i, 10, radius, centerX, centerY);
        svg += `<line x1="${centerX}" y1="${centerY}" x2="${endPoint.x}" y2="${endPoint.y}" stroke="#E5E7EB" stroke-width="0.5" />`;
    });

    // --- LABELS ---
    ATTRIBUTES.forEach((attr, i) => {
        const labelRadius = radius + 8;
        const angle = (Math.PI / 2) - (2 * Math.PI * i / NUM_ATTRIBUTES);
        const x = centerX + labelRadius * Math.cos(angle);
        const y = centerY - labelRadius * Math.sin(angle);
        const textAnchor = (x < centerX - 1) ? 'end' : (x > centerX + 1) ? 'start' : 'middle';
        const dominantBaseline = (y < centerY - 5) ? 'alphabetic' : (y > centerY + 5) ? 'hanging' : 'middle';
        svg += `<text x="${x}" y="${y}" text-anchor="${textAnchor}" dominant-baseline="${dominantBaseline}" fill="#4B5563">${t(attr)}</text>`;
    });

    // --- DATA POLYGON ---
    const dataPoints = ATTRIBUTES.map((attr, i) => {
        const point = getPoint(data[attr], i, 10, radius, centerX, centerY);
        return `${point.x},${point.y}`;
    }).join(' ');

    svg += `<polygon points="${dataPoints}" fill="rgba(139, 69, 19, 0.35)" stroke="rgba(90, 40, 10, 0.9)" stroke-width="1" />`;

    svg += '</svg>';
    return svg;
};
