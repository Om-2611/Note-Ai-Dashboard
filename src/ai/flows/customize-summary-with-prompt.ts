'use server';

/**
 * @fileOverview A flow to customize a summary with a user-provided prompt.
 *
 * - customizeSummaryWithPrompt - A function that customizes a summary using a prompt.
 * - CustomizeSummaryWithPromptInput - The input type for the customizeSummaryWithPrompt function.
 * - CustomizeSummaryWithPromptOutput - The return type for the customizeSummaryWithPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CustomizeSummaryWithPromptInputSchema = z.object({
  transcript: z.string().describe('The meeting transcript to summarize.'),
  customPrompt: z.string().describe('Custom instructions or prompts for summarization.'),
  originalSummary: z.string().describe('The original generated summary'),
});
export type CustomizeSummaryWithPromptInput = z.infer<typeof CustomizeSummaryWithPromptInputSchema>;

const CustomizeSummaryWithPromptOutputSchema = z.object({
  refinedSummary: z.string().describe('The refined summary based on the custom prompt.'),
});
export type CustomizeSummaryWithPromptOutput = z.infer<typeof CustomizeSummaryWithPromptOutputSchema>;

export async function customizeSummaryWithPrompt(input: CustomizeSummaryWithPromptInput): Promise<CustomizeSummaryWithPromptOutput> {
  return customizeSummaryWithPromptFlow(input);
}

const customizeSummaryPrompt = ai.definePrompt({
  name: 'customizeSummaryPrompt',
  input: {schema: CustomizeSummaryWithPromptInputSchema},
  output: {schema: CustomizeSummaryWithPromptOutputSchema},
  prompt: `You are an expert AI assistant specializing in refining meeting summaries.

  You will take an existing summary and refine it based on custom instructions provided by the user.
  Your goal is to tailor the summary to the user's specific needs and focus on particular aspects of the meeting, taking into account the original transcript.

  Original Transcript: {{{transcript}}}
  Original Summary: {{{originalSummary}}}
  Custom Instructions: {{{customPrompt}}}

  Refined Summary: `,
});

const customizeSummaryWithPromptFlow = ai.defineFlow(
  {
    name: 'customizeSummaryWithPromptFlow',
    inputSchema: CustomizeSummaryWithPromptInputSchema,
    outputSchema: CustomizeSummaryWithPromptOutputSchema,
  },
  async input => {
    const {output} = await customizeSummaryPrompt(input);
    return output!;
  }
);
