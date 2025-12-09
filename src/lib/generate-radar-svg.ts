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
    const radius = width * 0.35; // Reduced radius to make more space for labels
    const fontSize = width * 0.045; 
    const strokeWidth = width * 0.005;
    const labelMargin = fontSize * 0.8; // Margin to push labels outwards

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
        
        // Add level labels (6, 7, 8, 9, 10)
        const labelAngle = Math.PI / 2; // Top axis
        const labelX = centerX + levelRadius * Math.cos(labelAngle);
        const labelY = centerY - levelRadius * Math.sin(labelAngle);
        if (level > 0) { // Don't label the center
            svg += `<text x="${labelX + 10}" y="${labelY + (fontSize / 4)}" font-size="${fontSize * 0.7}" fill="#9CA3AF">${5 + level}</text>`;
        }
    }

    ATTRIBUTES.forEach((_, i) => {
        const endPoint = getPoint(10, i, centerX, centerY, radius);
        svg += `<line x1="${centerX}" y1="${centerY}" x2="${endPoint.x}" y2="${endPoint.y}" stroke="#E5E7EB" stroke-width="${strokeWidth}" />`;
    });

    // --- DATA POLYGON --- (Drawn before labels)
    const dataPoints = ATTRIBUTES.map((attr, i) => {
        const point = getPoint(data[attr], i, centerX, centerY, radius);
        return `${point.x},${point.y}`;
    }).join(' ');

    svg += `<polygon points="${dataPoints}" fill="rgba(139, 69, 19, 0.35)" stroke="rgba(90, 40, 10, 0.9)" stroke-width="${strokeWidth * 2}" />`;
    
    // --- DATA POINTS --- (Drawn before labels)
    ATTRIBUTES.forEach((attr, i) => {
        const point = getPoint(data[attr], i, centerX, centerY, radius);
        svg += `<circle cx="${point.x}" cy="${point.y}" r="${strokeWidth * 2.5}" fill="#FF0000" />`;
    });

    // --- LABELS --- (Drawn last to be on top)
    ATTRIBUTES.forEach((attr, i) => {
        const labelRadius = radius + labelMargin;
        const angle = (Math.PI / 2) - (2 * Math.PI * i / NUM_ATTRIBUTES);
        const x = centerX + labelRadius * Math.cos(angle);
        const y = centerY - labelRadius * Math.sin(angle) + (fontSize / 3);
        const textAnchor = (x < centerX - 10) ? 'end' : (x > centerX + 10) ? 'start' : 'middle';
        svg += `<text x="${x}" y="${y}" text-anchor="${textAnchor}" fill="#4B5563" font-weight="bold">${t(attr)}</text>`;
    });


    svg += '</svg>';
    return svg;
};
