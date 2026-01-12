# Bug Tracker

This document provides a structured way to report and track bugs. All bugs should be logged here before being worked on.

## Severity Levels

- **P0 (Critical):** Blocks development or testing, or causes a major crash. No workaround exists. Must be fixed immediately.
- **P1 (High):** A core feature is not functioning correctly, or user experience is severely degraded.
- **P2 (Medium):** A non-critical feature is malfunctioning, or a P1 bug has a reasonable workaround.
- **P3 (Low):** A cosmetic issue, typo, or minor inconvenience.

## Bug Report Template

When adding a new bug, please use the following format.

---

### [Bug Title]

- **ID:** `BUG-XXX`
- **Severity:** `[P0 | P1 | P2 | P3]`
- **Status:** `[Open | In Progress | Resolved | Won't Fix]`
- **Assignee:** `[GitHub Username]`

**Description:**
A clear, concise description of the bug.

**Steps to Reproduce:**
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior:**
A clear and concise description of what you expected to happen.

**Actual Behavior:**
A clear and concise description of what actually happened. Include screenshots or logs if possible.

---

## Current Bugs

All known bugs for the 1.0 release have been resolved.

### Terminal output prop was missing

- **ID:** `BUG-005`
- **Severity:** `P0`
- **Status:** `Resolved`
- **Assignee:** `N/A`

**Description:**
A runtime error `TypeError: Cannot read properties of undefined (reading 'length')` would crash the application when viewing the "Output" tab in the terminal. The `output` prop was mistakenly removed from the `<Terminal>` component in `IdeLayout`. The prop has been restored, fixing the crash.

### Upload Folder State Bug

- **ID:** `BUG-004`
- **Severity:** `P1`
- **Status:** `Resolved`
- **Assignee:** `N/A`

**Description:**
When a user uploads a new project folder, the file explorer's expansion state was not correctly reset, causing a `ReferenceError: setExpandedFolders is not defined`. The `useFileSystem` hook has been updated to correctly expose this setter, and the `IdeLayout` now properly resets the view on upload.

### File/Folder Creation Bugs

- **ID:** `BUG-003`
- **Severity:** `P1`
- **Status:** `Resolved`
- **Assignee:** `N/A`

**Description:**
Creating new files or folders in nested directories was unreliable. The logic for determining the parent folder and updating the UI has been completely overhauled and fixed.

### Theme toggle is not persisted

- **ID:** `BUG-002`
- **Severity:** `P3`
- **Status:** `Resolved`
- **Assignee:** `N/A`

**Description:**
The light/dark theme selection was reset on every page refresh. This is now persisted in `localStorage`.

### Terminal does not clear

- **ID:** `BUG-001`
- **Severity:** `P2`
- **Status:** `Resolved`
- **Assignee:** `N/A`

**Description:**
The terminal accumulates output from multiple "Run" commands but there is no way for the user to clear it. A "Clear" button has been added.
