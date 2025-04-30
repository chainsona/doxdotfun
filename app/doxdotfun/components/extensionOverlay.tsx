"use client";

import { useState } from "react";

export default function ExtensionOverlay() {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    isVisible && (
      <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleClose();
          }
        }}
      >
        <div className="max-w-2xl w-full text-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleClose();
            }
          }}
        >
          <h2 className="text-6xl font-bold text-white mb-4">
            download <span className="text-[#86efac]">doxdotfun</span> extension
          </h2>
          <p className="text-white text-3xl mb-4 font-mono animate-pulse">
            real-time auditing and doxing inside pump.fun
          </p>
          <img
            src="/images/doxdotfun-ext-preview.png"
            alt="Chrome Extension"
            className="w-1/3 h-auto rounded-lg mb-4 mx-auto"
          />
          <div className="flex justify-center space-x-4">
            <a
              href="https://github.com/KibuSolutions/doxdotfun-extension" // Replace with your Chrome extension URL
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-[#86efac] hover:bg-[#34c55e] text-black rounded-lg font-medium"
            >
              visit extension
            </a>
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium"
            >
              close
            </button>
          </div>
        </div>
      </div>
    )
  );
}