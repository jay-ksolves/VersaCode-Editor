export default function UpdatesPage() {
  return (
    <div className="prose dark:prose-invert max-w-none animate-fade-in">
      <h1 className="text-4xl font-bold tracking-tight animate-slide-up" style={{ animationDelay: '0.2s' }}>What's New in VersaCode</h1>

      <article className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <h2 className="text-2xl font-semibold tracking-tight">Version 1.0.0</h2>
        <p><em>Published: 2024-07-26</em></p>
        
        <h3>Welcome to the Official Release of VersaCode!</h3>
        <p>
          We are thrilled to announce the official 1.0 release of VersaCode. This version includes all the core features needed for a modern, web-based IDE experience, combining a professional-grade editor with powerful, integrated AI tools.
        </p>
        
        <h4>Key Features in This Release:</h4>
        <ul>
          <li>
            <strong>Full IDE Layout</strong>: A beautiful, responsive layout with a sidebar, multi-tab editor group, and a functional bottom panel for terminals and problems.
          </li>
          <li>
            <strong>Complete File Explorer</strong>: Full file and folder management, including create, rename, delete, and drag-and-drop, all persisted to local storage.
          </li>
          <li>
            <strong>Monaco-Powered Editor</strong>: A professional code editor with multi-tab support, syntax highlighting, and per-file undo/redo history.
          </li>
          <li>
            <strong>AI Integration</strong>: Code generation and completion powered by Genkit and Google's Gemini models, seamlessly integrated into your workflow.
          </li>
          <li>
            <strong>Resizable Panels</strong>: A VS Code-like experience for resizing the sidebar, editor, and terminal panels to fit your needs.
          </li>
          <li>
            <strong>Functional Terminal & Problems Panel</strong>: A client-side JavaScript terminal and a problems panel that links directly to your code.
          </li>
        </ul>

        <h3>What's Next?</h3>
        <p>
          Our journey is just beginning. We have big plans for future releases, including a full extension marketplace, real-time collaboration features, and support for more languages and frameworks. Stay tuned!
        </p>
      </article>
    </div>
  );
}
