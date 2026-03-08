import SwissCard from "@/components/swiss/SwissCard";
import SwissButton from "@/components/swiss/SwissButton";
import Link from "next/link";
import { Github } from "lucide-react";

export default function SignIn() {
  return (
    <div className="flex items-center justify-center min-h-[70vh] bg-swiss-white p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      <SwissCard className="w-full max-w-xl p-12 border-8 border-swiss-black shadow-[24px_24px_0_0_rgba(255,0,0,1)] bg-swiss-white relative z-10">
        <div className="space-y-12">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter italic leading-none border-b-8 border-swiss-red pb-4">
              SIGN_IN
            </h1>
            <p className="text-xl font-bold uppercase tracking-tight opacity-40 italic">
              ESTABLISH_NEURAL_UPLINK // ACCESS_CORE_MODULES
            </p>
          </div>

          <div className="space-y-8">
            <SwissButton variant="primary" size="lg" className="w-full h-24 text-2xl shadow-[12px_12px_0_0_rgba(0,0,0,1)]" asChild>
              <a href="/api/auth/signin/github">
                <Github className="h-8 w-8 mr-4 shrink-0" />
                CONTINUE_WITH_GITHUB
              </a>
            </SwissButton>

            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-center opacity-40">
              SECURE_HANDSHAKE_VIA_GITHUB_OAUTH_2.0
            </p>
          </div>
        </div>
      </SwissCard>
    </div>
  )
}

