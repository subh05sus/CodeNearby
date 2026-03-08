/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Users, Clock, ArrowRight, Sparkles, MapPin } from "lucide-react";
import LoginButton from "@/components/login-button";
import { formatDistanceToNow } from "date-fns";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { Session } from "next-auth";
import SwissSection from "@/components/swiss/SwissSection";
import SwissCard from "@/components/swiss/SwissCard";
import SwissButton from "@/components/swiss/SwissButton";
import Image from "next/image";

interface Gathering {
  id: string;
  name: string;
  slug: string;
  expiresAt: string;
  hostId: string;
  host: {
    name: string;
    image: string;
  };
  participants: Array<{
    name: string;
    image: string;
    _id: string;
  }>;
}

export default function JoinGatheringPage() {
  const { data: session } = useSession() as { data: Session | null };
  const params = useParams();
  const router = useRouter();
  const [gathering, setGathering] = useState<Gathering | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (session) {
      fetchGathering();
    }
  }, [session]);

  const fetchGathering = async () => {
    try {
      const response = await fetch(`/api/gathering/${params.slug}`);
      if (!response.ok) {
        throw new Error("Failed to fetch gathering");
      }
      const data = await response.json();
      setGathering(data);
    } catch {
      toast.error("Failed to fetch gathering. Please try again.");
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

      if (!response.ok) {
        throw new Error("Failed to join gathering");
      }

      toast.success("Gathering joined successfully!");
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      router.push(`/gathering/${params.slug}`);
    } catch {
      toast.error("Failed to join gathering. Please try again.");
    } finally {
      setJoining(false);
    }
  };

  if (!session) {
    return (
      <SwissSection variant="white" className="py-24">
        <div className="flex flex-col items-center justify-center min-h-[50vh] max-w-2xl mx-auto text-center">
          <SwissCard className="p-12 border-8 border-swiss-black shadow-[24px_24px_0_0_rgba(0,0,0,1)] bg-swiss-white">
            <h1 className="text-5xl font-black uppercase tracking-tighter italic leading-none border-b-8 border-swiss-red pb-4 mb-6">
              RESTRICTED_ACCESS
            </h1>
            <p className="text-sm font-bold uppercase tracking-widest opacity-40 mb-12">
              AUTHENTICATION_REQUIRED_FOR_NODE_ENTRY
            </p>
            <div className="flex justify-center">
              <LoginButton />
            </div>
          </SwissCard>
        </div>
      </SwissSection>
    );
  }

  if (loading) {
    return (
      <SwissSection variant="white" className="py-24">
        <div className="flex justify-center items-center min-h-[50vh]">
          <Loader2 className="h-12 w-12 animate-spin text-swiss-black" />
        </div>
      </SwissSection>
    );
  }

  if (!gathering) {
    return (
      <SwissSection variant="white" className="py-24">
        <div className="flex flex-col items-center justify-center min-h-[50vh] max-w-2xl mx-auto text-center">
          <SwissCard className="p-12 border-4 border-swiss-black bg-swiss-muted/10 opacity-50">
            <h1 className="text-4xl font-black uppercase tracking-tighter italic mb-4">NODE_NOT_FOUND</h1>
            <p className="font-bold uppercase tracking-widest text-xs opacity-60 mb-8 italic leading-relaxed">
              THE_REQUESTED_GATHERING_DOES_NOT_EXIST<br />OR_HAS_BEEN_TERMINATED
            </p>
            <SwissButton variant="secondary" onClick={() => router.push("/gathering")}>
              RETURN_TO_SYSTEM_FEED
            </SwissButton>
          </SwissCard>
        </div>
      </SwissSection>
    );
  }

  if (
    gathering.participants?.find(
      (participant) => participant._id === session?.user?.id
    )
  ) {
    return (
      <SwissSection variant="white" className="py-24">
        <div className="flex flex-col items-center justify-center min-h-[50vh] max-w-2xl mx-auto text-center">
          <SwissCard className="p-12 border-8 border-swiss-black shadow-[16px_16px_0_0_rgba(0,0,0,1)]">
            <h1 className="text-5xl font-black uppercase tracking-tighter italic border-b-8 border-swiss-black pb-4 mb-6">ALREADY_SYNCED</h1>
            <p className="font-bold uppercase tracking-widest text-xs opacity-40 mb-12">YOUR_NODE_IS_ALREADY_CONNECTED_TO_THIS_STREAM</p>
            <SwissButton variant="primary" className="h-16 px-12" onClick={() => router.push(`/gathering/${gathering.slug}`)}>
              ACCESS_GATHERING_DATA
            </SwissButton>
          </SwissCard>
        </div>
      </SwissSection>
    );
  }

  const timeLeft = new Date(gathering.expiresAt).getTime() - new Date().getTime();
  const isExpired = timeLeft <= 0;

  return (
    <SwissSection variant="white" className="py-24">
      <div className="max-w-2xl mx-auto px-4">
        <SwissCard className="relative overflow-hidden p-0 border-8 border-swiss-black shadow-[32px_32px_0_0_rgba(255,0,0,1)] bg-swiss-white">
          {/* Header Region */}
          <div className="p-10 border-b-8 border-swiss-black bg-swiss-black text-swiss-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-swiss-red p-2 border-2 border-swiss-white">
                <Sparkles className="h-5 w-5 text-swiss-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">LIVE_PROTOCOL // ACTIVE</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic leading-[0.9] mb-6">
              {gathering.name}
            </h1>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-swiss-red">
              <Clock className="h-4 w-4" />
              {isExpired
                ? "GATHERING_HAS_EXPIRED"
                : `EXPIRES_IN // ${formatDistanceToNow(new Date(gathering.expiresAt), { addSuffix: true }).toUpperCase()}`}
            </div>
          </div>

          {/* Metadata Region */}
          <div className="p-10 space-y-12">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 border-8 border-swiss-black overflow-hidden grayscale contrast-125">
                <Image src={gathering.host?.image} width={80} height={80} alt={gathering.host?.name} className="object-cover" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">HOST_NODE</p>
                <p className="text-3xl font-black uppercase tracking-tighter italic leading-none">{gathering.host?.name}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between border-b-4 border-swiss-muted pb-4">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-swiss-red" />
                  <span className="text-xs font-black uppercase tracking-widest">PARTICIPANT_LOAD</span>
                </div>
                <span className="text-3xl font-black tracking-tighter">{gathering.participants?.length || 0}</span>
              </div>

              <div className="flex flex-wrap gap-3">
                {gathering.participants?.slice(0, 10).map((participant, i) => (
                  <div key={i} className="w-12 h-12 border-4 border-swiss-black grayscale hover:grayscale-0 transition-all cursor-crosshair overflow-hidden bg-swiss-muted">
                    <Image src={participant.image} width={48} height={48} alt={participant.name} className="object-cover" />
                  </div>
                ))}
                {gathering.participants?.length > 10 && (
                  <div className="h-12 px-3 border-4 border-swiss-black flex items-center justify-center font-black text-xs bg-swiss-black text-swiss-white">
                    +{gathering.participants.length - 10}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-10 bg-swiss-muted/10">
            <SwissButton
              onClick={handleJoinGathering}
              className="w-full h-24 text-2xl border-8 shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:shadow-[16px_16px_0_0_rgba(0,0,0,1)]"
              variant="primary"
              disabled={joining || isExpired}
            >
              {joining ? (
                <Loader2 className="mr-3 h-8 w-8 animate-spin" />
              ) : isExpired ? (
                "NODE_EXPIRED"
              ) : (
                <>
                  JOIN_STREAM
                  <ArrowRight className="ml-4 h-8 w-8 text-swiss-red" />
                </>
              )}
            </SwissButton>
          </div>
        </SwissCard>
      </div>
    </SwissSection>
  );
}
