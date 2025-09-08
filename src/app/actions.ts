'use server';

import { generateCuppingReport } from '@/ai/flows/generate-cupping-report';
import type { GenerateCuppingReportOutput } from '@/ai/flows/generate-cupping-report';

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function generateCuppingReportAction({
  cuppingData,
}: {
  cuppingData: string;
}): Promise<ActionResult<GenerateCuppingReportOutput>> {
  try {
    const report = await generateCuppingReport({ cuppingData });
    return { success: true, data: report };
  } catch (error) {
    console.error('Error generating cupping report:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unknown error occurred.' };
  }
}
