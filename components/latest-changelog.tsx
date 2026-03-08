import React from "react";
import { CHANGELOG } from "@/consts/Changelog";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import SwissCard from "./swiss/SwissCard";

const LatestChangelog: React.FC = () => {
  const latestVersion = CHANGELOG[0];

  return (
    <div className="max-w-3xl mx-auto mb-20 relative">
      <div className="absolute -top-4 left-8 bg-swiss-red text-white text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1 z-10">
        Latest Release: v{latestVersion.version}
      </div>
      <SwissCard variant="white" pattern="grid" className="pt-12">
        <h2 className="font-black uppercase  text-swiss-red mb-6 border-b-2 border-black dark:border-white pb-2 w-fit">
          Additions
        </h2>
        <ul className="space-y-4 text-black dark:text-white font-medium text-sm">
          {latestVersion.changes.map((change: string, index: number) => (
            <li key={index} className="flex gap-4 items-start">
              <span className="text-swiss-red font-black">✽</span>
              <span dangerouslySetInnerHTML={{ __html: change }} />
            </li>
          ))}
        </ul>
        <div className="mt-12 border-t border-black/10 dark:border-white/10 pt-6">
          <Link
            href="/changelog"
            className="group text-xs font-black uppercase  flex items-center gap-2 text-black dark:text-white hover:text-swiss-red dark:hover:text-swiss-red transition-colors"
          >
            <span>View Changelog history</span>
            <ChevronRight
              className="group-hover:translate-x-2 transition-transform duration-200"
              size={14}
            />
          </Link>
        </div>
      </SwissCard>
    </div>
  );
};

export default LatestChangelog;
