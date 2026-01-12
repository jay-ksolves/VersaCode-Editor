# Feature: AI Assistant

**ID:** `feature-ai-assistant`
**Status:** `Completed`
**Core Components:** `AiAssistantPanel.tsx`, `IdeLayout.tsx`, `ai/flows/ai-assistant-flow.ts`
**AI Integration:** `Yes`

## 1. Description

The AI Assistant is a core feature of VersaCode, providing a powerful, conversational coding partner directly within the IDE. It functions similarly to GitHub Copilot Chat, allowing users to ask questions, refactor code, or generate new functionality by providing a natural language prompt. The assistant can be given specific file context, enabling it to provide highly relevant and accurate responses based on the user's actual codebase.

This feature is designed to be scalable and secure by allowing users to provide their own Google AI API key.

## 2. UI/UX Breakdown

- **Trigger:** The user opens the AI Assistant by clicking the "Bot" icon in the Activity Bar. This reveals a dedicated, resizable side panel.
- **Components:**
  - **`AiAssistantPanel.tsx`**: The main UI for the feature. It contains all the necessary inputs and outputs for interacting with the AI.
  - **`IdeLayout.tsx`**: Manages the visibility and state of the AI Assistant panel.
- **Visual Flow:**
  - The user first enters their Google AI API key, which is saved to `localStorage`.
  - The user can then select one or more files from a file tree within the panel to provide as context.
  - They write a detailed prompt in the textarea (e.g., "Refactor the `useFileSystem` hook to be more performant").
  - Clicking "Generate" sends the request to the AI. A loading indicator is shown.
  - The AI's response (either code or text) is displayed in a read-only Monaco Editor instance within the panel for easy viewing and copying.

## 3. State Management

- **API Key:** The user's API key is managed via a `useState` hook in `AiAssistantPanel.tsx` and is persisted to `localStorage`.
- **Selected Files:** The set of file IDs selected for context is managed with a `useState<Set<string>>`.
- **Prompt & Response:** The user's prompt and the AI's response are handled by simple `useState` hooks.
- **Loading State:** A boolean `isGenerating` state is used to disable the "Generate" button and show a loading spinner during the AI request.

## 4. AI Integration Details

- **Genkit Flow:** `aiAssistantFlow` in `src/ai/flows/ai-assistant-flow.ts`.
- **Input Schema:** The flow accepts a `prompt`, an optional `context` string, and the user's `apiKey`.
- **Output Schema:** The flow returns an object containing the `generatedCode` as a string.
- **Interaction Logic:**
  - The `AiAssistantPanel` component gathers the file content for all selected files and concatenates them into a single `context` string.
  - It calls the `runAiAssistant` server action, passing the prompt, context, and API key.
  - The `aiAssistantFlow` on the backend dynamically initializes a new Genkit instance using the provided `apiKey`. This is a critical design choice for security and scalability, ensuring that each user's requests are authenticated with their own credentials.
  - The flow then invokes the Gemini model with a carefully crafted system prompt that instructs it to act as an expert pair programmer.
  - The returned code is then set in the `aiResponse` state and displayed in the read-only editor.

## 5. Future Improvements

- [ ] Implement streaming for the AI response to show results faster.
- [ ] Add a chat history to allow for follow-up questions.
- [ ] Allow the AI to suggest and apply changes directly to files in the editor.
