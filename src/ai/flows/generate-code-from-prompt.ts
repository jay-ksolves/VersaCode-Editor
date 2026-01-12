
'use server';

/**
 * @fileOverview An AI-powered code generation flow.
 * This flow takes a natural language prompt and a target programming language, then generates a complete
 * code snippet. It is used for features like the "Generate Code" dialog in the file explorer.
 *
 * - generateCodeFromPrompt - The primary exported function that executes the code generation logic.
 * - GenerateCodeFromPromptInput - The Zod schema defining the input for the flow.
 * - GenerateCodeFromPromptOutput - The Zod schema defining the output of the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCodeFromPromptInputSchema = z.object({
  prompt: z.string().describe('A natural language description of the desired code functionality.'),
  language: z.string().optional().default('typescript').describe('The programming language for the generated code (e.g., "typescript", "python").'),
});
export type GenerateCodeFromPromptInput = z.infer<typeof GenerateCodeFromPromptInputSchema>;

const GenerateCodeFromPromptOutputSchema = z.object({
  code: z.string().describe('The generated code snippet as a string.'),
});
export type GenerateCodeFromPromptOutput = z.infer<typeof GenerateCodeFromPromptOutputSchema>;

export async function generateCodeFromPrompt(input: GenerateCodeFromPromptInput): Promise<GenerateCodeFromPromptOutput> {
  return generateCodeFromPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCodeFromPromptPrompt',
  input: {schema: GenerateCodeFromPromptInputSchema},
  output: {schema: GenerateCodeFromPromptOutputSchema},
  prompt: `You are an expert software engineer specializing in generating code from natural language descriptions.

  You will generate code based on the description provided, and ensure it is valid and executable.
  Specify the language that the code should be generated in.

  Description: {{{prompt}}}
  Language: {{{language}}}

  Here is the generated code:`,
});

const generateCodeFromPromptFlow = ai.defineFlow(
  {
    name: 'generateCodeFromPromptFlow',
    inputSchema: GenerateCodeFromPromptInputSchema,
    outputSchema: GenerateCodeFromPromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
