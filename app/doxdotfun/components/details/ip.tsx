"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter for navigation
import { format } from "date-fns";

import WhoIsIP from "./whois/ip";

interface Token {
  mint: string;
  name: string;
  symbol: string;
  created_at: string;
}

interface IpDetailsProps {
  ip: string;
  lastSeen: string;
}

export default function IpDetails({ ip, lastSeen }: IpDetailsProps) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [developers, setDevelopers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter(); // Initialize router

  useEffect(() => {
    // Fetch tokens
    fetch(`/doxdotfun/api/ip/tokens/${ip}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setTokens(data.tokens || []);
        }
      })
      .catch((err) => setError(err.message));

    // Fetch developers
    fetch(`/doxdotfun/api/ip/developers/${ip}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setDevelopers(data.developers || []);
        }
      })
      .catch((err) => setError(err.message));
  }, [ip]);

  const handleNavigate = (address: string) => {
    router.push(`/doxdotfun/audit/${address}`); // Navigate to the auditor page
  };

  return (
    <div className="col-span-1 shadow-lg rounded-xl bg-[#15161b]">
      {/* Header */}
      <div className="bg-[#86efac] rounded-t-xl px-6 py-3">
        <h2 className="text-sm font-medium text-black">IP details</h2>
      </div>

      {/* Content */}
      <div className="text-white px-6 py-4 text-xs space-y-4">
        {/* IP Info */}
        <div>
          <p>
            <span className="font-bold text-[#ffffff]">IP:</span> {ip}
          </p>
          <p>
            <span className="font-bold text-[#ffffff]">last seen:</span> {lastSeen}
          </p>
        </div>

        <WhoIsIP ip={ip} bgColor="#1f232e" />
        
        {/* Error Message */}
        {/* {error && <p className="text-red-500">error: {error}</p>} */}

        {/* Tokens Table */}
        <div>
          <div className="bg-[#86efac] rounded-t-xl px-6 py-2 border-b-[1px] border-[#15161b]">
            <h2 className="text-sm font-medium text-black text-center lowercase">
              {tokens.length} {tokens.length === 1 ? "launch" : "launches"}
            </h2>
          </div>
          <div className="relative overflow-x-auto shadow-md rounded-none max-h-60  overflow-y-auto
            [&::-webkit-scrollbar]:w-2
            [&::-webkit-scrollbar]:h-2
            [&::-webkit-scrollbar-track]:rounded-full
            [&::-webkit-scrollbar-track]:bg-gray-100
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-gray-300
            dark:[&::-webkit-scrollbar-track]:bg-neutral-700
            dark:[&::-webkit-scrollbar-track]:rounded-full
            dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500
            bg-transparent scrollbar-thin scrollbar-thumb-[#86efac] scrollbar-track-transparent
            [&::-webkit-scrollbar-corner]:bg-neutral-700
            [&::-webkit-scrollbar-corner]:rounded-none">
            <table className="table-auto w-full border-collapse">
              <colgroup>
                <col className="w-1/8" /> {/* Created At (Smaller) */}
                <col className="w-1/8" /> {/* Name */}
                <col className="w-1/4" /> {/* Symbol (Same as Name) */}
                <col className="w-1/6" /> {/* Developer */}
                <col className="w-1/8" /> {/* Website */}
              </colgroup>
              <thead className="bg-[#86efac] text-black">
                <tr>
                  <th className="px-4 py-2 text-sm text-left font-medium">name</th>
                  <th className="px-4 py-2 text-sm text-left font-medium">symbol</th>
                  <th className="px-4 py-2 text-sm text-left font-medium">mint</th>
                  <th className="px-4 py-2 text-sm text-left font-medium">created at</th>
                  <th className="px-4 py-2 text-sm "></th>
                </tr>
              </thead>
              <tbody>
                {tokens.length > 0 ? (
                  tokens.map((token, index) => (
                  <tr
                    key={index}
                    className={`text-white border-0 border-b-[1px] border-[#86efac] hover:bg-[#393e47] transition ${
                    index % 2 === 0 ? "bg-[#1f232e]" : "bg-[#292d33]"
                    }`}
                  >
                    <td className="px-4 py-2 text-xs">{token.name}</td>
                    <td className="px-4 py-2 text-xs">{token.symbol}</td>
                    <td className="px-4 py-2 text-xs">{token.mint}</td>
                    <td className="px-4 py-2 text-xs text-nowrap">
                    {format(new Date(token.created_at), "yyyy-MM-dd HH:mm")}
                    </td>
                    <td className="p-2 text-xs text-right">
                    <div className="flex justify-end">
                      <a
                        href={`https://pump.fun/coin/${token.mint}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <button
                        className="px-2 py-2 border-[1px] border-[#86efac] hover:bg-[#34c55e] text-black rounded-lg font-semibold flex items-center justify-center"
                        >
                        <img
                          src="https://pump.fun/_next/static/media/logo-pump.80ada4f8.svg"
                          alt="open in pump.fun"
                          className="w-4 h-4"
                        />
                        </button>
                      </a>
                    </div>
                    </td>
                  </tr>
                  ))
                ) : (
                  <tr>
                  <td colSpan={4} className="px-4 py-2 text-gray-400 text-center">
                    no tokens found
                  </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Developers Table */}
        <div>
          <div className="relative overflow-x-auto shadow-md rounded-xl rounded-b-none max-h-60  overflow-y-auto
            [&::-webkit-scrollbar]:w-2
            [&::-webkit-scrollbar]:h-2
            [&::-webkit-scrollbar-track]:rounded-full
            [&::-webkit-scrollbar-track]:bg-gray-100
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-gray-300
            dark:[&::-webkit-scrollbar-track]:bg-neutral-700
            dark:[&::-webkit-scrollbar-track]:rounded-full
            dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500
            bg-transparent scrollbar-thin scrollbar-thumb-[#86efac] scrollbar-track-transparent
            [&::-webkit-scrollbar-corner]:bg-neutral-700
            [&::-webkit-scrollbar-corner]:rounded-none">
            <table className="table-auto w-full border-collapse">
              <colgroup>
                <col className="w-full" /> {/* IP */}
                <col className="w-1/8" /> {/* Rank */}
              </colgroup>
              <thead className="bg-[#86efac] text-black">
                <tr>
                <th className="px-4 py-2 text-sm text-left font-medium">developers</th>
                <th className="px-2 md:px-4 py-2 text-sm text-left"></th>
                </tr>
              </thead>
              <tbody>
                {developers.length > 0 ? (
                  developers.map((developer, index) => (
                    <tr
                      key={index}
                      className={`text-white border-0 border-b-[1px] border-[#86efac] hover:bg-[#393e47] transition ${index % 2 === 0 ? "bg-[#1f232e]" : "bg-[#292d33]"}`}
                    >
                      <td className="px-4 py-2 text-xs">{developer}</td>
                      <td className="px-2 md:px-4 py-2 text-center text-xs flex space-x-2">
                        <a
                            href={`https://solscan.io/account/${developer}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <button
                            className="px-2 py-2 border-[1px] border-[#86efac] hover:bg-[#34c55e] text-black rounded-lg font-semibold flex items-center justify-center"
                            >
                            <img
                                src="/icons/doxdotfun/solscan-logo-light.svg"
                                alt="open in solscan"
                                className="w-4 h-4 min-w-4 min-h-4"
                            />
                            </button>
                        </a>
                        <button
                          onClick={() => handleNavigate(developer)}
                          className="px-3 md:px-4 py-2 bg-[#86efac] hover:bg-[#34c55e] text-black rounded-lg font-medium"
                        >
                          {/* <FaExternalLinkAlt className="mr-2 text-nowrap" /> */}
                          audit
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-2 text-gray-400 text-center">no developers found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}