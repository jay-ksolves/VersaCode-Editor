# VersaCode: System Architecture

## 1. Core Technology Stack

- **Framework:** [Next.js](https://nextjs.org/) (with App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **UI Components:** [ShadCN/UI](https://ui.shadcn.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Generative AI:** [Genkit](https://firebase.google.com/docs/genkit) (with Google AI Plugin)
- **Icons:** [Lucide React](https://lucide.dev/)

## 2. Frontend Architecture

The frontend is built using the **Next.js App Router**, which allows for a clear separation between Server Components and Client Components.

- **Server Components:** Used for static layout elements and data fetching that doesn't require client-side interactivity. The main page layouts and panels are initially rendered on the server.
- **Client Components (`"use client"`):** Used for all interactive UI elements, including the code editor, terminal, buttons, and panels that manage state. Most components within `src/components/versacode` are Client Components.

### State Management

- **Local Component State:** For state confined to a single component, we use React's built-in hooks: `useState`, `useReducer`, and `useEffect`.
- **Shared/Global State:** For state that needs to be shared across the IDE (e.g., active file, theme, terminal output), we use `React.Context` combined with hooks. The `IdeLayout` component acts as the primary state provider.

## 3. Directory Structure

The project follows a standard Next.js `src` directory structure:

```
/src
|-- /app            # Next.js routes, layouts, and pages
|-- /ai             # Genkit flows for AI features
|   |-- /flows      # Individual AI flow definitions
|   `-- genkit.ts   # Genkit configuration
|-- /components     # Reusable UI components
|   |-- /ui         # Core ShadCN UI components
|   `-- /versacode  # IDE-specific composite components
|-- /hooks          # Custom React hooks (e.g., useToast)
|-- /lib            # Utility functions and libraries
`-- /docs           # Project documentation
```

## 4. AI Integration with Genkit

All generative AI functionality is handled through **Genkit flows**, located in `src/ai/flows`.

- **Flow Definition:** Each flow is a server-side function defined with `ai.defineFlow`. It specifies input/output schemas (using Zod) and orchestrates calls to the Gemini LLM.
- **Client-Side Invocation:** Client components, such as `IdeLayout`, can call these flows as if they were standard async functions. Next.js server actions handle the communication between the client and the server-side flow.
- **Example:** The "Suggest Code" feature in `Header.tsx` calls the `suggestCodeCompletion` flow, passing the current code context and receiving a completion snippet.
