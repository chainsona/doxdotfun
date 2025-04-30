import React, { useState, useEffect } from "react";

interface WhoIsIPProps {
    ip: string;
    bgColor: string; // Add bgColor prop
}

const WhoIsIP: React.FC<WhoIsIPProps> = ({ ip, bgColor }) => {
    const [ipInfo, setIpInfo] = useState<any | null>(null);

    useEffect(() => {
        const fetchIpInfo = async () => {
            try {
                const response = await fetch(`/doxdotfun/api/whois/ip-info/${ip}`);
                const data = await response.json();
                setIpInfo(data);
            } catch (error) {
                console.error("Error fetching IP information:", error);
            }
        };

        if (ip) {
            fetchIpInfo();
        }
    }, [ip]);

    return (
        <div className="col-span-1 shadow-lg rounded-xl" style={{ backgroundColor: bgColor }}>
            <div className="bg-[#86efac] rounded-t-xl px-6 py-2">
                <h2 className="text-sm font-medium text-black">who is IP</h2>
            </div>
            <div className="text-white px-6 py-3 text-xs">
                {ipInfo ? (
                    <ul className="lowercase">
                        <li>{ipInfo.ai_summary || "no summary available"}</li>
                    </ul>
                ) : (
                    <p className="text-gray-400">loading IP who is data...</p>
                )}
            </div>
        </div>
    );
};

export default WhoIsIP;