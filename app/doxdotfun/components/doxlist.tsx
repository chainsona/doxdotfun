"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter for navigation

import Spinner from "@/app/doxdotfun/components/ui/spinner";

export default function Doxlist() {
  const router = useRouter(); // Initialize router

  const [loading, setLoading] = useState(false); // Set to false since we have static data

  // Static data for the table
  const tableData = [
    {
      address: "A6v1DvkYGuvfyJR4hmzcgptFE72MhU3ijbhECdXWvZq7",
      links: ["https://x.com/zuscrypto"],
    },
    {
      address: "F5va8S8D9vZ2XWSDkVxUuGY4ZVy4mC4ocbWsPUGcg8jT",
      links: ["https://x.com/vnusheniee"],
    },
    {
      address: "J2L495ZPcJ6Btuyd4YqXz5uw7hpKiQXGcLvALwumabED",
      links: ["https://x.com/chestermeme2"],
    },
  ];

  const handleNavigate = (address: string) => {
    router.push(`/doxdotfun/audit/${address}`); // Navigate to the auditor page
  };

  return (
    <div className="w-full max-w-8xl mx-auto px-6">
      <h1 className="text-white text-3xl font-bold mb-12 text-center">doxlist</h1>
      <p className="text-gray-400 text-sm mb-12 text-center">
        The following are some examples of data we have found. These are provided solely for illustrative purposes to demonstrate the platform's functionality. All data shown is publicly available and accessible online. We do not infringe on privacy or violate any laws.
      </p>
      {loading ? (
        <Spinner />
      ) : (
        <div className="relative overflow-x-auto shadow-md rounded-t-xl mb-8">
          <table className="table-auto w-full border-collapse">
            <colgroup>
              <col className="w-6/8" /> {/* address */}
              <col className="w-2/8" /> {/* Links */}
            </colgroup>
            <thead className="bg-[#86efac] text-black">
              <tr>
                <th className="px-4 py-2 text-sm text-left font-medium">funder</th>
                <th className="px-4 py-2 text-sm text-left font-medium">related X Accounts</th>
              </tr>
            </thead>
            <tbody className="bg-[#1f232e] text-white">
              {tableData.map((row, index) => (
                <tr 
                key={index}
                className={`text-nowrap text-white border-0 border-b-[1px] border-[#86efac] bg-[#1f232e] hover:bg-[#393e47] transition ${
                  index !== 0 ? "border-t-[1px]" : ""
                } ${index % 2 === 0 ? "bg-[#1f232e]" : "bg-[#292d33]"}`}>
                  <td className="px-4 py-2 text-sm  flex items-center space-x-4">
                    {/* <button
                      onClick={() => handleNavigate(row.address)}
                      className="px-3 md:px-4 py-2 bg-[#86efac] hover:bg-[#34c55e] text-black rounded-lg font-medium mr-4"
                    >
                      audit
                    </button> */}
                    {row.address}
                    
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <ul className="list-none pl-4">
                      {row.links.map((link, linkIndex) => (
                        <li key={linkIndex}>
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#86efac] hover:underline"
                          >
                            {link}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}