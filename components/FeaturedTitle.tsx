"use client";
import { FastForward } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

function FeaturedTitle() {
  const router = useRouter();
  const handleFeaturedTitleClick = () => {
    router.push("/about/ai-connect");
  };
  return (
    <div
      className="mt-8 flex justify-center items-center"
      onClick={handleFeaturedTitleClick}
    >
      <div
        className="overflow-hidden flex items-center justify-center text-center border-4 border-black dark:border-white bg-white dark:bg-black group cursor-pointer shadow-[8px_8px_0_0_rgba(255,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-100 p-2"
      >
        <div className="flex items-center justify-center">
          <img
            src="/ai.gif"
            alt="AI Connect"
            className="h-6 w-6 object-contain mr-4 grayscale group-hover:grayscale-0 transition-all duration-200"
          />
          <span className="whitespace-nowrap font-black uppercase tracking-[0.2em] text-sm flex items-center gap-2 text-black dark:text-white">
            AI Connect is Live
            <FastForward
              size={18}
              className="text-swiss-red"
            />
          </span>
        </div>
      </div>
    </div>
  );
}

export default FeaturedTitle;
