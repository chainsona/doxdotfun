"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Spinner from "@/app/doxdotfun/components/ui/spinner";

import dynamic from 'next/dynamic';
const Relations = dynamic(() => import('@/app/doxdotfun/components/relations'), {ssr: false})

import WhoIsAddress from "@/app/doxdotfun/components/details/whois/address";
import ArkhamLabels from "@/app/doxdotfun/components/details/arkhamLabels";

export default function AuditorPage() {
  const { address } = useParams();
  const [developerBalance, setDeveloperBalance] = useState<number | null>(null);
  const [firstFunder, setFirstFunder] = useState<string | null>(null);
  const [allFunders, setAllFunders] = useState<string[]>([]);
  const [nonUniqueIps, setNonUniqueIps] = useState(new Set<string>());
  const [loading, setLoading] = useState(true);
  const [labels, setLabels] = useState<{
    name: boolean; known: boolean; label: string; tag: string | null 
}[]>([]);

  const [ipInfo, setIpInfo] = useState<any | null>(null);

    useEffect(() => {
      if (!address) return;

      const fetchData = async () => {
      try {
        const [balanceRes, funderRes, fundersRes] = await Promise.all([
          // const [balanceRes, funderRes, fundersRes, ipsRes] = await Promise.all([
          fetch(`/doxdotfun/api/developer/balance/${address}`),
          fetch(`/doxdotfun/api/developer/firstFunder/${address}`),
          fetch(`/doxdotfun/api/developer/allFunders/${address}`),
          // fetch(`/doxdotfun/api/ips`),
        ]);

        const balanceData = await balanceRes.json();
        setDeveloperBalance(balanceData.balance || null);
        
        const funderData = await funderRes.json();
        setFirstFunder(funderData.first_funder || null);

        const fundersData = await fundersRes.json();
        setAllFunders(fundersData.all_funders || []);

        if (typeof address === "string") {
          // fetchIpInfo(funderData.ip);
          fetchIpInfo(address);
        }

        // const ipsData = await ipsRes.json();
        // const ipCounts: Record<string, number> = {};
        // ipsData.forEach((row: any) => {
        //   ipCounts[row.ip] = (ipCounts[row.ip] || 0) + 1;
        // });
        // setNonUniqueIps(new Set(Object.keys(ipCounts).filter((ip) => ipCounts[ip] > 1)));

        const fetchedLabels = await Promise.all(
          fundersData.all_funders.map((funder: string) => fetchAddressLabel(funder))
        );
        setLabels(fetchedLabels);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [address]);

    // Fetch address label dynamically
    const fetchAddressLabel = async (address: string) => {
      try {
          const response = await fetch(`/doxdotfun/api/frontend/address/label?address=${address}`);
          const data = await response.json();
          return data;
      } catch (error) {
          console.error(`Error fetching label for address ${address}:`, error);
          return { known: false, label: null, tag: null };
      }
  };

  const fetchIpInfo = async (ip: string) => {
    try {
      const response = await fetch(`/doxdotfun/api/whois/ip-info/${ip}`);
      const data = await response.json();
      setIpInfo(data);
    } catch (error) {
      console.error("Error fetching IP information:", error);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center p-4 md:p-8">
      <h1 className="text-white text-3xl font-bold mb-6 text-center">developer&apos;s audit</h1>
      <div className="w-full max-w-8xl mx-auto px-0 md:px-6 space-y-6">
      {loading ? (
        <Spinner />
      ) : (
        <div className="w-full max-w-8xl pb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 md:gap-6">
          <div className="col-span-1">
            <div className="bg-[#1f232e] rounded-xl shadow-2xl mb-4 md:mb-0">
              <div className="bg-[#86efac] rounded-t-xl px-4 md:px-6 py-2">
                <h2
                  className="text-sm font-medium text-black flex cursor-pointer"
                  title="click to copy"
                  onClick={() => typeof address === "string" && navigator.clipboard.writeText(address)}
                >
                  {address}
                </h2>
              </div>
              <div className="text-white px-6 py-2">
                <div className="flex flex-col space-y-2 py-2">
                <div className="col-span-1">
                  <div className="shadow-lg rounded-xl bg-[#15161b]">
                    <div className="bg-[#86efac] rounded-t-xl px-6 py-2">
                    <h2 className="text-sm font-medium text-black">first funder</h2>
                    </div>
                    <div className="text-white px-6 py-3 text-xs flex items-center justify-between">
                    {firstFunder && firstFunder.length > 15 ? (
                      <div className="flex flex-col">
                      <span className="cursor-pointer block xl:hidden" title="click to copy" onClick={() => navigator.clipboard.writeText(firstFunder)}>
                      {`${firstFunder.slice(0, 4)}...${firstFunder.slice(-4)}`}
                      </span>
                      <span className="cursor-pointer hidden xl:block" title="click to copy" onClick={() => navigator.clipboard.writeText(firstFunder)}>
                      {`${firstFunder}`}
                      </span>
                      {/* Add Arkham Labels */}
                      <ArkhamLabels address={firstFunder} bgColor="#15161b" />
                      </div>
                    ) : (
                      <></>
                    )}
                    <a
                      href={`https://solscan.io/account/${address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <button
                        className="px-2 py-2 border-[1px] border-[#86efac] hover:bg-[#34c55e] text-white rounded-lg font-semibold flex items-center justify-center"
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
                  </div>
                <WhoIsAddress address={typeof address === "string" ? address : address[0]} bgColor="#15161b" />
              </div>
            </div>
          </div>
        </div>
          <div className="col-span-2">
            <Relations latestToken={{ developer: address }} allFunders={allFunders} />
          </div>
          </div>
        </div>
      )}
      </div>
    </main>
  );
}
