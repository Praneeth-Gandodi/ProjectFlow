'use server';

/**
 * @fileOverview An AI agent to parse plan sentences into a structured, numbered list of requirements.
 *
 * - parsePlanSentences - A function that handles the parsing of plan sentences.
 * - ParsePlanSentencesInput - The input type for the parsePlanSentences function.
 * - ParsePlanSentencesOutput - The return type for the parsePlanSentences function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ParsePlanSentencesInputSchema = z.object({
  sentences: z
    .string()
    .describe('A string containing sentences describing project requirements.'),
});
export type ParsePlanSentencesInput = z.infer<typeof ParsePlanSentencesInputSchema>;

const ParsePlanSentencesOutputSchema = z.object({
  requirements: z
    .array(z.string())
    .describe('A structured, numbered list of requirements parsed from the input sentences.'),
});
export type ParsePlanSentencesOutput = z.infer<typeof ParsePlanSentencesOutputSchema>;

export async function parsePlanSentences(input: ParsePlanSentencesInput): Promise<ParsePlanSentencesOutput> {
  return parsePlanSentencesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'parsePlanSentencesPrompt',
  input: {schema: ParsePlanSentencesInputSchema},
  output: {schema: ParsePlanSentencesOutputSchema},
  prompt: `You are an AI expert in parsing project requirements from sentences.

  Your task is to take a string of sentences and intelligently parse them into a structured, numbered list of requirements.

  Sentences: {{{sentences}}}

  Return the requirements in a numbered list format.
  `,
});

const parsePlanSentencesFlow = ai.defineFlow(
  {
    name: 'parsePlanSentencesFlow',
    inputSchema: ParsePlanSentencesInputSchema,
    outputSchema: ParsePlanSentencesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
