
export default function TermsPage() {
  return (
    <div className="prose dark:prose-invert max-w-none animate-fade-in">
      <h1 className="text-4xl font-bold tracking-tight animate-slide-up" style={{ animationDelay: '0.2s' }}>Terms of Use</h1>
      <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <p><em>Last Updated: 2024-07-26</em></p>
        
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing or using VersaCode (the "Service"), you agree to be bound by these Terms of Use ("Terms"). If you do not agree to these Terms, you may not use the Service.
        </p>

        <h2>2. Use of the Service</h2>
        <p>
          VersaCode is provided as a free, open-source web-based Integrated Development Environment. You are permitted to use the Service for personal, educational, and commercial purposes, subject to the terms of its <a href="/license">MIT License</a>.
        </p>

        <h2>3. User-Generated Content</h2>
        <p>
          All code, files, and content you create within the VersaCode IDE ("User Content") are stored locally in your browser's storage. We do not have access to, nor do we store, your User Content on our servers. You are solely responsible for the User Content you create and for backing it up.
        </p>
        
        <h2>4. Prohibited Conduct</h2>
        <p>
          You agree not to use the Service to:
        </p>
        <ul>
          <li>Engage in any activity that is illegal, harmful, or fraudulent.</li>
          <li>Attempt to disrupt or compromise the integrity or security of the Service, even though it runs client-side.</li>
          <li>Create or transmit any content that is infringing, defamatory, or violates the rights of any third party.</li>
        </ul>
        
        <h2>5. Disclaimers</h2>
        <p>
          THE SERVICE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND. WE DISCLAIM ALL WARRANTIES, WHETHER EXPRESS OR IMPLIED, INCLUDING THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
        </p>
        
        <h2>6. Limitation of Liability</h2>
        <p>
          IN NO EVENT SHALL VERSACODE OR ITS CONTRIBUTORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SERVICE OR THE USE OR OTHER DEALINGS IN THE SERVICE.
        </p>

        <h2>7. Changes to Terms</h2>
        <p>
          We may modify these Terms at any time. We will notify you by posting the revised Terms on this page. Your continued use of the Service after such changes constitutes your acceptance of the new Terms.
        </p>
      </div>
    </div>
  );
}
