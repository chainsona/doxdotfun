import React, { useState, useEffect } from "react";

import ArkhamLabels from "@/app/doxdotfun/components/details/arkhamLabels";

interface WhoIsAddressProps {
    address: string;
    bgColor: string; // Add bgColor prop
}

const WhoIsAddress: React.FC<WhoIsAddressProps> = ({ address, bgColor }) => {
    const [addressInfo, setAddressInfo] = useState<any | null>(null);
    const [arkhamTags, setArkhamTags] = useState<string | null>(null); // State for Arkham tags

    useEffect(() => {
        const fetchAddressInfo = async () => {
            try {
                const response = await fetch(`/doxdotfun/api/whois/address-info/${address}`);
                const data = await response.json();
                setAddressInfo(data);
            } catch (error) {
                console.error("Error fetching address information:", error);
            }
        };

        const fetchArkhamTags = async () => {
            try {
                const response = await fetch(`/doxdotfun/api/whois/address-labels/${address}`);
                const data = await response.json();
                if (data != null && data.length > 0) {
                    setArkhamTags(data); // Get the first label
                }
            } catch (error) {
                console.error("Error fetching Arkham tags:", error);
            }
        };

        if (address) {
            fetchAddressInfo();
            fetchArkhamTags();
        }
    }, [address]);

    return (
        <div className="col-span-1 shadow-lg rounded-xl" style={{ backgroundColor: bgColor }}>
            <div className="bg-[#86efac] rounded-t-xl px-6 py-2">
                <h2 className="text-sm font-medium text-black">who is address</h2>
            </div>
            <div className="text-white px-6 py-3 text-xs">
                {addressInfo ? (
                    <div className="flex flex-row gap-2 justify-between">
                        <ul className="lowercase">
                            <li>
                                <span
                                    title="click to copy the address"
                                    onClick={() => navigator.clipboard.writeText(address)}
                                    className="cursor-pointer"
                                >
                                    {addressInfo.ai_summary
                                        ? addressInfo.ai_summary.replace(
                                              /([A-Za-z0-9]{25,})/g,
                                              (match: string) => `${match.substring(0, 4)}...${match.slice(-4)}`
                                          )
                                        : "no labels from partners"}
                                </span>
                            </li>
                        </ul>

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
                                    className="w-4 h-4 min-w-4 min-h-4"
                                />
                            </button>
                        </a>
                    </div>
                ) : (
                    <p className="text-gray-400">loading address who is data...</p>
                )}
                {/* Display Arkham tags if available */}
                <ArkhamLabels address={address} bgColor="#15161b" />
            </div>
        </div>
    );
};

export default WhoIsAddress;