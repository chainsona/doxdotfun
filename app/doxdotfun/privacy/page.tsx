"use client";

export default function PrivacyPage() {
  return (
    <main className="flex min-h-100 flex-col items-center justify-center px-0 py-4 md:p-8">
      <div className="max-w-4xl w-full px-4">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Overview</h2>
          <p className="mb-4">
            DoxDotFun ("we", "us" or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and disclose information when you use our browser extension and related services (the "Service").
          </p>
          <p className="mb-4">
            Transparency and security are core to our mission. This policy outlines our practices regarding data collection and usage for our Solana wallet analysis tool.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">The Information We Collect</h2>
          <h3 className="text-xl font-medium mb-2">Information You Provide</h3>
          <p className="mb-4">
            When you interact with our Service, you may voluntarily provide:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Wallet addresses you choose to analyze</li>
            <li>Feedback or bug reports submitted to our team</li>
            <li>Contact information if you reach out for support</li>
          </ul>

          <h3 className="text-xl font-medium mb-2">Information We Collect Automatically</h3>
          <p className="mb-4">
            Our Service automatically collects:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Public blockchain data related to analyzed wallet addresses</li>
            <li>Aggregate usage statistics about feature utilization</li>
            <li>Basic diagnostic information to improve service reliability</li>
          </ul>

          <h3 className="text-xl font-medium mb-2">Information from Third Parties</h3>
          <p className="mb-4">
            We may access publicly available information from:
          </p>
          <ul className="list-disc pl-6">
            <li>Blockchain explorers and indexers</li>
            <li>Open APIs providing wallet intelligence data</li>
            <li>Publicly shared social media information</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">How We Use Information</h2>
          <p className="mb-4">
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Provide wallet analysis and risk assessment features</li>
            <li>Improve and optimize our Service's accuracy</li>
            <li>Develop new functionality to combat fraud</li>
            <li>Respond to user inquiries and support requests</li>
          </ul>
          <p>
            We do not sell or rent user data to third parties. All analysis is performed using publicly available blockchain data.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Data Retention</h2>
          <p className="mb-4">
            We retain:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Wallet analysis results temporarily for performance caching</li>
            <li>Support communications for 90 days after resolution</li>
            <li>Aggregate usage statistics indefinitely for service improvement</li>
          </ul>
          <p>
            You can clear locally cached data at any time through your browser settings.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Security</h2>
          <p className="mb-4">
            We implement industry-standard security measures to protect against unauthorized access to or unauthorized alteration, disclosure, or destruction of data.
          </p>
          <p>
            As a browser extension, we recommend users maintain good security practices including using wallet protection tools and verifying all transactions.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
          <p className="mb-4">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
          </p>
          <p>
            You are advised to review this Privacy Policy periodically for any changes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at privacy@doxdotfun.app.
          </p>
        </section>
      </div>
    </main>
  );
}