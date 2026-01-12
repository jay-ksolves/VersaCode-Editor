export default function ApiPage() {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <h1>API Reference</h1>
      <p>
        The VersaCode extension API is currently under development. Our goal is to provide a simple yet powerful API that allows developers to extend the IDE with new functionality, themes, and language support.
      </p>

      <h2>Coming Soon</h2>
      <ul>
        <li>
          <strong>Commands API</strong>: Register new commands to be used in the command palette.
        </li>
         <li>
          <strong>Panels API</strong>: Add new custom panels to the sidebar.
        </li>
        <li>
          <strong>Editor API</strong>: Interact with the Monaco editor to manipulate text and selections.
        </li>
      </ul>
       <p>
        Stay tuned for more updates as we build out the extension ecosystem.
      </p>
    </div>
  );
}
