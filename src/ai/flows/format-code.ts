'use server';

/**
 * @fileOverview An AI-powered code formatting flow.
 *
 * - formatCode - A function that formats a given code snippet.
 * - FormatCodeInput - The input type for the formatCode function.
 * - FormatCodeOutput - The return type for the formatCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FormatCodeInputSchema = z.object({
  code: z.string().describe('The code snippet to format.'),
  language: z.string().describe('The programming language of the code.'),
});
export type FormatCodeInput = z.infer<typeof FormatCodeInputSchema>;

const FormatCodeOutputSchema = z.object({
  formattedCode: z.string().describe('The formatted code snippet.'),
});
export type FormatCodeOutput = z.infer<typeof FormatCodeOutputSchema>;

export async function formatCode(input: FormatCodeInput): Promise<FormatCodeOutput> {
  return formatCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'formatCodePrompt',
  input: {schema: FormatCodeInputSchema},
  output: {schema: FormatCodeOutputSchema},
  prompt: `You are an expert code formatter. You will receive a code snippet and its programming language.
  Format the code according to the standard conventions for that language (e.g., Prettier for TypeScript/JavaScript, Black for Python).
  Return only the formatted code.

  Programming Language: {{{language}}}
  Code to Format:
  -------------------
  {{{code}}}
  -------------------
  `,
});

const formatCodeFlow = ai.defineFlow(
  {
    name: 'formatCodeFlow',
    inputSchema: FormatCodeInputSchema,
    outputSchema: FormatCodeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
