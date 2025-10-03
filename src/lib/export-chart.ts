import { toPng } from 'html-to-image';
import type { RefObject } from 'react';

export const exportChart = (chartRef: RefObject<HTMLElement>) => {
  if (chartRef.current === null) {
    return;
  }

  toPng(chartRef.current, { cacheBust: true })
    .then((dataUrl) => {
      const link = document.createElement('a');
      link.download = 'flavor-profile.png';
      link.href = dataUrl;
      link.click();
    })
    .catch((err) => {
      console.error(err);
    });
};
