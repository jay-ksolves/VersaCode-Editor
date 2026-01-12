# Feature: File Explorer

**ID:** `feature-file-explorer`
**Status:** `Completed`
**Core Components:** `FileExplorer.tsx`, `IdeLayout.tsx`, `hooks/useFileSystem.ts`
**AI Integration:** `Yes`

## 1. Description

The File Explorer provides a user-friendly, VS Code–like tree view of the project's file system. It allows users to navigate, create, select, rename, and delete files and folders directly within the IDE. It also includes an AI-powered "Generate Code" feature to create new files from a natural language prompt. All changes are persisted to the browser's high-performance Origin Private File System (OPFS) to ensure the user's workspace is saved between sessions.

## 2. UI/UX Breakdown

- **Trigger:** The explorer is visible when the "Files" icon in the sidebar is active.
- **Components:**
  - **`FileExplorer.tsx`**: Renders the file tree and action buttons (Generate Code, New File, New Folder, Refresh). It handles user interactions like inline renaming, delete confirmations, AI generation, context menus, and drag-and-drop gestures.
  - **`IdeLayout.tsx`**: The main parent component that initializes the `useFileSystem` hook and provides the state down to the `FileExplorer` and `CodeEditor`.
  - **`hooks/useFileSystem.ts`**: A custom hook that encapsulates all logic for managing the file system state, including CRUD operations, drag-and-drop (`moveNode`), validation, and OPFS synchronization.
- **Visual Flow:**
  - Users can click on a folder to expand or collapse it; this state is persisted. The folder icon changes to reflect its state.
  - Clicking a file makes it the "active" file, and its content is loaded into the `CodeEditor`.
  - A right-click context menu on each item allows for renaming and deleting.
  - Renaming happens inline within the file tree.
  - Deleting an item brings up a confirmation dialog to prevent accidental data loss.
  - Files and folders can be dragged and dropped to reorganize the project structure.

## 3. State Management

- **State:** The entire file system, active file, and expanded folder states are managed by the `useFileSystem` hook.
  - `const { files, activeFileId, expandedFolders, ... } = useFileSystem();` in `IdeLayout.tsx`.
- **Data Flow:**
  - The `files` array and `expandedFolders` set are passed from `IdeLayout` to `FileExplorer`.
  - The content of the file corresponding to `activeFileId` is passed to `CodeEditor` by managing Monaco `ITextModel` instances.
  - When the user edits code, the `onChange` handler updates the content of the active file in the main `files` state via a function provided by the hook. This ensures that when the user switches between files, their changes are not lost.
  - All modifications are immediately saved to the OPFS.

## 4. AI Integration Details

- **Genkit Flow:** `generateCodeFromPrompt` in `ai/flows/generate-code-from-prompt.ts`
- **Input Schema:** The AI flow accepts a natural language `prompt` and the target `language`.
- **Output Schema:** The flow returns the generated `code` as a string.
- **Interaction Logic:** The "Generate Code" dialog in `FileExplorer` collects the user's prompt and a file name. It calls the flow, then uses the `useFileSystem` hook to create a new file with the AI-generated content and opens it in the editor.

## 5. Future Improvements

- [ ] Show file-specific icons (e.g., a React icon for `.tsx` files).
- [ ] Add "Copy Path" and "Reveal in Finder" options to the context menu.
- [ ] Integrate with a real remote Git repository.
