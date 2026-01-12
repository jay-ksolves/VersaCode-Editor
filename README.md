
# VersaCode - The AI-Native Web IDE

[![Live Demo](https://img.shields.io/badge/Live_Demo-▲-black?style=for-the-badge&logo=vercel)](https://versa-code-editor.vercel.app/)

VersaCode is a free, open-source, and feature-rich web-based Integrated Development Environment (IDE) designed for the modern developer. It combines the power and familiar interface of desktop editors like VS Code with the accessibility of a web app and the intelligence of generative AI.

![VersaCode IDE Screenshot](https://storage.googleapis.com/firebase-studio-v2-assets/versacode-screenshot.png)

## ✨ Core Features

- **AI-Powered Tools**: Leverage generative AI for code generation from prompts, context-aware code suggestions, and a conversational AI Assistant panel to refactor code or answer questions.
- **Full IDE Experience**: A complete, VS Code-like interface including a file explorer, multi-tab editor, integrated client-side terminal, and a problems/output panel.
- **Customizable Workspace**: A beautiful, responsive layout with resizable and collapsible panels, light and dark themes, and persisted UI state to remember your setup.
- **Complete File Management**: Full file and folder management within the browser's high-performance Origin Private File System (OPFS), including create, rename, delete, drag-and-drop, and the ability to upload your own projects.
- **Monaco-Powered Editor**: A professional code editor with multi-tab support, syntax highlighting, auto-save, per-file undo/redo history, and rich context menus.
- **Keyboard-Driven Workflow**: Access all major functions through a Command Palette (`Ctrl+Shift+P`) and standard keyboard shortcuts.
- **Simulated Source Control**: A fully interactive source control panel that allows you to stage, unstage, and commit changes within the IDE's virtual file system.

## 🚀 Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Components**: [ShadCN/UI](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Code Editor**: [Monaco Editor](https://microsoft.github.io/monaco-editor/) (The editor that powers VS Code)
- **Generative AI**: [Genkit](https://firebase.google.com/docs/genkit) (with Google AI Plugin)
- **State Persistence**: Browser Origin Private File System (OPFS) & `localStorage` for UI state.
- **Testing**: [Playwright](https://playwright.dev/) for End-to-End tests.

## 🏁 Getting Started

To get a local instance of VersaCode running for development:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/jay-ksolves/VersaCode-Editor.git
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd VersaCode-Editor
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```
4.  **Run the development server:**
    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:9002`. The main IDE interface is located at the `/editor` route.

## 🧪 Testing

This project uses Playwright for end-to-end testing. To run the tests:

1.  **Install Playwright browsers:**
    ```bash
    npx playwright install
    ```
2.  **Run the E2E tests:**
    ```bash
    npm run test:e2e
    ```

## 🤝 Contributing

VersaCode is a community-driven project, and contributions are welcome! Please check out the `CONTRIBUTING.md` file and the `/docs` directory to learn more about the project architecture, feature specifications, and how to get involved.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
