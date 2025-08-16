'use server';

/**
 * @fileOverview A flow for refining AI-generated summaries based on user edits.
 *
 * - refineGeneratedSummary - A function that takes an initial summary and user edits, then returns a refined summary.
 * - RefineGeneratedSummaryInput - The input type for the refineGeneratedSummary function.
 * - RefineGeneratedSummaryOutput - The return type for the refineGeneratedSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RefineGeneratedSummaryInputSchema = z.object({
  initialSummary: z.string().describe('The initial AI-generated summary.'),
  userEdits: z.string().describe('The edits made by the user to the initial summary.'),
});
export type RefineGeneratedSummaryInput = z.infer<typeof RefineGeneratedSummaryInputSchema>;

const RefineGeneratedSummaryOutputSchema = z.object({
  refinedSummary: z.string().describe('The refined summary incorporating user edits and AI improvements.'),
});
export type RefineGeneratedSummaryOutput = z.infer<typeof RefineGeneratedSummaryOutputSchema>;

export async function refineGeneratedSummary(input: RefineGeneratedSummaryInput): Promise<RefineGeneratedSummaryOutput> {
  return refineGeneratedSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'refineGeneratedSummaryPrompt',
  input: {schema: RefineGeneratedSummaryInputSchema},
  output: {schema: RefineGeneratedSummaryOutputSchema},
  prompt: `You are an AI assistant that refines summaries based on user edits.

  The initial summary is:
  {{initialSummary}}

  The user has made the following edits:
  {{userEdits}}

  Please incorporate the user edits into the summary and refine it to be more accurate, concise, and informative. Return the complete refined summary.
  Do not add any extra conversational text. Just return the new summary.
  `,
});

const refineGeneratedSummaryFlow = ai.defineFlow(
  {
    name: 'refineGeneratedSummaryFlow',
    inputSchema: RefineGeneratedSummaryInputSchema,
    outputSchema: RefineGeneratedSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
