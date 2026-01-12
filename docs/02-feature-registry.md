# Feature Registry & Documentation Standard

Every new feature implemented in VersaCode must be documented according to the following standard. This ensures consistency and makes it easier for other contributors to understand and build upon existing work.

Create a new markdown file in `/docs/features` for each distinct feature.

---

## Feature Documentation Template

```markdown
# Feature: [Feature Name]

**ID:** `[unique-feature-id]`
**Status:** `[Not Started | In Progress | Completed | Deprecated]`
**Core Components:** `[List of primary React components involved, e.g., CodeEditor.tsx, Header.tsx]`
**AI Integration:** `[Yes | No | Partial]`

## 1. Description

A clear and concise description of what this feature does and the problem it solves for the user. Explain its primary purpose and user-facing behavior.

## 2. UI/UX Breakdown

- **Trigger:** How does the user activate or interact with this feature? (e.g., "User clicks the 'Run' button in the header.")
- **Components:** Detail the roles of the core components involved.
  - **`ComponentA.tsx`**: Responsible for rendering the main UI and handling user input.
  - **`ComponentB.tsx`**: Displays the output or result of the feature's action.
- **Visual Flow:** Describe the sequence of events from the user's perspective.

## 3. State Management

- **State Variables:** List the key state variables associated with this feature.
  - `const [code, setCode] = useState<string>('');` // Located in `IdeLayout.tsx`
- **Data Flow:** Explain how data flows between components. (e.g., "The `code` state is passed from `IdeLayout` down to `CodeEditor` as a prop. The `onChange` callback updates the state in the parent.")

## 4. AI Integration Details (if applicable)

- **Genkit Flow:** Specify the Genkit flow used. (e.g., `suggestCodeCompletion` in `ai/flows/ai-suggest-code-completion.ts`)
- **Input Schema:** What data is passed to the AI flow?
- **Output Schema:** What data is expected back from the AI?
- **Interaction Logic:** How is the AI's response handled and integrated back into the UI?

## 5. Future Improvements

- [ ] A checklist of potential enhancements or related features to be added later.
```
