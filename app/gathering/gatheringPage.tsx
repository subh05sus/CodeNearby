/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2, Plus, Radio, Clock, Users, Github, ArrowRight } from "lucide-react";
import Link from "next/link";
import { GatheringList } from "@/components/gathering-list";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

interface Gathering {
  id: string;
  name: string;
  slug: string;
  expiresAt: string;
  hostId: string;
  participants: string[];
  createdAt: string;
}

function timeUntil(expiresAt: string) {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 0) return `${h}h ${m}m left`;
  return `${m}m left`;
}

export default function GatheringPage() {
  const { data: session } = useSession();
  const [gatherings, setGatherings] = useState<Gathering[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) fetchGatherings();
  }, [session]);

  const fetchGatherings = async () => {
    try {
      const response = await fetch("/api/gathering");
      if (!response.ok) throw new Error();
      const data = await response.json();
      setGatherings(data);
    } catch {
      toast.error("Failed to fetch gatherings.");
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: "hsl(24 95% 53% / 0.10)", border: "1px solid hsl(24 95% 53% / 0.25)" }}
        >
          <Radio className="w-8 h-8 text-primary" />
        </div>
        <div className="text-center max-w-sm">
          <h2 className="font-heading text-2xl mb-2">Live Gatherings</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Join or create live developer gatherings. Chat, share, and connect in real time.
          </p>
        </div>
        <button
          onClick={() => signIn("github")}
          className="flex items-center gap-2.5 px-6 py-3 rounded-full font-semibold text-white transition-all hover:scale-[1.03] active:scale-[0.98]"
          style={{ background: "hsl(24 95% 53%)" }}
        >
          <Github className="w-4 h-4" />
          Sign in with GitHub
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-xl bg-primary/12 animate-pulse" />
          <div className="h-5 w-40 rounded-lg bg-muted animate-pulse" />
        </div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "hsl(24 95% 53% / 0.12)" }}
          >
            <Radio className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="font-heading text-lg leading-tight">Gatherings</h1>
            <p className="text-[11px] text-muted-foreground">
              {gatherings.length} live {gatherings.length === 1 ? "gathering" : "gatherings"}
            </p>
          </div>
        </div>
        {gatherings.length > 0 && (
          <Link
            href="/gathering/create"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold text-sm text-white hover:opacity-90 transition-opacity"
            style={{ background: "hsl(24 95% 53%)" }}
          >
            <Plus className="h-3.5 w-3.5" />
            Create
          </Link>
        )}
      </div>

      {gatherings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-5">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "hsl(24 95% 53% / 0.08)", border: "1px solid hsl(24 95% 53% / 0.20)" }}
          >
            <Radio className="w-8 h-8 text-primary/60" />
          </div>
          <div className="text-center">
            <p className="font-heading text-lg mb-1">No gatherings yet</p>
            <p className="text-sm text-muted-foreground">
              Be the first to create a gathering and invite others!
            </p>
          </div>
          <Link
            href="/gathering/create"
            className="flex items-center gap-1.5 px-6 py-3 rounded-full font-semibold text-sm text-white hover:opacity-90 transition-opacity"
            style={{ background: "hsl(24 95% 53%)" }}
          >
            <Plus className="h-4 w-4" />
            Create Your First Gathering
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {gatherings.map((g) => (
            <Link
              key={g.id}
              href={`/gathering/${g.slug}`}
              className="group flex items-center justify-between rounded-2xl border border-border bg-card hover:border-primary/20 hover:bg-primary/5 px-5 py-4 transition-all duration-200"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                    {g.name}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {timeUntil(g.expiresAt)}
                    </span>
                    {g.participants && (
                      <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {g.participants.length}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <span
                className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full text-white"
                style={{ background: "hsl(24 95% 53%)" }}
              >
                Enter →
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
