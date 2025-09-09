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

Pay special attention to the following fields: 'roastLevel', 'waterTemperature', 'acidityIntensity', 'bodyIntensity', 'uniformity', 'cleanCup', and 'sweetness'.
- Analyze and describe how the roast level (light, medium, or dark) likely influenced the coffee's flavor profile, acidity, and body.
- Analyze and describe how the water temperature (cold, warm, or hot) might have influenced the extraction and the coffee's flavor profile, acidity, body, and overall perception.
- Incorporate the 'acidityIntensity' (low, medium, high) into your analysis of the acidity score. Describe the quality and character of the acidity.
- Incorporate the 'bodyIntensity' (low, medium, high) into your analysis of the body score. Describe the weight, texture, and quality of the body.
- Analyze the 'uniformity', 'cleanCup', and 'sweetness' scores. A score of 10 in these areas is perfect. Explain what these scores imply about the consistency and quality of the coffee sample across multiple cups. For example, a lower uniformity score suggests inconsistencies between cups.

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
