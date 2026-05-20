/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  Users,
  Clock,
  ArrowRight,
  Sparkles,
  Radio,
  Github,
} from "lucide-react";
import LoginButton from "@/components/login-button";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { Session } from "next-auth";
import Link from "next/link";

interface Gathering {
  id: string;
  name: string;
  slug: string;
  expiresAt: string;
  hostId: string;
  host: { name: string; image: string };
  participants: Array<{ name: string; image: string; _id: string }>;
}

const container = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { staggerChildren: 0.08 } },
};
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function JoinGatheringPage() {
  const { data: session } = useSession() as { data: Session | null };
  const params = useParams();
  const router = useRouter();
  const [gathering, setGathering] = useState<Gathering | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (session) fetchGathering();
  }, [session]);

  const fetchGathering = async () => {
    try {
      const response = await fetch(`/api/gathering/${params.slug}`);
      if (!response.ok) throw new Error();
      const data = await response.json();
      setGathering(data);
    } catch {
      toast.error("Failed to fetch gathering.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGathering = async () => {
    setJoining(true);
    try {
      const response = await fetch("/api/gathering/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uniqueSlug: params.slug }),
      });
      if (!response.ok) throw new Error();
      toast.success("Joined!");
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      router.push(`/gathering/${params.slug}`);
    } catch {
      toast.error("Failed to join gathering.");
    } finally {
      setJoining(false);
    }
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-250px)] gap-6 px-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: "hsl(24 95% 53% / 0.10)", border: "1px solid hsl(24 95% 53% / 0.25)" }}
        >
          <Radio className="w-7 h-7 text-primary" />
        </div>
        <div className="text-center max-w-xs">
          <h2 className="font-heading text-xl mb-2">Join this gathering</h2>
          <p className="text-sm text-muted-foreground">Sign in with GitHub to join.</p>
        </div>
        <LoginButton />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100dvh-250px)]">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!gathering) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-250px)] gap-4 text-center px-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: "hsl(var(--muted))" }}
        >
          <Radio className="w-7 h-7 text-muted-foreground/50" />
        </div>
        <h2 className="font-heading text-xl">Gathering Not Found</h2>
        <p className="text-sm text-muted-foreground">
          This gathering doesn&apos;t exist or has expired.
        </p>
        <Link
          href="/gathering"
          className="text-sm font-semibold text-primary hover:underline"
        >
          ← Browse gatherings
        </Link>
      </div>
    );
  }

  if (gathering.participants?.find((p) => p._id === session?.user?.id)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-250px)] gap-4 text-center px-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: "hsl(24 95% 53% / 0.10)" }}
        >
          <Sparkles className="w-7 h-7 text-primary" />
        </div>
        <h2 className="font-heading text-xl">Already Joined</h2>
        <p className="text-sm text-muted-foreground">You&apos;re already in this gathering.</p>
        <button
          onClick={() => router.push(`/gathering/${gathering.slug}`)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm text-white"
          style={{ background: "hsl(24 95% 53%)" }}
        >
          Enter Gathering
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  const timeLeft = new Date(gathering.expiresAt).getTime() - Date.now();
  const isExpired = timeLeft <= 0;
  const h = Math.floor(timeLeft / 3600000);
  const m = Math.floor((timeLeft % 3600000) / 60000);

  return (
    <div className="container mx-auto px-4 py-8 min-h-[calc(100dvh-250px)] flex items-center justify-center">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="w-full max-w-md"
      >
        <div className="rounded-3xl border border-border bg-card overflow-hidden relative">
          {/* Top gradient */}
          <div
            className="absolute inset-x-0 top-0 h-32 pointer-events-none"
            style={{
              background: "linear-gradient(to bottom, hsl(24 95% 53% / 0.08), transparent)",
            }}
          />

          <div className="relative p-6 sm:p-8">
            {/* Status badge */}
            <motion.div variants={item} className="flex items-center gap-2 mb-5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-mono font-semibold text-primary uppercase tracking-widest">
                {isExpired ? "Expired" : "Live Gathering"}
              </span>
            </motion.div>

            {/* Name */}
            <motion.h1 variants={item} className="font-heading text-2xl sm:text-3xl mb-2">
              {gathering.name}
            </motion.h1>

            <motion.div variants={item} className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {isExpired ? "Expired" : `${h}h ${m}m left`}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                {gathering.participants?.length || 0} in here
              </span>
            </motion.div>

            {/* Host */}
            <motion.div variants={item} className="flex items-center gap-3 mb-6 p-4 rounded-2xl bg-muted/50">
              <Avatar className="h-9 w-9 border-2 border-background">
                <AvatarImage src={gathering.host?.image} />
                <AvatarFallback>H</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs text-muted-foreground">Hosted by</p>
                <p className="font-semibold text-sm">{gathering.host?.name}</p>
              </div>
            </motion.div>

            {/* Participant avatars */}
            {gathering.participants?.length > 0 && (
              <motion.div variants={item} className="flex items-center gap-2 mb-6">
                <div className="flex -space-x-2">
                  {gathering.participants.slice(0, 6).map((p, i) => (
                    <Avatar key={i} className="border-2 border-background h-7 w-7">
                      <AvatarImage src={p.image} />
                      <AvatarFallback className="text-[10px]">{p.name?.[0]}</AvatarFallback>
                    </Avatar>
                  ))}
                  {gathering.participants.length > 6 && (
                    <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold border-2 border-background">
                      +{gathering.participants.length - 6}
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">joined</p>
              </motion.div>
            )}

            {/* Join button */}
            <motion.div variants={item}>
              <button
                onClick={handleJoinGathering}
                disabled={joining || isExpired}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                style={{ background: "hsl(24 95% 53%)" }}
              >
                {joining ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Joining...
                  </>
                ) : isExpired ? (
                  "This gathering has expired"
                ) : (
                  <>
                    Join Gathering
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
