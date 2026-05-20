"use client";

import AIChatInterface from "@/components/ai-chat-interface";
import { useSession } from "next-auth/react";
import { Session } from "next-auth";
import { Sparkles, Github, ArrowRight } from "lucide-react";
import { signIn } from "next-auth/react";

export default function FindYourPairPage() {
  const { data: session } = useSession() as { data: Session | null };
  const user = session?.user;

  return (
    // Negate the global layout's py-8 so chat can fill full height cleanly
    <div className="-my-8 flex flex-col" style={{ height: "calc(100dvh - 200px)" }}>
      {/* Compact header */}
      <div className="flex items-center gap-3 px-4 sm:px-6 py-3 flex-shrink-0">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: "hsl(24 95% 53% / 0.12)",
          }}
        >
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div className="min-w-0">
          <h1 className="font-heading text-base leading-tight">AI-Connect</h1>
          <p className="text-[11px] text-muted-foreground leading-tight">
            Find developers by skill, location, or vibe
          </p>
        </div>
        <span
          className="ml-auto text-[10px] font-mono font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full hidden sm:block"
          style={{
            color: "hsl(24 95% 53%)",
            background: "hsl(24 95% 53% / 0.10)",
            border: "1px solid hsl(24 95% 53% / 0.20)",
          }}
        >
          Beta
        </span>
      </div>

      {/* Chat or sign-in wall */}
      <div className="flex-1 overflow-hidden px-0 sm:px-6 min-h-0">
        {user ? (
          <AIChatInterface />
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-6 px-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: "hsl(24 95% 53% / 0.10)",
                border: "1px solid hsl(24 95% 53% / 0.25)",
              }}
            >
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center max-w-sm">
              <h2 className="font-heading text-2xl mb-2">
                Sign in to use AI-Connect
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Chat with our AI to find GitHub developers by skill, location,
                or what you&apos;re building — no searching required.
              </p>
            </div>
            <button
              onClick={() => signIn("github")}
              className="flex items-center gap-2.5 px-6 py-3 rounded-full font-semibold text-white transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
              style={{ background: "hsl(24 95% 53%)" }}
            >
              <Github className="w-4 h-4" />
              Sign in with GitHub
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
