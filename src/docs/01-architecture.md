# VersaCode: System Architecture

## 1. Core Technology Stack

- **Framework:** [Next.js](https://nextjs.org/) (with App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **UI Components:** [ShadCN/UI](https://ui.shadcn.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Code Editor:** [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- **Generative AI:** [Genkit](https://firebase.google.com/docs/genkit) (with Google AI Plugin)
- **Icons:** [Lucide React](https://lucide.dev/)
- **State Persistence:** Browser `localStorage`

## 2. Frontend Architecture

The frontend is built using the **Next.js App Router**, which allows for a clear separation between Server Components and Client Components.

- **`src/app/(info)/**`**: Routes for static informational pages (landing page, docs, blog, etc.).
- **`src/app/editor/page.tsx`**: The main entry point for the IDE client application. This page renders the core `IdeLayout` component.
- **`src/components/versacode/ide-layout.tsx`**: The heart of the application. This is a large client component that orchestrates the entire IDE interface, including the header, activity bar, panels, editor, and status bar. It manages all major state and interactions.
- **Client Components (`"use client"`):** Used for all interactive UI elements, including the code editor, terminal, buttons, and panels that manage state. Most components within `src/components/versacode` are Client Components.

### State Management

- **File System State:** All file system operations (CRUD, moving, renaming) and state are encapsulated in the `useFileSystem` custom hook (`src/hooks/useFileSystem.ts`). This hook also handles persistence of the file tree, open files, and expanded folders to `localStorage`.
- **UI State:** Global UI state such as the active theme, panel sizes, and open/closed status of panels is managed within `IdeLayout` and persisted to `localStorage` to ensure a consistent workspace between sessions.
- **Editor State (Monaco Models):** The `IdeLayout` component manages the lifecycle of Monaco Editor `ITextModel` instances. A `Map` caches one model per opened file, preserving undo/redo history and editor state across tab switches.

## 3. Directory Structure

The project follows a standard Next.js `src` directory structure:

```
/src
|-- /app                # Next.js routes, layouts, and pages
|   |-- /(info)         # Routes for static informational pages
|   |-- /editor         # The main IDE route
|   `-- page.tsx        # The public landing/download page
|-- /ai                 # Genkit flows for AI features
|   |-- /flows          # Individual AI flow definitions
|   `-- genkit.ts       # Genkit configuration
|-- /components         # Reusable UI components
|   |-- /ui             # Core ShadCN UI components
|   `-- /versacode      # IDE-specific composite components
|-- /hooks              # Custom React hooks (useFileSystem, useToast)
|-- /lib                # Utility functions and libraries
`-- /docs               # Project documentation (you are here)
```

## 4. AI Integration with Genkit

All generative AI functionality is handled through **Genkit flows**, located in `src/ai/flows`.

- **Flow Definition:** Each flow is a server-side function defined with `ai.defineFlow`. It specifies input/output schemas (using Zod) and orchestrates calls to the Gemini LLM.
- **Client-Side Invocation:** Client components, such as `IdeLayout` and `AiAssistantPanel`, call these flows as if they were standard async functions. Next.js server actions handle the communication between the client and the server-side flow.
- **Dynamic API Keys:** The AI Assistant feature (`ai-assistant-flow.ts`) demonstrates a scalable approach where the user provides their own API key. The flow dynamically initializes a temporary Genkit instance with the user's key for that specific request, ensuring security and proper attribution of API usage.
- **Example:** The "Generate Code" feature in `FileExplorer.tsx` calls the `generateCodeFromPrompt` flow, passing a natural language prompt and receiving a generated code snippet. The AI Assistant panel uses the more advanced `aiAssistantFlow` to provide conversational, context-aware coding help.

    