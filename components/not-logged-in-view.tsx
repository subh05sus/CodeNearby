"use client";

import React from "react";
import { cn } from "@/lib/utils";
import SwissButton from "./swiss/SwissButton";
import SwissCard from "./swiss/SwissCard";
import SwissSection from "./swiss/SwissSection";
import { ArrowRight, Globe, Layers, Zap, Clock, MessageSquare, ChevronRight, Plus } from "lucide-react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { faqs } from "@/consts/faq";
import { useState } from "react";
import { useRouter } from "next/navigation";

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div
      className={cn(
        "group border-4 border-black dark:border-white p-6 transition-all cursor-pointer",
        isOpen ? "bg-black dark:bg-white text-white dark:text-black" : "hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black"
      )}
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="flex justify-between items-center mb-0">
        <p className="text-lg font-black uppercase tracking-tight">{question}</p>
        <Plus className={cn("w-6 h-6 transition-transform", isOpen ? "rotate-45" : "")} />
      </div>
      {isOpen && (
        <div className="mt-6 pt-6 border-t border-white/20 dark:border-black/20">
          <p className="font-medium text-lg italic leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
};

function NotLoggedInView() {
  const router = useRouter();
  return (
    <div className="bg-white dark:bg-black min-h-screen selection:bg-swiss-red selection:text-white transition-colors duration-300">
      {/* 01. NAVIGATION & HERO */}
      <section className="relative h-screen flex flex-col justify-between p-8 border-b-4 border-black dark:border-white overflow-hidden swiss-grid-pattern swiss-noise">

        <div className="mt-32 relative z-10 w-full">
          <div className="flex flex-col gap-2 mb-4">
            <span className="inline-block px-4 py-1 bg-black dark:bg-white text-white dark:text-black text-xs font-black uppercase tracking-widest w-fit">
              AI Connect is Live
            </span>
            <h2 className="text-2xl font-black uppercase tracking-widest text-swiss-red">Welcome to</h2>
          </div>

          <h1 className="text-[12vw] md:text-[min(15vw,15rem)] font-black text-black dark:text-white uppercase tracking- leading-[0.85] mb-8">
            <span className="block">CODE</span>
            <span className="block text-swiss-red">NEARBY</span>
          </h1>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 border-t-4 border-black dark:border-white pt-8">
            <div className="max-w-xl">
              <p className="text-2xl md:text-3xl font-bold uppercase tracking-tighter leading-tight italic text-black dark:text-white">
                A system for universal developer discovery and meaningful connections.
              </p>
            </div>
            <SwissButton
              size="xl"
              className="w-full md:w-auto"
              onClick={() => signIn("github")}
            >
              Initialize Access <ArrowRight className="ml-4 w-8 h-8" />
            </SwissButton>
          </div>
        </div>

        {/* Bauhaus Geometric Element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] -z-10 opacity-10 dark:opacity-20 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-black dark:border-white rounded-full" />
          <div className="absolute top-1/2 left-0 w-full h-1 bg-black dark:bg-white" />
          <div className="absolute top-0 left-1/2 w-1 h-full bg-black dark:bg-white" />
        </div>
      </section>

      {/* 02. METHOD: ASYMMETRIC GRID */}
      <SwissSection number="02" title="Core Features" variant="muted" pattern="dots">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-12 lg:col-span-8 flex flex-col gap-8">
            <SwissCard pattern="grid" className="h-full group">
              <div className="flex justify-between items-start mb-12">
                <Globe className="w-16 h-16 text-swiss-red" />
                <span className="text-4xl font-black opacity-10 dark:opacity-20 uppercase">Geo-Sync</span>
              </div>
              <h3 className="text-5xl font-black mb-6 leading-none text-black dark:text-white">Discover Developers</h3>
              <p className="text-xl max-w-2xl font-medium mb-12 text-black dark:text-white/80">
                Find and connect with developers nearby. Filter by location, skills, and interests to discover potential collaborators in your area.
              </p>
              <div className="h-1 w-24 bg-swiss-red group-hover:w-full transition-all duration-300" />
            </SwissCard>
          </div>

          <div className="md:col-span-12 lg:col-span-4 flex flex-col gap-8">
            <SwissCard variant="accent" className="flex-1 flex flex-col justify-between">
              <div>
                <Zap className="w-12 h-12 mb-8" />
                <h3 className="text-3xl font-black mb-4 uppercase">AI-Connect</h3>
                <p className="font-bold text-lg">Use our intelligent assistant powered by AI to find GitHub developers based on skills, location, or specific requirements through natural conversations.</p>
              </div>
              <div className="pt-8 border-t border-white/20 dark:border-black/20">
                <p className="text-sm uppercase tracking-widest font-black">AI Connect is Live</p>
              </div>
            </SwissCard>
          </div>

          <div className="md:col-span-4 flex flex-col gap-8">
            <SwissCard variant="white" className="flex-1">
              <MessageSquare className="w-12 h-12 mb-8 text-swiss-red" />
              <h3 className="text-3xl font-black mb-4 uppercase text-black dark:text-white">Discussions</h3>
              <p className="font-medium text-black dark:text-white/80">Start or join technical discussions, debug problems together, and exchange ideas with developers in your local community.</p>
            </SwissCard>
          </div>
          <div className="md:col-span-4 flex flex-col gap-8">
            <SwissCard className="flex-1">
              <Clock className="w-12 h-12 mb-8 text-swiss-red" />
              <h3 className="text-2xl font-black mb-4 uppercase text-black dark:text-white">Gatherings</h3>
              <p className="font-medium text-black dark:text-white/80">Join online meetups, pair programming sessions, and code reviews with developers in your timezone and local area.</p>
            </SwissCard>
          </div>
          <div className="md:col-span-4 flex flex-col gap-8">
            <SwissCard className="flex-1">
              <Globe className="w-12 h-12 mb-8 text-swiss-red" />
              <h3 className="text-2xl font-black mb-4 uppercase text-black dark:text-white">Global Community</h3>
              <p className="font-medium text-black dark:text-white/80">Be part of a worldwide network while focusing on your local tech scene. Connect globally, interact locally with developers near you.</p>
            </SwissCard>
          </div>
        </div>
      </SwissSection>

      {/* 03. WHY CODENEARBY */}
      <SwissSection number="03" title="Value Proposition" variant="white">
        <h2 className="text-6xl font-black uppercase mb-12 text-black dark:text-white">Why CodeNearby.</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: Globe, title: "Networking", desc: "Find Developers Near You." },
            { icon: Layers, title: "Collaboration", desc: "Build projects with like-minded developers." },
            { icon: MessageSquare, title: "Feed & Discussions", desc: "Share your thoughts, code snippets, and polls." },
            { icon: Zap, title: "Messaging", desc: "Chat with developers, share code, and brainstorm." },
            { icon: Clock, title: "Gatherings", desc: "Host and join live developer meetups." },
            { icon: Plus, title: "Hackathons", desc: "Find and team up for the next big hackathon." }
          ].map((item, i) => (
            <div key={i} className="border-4 border-black dark:border-white p-8 group hover:bg-swiss-red hover:text-white dark:hover:bg-swiss-red dark:hover:text-white transition-colors duration-150 ease-linear bg-white dark:bg-black">
              <item.icon className="w-10 h-10 mb-8 text-swiss-red group-hover:text-white transition-colors" />
              <h4 className="text-2xl font-black mb-4 uppercase text-black dark:text-white group-hover:text-white">{item.title}</h4>
              <p className="font-bold text-lg leading-tight text-black dark:text-white group-hover:text-white">{item.desc}</p>
              <div className="mt-8 flex justify-end">
                <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform duration-200 text-black dark:text-white group-hover:text-white" />
              </div>
            </div>
          ))}
        </div>
      </SwissSection>

      {/* 04. AI-CONNECT SHOWCASE */}
      <SwissSection title="Innovation" variant="muted" pattern="grid">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2">
            <h3 className="text-6xl font-black uppercase mb-8 leading-none text-black dark:text-white">Meet AI-Connect</h3>
            <p className="text-2xl font-medium mb-12 leading-tight text-black dark:text-white/80">
              Our newest feature uses Gemini AI to help you find the perfect developers for your projects. Search by skills, location, or specific requirements through a conversational interface.
            </p>
            <div className="space-y-4 mb-12">
              {["Find React developers in San Francisco", "Search for Python experts near your location", "Look up specific GitHub users"].map((text, i) => (
                <div key={i} className="flex items-center gap-4 border-l-8 border-swiss-red pl-6 py-2 bg-white/50 dark:bg-black/50">
                  <span className="text-swiss-red font-black text-2xl">✓</span>
                  <p className="font-black uppercase tracking-tight text-black dark:text-white">{text}</p>
                </div>
              ))}
            </div>
            <SwissButton variant="accent" onClick={() => router.push("/ai-connect")}>
              Learn more about AI-Connect <ArrowRight className="ml-4" />
            </SwissButton>
          </div>
          <div className="lg:w-1/2 w-full aspect-square border-8 border-black dark:border-white bg-black dark:bg-neutral-900 relative overflow-hidden group">
            <div className="absolute inset-0 swiss-grid-pattern opacity-20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Image
                src="/ai-preview-light.png"
                alt="AI-Connect Preview"
                fill
                className="object-cover"
              />
              <div className="absolute bottom-8 left-8 right-8 bg-white dark:bg-black p-6 border-t-4 border-swiss-red transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                <p className="font-black uppercase tracking-widest text-xs mb-2 text-black dark:text-white">Feature Preview</p>
                <p className="font-bold italic text-lg text-black dark:text-white">&ldquo;Find a web developers in Kolkata&ldquo;</p>
              </div>
            </div>
          </div>
        </div>
      </SwissSection>

      {/* 05. PLATFORM VISION */}
      <section className="py-32 px-8 border-b-4 border-black dark:border-white bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-start">
            <div>
              <h2 className="text-4xl font-black uppercase mb-8 tracking-tighter text-black dark:text-white">This is the start of something new</h2>
              <p className="text-xl font-medium leading-relaxed mb-8 text-black dark:text-white/80">
                Finding the right developer to work with should be easy. Whether you want a coding partner, to share ideas, or join a project, Codenearby makes it simple. Our goal is to make developer connections quick and easy.
              </p>
              <div className="h-1 lg:w-full bg-black dark:bg-white -ml-8 hidden md:block" />
            </div>
            <div className="md:pt-24">
              <p className="text-xs font-black uppercase tracking-[0.5em] mb-4 opacity-50 dark:opacity-40 italic text-black dark:text-white">I believe</p>
              <blockquote className="text-4xl lg:text-5xl font-black uppercase leading-[0.9] mb-12 text-black dark:text-white">
                &ldquo;Connections should be easy to make because <span className="text-swiss-red">great ideas</span> grow faster together...&ldquo;
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* 06. SYSTEM LOGS */}
      <SwissSection number="06" title="System Logs" variant="muted" pattern="grid">
        <div className="flex flex-col md:flex-row gap-12">
          <div className="md:w-1/3">
            <p className="text-xl font-black uppercase tracking-widest text-swiss-red mb-8">Latest Release: v1.3.0</p>
            <p className="text-2xl font-bold italic leading-tight mb-8 text-black dark:text-white">
              Continuous iteration on the core engine to ensure the highest fidelity of developer connections.
            </p>
            <SwissButton variant="secondary" size="sm">
              View Changelog history <ChevronRight className="ml-2" />
            </SwissButton>
          </div>
          <div className="md:w-2/3">
            <div className="bg-black dark:bg-neutral-900 text-white p-8 border-l-8 border-swiss-red">
              <h5 className="text-xs font-black uppercase tracking-[0.4em] mb-8 opacity-50 dark:opacity-40">Additions</h5>
              <div className="space-y-6">
                {[
                  "Developers API: Extract skills and location via AI, then search GitHub with cached basic search; improved name/bio matching and location filtering",
                  "Developers API: Added AI summary of fetched users; token usage now accounts for both extraction and summary calls",
                  "Profile Analyze: Added AI-generated profile summary and switched to consuming actual tokens used",
                  "Repositories API: Reinforced search-first then AI analysis flow; expanded structured debugging logs",
                  "API v1 routes: Improved structured logging and GitHub request headers to reduce rate-limit issues"
                ].map((log, i) => (
                  <div key={i} className="flex gap-4 items-start border-b border-white/10 dark:border-black/20 pb-4">
                    <span className="text-swiss-red font-black">✽</span>
                    <p className="font-medium text-sm leading-snug">{log}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SwissSection>

      {/* 07. FAQ SECTION */}
      <SwissSection title="Questions" variant="white" className="border-b-0">
        <div className="flex flex-col md:flex-row gap-16">
          <div className="md:w-1/3">
            <h2 className="text-6xl font-black uppercase leading-none tracking-tightest mb-8 text-black dark:text-white">Frequently asked questions</h2>
            <p className="text-xl font-black uppercase tracking-widest text-swiss-red">FAQS</p>
          </div>
          <div className="md:w-2/3 grid grid-cols-1 gap-4">
            {faqs.map((item, i) => (
              <FAQItem key={i} question={item.question} answer={item.answer} />
            ))}
          </div>
        </div>
      </SwissSection>

    </div>
  );
}

export default NotLoggedInView;
