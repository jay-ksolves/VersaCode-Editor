
# Feature: Command Palette

**ID:** `feature-command-palette`
**Status:** `Completed`
**Core Components:** `CommandPalette.tsx`, `IdeLayout.tsx`, `Header.tsx`
**AI Integration:** `No`

## 1. Description

The Command Palette provides a fast, keyboard-driven way for users to access and execute common IDE commands. It is a central search bar, similar to the one in VS Code, that can be opened with a keyboard shortcut (`Ctrl+Shift+P`). This feature significantly improves workflow efficiency by allowing users to keep their hands on the keyboard.

## 2. UI/UX Breakdown

- **Trigger:** The user can open the command palette by:
  - Pressing the keyboard shortcut `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS).
  - Clicking the "Command Palette" button in the header.
  - Selecting "Command Palette" from the "View" menu in the header.
- **Components:**
  - **`CommandPalette.tsx`**: A dialog component built using `cmdk`. It contains a search input and a list of available commands grouped by category.
  - **`IdeLayout.tsx`**: The main layout component that manages the open/closed state of the command palette and provides a central `handleCommand` function to execute actions based on the selected command's ID.
  - **`Header.tsx`**: Contains a button in the top-right and a menu item in the "View" menu to open the palette.
- **Visual Flow:**
  - When triggered, a dialog box appears at the top-center of the screen.
  - The user can type to filter the list of available commands.
  - Pressing `Enter` or clicking on a command executes the associated action and closes the palette.

## 3. State Management

- **State Variables:**
  - `const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);` // Located in `IdeLayout.tsx`
- **Data Flow:**
  - The `isCommandPaletteOpen` state and `setIsCommandPaletteOpen` setter are passed from `IdeLayout` to the `CommandPalette` component and the `Header`.
  - When a user selects a command, the `CommandPalette` calls the `onCommand` prop with the command's unique ID (e.g., `'file:new'`).
  - The `handleCommand` function in `IdeLayout` uses a `switch` statement to determine which action to execute (e.g., calling `handleNewFile()`).

## 4. Future Improvements

- [ ] Add more commands (e.g., Git commands, theme toggling).
- [ ] Implement a "recently used" section.
- [ ] Allow extensions to register their own commands.
