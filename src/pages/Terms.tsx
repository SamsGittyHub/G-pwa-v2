import { Link } from "react-router-dom";

const Terms = () => {
  return (
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link to="/" className="text-sm underline hover:no-underline mb-8 inline-block">
          ← Back to Home
        </Link>
        
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-600 mb-8">Last updated: December 9, 2025</p>
        
        <div className="space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold mb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing or using TripleG.ai ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">2. Description of Service</h2>
            <p>
              TripleG.ai is a chat interface application that allows users to connect and use their own AI model API keys from third-party providers. We do not provide, host, or supply any AI models. The Service acts solely as an interface to AI services you configure.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">3. User Responsibilities</h2>
            <p className="mb-2">You are responsible for:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Providing your own valid API keys from AI providers</li>
              <li>Any costs incurred from third-party AI providers</li>
              <li>Complying with the terms of service of the AI providers you use</li>
              <li>Keeping your account credentials secure</li>
              <li>All content you generate or transmit through the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">4. Prohibited Use</h2>
            <p className="mb-2">You agree not to use the Service to:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Violate any laws or regulations</li>
              <li>Generate harmful, illegal, or abusive content</li>
              <li>Infringe on intellectual property rights</li>
              <li>Attempt to reverse engineer or compromise the Service</li>
              <li>Share your account with unauthorized users</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">5. Disclaimer of Warranties</h2>
            <p>
              THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT GUARANTEE THE ACCURACY, RELIABILITY, OR AVAILABILITY OF THE SERVICE OR ANY AI OUTPUTS GENERATED THROUGH IT.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">6. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, TRIPLEG.AI SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE, INCLUDING BUT NOT LIMITED TO COSTS FROM THIRD-PARTY AI PROVIDERS.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">7. Third-Party Services</h2>
            <p>
              The Service integrates with third-party AI providers. We are not responsible for the content, policies, or practices of these third parties. Your use of third-party services is governed by their respective terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">8. Account Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account at any time for violation of these terms or for any reason at our discretion.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">9. Changes to Terms</h2>
            <p>
              We may modify these terms at any time. Continued use of the Service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">10. Contact</h2>
            <p>
              For questions about these Terms, contact us at support@tripleg.ai
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

export default Terms;

