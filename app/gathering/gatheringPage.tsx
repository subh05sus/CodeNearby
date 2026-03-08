/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import SwissButton from "@/components/swiss/SwissButton";
import { Plus } from "lucide-react";
import Link from "next/link";
import { GatheringList } from "@/components/gathering-list";
import LoginButton from "@/components/login-button";
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


export default function GatheringPage() {
  const { data: session } = useSession();
  const [gatherings, setGatherings] = useState<Gathering[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchGatherings();
    }
  }, [session]);

  const fetchGatherings = async () => {
    try {
      const response = await fetch("/api/gathering");
      if (!response.ok) {
        throw new Error("Failed to fetch gatherings");
      }
      const data = await response.json();
      setGatherings(data);
    } catch {
      toast.error("Failed to fetch gatherings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 bg-white dark:bg-black transition-colors duration-300">
        <div className="border-8 border-black dark:border-white p-12 bg-white dark:bg-black text-center shadow-[12px_12px_0_0_rgba(0,0,0,1)] dark:shadow-[12px_12px_0_0_rgba(255,255,255,1)]">
          <h1 className="font-black text-6xl uppercase tracking-tighter mb-6 leading-none text-black dark:text-white">
            ACCESS<br />RESTRICTED
          </h1>
          <p className="font-bold uppercase tracking-tight text-xl mb-8 opacity-60 text-black dark:text-white">
            SIGN IN TO ACCESS GATHERINGS
          </p>
          <div className="flex justify-center">
            <LoginButton />
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-white dark:bg-black transition-colors duration-300">
        <div className="w-32 h-32 bg-black dark:bg-white animate-pulse border-8 border-gray-100 dark:border-gray-900" />
        <p className="font-black mt-6 uppercase  text-xs text-black dark:text-white">SYNCHRONIZING_NODES...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-black min-h-screen pb-24 transition-colors duration-300">
      {/* Swiss Header */}
      <div className="border-b-8 border-black dark:border-white bg-white dark:bg-black sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-black text-8xl uppercase tracking-tighter leading-[0.8] mb-2 text-black dark:text-white">
              GATHERINGS<br />EVENTS
            </h1>
            <p className="font-bold uppercase tracking-[0.2em] text-xs text-swiss-red">
              COMMUNITY / PEER_TO_PEER / V_1.0
            </p>
          </div>

          {gatherings.length !== 0 && (
            <SwissButton asChild className="h-16 px-10 text-xl">
              <Link href="/gathering/create">
                <Plus className="mr-3 h-6 w-6 stroke-[3]" /> CREATE_GATHERING
              </Link>
            </SwissButton>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {gatherings.length === 0 ? (
          <div className="border-8 border-black dark:border-white p-16 bg-white dark:bg-black text-center shadow-[16px_16px_0_0_rgba(0,0,0,1)] dark:shadow-[16px_16px_0_0_rgba(255,255,255,1)] max-w-2xl mx-auto mt-12 transition-colors">
            <h2 className="font-black text-5xl uppercase tracking-tighter mb-6 text-black dark:text-white">NO_GATHERINGS_FOUND</h2>
            <p className="font-bold uppercase tracking-tight text-lg mb-10 opacity-60 leading-tight text-black dark:text-white">
              YOU ARE NOT CURRENTLY PARTICIPATING IN ANY LOCAL EVENTS.
              INITIATE A NEW GATHER_POINT TO CONNECT WITH OTHERS.
            </p>
            <div className="flex justify-center">
              <SwissButton asChild className="h-16 px-10 text-xl">
                <Link href="/gathering/create">
                  <Plus className="mr-3 h-6 w-6 stroke-[3]" /> CREATE_FIRST_EVENT
                </Link>
              </SwissButton>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            <div className="border-l-8 border-black dark:border-white pl-8 transition-colors">
              <p className="font-bold uppercase  text-xs text-swiss-red mb-2">ACTIVE_SESSIONS</p>
              <h3 className="font-black text-4xl uppercase tracking-tighter text-black dark:text-white">SURROUNDING_EVENTS</h3>
            </div>
            <GatheringList gatherings={gatherings} />
          </div>
        )}
      </div>
    </div>
  );
}
