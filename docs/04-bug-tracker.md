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

### Terminal does not clear

- **ID:** `BUG-001`
- **Severity:** `P2`
- **Status:** `Open`
- **Assignee:** `N/A`

**Description:**
The terminal accumulates output from multiple "Run" commands but there is no way for the user to clear it.

**Steps to Reproduce:**
1. Click the "Run" button multiple times.
2. Observe that the terminal output grows with each click.

**Expected Behavior:**
There should be a button or command (e.g., `clear`) to wipe the terminal history.

**Actual Behavior:**
The output persists until the page is reloaded.

### Theme toggle is not persisted

- **ID:** `BUG-002`
- **Severity:** `P3`
- **Status:** `Open`
- **Assignee:** `N/A`

**Description:**
The light/dark theme selection is reset every time the page is refreshed.

**Steps to Reproduce:**
1. Click the theme toggle button in the sidebar to switch to the non-default theme.
2. Refresh the browser page.

**Expected Behavior:**
The selected theme should be saved (e.g., in `localStorage`) and reapplied on page load.

**Actual Behavior:**
The IDE reverts to the default system theme.
