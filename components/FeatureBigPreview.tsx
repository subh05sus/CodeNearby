import { Bot, ExternalLink, FastForward } from "lucide-react";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import SwissCard from "./swiss/SwissCard";
import SwissButton from "./swiss/SwissButton";

function FeatureBigPreview() {
  return (
    <SwissCard variant="muted" pattern="grid" className="p-0">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/2 p-6 md:p-12">
          <div className="flex items-center mb-8">
            <div className="bg-swiss-red p-3 border-2 border-black dark:border-white mr-4">
              <Bot className="h-8 w-8 text-white dark:text-black" />
            </div>
            <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic leading-none text-black dark:text-white">Meet AI-Connect</h3>
          </div>
          <p className="text-xl md:text-2xl font-bold uppercase tracking-tight leading-tight italic mb-8 text-black dark:text-white/80">
            Our newest feature uses Gemini AI to help you find the perfect
            developers for your projects. Search by skills, location, or
            specific requirements through a conversational interface.
          </p>
          <ul className="mb-12 space-y-4">
            {[
              "Find React developers in San Francisco",
              "Search for Python experts near your location",
              "Look up specific GitHub users"
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-4 border-l-8 border-swiss-red pl-6 py-2 bg-white/50 dark:bg-black/50">
                <span className="text-swiss-red font-black text-2xl">✓</span>
                <span className="font-black uppercase tracking-tight text-xs md:text-sm text-black dark:text-white">{item}</span>
              </li>
            ))}
          </ul>
          <SwissButton variant="primary" asChild>
            <Link
              href="/about/ai-connect"
              className="inline-flex items-center gap-4"
            >
              LEARN_MORE_ABOUT_AI_CONNECT
              <ExternalLink className="h-5 w-5" />
            </Link>
          </SwissButton>
        </div>
        <div className="md:w-1/2 relative min-h-[300px] flex justify-center items-center p-8 bg-black dark:bg-neutral-950 border-l-4 border-black dark:border-white overflow-hidden group">
          <div className="absolute inset-0 swiss-grid-pattern opacity-20" />
          <Image
            src="/ai.gif"
            alt="AI-Connect feature preview"
            width={400}
            height={400}
            className="object-contain relative z-10 grayscale group-hover:grayscale-0 transition-all duration-500"
          />
        </div>
      </div>
    </SwissCard>
  );
}

export default FeatureBigPreview;
