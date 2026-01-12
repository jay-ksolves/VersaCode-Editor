# Feature: File Explorer

**ID:** `feature-file-explorer`
**Status:** `In Progress`
**Core Components:** `FileExplorer.tsx`, `IdeLayout.tsx`, `hooks/useFileSystem.ts`
**AI Integration:** `No`

## 1. Description

The File Explorer provides a user-friendly, VS Code–like tree view of the project's file system. It allows users to navigate, create, select, rename, and delete files and folders directly within the IDE. All changes are persisted to `localStorage` to ensure the user's workspace is saved between sessions.

## 2. UI/UX Breakdown

- **Trigger:** The explorer is visible when the "Files" icon in the sidebar is active.
- **Components:**
  - **`FileExplorer.tsx`**: Renders the file tree and action buttons (New File, New Folder). It handles user interactions and calls functions from the `useFileSystem` hook.
  - **`IdeLayout.tsx`**: The main parent component that initializes the `useFileSystem` hook and provides the state down to the `FileExplorer` and `CodeEditor`.
  - **`hooks/useFileSystem.ts`**: A custom hook that encapsulates all logic for managing the file system state, including CRUD operations and `localStorage` synchronization.
- **Visual Flow:**
  - Users can click on a folder to expand or collapse it.
  - Clicking a file makes it the "active" file, and its content is loaded into the `CodeEditor`.
  - Buttons at the top of the panel allow for the creation of new files and folders within the currently selected directory (or at the root).

## 3. State Management

- **State:** The entire file system is managed by the `useFileSystem` hook.
  - `const { files, activeFileId, ... } = useFileSystem();` in `IdeLayout.tsx`.
- **Data Flow:**
  - The `files` array (the tree structure) is passed from `IdeLayout` to `FileExplorer`.
  - The content of the file corresponding to `activeFileId` is passed to `CodeEditor`.
  - When the user edits code, the `onChange` handler updates the content of the active file in the main `files` state via a function provided by the hook. This ensures that when the user switches between files, their changes are not lost.
  - All modifications (create, rename, delete, edit) are immediately saved to `localStorage`.

## 4. AI Integration Details (if applicable)

N/A

## 5. Future Improvements

- [ ] Add a right-click context menu for file operations (Rename, Delete).
- [ ] Drag-and-drop functionality for moving files and folders.
- [ ] Integrate with a real backend file system instead of `localStorage`.
- [ ] Show file-specific icons (e.g., a React icon for `.tsx` files).
