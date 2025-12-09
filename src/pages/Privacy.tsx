import { Link } from "react-router-dom";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link to="/" className="text-sm underline hover:no-underline mb-8 inline-block">
          ← Back to Home
        </Link>
        
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-600 mb-8">Last updated: December 9, 2025</p>
        
        <div className="space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold mb-2">1. Overview</h2>
            <p>
              TripleG.ai ("we", "our", "us") provides a chat interface application that allows users to connect their own AI model API keys. We do not provide, host, or supply any AI models ourselves.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">2. Information We Collect</h2>
            <p className="mb-2">We collect the following information:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Account information (email address, password)</li>
              <li>User preferences and settings</li>
              <li>API keys you provide for third-party AI services</li>
              <li>Chat history and conversation data stored locally or in your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>To provide and maintain our service</li>
              <li>To authenticate your account</li>
              <li>To route your requests to the AI providers you have configured</li>
              <li>To save your preferences and chat history</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">4. Third-Party AI Services</h2>
            <p>
              When you provide API keys for third-party AI services (such as OpenAI, Anthropic, Google, etc.), your conversations are sent directly to those providers. We are not responsible for how those third parties handle your data. Please review the privacy policies of the AI providers you choose to use.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">5. Data Storage & Security</h2>
            <p>
              Your API keys are stored securely and encrypted. We do not share, sell, or rent your personal information to third parties. We implement reasonable security measures to protect your data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Access your personal data</li>
              <li>Delete your account and associated data</li>
              <li>Export your data</li>
              <li>Update or correct your information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">7. Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify users of any material changes by posting the new policy on this page.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">8. Contact</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at support@tripleg.ai
            </p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-200 text-xs text-gray-500">
          <p>© 2025 TripleG.ai. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;

