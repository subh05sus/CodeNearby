"use client";
import AIChatInterface from "@/components/ai-chat-interface";
import { useSession } from "next-auth/react";
import { Session } from "next-auth";
import { InfoIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import SwissButton from "@/components/swiss/SwissButton";

export default function FindYourPairPage() {
  const { data: session } = useSession() as { data: Session | null };
  const user = session?.user;
  const router = useRouter();
  const handleInfoClick = () => {
    router.push("/about/ai-connect");
  };

  return (
    <main className="container mx-auto px-4 md:px-8 py-8 max-w-7xl">
      <div className="mb-12 border-b-8 border-swiss-black pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative">
        <div className="absolute -top-4 -left-4 w-12 h-12 bg-swiss-red -z-10" />
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic leading-none">
              NEURAL_DISCOVERY
            </h1>
            <InfoIcon
              className="h-10 w-10 cursor-pointer hover:text-swiss-red transition-all duration-200"
              onClick={handleInfoClick}
            />
          </div>
          <p className="text-xl font-bold uppercase tracking-tight opacity-40 italic">
            INTERFACE_VERSION_4.0 // ACTIVE_SEQUENCER
          </p>
        </div>
        <div className="flex items-center gap-4 bg-swiss-black text-swiss-white px-6 py-3 border-4 border-swiss-black">
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">CORE_SYSTEM_GEMINI_AI</span>
          <div className="w-8 h-1 bg-swiss-red" />
        </div>
      </div>

      <div className="w-full">
        {user ? (
          <AIChatInterface />
        ) : (
          <div className="h-[calc(100vh-20rem)] border-8 border-swiss-black bg-swiss-white flex flex-col items-center justify-center p-12 text-center group relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
            <div className="relative z-10 space-y-8">
              <div className="inline-block bg-swiss-red text-swiss-white px-8 py-4 text-3xl font-black uppercase tracking-tighter italic mb-4 shadow-[12px_12px_0_0_rgba(0,0,0,1)]">
                RESTRICTED_ACCESS
              </div>
              <h3 className="text-4xl font-black uppercase tracking-tighter italic leading-none">
                AUTHENTICATION_REQUIRED
              </h3>
              <p className="text-xl font-bold uppercase tracking-tight max-w-xl mx-auto opacity-60">
                ESTABLISH A SECURE SESSION UPLINK TO ACCESS THE NEURAL DISCOVERY INTERFACE. FIND YOUR OPTIMAL DEVELOPER MATCH THROUGH HIGH-PERFORMANCE SEARCH.
              </p>
              <SwissButton variant="primary" size="lg" className="h-20 px-12 text-xl" onClick={() => router.push("/auth/signin")}>
                INITIALIZE_UPLINK
              </SwissButton>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
