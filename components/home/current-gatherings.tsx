"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Radio, Calendar } from "lucide-react";
import Link from "next/link";
import { ScrollArea } from "../ui/scroll-area";

interface Gathering {
  _id: string;
  name: string;
  slug: string;
  expiresAt: string;
}

function timeUntil(expiresAt: string) {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 0) return `${h}h ${m}m left`;
  return `${m}m left`;
}

export function CurrentGatherings() {
  const [gatherings, setGatherings] = useState<Gathering[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/gathering")
      .then((r) => r.json())
      .then(setGatherings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="rounded-2xl border border-border bg-card flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Radio className="w-3.5 h-3.5 text-primary" />
          </div>
          <h2 className="font-heading text-base">Live Gatherings</h2>
        </div>
        <Link
          href="/gathering/create"
          className="text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          + Create
        </Link>
      </div>

      {/* Body */}
      <ScrollArea className="h-full px-5 py-4">
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : gatherings.length > 0 ? (
          <ul className="space-y-2">
            {gatherings.map((g) => (
              <li
                key={g._id}
                className="group flex items-center justify-between rounded-xl border border-border hover:border-primary/20 bg-background hover:bg-primary/5 px-4 py-3 transition-all duration-200"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 animate-pulse" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{g.name}</p>
                    <p className="text-[11px] font-mono text-muted-foreground">
                      {timeUntil(g.expiresAt)}
                    </p>
                  </div>
                </div>
                <Button
                  asChild
                  size="sm"
                  className="flex-shrink-0 h-7 text-xs rounded-full px-3"
                >
                  <Link href={`/gathering/${g.slug}`}>
                    <Users className="h-3 w-3 mr-1" />
                    Join
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
            <Calendar className="w-8 h-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No live gatherings</p>
            <Link
              href="/gathering/create"
              className="text-xs text-primary hover:underline"
            >
              Start one →
            </Link>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
