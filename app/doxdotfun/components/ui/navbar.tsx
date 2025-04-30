"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const [searchInput, setSearchInput] = useState(""); // State for the search input
  const [menuOpen, setMenuOpen] = useState(false); // State for mobile menu
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/doxdotfun/audit/${searchInput.trim()}`); // Navigate to the audit page with the entered address
      setSearchInput(""); // Clear the input field
    }
  };

  return (
    <nav className="text-white dark:text-white  p-2 px-4 text-nowrap bg-[#15161b]">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <h1 className="text-xl font-bold">
            <Link href="/doxdotfun" className="flex items-center">
              <Image
                src="/icons/doxdotfun/icon-128.png"
                alt="doxdotfun Logo"
                width={32}
                height={32}
                className="h-8 w-8 mr-2"
              />
              doxdotfun
            </Link>
          </h1>
        </div>

        {/* Search Bar (Desktop Only) */}
        <div className="hidden md:flex flex-1 justify-center">
          <form onSubmit={handleSearch} className="flex items-center space-x-2 w-full max-w-md">
            <input
              type="text"
              placeholder="enter a dev wallet to start auditing"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg text-white dark:text-white  border-[1px] border-[#86efac] bg-[#15161b] placeholder-[#bebebe] text-sm"
              spellCheck={false} // Prevents red underline for bad strings
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#86efac] hover:bg-[#34c55e] text-black rounded-lg font-semibold text-sm"
            >
              search
            </button>
          </form>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex space-x-8">
          <Link href="/doxdotfun" className="hover:underline">
            dashboard
          </Link>
          <Link href="/doxdotfun/leaderboard" className="hover:underline">
            leaderboard
          </Link>
          <Link
            href="/doxdotfun/audit/H8ucHybRS44Tx82Am42QJUL4gVQCtpJRYWrwNJ4WUoiu"
            className="hover:underline"
          >
            audit
          </Link>
          <Link href="/doxdotfun/doxlist" className="hover:underline">
            doxlist
          </Link>
          <Link href="/doxdotfun/api/docs" className="hover:underline">
            docs
          </Link>
        </div>

        {/* Hamburger Menu for Mobile */}
        <button
          className="md:hidden text-white dark:text-white  focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <ul className="md:hidden mt-4 space-y-2 bg-[#15161b] p-4 rounded-lg">
          <li>
            <Link href="/doxdotfun" className="hover:underline block">
              dashboard
            </Link>
          </li>
          <li>
            <Link href="/doxdotfun/leaderboard" className="hover:underline block">
              leaderboard
            </Link>
          </li>
          <li>
            <Link
              href="/doxdotfun/audit/H8ucHybRS44Tx82Am42QJUL4gVQCtpJRYWrwNJ4WUoiu"
              className="hover:underline block"
            >
              audit
            </Link>
          </li>
          <li>
            <Link href="/doxdotfun/api/docs" className="hover:underline block">
              docs
            </Link>
          </li>
        </ul>
      )}

      {/* Mobile Search Bar */}
      <div className="md:hidden mt-4">
        <form onSubmit={handleSearch} className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="enter a dev wallet..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg text-white dark:text-white  border-[1px] border-[#86efac] bg-[#15161b] placeholder-[#bebebe] text-sm"
            spellCheck={false} // Prevents red underline for bad strings
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#86efac] hover:bg-[#34c55e] text-black rounded-lg font-semibold text-sm"
          >
            search
          </button>
        </form>
      </div>
    </nav>
  );
}
