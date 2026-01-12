# IDE Feature Progress Tracker

This document tracks the implementation status of core IDE features.

## Core Shell & Layout

- [x] Main landing page (VS Code style)
- [x] Basic IDE Layout (Activity Bar, Side Panel, Main Panel, Status Bar) at `/editor` route
- [x] Resizable panels (Side Panel, Editor, Bottom Panel)
- [x] Collapsible Side Panels with persistence
- [x] Command Palette (`Ctrl+Shift+P`)
- [x] Theme Toggle (Light/Dark) - UI present, logic pending
- [x] Persist Theme and Panel State in `localStorage`

## File Explorer Panel (`files`)

- [x] "Open Editors" section in sidebar
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
- [x] File-specific icons based on extension

## Search Panel (`search`)

- [x] UI for global search
- [x] Implement search logic across all files
- [x] Display search results with context
- [x] Link search results to lines in the code editor

## Code Editor

- [x] Monaco Editor integration with stable model management
- [x] Multi-tab support with advanced context menus (Close, Close All, etc.)
- [x] Scrollable editor tabs with drag-and-drop reordering
- [x] AI Code Suggestion (`Ctrl+Space` or button click)
- [x] Displays content of selected file
- [x] Syntax Highlighting
- [x] Per-file undo/redo history
- [x] Per-file dirty state tracking with UI indicator
- [x] Show/Hide Minimap setting
- [x] Code Formatting (via AI)
- [x] AI Code Generation from Prompt
- [x] Double-click tab area to create new untitled file

## Bottom Panel (Terminal / Output)

- [x] Functional Terminal UI with Tabs
- [x] Client-side JavaScript code execution
- [x] "Problems" tab with dynamic data from editor diagnostics
- [x] "Output" tab for logging IDE actions
- [x] Clear terminal output
- [x] Link problems to lines in the code editor
- [x] Close/hide bottom panel
- [x] Multi-terminal support with tabs

## Extensions Panel (`extensions`)

- [x] Mock list of installed extensions
- [ ] Connect to an extension marketplace (deferred for future release)
- [ ] Install / Uninstall extensions (deferred for future release)

## Settings Panel (`settings`)

- [x] UI for theme and editor settings
- [x] Implement setting logic (font size, minimap)
- [x] Reset settings to default
