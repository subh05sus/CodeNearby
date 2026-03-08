"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import Link from "next/link";
import { ScrollArea } from "../ui/scroll-area";
import SwissCard from "../swiss/SwissCard";
import SwissButton from "../swiss/SwissButton";

interface Gathering {
  _id: string;
  name: string;
  slug: string;
  expiresAt: string;
}

export function CurrentGatherings() {
  const [gatherings, setGatherings] = useState<Gathering[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGatherings = async () => {
      try {
        const response = await fetch("/api/gathering");
        const data = await response.json();
        setGatherings(data);
      } catch (error) {
        console.error("Error fetching current gatherings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGatherings();
  }, []);

  return (
    <SwissCard variant="white" pattern="dots">
      <div className="mb-6 border-b-2 border-black dark:border-white pb-2">
        <h2 className="text-xl font-black uppercase  flex items-center gap-2 text-black dark:text-white">
          <Users size={20} className="text-swiss-red" />
          Current Gatherings
        </h2>
      </div>
      <div>
        <ScrollArea className="h-[200px] pr-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 w-full bg-muted dark:bg-neutral-800 border-2 border-black dark:border-white animate-pulse" />
              ))}
            </div>
          ) : gatherings.length > 0 ? (
            <ul className="space-y-4">
              {gatherings.map((gathering) => (
                <li
                  key={gathering._id}
                  className="flex flex-col border-2 border-black dark:border-white p-4 bg-white dark:bg-black relative group"
                >
                  <div className="mb-4">
                    <h3 className="font-black uppercase text-lg leading-tight group-hover:text-swiss-red transition-colors text-black dark:text-white">
                      {gathering.name}
                    </h3>
                    <p className="text-[10px] font-black uppercase  opacity-50 dark:opacity-40 italic mt-1 text-black dark:text-white">
                      EXPIRES: {new Date(gathering.expiresAt).toLocaleString().split(",")[0]}
                    </p>
                  </div>
                  <SwissButton variant="accent" size="sm" className="w-full" asChild>
                    <Link href={`/gathering/${gathering.slug}`}>
                      JOIN GATHERING
                    </Link>
                  </SwissButton>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm font-black uppercase  opacity-30 dark:opacity-20 italic py-8 border-2 border-dashed border-black/20 dark:border-white/20 text-center text-black dark:text-white">
              NO CURRENT GATHERINGS
            </p>
          )}
        </ScrollArea>
      </div>
    </SwissCard>
  );
}
