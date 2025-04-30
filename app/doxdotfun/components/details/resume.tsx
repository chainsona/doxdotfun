"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import IpDetails from "./ip";

interface Token {
  mint: string;
  name: string;
  symbol: string;
  created_at: string;
}

interface ResumeProps {
  address: string;
  ip: string;
}

export default function Resume({ address, ip }: ResumeProps) {
  const [ips, setIps] = useState<string[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedIp, setSelectedIp] = useState<{ ip: string; last_seen: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch IPs
    fetch(`/doxdotfun/api/developer/ips/${address}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setIps(data.ips || []);
        }
      })
      .catch((err) => setError(err.message));

    // Fetch Tokens
    fetch(`/doxdotfun/api/developer/tokens/${address}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setTokens(data.tokens || []);
        }
      })
      .catch((err) => setError(err.message));
  }, [address]);

  return (
    <div className="col-span-1 shadow-lg rounded-xl bg-[#15161b]">
      {/* Header */}
      <div className="bg-[#86efac] rounded-t-xl px-6 py-2">
        <h2 className="text-sm font-medium text-black">resume</h2>
      </div>
    {/* Content */}
    <div className="text-white px-6 py-4 text-xs space-y-2">
      {/* Error Message */}
      {/* {error && <p className="text-red-500">Error: {error}</p>} */}

    {/* IPs Section */}
        <div>
            <div className="bg-[#86efac] rounded-t-xl px-6 py-2 border-b-[1px] border-[#15161b]">
                <h2 className="text-sm font-medium text-black text-center lowercase">
                    {ips.length > 0 ? "known IPs" : "no known IPs"}
                </h2>
            </div>
            {ips.length > 0 && (
            <div
                className="relative overflow-x-auto shadow-md rounded-none max-h-60 overflow-y-auto
                [&::-webkit-scrollbar]:w-2
                [&::-webkit-scrollbar]:h-2
                [&::-webkit-scrollbar-track]:rounded-full
                [&::-webkit-scrollbar-track]:bg-gray-100
                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-thumb]:bg-gray-300
                dark:[&::-webkit-scrollbar-track]:bg-neutral-700
                dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500
                bg-transparent scrollbar-thin scrollbar-thumb-[#86efac] scrollbar-track-transparent"
            >
                <table className="table-auto w-full border-collapse">
                    <colgroup>
                        <col className="w-full" /> {/* IP */}
                        <col className="w-1/8" /> {/* Rank */}
                    </colgroup>
                    <thead className="bg-[#86efac] text-black">
                        <tr>
                            <th className="px-4 py-2 text-sm text-left font-medium">IP</th>
                            <th className="px-4 py-2 text-sm text-left"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {ips.map((ip, index) => (
                            <tr
                                key={index}
                                className={`text-white bg-[#1f232e] hover:bg-[#393e47] border-0 border-[#86efac] ${
                                    index === ips.length - 1 ? "border-b-[1px]" : " border-b-[1px]"
                                } transition`}
                            >
                                <td className="px-4 py-2 text-xs">
                                    {ip && ip.length > 25 ? `${ip.slice(0, 25)}...` : ip}
                                </td>
                                <td className="px-4 py-2 text-xs">
                                    <button
                                        className="px-4 py-2 bg-[#86efac] hover:bg-[#34c55e] text-black rounded-lg font-medium"
                                        onClick={() =>
                                            setSelectedIp({
                                                ip: ip.trim(),
                                                last_seen: new Date().toISOString(),
                                            })
                                        }
                                    >
                                        info
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>

        {selectedIp && (
            <div
            className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-80 z-50"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                setSelectedIp(null);
                }
            }}
            >
            <div className="relative w-full max-w-7xl px-4 md:px-4 sm:px-0">
                <button
                className="absolute -top-10 right-4 md:right-4 sm:right-0 px-4 py-2 bg-[#86efac] hover:bg-[#34c55e] text-black rounded-lg font-medium"
                onClick={() => setSelectedIp(null)}
                >
                close
                </button>
                <IpDetails
                ip={selectedIp.ip}
                lastSeen={format(new Date(selectedIp.last_seen), "yyyy-MM-dd HH:mm")}
                />
            </div>
        </div>
        )}

        {/* Tokens Section */}
        <div>
            <div className="bg-[#86efac] rounded-t-xl px-6 py-2 border-b-[1px] border-[#15161b]">
            <h2 className="text-sm font-medium text-black text-center lowercase">
                {tokens.length} {tokens.length === 1 ? "launch" : "launches"}
            </h2>
            </div>
            <div className={`grid ${tokens.length <= 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 md:grid-cols-2"} gap-2 mt-[1px]`}>
            {tokens.length > 0 ? (
                tokens.map((token, index) => (
                <div
                    key={index}
                    className="relative p-4 pt-6 rounded-none shadow-md border-b border-[#86efac] bg-[#1f232e] hover:bg-[#393e47] transition"
                >
                    {token.symbol === token.name ? (
                        <>
                        <strong className="text-sm font-semibold">{token.symbol}</strong>
                        <p className="text-xs text-gray-400 mt-1">
                        {format(new Date(token.created_at), "yyyy-MM-dd HH:mm")}
                        </p>
                        </>
                    ) : (
                        <>
                        <strong className="text-sm font-semibold">{token.symbol}</strong><br/>{token.name}
                        <p className="text-xs text-gray-400 mt-1">
                        {format(new Date(token.created_at), "yyyy-MM-dd HH:mm")}
                        </p>
                        </>
                    )}
                    <div className="absolute top-0 right-0 flex space-x-1 mr-2 mt-1">
                        {/* <p
                            className="px-2 py-2 text-xs cursor-pointer hover:underline"
                            title="click to copy"
                            onClick={() => navigator.clipboard.writeText(token.mint)}
                        >
                            {`${token.mint.slice(0, 4)}...${token.mint.slice(-4)}`}
                        </p> */}
                        
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
                        <a
                            href={`https://solscan.io/token/${token.mint}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <button
                            className="px-2 py-2 border-[1px] border-[#86efac] hover:bg-[#34c55e] text-black rounded-lg font-semibold flex items-center justify-center"
                            >
                            <img
                                src="/icons/doxdotfun/solscan-logo-light.svg"
                                alt="open in solscan"
                                className="w-4 h-4"
                            />
                            </button>
                        </a>
                    </div>
                </div>
                ))
            ) : (
                <></>
            )}
            </div>
        </div>
      </div>
    </div>
  );
}