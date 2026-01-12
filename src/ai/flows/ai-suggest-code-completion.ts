
'use server';

/**
 * @fileOverview An AI-powered code completion flow that suggests code snippets.
 * This flow takes the current code in the editor as context and the language, then returns a relevant code suggestion.
 * It is designed to be triggered on demand by the user (e.g., via a keyboard shortcut).
 *
 * - suggestCodeCompletion - The primary exported function that executes the code completion logic.
 * - SuggestCodeCompletionInput - The Zod schema defining the input for the flow.
 * - SuggestCodeCompletionOutput - The Zod schema defining the output of the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCodeCompletionInputSchema = z.object({
  codeContext: z.string().describe('The full content of the code file the user is currently editing.'),
  programmingLanguage: z.string().describe('The programming language of the code (e.g., "typescript", "css").'),
});
export type SuggestCodeCompletionInput = z.infer<typeof SuggestCodeCompletionInputSchema>;

const SuggestCodeCompletionOutputSchema = z.object({
  suggestedCode: z.string().describe('The AI-suggested code completion snippet to be inserted at the user\'s cursor.'),
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
    const response = await prompt.generate({
        input,
    });
    return response.output()!;
  }
);
