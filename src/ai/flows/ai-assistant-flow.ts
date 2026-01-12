
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
  prompt: `You are an expert AI pair programmer integrated into a web-based IDE called VersaCode. Your purpose is to help users with their coding tasks by providing accurate, clean, and production-ready code.

You must follow these rules:
1.  **Analyze the Request**: Carefully analyze the user's prompt and any provided file context.
2.  **Use File Context**: If file context is provided, treat it as the primary source of truth for the user's existing code. Your suggestions should be based on this context.
3.  **Provide Complete Code**: When asked to refactor or add a feature, provide the complete, updated code for the file or component. Do not provide partial snippets or diffs unless explicitly asked.
4.  **No Markdown for Code**: When your entire response is a block of code, return only the raw code. Do NOT wrap it in markdown backticks (e.g., \`\`\`typescript ... \`\`\`).
5.  **Explain When Necessary**: If the user asks a question, provide a clear and concise explanation. If you are providing a complex code solution, add a brief explanation *after* the code block.

Here is the file context the user has provided:
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
    // Fall back to the environment variable if no key is provided by the user.
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
