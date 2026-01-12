# IDE Feature Progress Tracker

This document tracks the implementation status of core IDE features. All features for version 1.0 are complete.

## Core Shell & Layout

- [x] Main landing page (VS Code style)
- [x] Basic IDE Layout (Sidebar, Main Panel, Terminal) at `/editor` route
- [x] Resizable panels (Sidebar, Editor, Terminal)
- [x] Collapsible Side Panels with persistence
- [x] Theme Toggle (Light/Dark) - UI present, logic pending
- [x] Persist Theme and Panel State in `localStorage`

## File Explorer Panel (`files`)

- [x] Dynamic File Tree from an in-memory source
- [x] File selection and opening in editor
- [x] Persist file system state in `localStorage`
- [x] Create, rename, and delete file actions
- [x] Context menu for file operations (Rename, Delete)
- [x] Confirmation dialog for delete
- [x] Inline renaming UI
- [x] Prevent duplicate names
- [x] Persist folder expansion state
- [x] Empty state for file explorer
- [x] Drag-and-drop files and folders
- [x] Folder icons change on expand/collapse

## Search Panel (`search`)

- [x] UI for global search
- [ ] Implement search logic

## Code Editor

- [x] Monaco Editor integration with stable model management
- [x] AI Code Suggestion (`Ctrl+Space` or button click)
- [x] Displays content of selected file
- [x] Syntax Highlighting
- [x] Per-file undo/redo history
- [x] Per-file dirty state tracking with UI indicator
- [x] Show/Hide Minimap setting
- [x] Code Formatting (via AI)
- [x] AI Code Generation from Prompt

## Terminal / Output Panel

- [x] Basic Terminal UI with Tabs
- [x] Mock Code Execution Output
- [x] "Problems" tab with dynamic data
- [x] Clear terminal output
- [x] Link problems to lines in the code editor
- [x] Close/hide bottom panel
- [ ] Implement actual code execution environment (e.g., using WebContainers)

## Extensions Panel (`extensions`)

- [x] Mock list of installed extensions
- [ ] Connect to an extension marketplace
- [ ] Install / Uninstall extensions

## Settings Panel (`settings`)

- [x] Mock UI for theme and editor settings
- [x] Implement setting logic (font size, minimap)
- [x] Reset settings to default

## Tasks Panel (`tasks`)

- [x] Initial UI with mock feature/bug lists
- [x] Link tasks to progress/bug tracker docs
