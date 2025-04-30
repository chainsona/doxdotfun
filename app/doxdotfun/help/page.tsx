"use client";

export default function HelpPage() {
  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-8 md:p-12">
    <div className="max-w-4xl col-span-1 shadow-lg rounded-xl bg-[#15161b]">
        <div className="bg-[#86efac] rounded-t-xl px-6 py-2">
            <h1 className="text-sm font-bold text-black">doxdotfun help center</h1>
        </div>
        
        <div className="bg-[#1f232e] px-6 py-4">
          <section className="">
            <h2 className="text-2xl font-semibold mb-2 text-white">getting started</h2>
            <div className="space-y-8 mb-8">
              <div className="">
                <h3 className="text-md font-medium mb-2 text-white">browser extension</h3>
                <p className="mb-2">install our extension to access wallet intelligence directly in your browser:</p>
                <ul className="list-none pl-6 mb-2 space-y-1">
                  <li><a href="#" className="text-[#86efac] hover:underline">Chrome web store</a></li>
                  <li><a href="#" className="text-[#86efac] hover:underline">Firefox add-ons</a></li>
                </ul>
                <p>after installation, the extension will automatically audit tokens and deployers on pump.fun pages.</p>
              </div>
              
              <div className="">
              <h2 className="text-2xl font-semibold mb-2 text-white">basic usage</h2>
                <ol className="list-decimal pl-6 space-y-2 lowercase">
                  <li>Navigate to any Solana dApp or blockchain explorer</li>
                  <li>Look for wallet addresses or token pages</li>
                  <li>Click the DoxDotFun icon to reveal intelligence</li>
                  <li>View risk indicators, associated wallets, and activity patterns</li>
                </ol>
              </div>
            </div>
          </section>

          <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2 text-white">features guide</h2>
            <div className="grid md:grid-cols-2 gap-6">
            <div className="max-w-4xl col-span-1 shadow-lg rounded-xl bg-[#15161b]">
                <div className="bg-[#86efac] rounded-t-xl px-6 py-2">
                    <h1 className="text-sm font-bold text-black">wallet analysis</h1>
                </div>
                <div className="p-4">
                  <p className="lowercase">View detailed profiles of any Solana wallet including:</p>
                  <ul className="list-none pl-5 mt-2 space-y-1">
                    <li>associated IP addresses</li>
                    <li className="lowercase">Known social media connections</li>
                    <li className="lowercase">Token deployment history</li>
                    <li className="lowercase">Cluster relationships</li>
                  </ul>
                </div>
              </div>
              
            <div className="max-w-4xl col-span-1 shadow-lg rounded-xl bg-[#15161b]">
                <div className="bg-[#86efac] rounded-t-xl px-6 py-2">
                    <h1 className="text-sm font-bold text-black">API access</h1>
                </div>
                <div className="p-4">
                <p>integrate our intelligence into your tools:</p>
                <ul className="list-none pl-5 mt-2 space-y-1 lowercase">
                  <li>Real-time wallet scoring</li>
                  <li>Batch analysis endpoints</li>
                  <li>Historical pattern matching</li>
                </ul>
                <a href="/doxdotfun/api/docs" className="mt-2 inline-block text-[#86efac] hover:underline">
                  view API documentation →
                </a>
                </div>
              </div>
              
            <div className="max-w-4xl col-span-1 shadow-lg rounded-xl bg-[#15161b]">
                <div className="bg-[#86efac] rounded-t-xl px-6 py-2">
                    <h1 className="text-sm font-bold text-black">risk indicators</h1>
                </div>
                <div className="p-4">
                <p className="lowercase">Our system flags potential risks including:</p>
                <ul className="list-none pl-5 mt-2 space-y-1 lowercase">
                  <li>Serial token deployers</li>
                  <li>Known rug pull patterns</li>
                  <li>Suspicious transaction flows</li>
                  <li>Cluster behavior anomalies</li>
                </ul>
                </div>
              </div>

            <div className="max-w-4xl col-span-1 shadow-lg rounded-xl bg-[#15161b]">
                <div className="bg-[#86efac] rounded-t-xl px-6 py-2">
                    <h1 className="text-sm font-bold text-black">social connections</h1>
                </div>
                <div className="p-4">
                <p className="lowercase">discover off-chain connections:</p>
                <ul className="list-none pl-5 mt-2 space-y-1 ">
                  <li>X handles</li>
                  <li>Telegram usernames</li>
                  <li>Discord associations</li>
                  <li className=" lowercase">Other web2 identities</li>
                </ul>
              </div>
              </div>
            </div>
          </section>

          {/* <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-2 text-white">troubleshooting</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2 text-white">Extension Not Working?</h3>
                <ul className="list-none pl-6 space-y-1">
                  <li>Ensure you're on a supported Solana dApp page</li>
                  <li>Refresh the page after installing the extension</li>
                  <li>Check that the extension is enabled in your browser</li>
                  <li>Try disabling other wallet extensions temporarily</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2 text-white">Data Not Loading?</h3>
                <ul className="list-none pl-6 space-y-1">
                  <li>Check your internet connection</li>
                  <li>Verify the wallet address is valid</li>
                  <li>Wait a few moments as some analyses take time</li>
                  <li>Some new wallets may have limited available data</li>
                </ul>
              </div>
            </div>
          </section> */}

          <section className="mb-4">
            <h2 className="text-2xl font-semibold mb-4 text-white">community & support</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2 text-white">contact us</h3>
                <p className="mb-2">for direct support:</p>
                <ul className="space-y-1">
                  <li>email: <a href="mailto:kibu.solutions@gmail.com" className="text-[#86efac] hover:underline">kibu.solutions@gmail.com</a></li>
                  <li>X: <a href="https://twitter.com/KibuSolutions" target="_blank" rel="noopener noreferrer" className="text-[#86efac] hover:underline">@KibuSolutions</a></li>
                  {/* <li>Telegram: <a href="https://t.me/doxdotfun" target="_blank" rel="noopener noreferrer" className="text-[#86efac] hover:underline">@doxdotfun</a></li> */}
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2 text-white">contribute on GitHub</h3>
                <p>help improve doxdotfun:</p>
                <ul className="list-none pl-6 mt-2 space-y-1 lowercase">
                  <li>Report suspicious wallets</li>
                  <li>Submit bug reports</li>
                  <li>Suggest new features</li>
                  <li>Contribute to our open-source components</li>
                </ul>
              </div>
            </div>
          </section>

          {/* <section className="pt-4 border-t">
            <h2 className="text-xl font-semibold mb-2 text-white">need more help?</h2>
            <p className="mb-4">Check out our <a href="/faq" className="text-[#86efac] hover:underline">FAQ page</a> or join our community discussions.</p>
            <p>for security reports, please contact <a href="mailto:security@doxdotfun.app" className="text-[#86efac] hover:underline">security@doxdotfun.app</a></p>
          </section> */}
        </div>
      </div>
    </main>
  );
}