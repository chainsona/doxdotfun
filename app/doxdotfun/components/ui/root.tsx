"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/app/doxdotfun/components/ui/navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); // Get the current route

  const isLandingPage = pathname === "/"; // Check if the current route is the landing page

  return (
    <div className="min-h-screen flex flex-col bg-[#15161b]">
      {!isLandingPage && <Navbar />} {/* Show Navbar only if not on the landing page */}
      <main className="flex-grow">{children}</main>
      
      <div className="flex flex-col items-center justify-end flex-grow pb-8">
        <div className="text-white text-lg mb-4">
          doxdotfun is powered by:
        </div>
        <div className="mb-2 mt-6 flex-row space-y-8 items-center justify-center md:flex md:space-x-64 md:space-y-0 md:mt-2">
          <img src="/icons/doxdotfun/powered/branding-solscan-logo-light.svg" alt="Solscan" className="h-6 text-white" />
          <img src="/icons/doxdotfun/powered/Arkham_Intelligence_logo.svg" alt="Arkham Intelligence" className="h-12" />
        </div>
      </div>

      {!isLandingPage && (
        <footer className="text-white dark:text-white  p-2 px-4 text-center bg-[#15161b] border-t-[1px] border-[#323232] text-sm">
          © doxdotfun 2025. all rights reserved.
        </footer>
      )}
    </div>
  );
}

