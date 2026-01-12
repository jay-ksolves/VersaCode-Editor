# VersaCode: System Architecture

## 1. Core Technology Stack

- **Framework:** [Next.js](https://nextjs.org/) (with App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **UI Components:** [ShadCN/UI](https://ui.shadcn.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Code Editor:** [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- **Generative AI:** [Genkit](https://firebase.google.com/docs/genkit) (with Google AI Plugin)
- **Icons:** [Lucide React](https://lucide.dev/)

## 2. Frontend Architecture

The frontend is built using the **Next.js App Router**, which allows for a clear separation between Server Components and Client Components.

- **`src/app/page.tsx`**: A static, server-rendered landing page that serves as the public-facing entry point.
- **`src/app/editor/page.tsx`**: The main entry point for the IDE client application.
- **Client Components (`"use client"`):** Used for all interactive UI elements, including the code editor, terminal, buttons, and panels that manage state. Most components within `src/components/versacode` are Client Components.

### State Management

- **Local Component State:** For state confined to a single component, we use React's built-in hooks: `useState`, `useReducer`, and `useEffect`.
- **File System State:** All file system operations (CRUD, moving, renaming) and state are encapsulated in the `useFileSystem` custom hook (`src/hooks/useFileSystem.ts`). This hook also handles persistence to the browser's high-performance Origin Private File System (OPFS).
- **Editor State (Monaco Models):** The `IdeLayout` component manages the lifecycle of Monaco Editor `ITextModel` instances. A `Map` caches one model per opened file, preserving undo/redo history and editor state across tab switches.

## 3. Directory Structure

The project follows a standard Next.js `src` directory structure:

```
/src
|-- /app                # Next.js routes, layouts, and pages
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
|   |-- /extensions.ts  # The central extension registry
|   `-- /extensions-api.ts # The extension API definition
|-- /extensions         # Individual extension modules
`-- /docs               # Project documentation
```

## 4. AI Integration with Genkit

All generative AI functionality is handled through **Genkit flows**, located in `src/ai/flows`.

- **Flow Definition:** Each flow is a server-side function defined with `ai.defineFlow`. It specifies input/output schemas (using Zod) and orchestrates calls to the Gemini LLM.
- **Client-Side Invocation:** Client components, such as `IdeLayout` and `FileExplorer`, call these flows as if they were standard async functions. Next.js server actions handle the communication between the client and the server-side flow.
- **Example:** The "Generate Code" feature in `FileExplorer.tsx` calls the `generateCodeFromPrompt` flow, passing a natural language prompt and receiving a generated code snippet.

## 5. Extensibility and Command System

VersaCode is designed to be modular through a simple extension system, mirroring the architecture of modern IDEs like VS Code.

- **Extension API (`src/lib/extensions-api.ts`):** This file defines the `VersaCodeExtension` interface, which is the contract for all extensions. The most important part of this interface is the `activate` method.
- **Extension Registry (`src/lib/extensions.ts`):** This acts as a central manifest, importing all individual extension modules (from `src/extensions/`) and exporting them as a single array.
- **Activation on Startup:** When the `IdeLayout` component mounts, it iterates through the extension registry and calls the `activate` method for each one.
- **Command Registration:** The `activate` method receives an `ExtensionContext` object, which includes a `registerCommand` function. Extensions use this function to register commands with the IDE, providing a unique command ID and a callback function to be executed.
- **Command Palette Integration:** The `CommandPalette` component is the primary user interface for commands. When a user selects a command, the `IdeLayout` looks up the command ID in its registry and executes the corresponding callback provided by the extension, making the system fully functional and extensible.
