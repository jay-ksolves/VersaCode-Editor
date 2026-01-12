# Feature: IDE Layout & Resizable Panels

**ID:** `feature-panels-and-layout`
**Status:** `Completed`
**Core Components:** `IdeLayout.tsx`, `ActivityBar.tsx`, `StatusBar.tsx`, `Terminal.tsx`, `resizable.tsx`
**AI Integration:** `No`

## 1. Description

The core layout of VersaCode is designed to be familiar, functional, and flexible, mirroring the professional experience of modern desktop IDEs like VS Code. It consists of several key regions: an Activity Bar, a Side Panel, a Main Editor Group, a Bottom Panel, and a Status Bar. The panels are resizable and their states (sizes and open/closed status) are persisted to `localStorage`, providing a customizable and consistent workspace for the user.

## 2. UI/UX Breakdown

- **Regions:**
  - **`ActivityBar`**: A narrow vertical bar on the far left containing icons to switch between the main side panels (Files, Search, AI, Extensions, Settings).
  - **`Side Panel`**: A collapsible panel whose content is determined by the active icon in the Activity Bar. It can be completely hidden by pressing `Ctrl+B` or by clicking the active icon again.
  - **`Main Panel Group`**: The central area of the IDE, containing the editor tabs and the code editor itself.
  - **`Bottom Panel`**: A collapsible panel at the bottom, typically containing the Terminal, Problems, and Output tabs.
  - **`StatusBar`**: A thin bar at the very bottom of the window that displays contextual information like the current Git branch, problem counts, and language mode.
- **Interactivity:**
  - **Resizing:** Users can drag the handles between the Side, Main, and Bottom panels to resize them to their liking.
  - **Collapsing:** The Side Panel can be collapsed by dragging it to its minimum size or using the `Ctrl+B` shortcut. The Bottom Panel can be closed via a button in its header.
- **Components:**
  - **`IdeLayout.tsx`**: The master component that assembles all the layout regions using the `react-resizable-panels` library. It manages the open/closed state of panels and orchestrates which content (e.g., `FileExplorer`) is shown in the Side Panel.
  - **`ActivityBar.tsx`**: Renders the primary navigation icons and controls the `activePanel` state in `IdeLayout`.
  - **`StatusBar.tsx`**: A simple display component that receives data (like problem counts) as props.
  - **`Terminal.tsx`**: Manages the tabbed interface within the Bottom Panel.

## 3. State Management

- **Panel Sizes:** The `ResizablePanelGroup` component from `react-resizable-panels` handles the resizing logic internally. We persist the sizes to `localStorage` via the `onLayout` callback, saving the state under keys like `versacode-main-layout` and `versacode-side-layout`.
- **Panel Visibility:**
  - The `activePanel` state variable (`'files'`, `'search'`, `'none'`, etc.) in `IdeLayout` determines which component is rendered in the Side Panel. Setting it to `'none'` effectively hides the panel's content.
  - The `isBottomPanelOpen` state (`true`/`false`) controls the visibility of the Bottom Panel.
- **Persistence:** All key UI states—the active panel, the open/closed status of the bottom panel, and the sizes of all resizable panels—are saved to `localStorage` within the `IdeLayout` component. This ensures the user's customized layout is restored every time they open the IDE.

## 4. Future Improvements

- [ ] Allow panels to be dragged and dropped into different locations (e.g., moving the terminal to the side).
- [ ] Support splitting the editor panel to view multiple files simultaneously.
- [ ] Add more items and interactivity to the Status Bar.
