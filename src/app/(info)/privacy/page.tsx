
export default function PrivacyPage() {
  return (
    <div className="prose dark:prose-invert max-w-none animate-fade-in">
      <h1 className="text-4xl font-bold tracking-tight animate-slide-up" style={{ animationDelay: '0.2s' }}>Privacy Policy</h1>
      <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <p><em>Last Updated: 2024-07-26</em></p>
        
        <h2 className="text-2xl font-semibold tracking-tight">1. Introduction</h2>
        <p>
          Welcome to VersaCode. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and share information about you when you use our web-based IDE and related services. Since VersaCode is a client-side application, our data handling is minimal and designed with your privacy in mind.
        </p>

        <h2 className="text-2xl font-semibold tracking-tight">2. Information We Collect</h2>
        <p>
          All data VersaCode creates is saved directly in your web browser's <strong>Origin Private File System (OPFS)</strong>. This includes:
        </p>
        <ul>
          <li><strong>File System State:</strong> The virtual files and folders you create, along with their contents, are saved so your work persists between sessions.</li>
          <li><strong>UI State:</strong> Information about your workspace layout, such as which files are open and which folders are expanded in the file explorer.</li>
          <li><strong>API Keys:</strong> If you provide an API key for AI features, it is stored in your browser's Local Storage for your convenience. It is only ever sent directly to the AI provider and never to our servers.</li>
        </ul>
        <p>
          <strong>We do not collect, transmit, or store any of this information on our servers.</strong> It remains entirely on your local machine.
        </p>

        <h2 className="text-2xl font-semibold tracking-tight">3. How We Use Your Information</h2>
        <p>
          The information stored in your browser is used solely to provide and improve your experience with the IDE. Specifically, it allows the application to:
        </p>
        <ul>
          <li>Restore your files and code when you reopen the editor.</li>
          <li>Remember your preferred layout and UI settings.</li>
          <li>Authenticate with third-party AI services on your behalf.</li>
        </ul>

        <h2 className="text-2xl font-semibold tracking-tight">4. Information Sharing</h2>
        <p>
          We do not share any of your data with third parties because we do not have access to it. All your code and settings remain within your browser.
        </p>

        <h2 className="text-2xl font-semibold tracking-tight">5. Your Choices</h2>
        <p>
          You have complete control over your data. You can clear your browser's site data at any time to permanently delete all your files and settings associated with VersaCode.
        </p>
        
        <h2 className="text-2xl font-semibold tracking-tight">6. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.
        </p>
      </div>
    </div>
  );
}
