"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import Spinner from "@/app/doxdotfun/components/ui/spinner";
import IpDetails from "@/app/doxdotfun/components/details/ip";

export default function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(25); // Number of items to show initially
  const [selectedIp, setSelectedIp] = useState<{ ip: string; launches: number; last_seen: string } | null>(null);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        const response = await fetch("/doxdotfun/api/frontend/leaderboard"); // Replace with your API endpoint
        const data = await response.json();
        setLeaderboardData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
        setLoading(false);
      }
    };

    fetchLeaderboardData();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
        setVisibleCount((prev) => Math.min(prev + 10, leaderboardData.length));
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [leaderboardData]);

  return (
    <div className="w-full max-w-8xl mx-auto px-6">
      <h1 className="text-white text-3xl font-bold mb-6 text-center">leaderboard</h1>
      {loading ? (
        <Spinner />
      ) : (
        <div className="relative overflow-x-auto shadow-md rounded-xl">
          <table className="table-auto w-full border-collapse">
            <colgroup>
              <col className="w-1/8" /> {/* Rank */}
              <col className="w-full" /> {/* IP */}
              <col className="w-1/8" /> {/* Launches */}
              <col className="w-1/8" /> {/* Last seen */}
              <col className="w-1/8" /> {/* Actions */}
            </colgroup>
            <thead className="bg-[#86efac] text-black">
              <tr>
                <th className="px-8 py-2 text-sm text-center font-medium">rank</th>
                <th className="px-4 py-2 text-sm text-left" font-medium>IP</th>
                <th className="px-4 py-2 text-sm text-left font-medium">launches</th>
                <th className="px-4 py-2 text-sm text-left font-medium">last seen</th>
                <th className="px-4 py-2 text-sm text-left font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.slice(0, visibleCount).map((item, index) => (
                <tr
                  key={index}
                  className={`text-nowrap text-white border-0 border-b-[1px] border-[#86efac] bg-[#1f232e] hover:bg-[#393e47] transition ${
                    index !== 0 ? "border-t-[1px]" : ""
                  } ${index % 2 === 0 ? "bg-[#1f232e]" : "bg-[#292d33]"}`}
                >
                  <td className="px-4 py-2 text-center text-xs">{index + 1}</td>
                  <td className="px-4 py-2 text-xs">
                    {item.ip && item.ip.length > 25 ? `${item.ip.slice(0, 25)}...` : item.ip}
                  </td>
                  <td className="px-4 py-2 text-xs">{item.launches}</td>
                  <td className="px-4 py-2 text-xs text-nowrap">
                    {format(new Date(item.last_seen), "yyyy-MM-dd HH:mm")}
                  </td>
                  <td className="px-4 py-2 text-xs">
                    <button
                      className="px-4 py-2 bg-[#86efac] hover:bg-[#34c55e] text-black rounded-lg font-medium"
                      onClick={() => setSelectedIp(item)}
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
              className="absolute text-xs -top-10 right-4 md:right-4 sm:right-0 px-4 py-2 bg-[#86efac] hover:bg-[#34c55e] text-black rounded-lg font-medium"
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
    </div>
  );
}