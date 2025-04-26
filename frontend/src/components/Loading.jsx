import React, { useEffect, useState } from "react";

const Loading = () => {
  useEffect(() => {
    document.body.style.overflow = "hidden"; // Disable scrolling when loading
    return () => {
      document.body.style.overflow = "auto"; // Re-enable scrolling when unmounted
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-gray-950 bg-opacity-50 z-50">
      <svg
        className="animate-spin h-10 w-10 border-t-2 border-b-2 border-teal-900 rounded-full"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="10" fill="none" strokeWidth="4"></circle>
      </svg>
    </div>
  );
};

export default Loading;
