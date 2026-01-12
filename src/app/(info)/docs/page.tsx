export default function DocsPage() {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <h1>Documentation</h1>
      <p>
        Welcome to the VersaCode documentation. Here you will find guides and references for using and extending the IDE.
      </p>
      <h2>Getting Started</h2>
      <p>
        To get started, simply navigate to the <a href="/editor">Editor</a>. The file explorer on the left provides a view of the virtual file system, which is persisted in your browser's local storage.
      </p>
      <h2>Core Features</h2>
      <ul>
        <li>AI-powered code generation and suggestions.</li>
        <li>Resizable panels and a multi-tab editor.</li>
        <li>In-browser file management with drag-and-drop.</li>
        <li>A mock terminal and problem viewer.</li>
      </ul>
    </div>
  );
}
