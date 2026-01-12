# IDE Feature Progress Tracker

This document tracks the implementation status of core IDE features.

## Core Shell & Layout

- [x] Basic IDE Layout (Sidebar, Main Panel, Terminal)
- [x] Collapsible Side Panels
- [x] Theme Toggle (Light/Dark)
- [ ] Persist Theme and Panel State in `localStorage`

## File Explorer Panel (`files`)

- [x] Dynamic File Tree from an in-memory source
- [x] File selection and opening in editor
- [x] Persist file system state in `localStorage`
- [ ] Create, rename, and delete file actions
- [ ] Context menu for file operations

## Code Editor

- [x] Basic Text Area with Line Numbers
- [x] AI Code Suggestion (`Ctrl+Space` or button click)
- [x] Displays content of selected file
- [ ] Syntax Highlighting
- [ ] Code Formatting (via Prettier extension)
- [ ] Show Minimap

## Terminal / Output Panel

- [x] Basic Terminal UI with Tabs
- [x] Mock Code Execution Output
- [x] "Problems" tab with mock data
- [ ] Implement actual code execution environment (e.g., using WebContainers)
- [ ] Clear terminal output
- [ ] Link problems to lines in the code editor

## Extensions Panel (`extensions`)

- [x] Mock list of installed extensions
- [ ] Connect to an extension marketplace
- [ ] Install / Uninstall extensions

## Settings Panel (`settings`)

- [x] Mock UI for theme and editor settings
- [ ] Implement setting logic (e.g., change font size)
- [ ] Reset settings to default

## Tasks Panel (`tasks`)

- [x] Initial UI with mock feature/bug lists
- [ ] Link tasks to progress/bug tracker docs
