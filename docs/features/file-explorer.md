# Feature: File Explorer

**ID:** `feature-file-explorer`
**Status:** `Completed`
**Core Components:** `FileExplorer.tsx`, `IdeLayout.tsx`, `hooks/useFileSystem.ts`
**AI Integration:** `Yes`

## 1. Description

The File Explorer provides a user-friendly, VS Code–like tree view of the project's file system. It allows users to navigate, create, select, rename, and delete files and folders directly within the IDE. It also includes an AI-powered "Generate Code" feature to create new files from a natural language prompt. All changes are persisted to `localStorage` to ensure the user's workspace is saved between sessions.

## 2. UI/UX Breakdown

- **Trigger:** The explorer is visible when the "Files" icon in the sidebar is active.
- **Components:**
  - **`FileExplorer.tsx`**: Renders the file tree and action buttons (Generate Code, New File, New Folder). It handles user interactions like inline renaming, delete confirmations, and the AI generation dialog, calling functions from the `useFileSystem` hook.
  - **`IdeLayout.tsx`**: The main parent component that initializes the `useFileSystem` hook and provides the state down to the `FileExplorer` and `CodeEditor`.
  - **`hooks/useFileSystem.ts`**: A custom hook that encapsulates all logic for managing the file system state, including CRUD operations, validation (e.g., duplicate names), and `localStorage` synchronization for both file structure and folder expansion state.
- **Visual Flow:**
  - Users can click on a folder to expand or collapse it; this state is persisted.
  - Clicking a file makes it the "active" file, and its content is loaded into the `CodeEditor`.
  - A context menu (popover) on each item allows for renaming and deleting.
  - Renaming happens inline within the file tree.
  - Deleting an item brings up a confirmation dialog to prevent accidental data loss.

## 3. State Management

- **State:** The entire file system, active file, and expanded folder states are managed by the `useFileSystem` hook.
  - `const { files, activeFileId, expandedFolders, ... } = useFileSystem();` in `IdeLayout.tsx`.
- **Data Flow:**
  - The `files` array and `expandedFolders` set are passed from `IdeLayout` to `FileExplorer`.
  - The content of the file corresponding to `activeFileId` is passed to `CodeEditor`.
  - When the user edits code, the `onChange` handler updates the content of the active file in the main `files` state via a function provided by the hook. This ensures that when the user switches between files, their changes are not lost.
  - All modifications (create, rename, delete, edit, expand/collapse) are immediately saved to `localStorage`.

## 4. AI Integration Details (if applicable)

- **Genkit Flow:** `generateCodeFromPrompt` in `ai/flows/generate-code-from-prompt.ts`
- **Input Schema:** The AI flow accepts a natural language `prompt` and the target `language`.
- **Output Schema:** The flow returns the generated `code` as a string.
- **Interaction Logic:** The "Generate Code" dialog in `FileExplorer` collects the user's prompt and a file name. It calls the flow, then uses the `useFileSystem` hook to create a new file with the AI-generated content and opens it.

## 5. Future Improvements

- [x] Add a right-click context menu for file operations (Rename, Delete).
- [x] Replace prompts with dialogs.
- [x] Implement inline renaming.
- [x] Drag-and-drop functionality for moving files and folders.
- [ ] Integrate with a real backend file system instead of `localStorage`.
- [ ] Show file-specific icons (e.g., a React icon for `.tsx` files).
