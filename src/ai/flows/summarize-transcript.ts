
'use server';

/**
 * @fileOverview Summarizes a meeting transcript using a generative AI model.
 *
 * - summarizeTranscript - A function that handles the summarization process.
 * - SummarizeTranscriptInput - The input type for the summarizeTranscript function.
 * - SummarizeTranscriptOutput - The return type for the summarizeTranscript function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeTranscriptInputSchema = z.object({
  transcript: z
    .string()
    .describe('The meeting transcript to summarize.'),
  customPrompt: z
    .string()
    .optional()
    .describe('Optional custom prompt for summarization.'),
});
export type SummarizeTranscriptInput = z.infer<typeof SummarizeTranscriptInputSchema>;

const SummarizeTranscriptOutputSchema = z.object({
  summary: z.string().describe('The concise summary of the meeting transcript.'),
});
export type SummarizeTranscriptOutput = z.infer<typeof SummarizeTranscriptOutputSchema>;

async function summarizeTranscript(input: SummarizeTranscriptInput): Promise<SummarizeTranscriptOutput> {
  return summarizeTranscriptFlow(input);
}
export {summarizeTranscript};

const summarizeTranscriptPrompt = ai.definePrompt({
  name: 'summarizeTranscriptPrompt',
  input: {schema: SummarizeTranscriptInputSchema},
  output: {schema: SummarizeTranscriptOutputSchema},
  prompt:  `You are an AI assistant. Your task is to summarize the given meeting transcript.
  Return a JSON object with a single key "summary".
  The value of "summary" must be a clear, concise summary in bullet points (not a verbatim copy).
  Focus on:
  - Key discussion points
  - Decisions made
  - Action items (if mentioned)
  
  Transcript:
  {{{transcript}}}
  `,
});

const summarizeTranscriptFlow = ai.defineFlow(
  {
    name: 'summarizeTranscriptFlow',
    inputSchema: SummarizeTranscriptInputSchema,
    outputSchema: SummarizeTranscriptOutputSchema,
  },
  async input => {
    const {output} = await summarizeTranscriptPrompt(input);
    return output!;
  }
);
