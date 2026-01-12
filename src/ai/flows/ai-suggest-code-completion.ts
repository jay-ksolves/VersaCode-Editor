'use server';

/**
 * @fileOverview An AI-powered code completion flow that suggests code snippets as the user types.
 *
 * - suggestCodeCompletion - A function that handles the code completion process.
 * - SuggestCodeCompletionInput - The input type for the suggestCodeCompletion function.
 * - SuggestCodeCompletionOutput - The return type for the suggestCodeCompletion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCodeCompletionInputSchema = z.object({
  codeContext: z.string().describe('The current code context the user is typing in.'),
  programmingLanguage: z.string().describe('The programming language of the code.'),
});
export type SuggestCodeCompletionInput = z.infer<typeof SuggestCodeCompletionInputSchema>;

const SuggestCodeCompletionOutputSchema = z.object({
  suggestedCode: z.string().describe('The AI-suggested code completion snippet.'),
});
export type SuggestCodeCompletionOutput = z.infer<typeof SuggestCodeCompletionOutputSchema>;

export async function suggestCodeCompletion(input: SuggestCodeCompletionInput): Promise<SuggestCodeCompletionOutput> {
  return suggestCodeCompletionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCodeCompletionPrompt',
  input: {schema: SuggestCodeCompletionInputSchema},
  output: {schema: SuggestCodeCompletionOutputSchema},
  prompt: `You are an AI code completion assistant. You will receive the current code context and programming language, and you will provide a code completion suggestion.

  Programming Language: {{{programmingLanguage}}}
  Code Context:
  -------------------
  {{{codeContext}}}
  -------------------

  AI-Suggested Code Completion:
  `,
});

const suggestCodeCompletionFlow = ai.defineFlow(
  {
    name: 'suggestCodeCompletionFlow',
    inputSchema: SuggestCodeCompletionInputSchema,
    outputSchema: SuggestCodeCompletionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
