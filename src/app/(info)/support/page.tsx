
export default function SupportPage() {
  return (
    <div className="prose dark:prose-invert max-w-none animate-fade-in">
      <h1 className="text-4xl font-bold tracking-tight animate-slide-up" style={{ animationDelay: '0.2s' }}>Support</h1>
      <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <p>
          Thank you for using VersaCode. As an open-source project, our support is community-driven. Here are the best ways to get help, report issues, and get involved.
        </p>
        
        <h2>Documentation</h2>
        <p>
          Before seeking help, please check our <a href="/docs">Documentation</a>. It provides comprehensive guides on getting started, core features, and the project's architecture.
        </p>

        <h2>Reporting Bugs</h2>
        <p>
          If you've found a bug, the best way to report it is by opening an issue on our GitHub repository. Please provide as much detail as possible, including:
        </p>
        <ul>
          <li>A clear and descriptive title.</li>
          <li>Steps to reproduce the bug.</li>
          <li>What you expected to happen.</li>
          <li>What actually happened (including screenshots or console errors if possible).</li>
        </ul>
        <p>
          <a href="#" className="text-primary hover:underline">Report a Bug on GitHub</a>
        </p>

        <h2>Feature Requests</h2>
        <p>
          Have an idea for a new feature? We'd love to hear it! Please open an issue on GitHub with the "feature request" label. Describe the feature and why you think it would be a valuable addition to VersaCode.
        </p>
        <p>
          <a href="#" className="text-primary hover:underline">Request a Feature on GitHub</a>
        </p>
        
        <h2>Community & Contributions</h2>
        <p>
          VersaCode is built by the community, for the community. If you're interested in contributing, check out our contribution guidelines on GitHub. We welcome contributions of all kinds, from code and documentation to design and testing.
        </p>
      </div>
    </div>
  );
}
