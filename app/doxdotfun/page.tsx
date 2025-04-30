"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter for navigation
import { FaExternalLinkAlt } from "react-icons/fa"; // Import an icon from react-icons
import { format } from "date-fns";

import { supabase } from "@/lib/supabaseClient";
import Spinner from "@/app/doxdotfun/components/ui/spinner";

// import Relations from "@/app/doxdotfun/components/relations";
import dynamic from 'next/dynamic';
const Relations = dynamic(() => import('./components/relations'), {ssr: false})
import ExtensionOverlay from "./components/extensionOverlay";
import WhoIsIP from "./components/details/whois/ip";
import WhoIsAddress from "./components/details/whois/address";

import ArkhamLabels from "@/app/doxdotfun/components/details/arkhamLabels";

export default function App() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [firstRow, setFirstRow] = useState<any | null>(null);
  const [developerBalance, setDeveloperBalance] = useState<number | null>(null);
  const [nonUniqueIps, setNonUniqueIps] = useState(new Set<string>()); // Persistent set of duplicate IPs
  const [nonUniqueDevs, setNonUniqueDevs] = useState(new Set<string>()); // Persistent set of duplicate devs
  
  const [firstFunder, setFirstFunder] = useState<string | null>(null);
  // const [allFunders, setAllFunders] = useState<{ address: string; label: { tag: string | null; label: string | null } | null }[]>([]);
  const [allFunders, setAllFunders] = useState<string[]>([]);

  const [labels, setLabels] = useState<{
      name: boolean; known: boolean; label: string; tag: string | null 
  }[]>([]);

  const [ipInfo, setIpInfo] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      let allData: any[] = [];
      let start = 0;
      let batchSize = 1000;
      
      while (true) {
        const { data, error } = await supabase
          .from("PumpFunIPs")
          .select("*")
          .gte("created_at", "2025-03-30T22:00:00") // Filter rows created on or after 2025-03-30 at 22:00
          .order("created_at", { ascending: true })
          .range(start, start + batchSize - 1); // Fetch 1000 rows at a time

        if (error) {
          console.error("Error fetching data:", error);
          break;
        }

        if (data.length === 0) break; // Stop if no more data

        // Filter out rows with empty or null IPs
        const filteredData = data.filter((row) => row.ip && row.ip.trim() !== "");

        allData = [...allData, ...filteredData]; // Merge filtered data
        start += batchSize;
      }

      setData(allData); // Add a class for developer address if developer_known is true
      updateNonUniqueIps(allData);
      updateNonUniqueDevs(allData);
      setLoading(false);
      
      if (allData.length > 0) {
        const first = allData[allData.length - 1];
        setFirstRow(first);
        if (first.developer) {
          const checkDeveloperInAddresses = async (developerAddress: string) => {
            const { data, error } = await supabase
              .from("Addresses")
              .select("*")
              .eq("address", developerAddress)
              .single();

            if (error || !data) {
              // If developer is not found in the Addresses table, perform the fetches
              fetchDeveloperBalance(developerAddress);
              fetchFirstFunder(developerAddress);
              fetchAllFunders(developerAddress);
          
            } else {
              // If developer is found, set the data directly
              setDeveloperBalance(data.balance || null);
              setFirstFunder(data.first_funder || null);
              setAllFunders(data.all_funders || []);
            }
          };
    
          checkDeveloperInAddresses(first.developer);
          fetchIpInfo(first.ip);
        }
      }
    };

    // Fetch initial data
    fetchData();

    const updateNonUniqueDevs = async (data: any[]) => {
      const devsCounts: Record<string, number> = {};

      // Count occurrences of each IP
      data.forEach((row) => {
        devsCounts[row.developer] = (devsCounts[row.developer] || 0) + 1;
      });

      // Find non-unique IPs
      const duplicates = new Set<string>(
        Object.keys(devsCounts).filter((developer) => devsCounts[developer] > 1)
      );

      setNonUniqueDevs(duplicates);
    };

    const updateNonUniqueIps = async (data: any[]) => {
      const ipCounts: Record<string, number> = {};

      // Count occurrences of each IP
      data.forEach((row) => {
        ipCounts[row.ip] = (ipCounts[row.ip] || 0) + 1;
      });

      // Find non-unique IPs
      const duplicates = new Set<string>(
        Object.keys(ipCounts).filter((ip) => ipCounts[ip] > 1)
      );

      setNonUniqueIps(duplicates);
    };

    const fetchDeveloperBalance = async (developerAddress: string) => {
      try {
        const response = await fetch(`/doxdotfun/api/developer/balance/${developerAddress}`);
        const data = await response.json();
        if (data.balance) {
          setDeveloperBalance(data.balance);
        }
      } catch (error) {
        console.error("Error fetching developer balance:", error);
      }
    };

    const fetchFirstFunder = async (developerAddress: string) => {
      try {
        const response = await fetch(`/doxdotfun/api/developer/firstFunder/${developerAddress}`);
        const data = await response.json();
        if (data.first_funder) {
          setFirstFunder(data.first_funder);
        }
      } catch (error) {
        console.error("Error fetching first funder:", error);
      }
    };

    const fetchAllFunders = async (developerAddress: string) => {
      try {
        const response = await fetch(`/doxdotfun/api/developer/allFunders/${developerAddress}`);
        const data = await response.json();

        if (data.all_funders) {
          const funders = data.all_funders;

          try {
              const response = await fetch(`/doxdotfun/api/frontend/address/label?address=${developerAddress}`);
              const labels = await response.json();
              setLabels(labels as { name: boolean; known: boolean; label: string; tag: string | null }[]);
          } catch (error) {
              console.error(`Error fetching label for address ${developerAddress}:`, error);
          }

          // setAllFunders(
          //   funders.map((funder: string, index: number) => ({
          //     address: funder,
          //     label: fetchedLabels[index] || { tag: null, label: null },
          //   }))
          // );
          setAllFunders(funders)
        }
      } catch (error) {
        console.error("Error fetching all funders:", error);
      }
    };

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

    // Subscribe to real-time updates
    const subscription = supabase
      .channel("PumpFunIPs")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "PumpFunIPs" },
        (payload) => {
          // console.log("Realtime event:", payload);

          setData((prevData) => {
            let updatedData = prevData;

            if (payload.eventType === "INSERT") {
              if (payload.new.ip && payload.new.ip.trim() !== "") {
                updatedData = [...prevData, payload.new];
              }
            } else if (payload.eventType === "UPDATE") {
              updatedData = prevData.map((item) =>
                item.id === payload.new.id ? payload.new : item
              );
            } else if (payload.eventType === "DELETE") {
              updatedData = prevData.filter((item) => item.id !== payload.old.id);
            }

            // Update non-unique IPs after modifying the dataset
            updateNonUniqueIps(updatedData);
            return updatedData;
          });

          if (payload.eventType === "INSERT") {
            setFirstRow(payload.new);
            if (payload.new.developer) {
              fetchDeveloperBalance(payload.new.developer);
              fetchFirstFunder(payload.new.developer);
              fetchAllFunders(payload.new.developer);
            } else {
              setDeveloperBalance(null);
              setFirstFunder(null);
              setAllFunders([]);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const router = useRouter(); // Initialize router

  const handleNavigate = (address: string) => {
    router.push(`/doxdotfun/audit/${address}`); // Navigate to the auditor page
  };

  return (
    <main className="flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-8xl mx-auto px-0 md:px-6 space-y-6">
        <ExtensionOverlay />
        {/* <h1 className="text-3xl font-medium mb-2 text-center">Launch Monitor</h1> */}
        {firstRow && (
          // <div className="w-full max-w-8xl bg-[#202020] shadow-md rounded-3xl p-6">
          <div className="w-full max-w-8xl pb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 md:gap-6">
              <div className="col-span-1">
                <div className="bg-[#1f232e] rounded-xl shadow-2xl mb-4 md:mb-0">
                  <div className="bg-[#86efac] rounded-t-xl px-4 md:px-6 py-2">
                  <h2 className="text-sm font-medium text-black">
                  latest launch&#39;s audit
                  </h2>
                  </div>
                  <div className="px-4 md:px-6 py-4">
                  <h3 className="text-white dark:text-white ">
                  {firstRow.symbol === firstRow.name ? (
                    <strong className="text-xl font-semibold">{firstRow.symbol}</strong>
                  ) : (
                    <>
                    <strong className="text-xl font-semibold">{firstRow.symbol}</strong>,  {firstRow.name}
                    </>
                  )}
                  </h3>
                  <p className="">
                    {/* <strong className="text-xs">website:</strong>{" "} */}
                    <a
                    href={firstRow.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#86efac] hover:underline text-xs"
                    >
                    {firstRow.website.length > 35
                      ? `${firstRow.website.slice(0, 35)}...`
                      : firstRow.website}
                    </a>
                  </p>
                  <p className="text-nowrap">
                    <strong className="text-white text-xs">IP:</strong>{" "}
                    <span
                    className={`${
                      nonUniqueIps.has(firstRow.ip) ? "text-red-500 font-medium" : "text-white"
                    } text-xs`}
                    >
                    {firstRow.ip && firstRow.ip.length > 25 ? `${firstRow.ip.slice(0, 25)}...` : firstRow.ip}
                    </span>
                    {nonUniqueIps.has(firstRow.ip) && (
                    <span className="text-white ml-2 text-xs">
                      (this IP is involved in {data.filter((row) => row.ip === firstRow.ip).length} launches)
                    </span>
                    )}
                  </p>
                  {/* <p className="text-white text-xs pt-1">
                    <strong>wallet balance:</strong>{" "}
                    {developerBalance !== null ? `${developerBalance / 10 ** 9} SOL` : "N/A"}
                  </p> */}
                  
                  
                  <div className="flex flex-col space-y-2 py-2">
                    <WhoIsIP ip={firstRow.ip} bgColor="#15161b" />
                    
                    <div className="col-span-1 shadow-lg rounded-xl bg-[#15161b]">
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
                              <ArkhamLabels address={firstFunder} bgColor="#15161b" />
                            </div>
                          ) : (
                            <></>
                          )}
                          <a
                            href={`https://solscan.io/account/${firstFunder}`}
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

                    <WhoIsAddress address={typeof firstRow.developer === "string" ? firstRow.developer : firstRow.developer[0]} bgColor="#15161b"/>
                  </div>
                  
                  </div>
                </div>
              </div>
              <div className="col-span-2">
                <Relations latestToken={firstRow} allFunders={allFunders} />
              </div>
            </div>
          </div>
        )}
        {loading ? (
          <Spinner />
        ) : (
          <div className="overflow-x-auto bg-[#15161b] shadow-md rounded-xl">
            <table className="table-auto w-full border-collapse">
              <colgroup>
                <col className="w-1/10" /> {/* Created At (Smaller) */}
                <col className="w-1/10" /> {/* Name */}
                <col className="w-1/6" /> {/* Symbol (Same as Name) */}
                <col className="w-1/2" /> {/* Developer */}
                <col className="w-1/10" /> {/* Website */}
                <col className="w-full" /> {/* IP */}
              </colgroup>
              <thead className="bg-[#86efac] text-black">
                <tr>
                  <th className="px-4 md:px-6 py-2 text-sm text-left text-nowrap font-medium">created at</th>
                  <th className="px-2 md:px-4 py-2 text-sm text-left font-medium">symbol</th>
                  <th className="px-2 md:px-4 py-2 text-sm text-left font-medium">name</th>
                  <th className="px-2 md:px-4 py-2 text-sm text-left font-medium">developer</th>
                  <th className="px-2 md:px-4 py-2 text-sm text-left font-medium">website</th>
                  <th className="px-2 md:px-4 py-2 text-sm text-left font-medium">IP</th>
                  <th className="px-2 md:px-4 py-2 text-sm text-left"></th>
                </tr>
              </thead>
              <tbody>
                {data.slice(-5).reverse().map((item, index) => (
                    <tr
                      key={index}
                      className={`border-0 text-white ${
                        index === data.slice(-5).reverse().length - 1
                        ? ""
                        : "border-b-[1px] border-[#86efac]"
                      } bg-[#1f232e] hover:bg-[#393e47] transition 
                      ${index % 2 === 0 ? "bg-[#1f232e]" : "bg-[#292d33]"}`}
                    >
                    <td className="px-4 md:px-6 py-2 text-xs">
                      {/* {format(new Date(item.lastSeen), "PPpp")}
                      {format(new Date(item.lastSeen), "yyyy-MM-dd HH:mm")} */}
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                    <td className="px-2 md:px-4 py-2 text-xs">{item.symbol}</td>
                    <td className="px-2 md:px-4 py-2 text-xs">{item.name}</td>
                    <td
                      className={`px-2 md:px-4 py-2 text-xs ${
                        nonUniqueDevs.has(item.developer) ? "text-red-500" : "text-white"
                      }`}
                      title={item.developer} // Display the full IP on hover
                    >{item.developer}
                      {nonUniqueDevs.has(item.developer) && (
                        <span className="text-white ml-2 text-xs">
                          (this dev is involved in {data.filter((row) => row.developer === item.developer).length} launches)
                        </span>
                      )}
                    </td>
                    <td className="px-2 md:px-4 py-2 text-xs">
                      <a
                        href={item.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#86efac] hover:underline text-sm"
                        >
                        {item.website.length > 35
                          ? `${item.website.slice(0, 35)}...`
                          : item.website}
                      </a>
                    </td>
                    <td
                      className={`px-2 md:px-4 py-2 text-xs ${
                      nonUniqueIps.has(item.ip) ? "text-red-500" : "text-white"
                      }`}
                      title={item.ip} // Display the full IP on hover
                    >
                      {item.ip && item.ip.length > 25 ? `${item.ip.slice(0, 25)}...` : item.ip}
                      {nonUniqueIps.has(item.ip) && (
                      <span className="ml-2 text-gray-200 text-xs">
                        (this IP is involved in {data.filter((row) => row.ip === item.ip).length} launches)
                      </span>
                      )}
                    </td>
                    <td className="px-2 md:px-4 py-2 text-center text-xs">
                      <button
                        onClick={() => handleNavigate(item.developer)}
                        className="px-3 md:px-4 py-2 bg-[#86efac] hover:bg-[#34c55e] text-black rounded-lg font-medium"
                      >
                        {/* <FaExternalLinkAlt className="mr-2 text-nowrap" /> */}
                        audit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}