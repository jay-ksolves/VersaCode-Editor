
'use server';

/**
 * @fileOverview A conversational AI assistant flow that can answer questions and generate code based on file context.
 * This flow is designed to be highly flexible, accepting a user prompt, optional file context, and a user-provided
 * API key to ensure security and proper API usage attribution.
 *
 * - runAiAssistant - The primary exported function that executes the AI assistant logic.
 * - AiAssistantInput - The Zod schema defining the input for the flow.
 * - AiAssistantOutput - The Zod schema defining the output of the flow.
 */

import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { ai } from '@/ai/genkit';

const AiAssistantInputSchema = z.object({
  prompt: z.string().describe('The user\'s natural language request or question.'),
  context: z.string().optional().describe('A string containing the content of files selected by the user to provide context to the AI.'),
  apiKey: z.string().optional().describe('The user-provided Google AI API key for authentication.'),
});
export type AiAssistantInput = z.infer<typeof AiAssistantInputSchema>;

const AiAssistantOutputSchema = z.object({
  generatedCode: z.string().describe('The AI-generated response, which could be code, natural language, or a mix of both.'),
});
export type AiAssistantOutput = z.infer<typeof AiAssistantOutputSchema>;

export async function runAiAssistant(input: AiAssistantInput): Promise<AiAssistantOutput> {
  return aiAssistantFlow(input);
}

const assistantPrompt = ai.definePrompt({
  name: 'aiAssistantPrompt',
  input: { schema: AiAssistantInputSchema },
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
    // Create a temporary Genkit instance with the user's API key for security and scalability.
    const userAi = genkit({
      plugins: [
        googleAI({
          apiKey: input.apiKey || process.env.GOOGLE_GENAI_API_KEY,
        }),
      ],
    });

    const { output } = await userAi.generate({
      model: 'gemini-pro',
      prompt: (await assistantPrompt.render(input)).prompt,
    });
    
    return { generatedCode: output as string };
  }
);
