/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Github } from "lucide-react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useState, useEffect } from "react";
import SwissCard from "./swiss/SwissCard";
import SwissButton from "./swiss/SwissButton";

interface InviteContentProps {
  referrer: string;
}

export default function InviteContent({ referrer }: InviteContentProps) {
  const [referrerData, setReferrerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReferrer() {
      try {
        const response = await fetch(`/api/user-by-github/${referrer}`);
        if (!response.ok) throw new Error("Failed to fetch referrer data");
        const data = await response.json();
        setReferrerData(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    if (referrer) {
      fetchReferrer();
    }
  }, [referrer]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <p className="text-2xl font-black uppercase tracking-[0.5em] animate-pulse">Loading...</p>
    </div>
  );
  if (!referrerData) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <p className="text-2xl font-black uppercase tracking-[0.5em] text-swiss-red">Referrer not found</p>
    </div>
  );

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-20rem)] py-24">
      <SwissCard variant="white" pattern="grid" className="w-full max-w-md p-12">
        <div className="flex flex-col items-center text-center">
          <div className="mb-8 relative">
            <Image
              src={referrerData.image}
              height={80}
              width={80}
              alt={""}
              className="rounded-none border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)]"
            />
          </div>
          <p className="text-xs font-black uppercase tracking-[0.4em] text-swiss-red mb-4 italic">Invitation Received</p>
          <h2 className="text-4xl font-black uppercase tracking-tighter leading-none mb-8">
            <span className="text-swiss-red">{referrerData.name || "Someone"}</span> invited you to join CodeNearby
          </h2>
          <p className="font-medium text-lg leading-tight mb-12">
            Discover GitHub developers in your area or search for specific users worldwide.
          </p>
          <SwissButton
            variant="accent"
            size="lg"
            className="w-full"
            onClick={async () => {
              await signIn("github", {
                callbackUrl: `/user/${referrerData.githubId as string}`,
              });
            }}
          >
            <Github className="inline mr-4" />
            LOGIN WITH GITHUB
          </SwissButton>
        </div>
      </SwissCard>
    </div>
  );
}
