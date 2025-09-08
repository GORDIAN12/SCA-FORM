'use server';

/**
 * @fileOverview Generates a comprehensive cupping report from transformed data with text summaries.
 *
 * - generateCuppingReport - A function that generates the cupping report.
 * - GenerateCuppingReportInput - The input type for the generateCuppingReport function.
 * - GenerateCuppingReportOutput - The return type for the generateCuppingReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCuppingReportInputSchema = z.object({
  cuppingData: z.string().describe('The transformed cupping data in JSON format.'),
});
export type GenerateCuppingReportInput = z.infer<typeof GenerateCuppingReportInputSchema>;

const GenerateCuppingReportOutputSchema = z.object({
  report: z.string().describe('The comprehensive cupping report with text summaries.'),
});
export type GenerateCuppingReportOutput = z.infer<typeof GenerateCuppingReportOutputSchema>;

export async function generateCuppingReport(input: GenerateCuppingReportInput): Promise<GenerateCuppingReportOutput> {
  return generateCuppingReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCuppingReportPrompt',
  input: {schema: GenerateCuppingReportInputSchema},
  output: {schema: GenerateCuppingReportOutputSchema},
  prompt: `You are an expert coffee cupping evaluator. Generate a comprehensive report based on the provided cupping data.

Cupping Data: {{{cuppingData}}}

Pay special attention to the 'waterTemperature' field. Analyze and describe how the water temperature (cold, warm, or hot) might have influenced the coffee's flavor profile, acidity, body, and overall perception.

Include a summary of the key findings, highlighting the coffee's strengths and weaknesses, and provide an overall score based on the SCA standards. The report should be suitable for sharing with other coffee professionals and enthusiasts.
`,
});

const generateCuppingReportFlow = ai.defineFlow(
  {
    name: 'generateCuppingReportFlow',
    inputSchema: GenerateCuppingReportInputSchema,
    outputSchema: GenerateCuppingReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
