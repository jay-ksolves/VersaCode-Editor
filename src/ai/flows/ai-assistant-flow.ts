
'use server';

/**
 * @fileOverview A conversational AI assistant flow that can answer questions and generate code based on file context.
 *
 * - runAiAssistant - A function that orchestrates the AI assistant logic.
 * - AiAssistantInput - The input type for the runAiAssistant function.
 * - AiAssistantOutput - The return type for the runAiAssistant function.
 */

import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { ai } from '@/ai/genkit';

const AiAssistantInputSchema = z.object({
  prompt: z.string().describe('The user\'s request or question.'),
  context: z.string().optional().describe('The content of files selected by the user to provide context.'),
  apiKey: z.string().optional().describe('The user-provided Google AI API key.'),
});
export type AiAssistantInput = z.infer<typeof AiAssistantInputSchema>;

const AiAssistantOutputSchema = z.object({
  generatedCode: z.string().describe('The AI-generated response, which could be code or natural language.'),
});
export type AiAssistantOutput = z.infer<typeof AiAssistantOutputSchema>;

export async function runAiAssistant(input: AiAssistantInput): Promise<AiAssistantOutput> {
  return aiAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiAssistantPrompt',
  input: { schema: AiAssistantInputSchema },
  output: { schema: AiAssistantOutputSchema },
  prompt: `You are an expert AI pair programmer. Your purpose is to help users with their coding tasks.
  
  You will be given a prompt from a user. You may also be given a context of one or more files from the user's project.
  
  - If the user asks for new code, generate that code.
  - If the user asks to refactor code, provide the refactored version.
  - If the user asks a question about the code, answer it.
  - If you are generating code, do not wrap it in markdown backticks. Just return the raw code.
  
  Here is the file context:
  ---
  {{{context}}}
  ---
  
  Here is the user's prompt:
  ---
  {{{prompt}}}
  ---
  
  Your response:
  `,
});

const aiAssistantFlow = ai.defineFlow(
  {
    name: 'aiAssistantFlow',
    inputSchema: AiAssistantInputSchema,
    outputSchema: AiAssistantOutputSchema,
  },
  async (input) => {
    // Create a temporary Genkit instance with the user's API key
    const userAi = genkit({
      plugins: [
        googleAI({
          apiKey: input.apiKey || process.env.GOOGLE_GENAI_API_KEY,
        }),
      ],
    });

    const { output } = await userAi.generate({
      model: 'googleai/gemini-pro',
      prompt: (await prompt.render(input)).prompt,
    });
    
    return output as AiAssistantOutput;
  }
);
