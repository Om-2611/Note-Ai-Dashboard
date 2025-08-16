
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
  prompt: `You are an AI assistant. Your task is to process the given transcript.
You must return a JSON object with a single key "summary".
The value of the "summary" key should be the exact content of the transcript provided below.

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
