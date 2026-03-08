"use client";

import type React from "react";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import SwissButton from "@/components/swiss/SwissButton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Users2, Clock, Sparkles } from "lucide-react";
import LoginButton from "@/components/login-button";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const expirationOptions = [
  { value: "1h", label: "1 HOUR" },
  { value: "2h", label: "2 HOURS" },
  { value: "4h", label: "4 HOURS" },
  { value: "8h", label: "8 HOURS" },
  { value: "12h", label: "12 HOURS" },
  { value: "24h", label: "24 HOURS" },
  { value: "36h", label: "36 HOURS" },
  { value: "72h", label: "72 HOURS" },
];

export default function CreateGatheringPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [name, setName] = useState("");
  const [expiration, setExpiration] = useState("4h");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast.error("You must be logged in to create a gathering.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/gathering", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, expiration }),
      });

      if (!response.ok) {
        throw new Error("Failed to create gathering");
      }

      const data = await response.json();

      toast.success("Gathering created successfully!");
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      router.push(`/gathering/${data.slug}`);
    } catch {
      toast.error("Failed to create gathering. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
        <div className="border-8 border-swiss-black p-12 bg-swiss-white text-center shadow-[12px_12px_0_0_rgba(0,0,0,1)]">
          <h1 className="font-black text-6xl uppercase tracking-tighter mb-6 leading-none">
            ACCESS<br />RESTRICTED
          </h1>
          <p className="font-bold uppercase tracking-tight text-xl mb-8 opacity-60">
            SIGN IN TO CREATE GATHERINGS
          </p>
          <div className="flex justify-center">
            <LoginButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-swiss-white min-h-screen pb-24">
      {/* Swiss Header */}
      <div className="border-b-8 border-swiss-black bg-swiss-white sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="font-black text-8xl uppercase tracking-tighter leading-[0.8] mb-2">
            INITIATE<br />SESSION
          </h1>
          <p className="font-bold uppercase tracking-[0.2em] text-xs text-swiss-red">
            NEW_GATHERING / V_1.0 / BROADCASTING_SIGNAL
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 flex justify-center">
        <div className="w-full max-w-2xl bg-swiss-white border-8 border-swiss-black p-12 shadow-[24px_24px_0_0_rgba(0,0,0,1)]">
          <div className="mb-12 border-l-8 border-swiss-black pl-8">
            <h2 className="font-black text-4xl uppercase tracking-tighter mb-2">GATHER_POINT_CONFIG</h2>
            <p className="font-bold uppercase tracking-widest text-xs text-swiss-red">ESTABLISHING_PEER_NETWORK</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-4">
              <label htmlFor="name" className="font-black text-xs uppercase tracking-widest flex items-center gap-2">
                <Users2 className="h-4 w-4 text-swiss-red" /> GATHERING_NAME
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="IDENTIFIER..."
                className="h-16 px-6 bg-swiss-white border-4 border-swiss-black rounded-none font-black uppercase tracking-tight focus:bg-swiss-muted transition-colors outline-none text-xl"
              />
            </div>

            <div className="space-y-4">
              <label htmlFor="expiration" className="font-black text-xs uppercase tracking-widest flex items-center gap-2">
                <Clock className="h-4 w-4 text-swiss-red" /> EXPIRATION_PROTOCOL
              </label>
              <Select value={expiration} onValueChange={setExpiration}>
                <SelectTrigger className="h-16 px-6 bg-swiss-white border-4 border-swiss-black rounded-none font-black uppercase tracking-tight focus:bg-swiss-muted transition-colors outline-none text-xl">
                  <SelectValue placeholder="DURATION..." />
                </SelectTrigger>
                <SelectContent className="bg-swiss-white border-4 border-swiss-black rounded-none shadow-[10px_10px_0_0_rgba(0,0,0,1)]">
                  {expirationOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="font-black uppercase py-3 hover:bg-swiss-black hover:text-swiss-white transition-colors cursor-pointer rounded-none">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="font-bold uppercase tracking-tight text-[10px] opacity-40">
                THE SESSIONS WILL AUTOMATICALLY TERMINATE AFTER THIS DURATION.
              </p>
            </div>

            <div className="pt-8 border-t-8 border-swiss-black">
              <SwissButton
                type="submit"
                disabled={loading}
                className="w-full h-20 text-3xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-3 h-8 w-8 animate-spin" /> INITIALIZING...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-3 h-8 w-8" /> CREATE_GATHER_POINT
                  </>
                )}
              </SwissButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
