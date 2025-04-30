import React, { useEffect, useState } from "react";

interface ArkhamLabelsProps {
  address: string;
  bgColor: string;
}

const ArkhamLabels: React.FC<ArkhamLabelsProps> = ({ address, bgColor }) => {
  const [arkhamTags, setArkhamTags] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      fetchArkhamTags();
    }
  }, [address]);

  return (
    <div className="">
        {arkhamTags ? (
            <div className="mt-4">
                <p className="text-sm font-semibold text-[#86efac]">Arkham Intel report:</p>
                <p className="text-xs text-white">
                    <span
                        onClick={(e) => {
                            // Improved Solana address regex (base58, 32-44 chars)
                            const solanaRegex = /[1-9A-HJ-NP-Za-km-z]{32,44}/g;
                            const matches = arkhamTags.match(solanaRegex);
                            
                            if (matches && matches.length > 0) {
                                // Get the first matching address
                                const address = matches[0];
                                navigator.clipboard.writeText(address)
                                    .then(() => {
                                        // Optional: Show feedback
                                        const target = e.target;
                                        const originalText = (target as HTMLElement).innerText;
                                        (target as HTMLElement).innerText = 'copied!';
                                        setTimeout(() => {
                                            target.innerText = originalText;
                                        }, 200);
                                    });
                            }
                        }}
                        className="lowercase"
                        style={{
                            wordBreak: 'break-word'
                        }}
                    >
                        {arkhamTags.split(/([1-9A-HJ-NP-Za-km-z]{32,44})/).map((part, i) => 
                            /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(part) ? (
                                <span key={i} className="text-[#86efac] cursor-pointer" 
                                title="click to copy the address">
                                    {part}
                                </span>
                            ) : (
                                <span key={i}>{part}</span>
                            )
                        )}
                    </span>
                </p>
            </div>
        ) : (
            <div className="mt-4">
                <p className="text-sm font-semibold text-[#86efac]">Arkham Intel report:</p>
                <p className="text-xs text-white">not labeled</p>
            </div>
        )}
    </div>
  );
};

export default ArkhamLabels;