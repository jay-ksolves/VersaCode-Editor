# Feature: Code Editor

**ID:** `feature-code-editor`
**Status:** `Completed`
**Core Components:** `CodeEditor.tsx`, `IdeLayout.tsx`, `EditorTabs.tsx`
**AI Integration:** `Yes`

## 1. Description

The Code Editor is the centerpiece of VersaCode, providing a professional-grade coding environment powered by the Monaco Editor—the same editor that powers VS Code. It is a highly performant, feature-rich component that supports syntax highlighting, multi-tab editing, AI-powered assistance, and robust state management to ensure a seamless and reliable user experience.

## 2. UI/UX Breakdown

- **Trigger:** The editor is the main content area of the IDE. A file is opened in the editor by clicking it in the File Explorer or by creating a new file.
- **Components:**
  - **`CodeEditor.tsx`**: A wrapper around the `@monaco-editor/react` component. It is configured with default options for a professional look and feel, such as the "vs-dark" theme and the "JetBrains Mono" font.
  - **`IdeLayout.tsx`**: The central orchestrator. It manages which file is currently active and which Monaco `ITextModel` should be displayed in the editor. It is responsible for creating, caching, and destroying models as files are opened and closed.
  - **`EditorTabs.tsx`**: Renders the tab bar above the editor. It allows users to switch between open files, reorder tabs via drag-and-drop, and close tabs individually, all, or others via a context menu. Double-clicking the empty area of the tab bar creates a new untitled file.
- **Visual Flow:**
  - When a file is selected, its corresponding tab becomes active, and its content is displayed in the editor.
  - The editor provides syntax highlighting based on the file extension.
  - Any unsaved changes were previously marked with a "dirty" indicator, but this has been removed in favor of an auto-save system.
  - Users can trigger AI code suggestions, code formatting, and other actions via the header buttons or keyboard shortcuts.

## 3. State Management

- **`ITextModel` Caching:** This is the most critical aspect of the editor's state management. The `IdeLayout` component maintains a `Map` (`modelsRef`) that caches a unique Monaco `ITextModel` for each opened file ID.
  - **Benefit:** This approach is highly efficient and robust. By keeping the model alive even when a tab is inactive, we preserve the entire editor state for that file, including the **undo/redo history**, cursor position, and scroll position.
- **Active File:** The `activeFileId` state in the `useFileSystem` hook determines which file (and therefore which model) is currently displayed in the editor.
- **Auto-Saving:** The editor is configured to automatically save changes. When the content of a model changes (i.e., the user types), an `onDidChangeContent` listener fires, which calls `updateFileContent` in the `useFileSystem` hook. This hook then immediately persists the entire file system state to the OPFS, ensuring no work is lost.

## 4. AI Integration Details

- **AI Code Suggestion:**
  - **Genkit Flow:** `suggestCodeCompletion` in `ai/flows/ai-suggest-code-completion.ts`.
  - **Trigger:** User presses `Ctrl+Space` or clicks the "Sparkles" icon in the header.
  - **Logic:** The current content of the active editor model is sent to the AI flow. The returned `suggestedCode` is then inserted at the user's current cursor position.
- **AI Code Generation:**
  - **Genkit Flow:** `generateCodeFromPrompt` in `ai/flows/generate-code-from-prompt.ts`.
  - **Trigger:** User clicks the "Generate Code" button in the File Explorer.
  - **Logic:** The AI-generated code is used to create a new file, which is then opened in the editor.
- **AI Assistant Panel:**
    - The AI assistant can read the content of the active file (if selected as context) to provide intelligent refactoring suggestions or answer questions about the code.

## 5. Future Improvements

- [ ] Implement IntelliSense and richer language support via Monaco language services.
- [ ] Add inline diff views for Git integration.
- [ ] Support split-pane editing (viewing multiple files side-by-side).
