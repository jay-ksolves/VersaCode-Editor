export default function ApiPage() {
  return (
    <div className="prose dark:prose-invert max-w-none animate-fade-in">
      <h1 className="text-4xl font-bold tracking-tight animate-slide-up" style={{ animationDelay: '0.2s' }}>Extension API Reference</h1>
      <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <p>
          The VersaCode extension API is currently under development. Our goal is to provide a simple yet powerful API that allows developers to extend the IDE with new functionality, themes, and language support, similar to the VS Code extension ecosystem.
        </p>

        <h2>Core Concepts</h2>
        <p>
          The extension API will be built around a few core concepts:
        </p>
        <ul>
          <li>
            <strong>Commands</strong>: Register new commands that can be executed from the command palette or bound to keyboard shortcuts.
          </li>
          <li>
            <strong>Panels & Views</strong>: Add new custom panels to the sidebar or create new views within the main editor area.
          </li>
          <li>
            <strong>Editor Interaction</strong>: Programmatically interact with the Monaco editor to manipulate text, selections, and decorations.
          </li>
          <li>
            <strong>Notifications</strong>: Display informational messages, warnings, or errors to the user.
          </li>
        </ul>
        
        <h2>Coming Soon</h2>
        <p>
          We are actively working on the first version of the API. Stay tuned for more updates and documentation as we build out the extension ecosystem. We believe that a strong extension community is key to making VersaCode a truly versatile tool.
        </p>
      </div>
    </div>
  );
}
