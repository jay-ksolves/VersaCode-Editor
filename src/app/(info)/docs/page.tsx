export default function DocsPage() {
  return (
    <div className="prose dark:prose-invert max-w-none animate-fade-in">
      <h1 className="text-4xl font-bold tracking-tight animate-slide-up" style={{ animationDelay: '0.2s' }}>Documentation</h1>
      <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <p>
          Welcome to the VersaCode documentation. Here you will find guides and API references for using and extending the IDE. Our goal is to provide a comprehensive resource for both users and contributors.
        </p>
        
        <h2>Getting Started</h2>
        <p>
          To get started with VersaCode, simply navigate to the <a href="/editor">Editor</a>. The IDE is designed to be intuitive, with a familiar layout for anyone who has used modern code editors. The file explorer on the left provides a view of a virtual file system, which is persisted in your browser's local storage, so your work is saved between sessions.
        </p>
        
        <h2>Core Features</h2>
        <p>
          VersaCode is packed with features designed for modern web development:
        </p>
        <ul>
          <li><strong>AI-Powered Tools</strong>: Leverage generative AI for code generation, suggestions, and formatting.</li>
          <li><strong>Resizable Panels</strong>: Customize your workspace with a VS Code–like resizable layout for the sidebar, editor, and terminal.</li>
          <li><strong>Complete File Management</strong>: Create, rename, delete, and organize files and folders with a drag-and-drop interface.</li>
          <li><strong>Functional Terminal</strong>: A client-side terminal for executing JavaScript commands and viewing logs.</li>
          <li><strong>Problem Detection</strong>: Real-time code analysis that highlights errors and warnings directly in your editor and the "Problems" panel.</li>
        </ul>
        
        <h2>For Contributors</h2>
        <p>
          Interested in contributing? VersaCode is an open-source project, and we welcome contributions of all kinds. Check out our project architecture and feature registry to learn more about how you can get involved.
        </p>
      </div>
    </div>
  );
}
