export default function UpdatesPage() {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <h1>What's New in VersaCode</h1>

      <h2>Version 1.0.0</h2>
      <p><em>Published: 2024-07-26</em></p>
      
      <h3>Welcome to VersaCode!</h3>
      <p>
        The initial release of VersaCode is here! This version includes all the core features needed for a modern, web-based IDE experience.
      </p>
      <ul>
        <li>
          <strong>Full IDE Layout</strong>: A beautiful, responsive layout with a sidebar, editor group, and terminal panel.
        </li>
        <li>
          <strong>File Explorer</strong>: Complete file and folder management, including create, rename, delete, and drag-and-drop, all persisted to local storage.
        </li>
        <li>
          <strong>Monaco-Powered Editor</strong>: A professional code editor with multi-tab support, syntax highlighting, and per-file undo/redo history.
        </li>
        <li>
          <strong>AI Integration</strong>: Code generation and completion powered by Genkit and Google's Gemini models.
        </li>
        <li>
          <strong>Resizable Panels</strong>: A VS Code-like experience for resizing the sidebar, editor, and terminal panels.
        </li>
      </ul>
    </div>
  );
}
