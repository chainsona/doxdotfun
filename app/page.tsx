"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const navigateToDoxDotFun = () => {
    router.push('/doxdotfun');
  };

  const navigateToDoxDotFunPaper = () => {
    router.push('https://medium.com/@KibuSolutions');
  };

  const navigateToXProfile = () => {
    router.push('https://x.com/KibuSolutions');
  };

  // Netflix-style gradient overlay
  const GradientOverlay = () => (
    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent z-10" />
  );

  return (
    <main className="min-h-screen bg-black text-white dark:text-white ">
      {/* Hero Section - Netflix style */}
      <section className="relative h-screen">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1741879080222-b9b5f20b3333?q=80&w=2232&auto=format&fit=crop')] bg-cover bg-center opacity-50" />
        <GradientOverlay />
        
        <div className="relative z-20 h-full flex flex-col justify-center px-8 md:px-16 lg:px-32">
          <h1 className="text-5xl md:text-8xl font-bold text-[#ffffff] mb-6 drop-shadow-lg">
            Kibu Solutions
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl text-gray-100 mb-8 drop-shadow-md">
            Blockchain innovators transforming industries with decentralized technology solutions.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={navigateToDoxDotFun}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className={`px-8 py-4 rounded-md font-bold text-lg text-black flex items-center justify-center transition-all duration-300 ${
                isHovered 
                  ? 'bg-[#34c55e] scale-105 shadow-lg'
                  : 'bg-[#86efac]'
              }`}
            >
              Explore doxdotfun
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
            
            <button
              onClick={navigateToDoxDotFunPaper} 
              className="px-8 py-4 bg-black/60 backdrop-blur-md border border-gray-600 rounded-md font-medium text-lg flex items-center justify-center hover:bg-gray-900/80 transition-all duration-300"
            >
              Learn More
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Featured Product Section - Netflix "row" style */}
      <section className="py-16 px-8 md:px-16 lg:px-32 -mt-20 relative z-30">
        <div className="bg-gray-900/80 backdrop-blur-lg rounded-xl p-8 md:p-12 border border-gray-800 shadow-2xl">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-1/2">
              <h2 className="text-3xl md:text-5xl font-bold text-[#86efac] mb-6">
                Introducing <span className="text-[#34c55e]">doxdotfun</span>
              </h2>
              <p className="text-lg md:text-xl text-gray-300 mb-6">
                Exposing serial token deployers on Solana using on-chain analysis, off-chain data, and open APIs. Unmask the bad actors behind Pump.fun rugs.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-[#34c55e] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Maps wallets to IPs and identifies clusters of rug deployers</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-[#34c55e] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Reveals links between wallets and their social activity</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-[#34c55e] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Exposes methodology and growth trends of these serial actors</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-[#34c55e] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Public API to integrate into dashboards or intelligence tools</span>
                </li>
              </ul>
              <button
                onClick={navigateToDoxDotFun}
                className="px-6 py-3 bg-[#86efac] hover:bg-[#34c55e] text-black rounded-lg font-semibold transition duration-300 flex items-center"
              >
                Try doxdotfun now
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="md:w-1/2 relative">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#34c55e] to-[#86efac] rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-200"></div>
                <div className="relative bg-gray-800 rounded-xl p-1 h-full">
                  <img 
                    src="/images/doxdotfun-preview.png" 
                    alt="DoxDotFun interface" 
                    className="rounded-lg w-full h-auto object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Propositions - Card Grid */}
      <section className="py-16 md:py-16 px-8 md:px-16 lg:px-32 mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-[#ffffff]">
          Why Choose Kibu Solutions?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-gray-900/80 backdrop-blur-md rounded-xl p-6 border border-gray-800 hover:border-[#ffffff] transition-all duration-300 hover:-translate-y-2 shadow-lg">
            <div className="bg-[#969696]/10 p-4 rounded-lg w-16 h-16 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#ffffff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-white dark:text-white ">Unbreakable Security</h3>
            <p className="text-gray-300">
              Blockchain's decentralized nature and cryptographic algorithms ensure your documents are protected against tampering and unauthorized access.
            </p>
          </div>
          
          {/* Card 2 */}
          <div className="bg-gray-900/80 backdrop-blur-md rounded-xl p-6 border border-gray-800 hover:border-[#ffffff] transition-all duration-300 hover:-translate-y-2 shadow-lg">
            <div className="bg-[#969696]/10 p-4 rounded-lg w-16 h-16 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#ffffff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-white dark:text-white ">Complete Transparency</h3>
            <p className="text-gray-300">
              Every transaction and document modification is recorded on an immutable ledger, providing full audit trails and accountability.
            </p>
          </div>
          
          {/* Card 3 */}
          <div className="bg-gray-900/80 backdrop-blur-md rounded-xl p-6 border border-gray-800 hover:border-[#ffffff] transition-all duration-300 hover:-translate-y-2 shadow-lg">
            <div className="bg-[#969696]/10 p-4 rounded-lg w-16 h-16 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#ffffff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-white dark:text-white ">Lightning Speed</h3>
            <p className="text-gray-300">
              Smart contracts automate processes that traditionally take days, reducing document handling time from weeks to minutes.
            </p>
          </div>
        </div>
      </section>

      {/* 
      <section className="py-16 px-8 md:px-16 lg:px-32 bg-gradient-to-br from-black to-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-medium mb-12 text-center text-[#86efac]">
            Our Vision for the Future
          </h2>
          
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-1/2">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#34c55e] to-[#86efac] rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
                <div className="relative bg-gray-800 rounded-xl overflow-hidden h-96 w-full">
                  <img 
                    src="https://images.unsplash.com/photo-1741879080222-b9b5f20b3333?q=80&w=2232&auto=format&fit=crop" 
                    alt="Blockchain technology" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
            
            <div className="md:w-1/2 space-y-6">
              <div className="flex items-start">
                <div className="bg-[#34c55e] rounded-full p-2 mr-4 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white dark:text-white " viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-white dark:text-white  mb-2">Decentralized World</h3>
                  <p className="text-gray-300">
                    We envision a future where power is distributed, not concentrated, giving individuals control over their data and digital identities.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-[#34c55e] rounded-full p-2 mr-4 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white dark:text-white " viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-white dark:text-white  mb-2">Trustless Systems</h3>
                  <p className="text-gray-300">
                    Building ecosystems where trust is established through cryptography and consensus, not intermediaries and institutions.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-[#34c55e] rounded-full p-2 mr-4 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white dark:text-white " viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-white dark:text-white  mb-2">Global Impact</h3>
                  <p className="text-gray-300">
                    Our solutions are designed to transcend borders, creating equal opportunities for participation in the digital economy worldwide.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      <section className="py-24 px-8 md:px-16 lg:px-32 bg-gradient-to-r from-[#080808]/10 to-[#969696]/10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1741879080222-b9b5f20b3333?q=80&w=2232&auto=format&fit=crop')] bg-cover bg-center" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white dark:text-white ">
            Ready to Build with us?
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            Join the revolution and experience the power of blockchain technology with Kibu Solutions.
          </p>
          <button
            onClick={navigateToXProfile}
            className="px-10 py-5 bg-[#000000] hover:bg-[#000000] hover:border-2 hover:border-[#ffffff] text-white dark:text-white  rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg"
          >
            Follow us on X
          </button>
        </div>
      </section>
    </main>
  );
}