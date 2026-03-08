/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import SwissSection from "@/components/swiss/SwissSection";
import SwissCard from "@/components/swiss/SwissCard";
import SwissButton from "@/components/swiss/SwissButton";
import {
  Github,
  Search,
  MapPin,
  Users,
  User,
  Bot,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function AIConnectAboutPage() {
  const { resolvedTheme } = useTheme();
  const [currentTheme, setCurrentTheme] = useState("light");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setCurrentTheme(resolvedTheme === "dark" ? "dark" : "light");
  }, [resolvedTheme]);

  return (
    <div className="bg-swiss-white min-h-screen pb-20">
      {/* Hero Section */}
      <SwissSection title="AI_CONNECT_PROTOCOL" number="01" variant="white">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-12 mb-12">
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter italic leading-none text-swiss-black mb-8">
              INTELLIGENT_DISCOVERY
            </h1>
            <p className="text-2xl font-bold uppercase tracking-tight max-w-3xl opacity-60">
              A SECURE NEURAL INTERFACE FOR GLOBAL DEVELOPER COORDINATION. DISCOVER, ANALYZE, AND CONNECT WITH THE WORLD&apos;S ELITE TECH TALENT.
            </p>
          </div>

          <div className="lg:col-span-7 space-y-8">
            <h2 className="text-4xl font-black uppercase tracking-tighter italic leading-tight underline decoration-8 decoration-swiss-red">
              OPTIMIZE_YOUR_NETWORK
            </h2>
            <p className="text-xl font-bold uppercase tracking-tight opacity-80 leading-snug">
              AI-CONNECT LEVERAGES HIGH-PERFORMANCE NEURAL NETWORKS TO IDENTIFY GITHUB ENTITIES BASED ON MULTI-DIMENSIONAL CRITERIA: SKILLS, GEOLOCATION, AND CONTRIBUTION METRICS.
            </p>
            <div className="flex flex-wrap gap-6 pt-6">
              <SwissButton variant="primary" size="lg" className="h-20 px-10 text-xl" asChild>
                <Link href="/ai-connect">INITIALIZE_INTERFACE</Link>
              </SwissButton>
              <SwissButton variant="secondary" size="lg" className="h-20 px-10 text-xl" asChild>
                <Link href="/explore">BROWSE_ELITE_NODES</Link>
              </SwissButton>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative aspect-square border-8 border-swiss-black shadow-[16px_16px_0_0_rgba(0,0,0,1)] group overflow-hidden bg-swiss-red">
              <motion.div
                onClick={() => setIsOpen(true)}
                className="w-full h-full cursor-pointer overflow-hidden p-6"
                whileHover={{ scale: 1.05 }}
              >
                <div className="absolute inset-0 opacity-20 pointer-events-none z-10" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                <div className="relative w-full h-full border-4 border-swiss-black">
                  <Image
                    src={`/ai-preview-${currentTheme}.png`}
                    alt="AI-Connect Interface"
                    fill
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                    priority
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </SwissSection>

      {/* Features Grid */}
      <SwissSection title="CORE_FUNCTIONALITY" number="02" variant="white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { icon: Search, title: "NEURAL_SEARCH", desc: "IDENTIFY DEVELOPERS BY STACK, LOGIC, OR INFRASTRUCTURE INTERESTS. SEARCH FOR EXPERTS IN REACT, PYTHON, AND NEURAL NETS." },
            { icon: MapPin, title: "GEOLOCATION_SYNC", desc: "LOCATE NODES WITHIN YOUR PHYSICAL PROXIMITY OR SPECIFIC GLOBAL COORDINATES. REMOTE COLLABORATION OPTIMIZED." },
            { icon: User, title: "INTEL_REPORTS", desc: "ACCESS COMPREHENSIVE DATA ON ENTITIES INCLUDING REPOSITORY METRICS, FOLLOWER VELOCITY, AND CONTRIBUTION LOAD." }
          ].map((feature) => (
            <SwissCard key={feature.title} className="p-10 border-4 border-swiss-black shadow-[12px_12px_0_0_rgba(255,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
              <div className="space-y-6">
                <div className="inline-block p-4 bg-swiss-black text-swiss-white">
                  <feature.icon className="h-10 w-10" />
                </div>
                <h3 className="text-3xl font-black uppercase tracking-tighter italic">{feature.title}</h3>
                <p className="font-bold uppercase tracking-tight opacity-60 leading-tight">
                  {feature.desc}
                </p>
              </div>
            </SwissCard>
          ))}
        </div>
      </SwissSection>

      {/* How It Works */}
      <SwissSection title="OPERATIONAL_GUIDE" number="03" variant="white">
        <div className="space-y-24">
          {[
            { icon: Bot, step: "STEP_01", title: "PROMPT_THE_ASSISTANT", desc: "INTERFACE WITH THE AI USING NATURAL LANGUAGE PROTOCOLS. REQUEST SPECIFIC EXPERTISE OR GEOGRAPHIC DATA.", signals: ["FIND_REACT_EXPERTS_NYC", "TOP_PYTHON_NODES", "LOCATE_NEARBY_ENTITIES"] },
            { icon: Github, step: "STEP_02", title: "ANALYZE_RESULTS", desc: "THE NEURAL ENGINE AGGREGATES DATA FROM GITHUB. REVIEW ACCURATE METRICS, SKILL SETS, AND CONTRIBUTION HISTORY.", signals: ["DATA_AGGREGATION_ACTIVE", "VALIDATING_IDENTITY", "EXTRACTING_Intel"] },
            { icon: Users, step: "STEP_03", title: "ESTABLISH_UPLINK", desc: "ONCE OPTIMAL ENTITIES ARE IDENTIFIED, ESTABLISH A DIRECT COMMUNICATION CHANNEL OR TRACK THEIR PROGRESS.", signals: ["CONNECTION_REQUEST_PENDING", "SYNCING_PROTOCOLS", "UPLINK_ESTABLISHED"] }
          ].map((item, i) => (
            <div key={item.step} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className={cn("lg:col-span-5 space-y-6", i % 2 === 1 ? "lg:order-last" : "")}>
                <div className="flex items-center gap-4 text-swiss-red font-black italic">
                  <span className="text-xl tracking-[0.5em]">{item.step}</span>
                  <div className="h-1 flex-grow bg-swiss-red" />
                </div>
                <h3 className="text-5xl font-black uppercase tracking-tighter italic">{item.title}</h3>
                <p className="text-xl font-bold uppercase tracking-tight opacity-80">{item.desc}</p>
                <div className="flex flex-wrap gap-2 pt-4">
                  {item.signals.map(s => (
                    <span key={s} className="bg-swiss-black text-swiss-white px-3 py-1 text-[10px] font-black uppercase tracking-widest italic">{s}</span>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-7">
                <div className="relative aspect-video border-8 border-swiss-black bg-swiss-muted/10 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                  <item.icon className="h-32 w-32 text-swiss-black/20" />
                  <div className="absolute bottom-6 left-6 right-6 h-12 border-4 border-dashed border-swiss-black/20 flex items-center justify-center">
                    <span className="text-[10px] font-black uppercase tracking-[1em] opacity-20">NEURAL_PREVIEW_ACTIVE</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SwissSection>

      {/* Powered by AI */}
      <SwissSection title="SUBSTRATE" number="04" variant="white">
        <SwissCard className="p-0 border-8 border-swiss-black bg-swiss-black text-swiss-white overflow-hidden shadow-[20px_20px_0_0_rgba(255,0,0,1)]">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-4 p-12 bg-swiss-red flex items-center justify-center border-b-8 lg:border-b-0 lg:border-r-8 border-swiss-black">
              <div className="relative h-48 w-48 invert brightness-0">
                <img
                  src="/gemini-logo.svg"
                  alt="Gemini AI"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <div className="lg:col-span-8 p-12 space-y-8">
              <h2 className="text-5xl font-black uppercase tracking-tighter italic">NEURAL_ENGINE_V4.0</h2>
              <p className="text-2xl font-bold uppercase tracking-tight opacity-80 leading-snug italic">
                AI-CONNECT LEVERAGES GEMINI AI, GOOGLE&apos;S STATE-OF-THE-ART LARGE LANGUAGE MODEL, TO PROVIDE INTELLIGENT AND CONTEXTUAL RESPONSES. THE ENGINE ANALYZES VAST DATA SETS ACROSS THE GITHUB ECOSYSTEM TO MATCH YOU WITH THE MOST RELEVANT DATA NODES.
              </p>
              <div className="h-4 w-full bg-swiss-red animate-pulse" />
            </div>
          </div>
        </SwissCard>
      </SwissSection>

      {/* CTA Section */}
      <SwissSection title="INITIALIZATION" number="05" variant="white">
        <div className="py-20 text-center space-y-12">
          <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter italic leading-none max-w-5xl mx-auto">
            READY_FOR_DEPLOYMENT?
          </h2>
          <SwissButton variant="primary" size="lg" className="h-24 px-16 text-3xl shadow-[12px_12px_0_0_rgba(255,0,0,1)]" asChild>
            <Link href="/ai-connect">START_AI_CONNECT</Link>
          </SwissButton>
        </div>
      </SwissSection>

      {/* FAQ */}
      <SwissSection title="TERMINAL_ENTRIES" number="06" variant="white">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {[
            { q: "IS_INTERFACE_ACCESS_FREE?", a: "AFFIRMATIVE. AI-CONNECT IS ACCESSIBLE TO ALL REGISTERED CODENEARBY NODES WITHOUT ADDITIONAL SURCHARGES." },
            { q: "DATA_ACCURACY_RATING?", a: "AI-CONNECT ANALYZES REAL-TIME GITHUB TELEMETRY. RESULTS MAY BE SUBJECT TO API THROUGHPUT AND PUBLIC DATA PRIVACY PARAMETERS." },
            { q: "REMOTE_LAYER_COMPATIBILITY?", a: "FULLY COMPATIBLE. SEARCH PARAMETERS ALLOW FOR GLOBAL MODULES WITHOUT GEOGRAPHIC CONSTRAINTS." }
          ].map((faq, i) => (
            <div key={i} className="space-y-4 border-l-8 border-swiss-red pl-8">
              <h4 className="text-2xl font-black uppercase tracking-tighter italic text-swiss-black">{faq.q}</h4>
              <p className="text-lg font-bold uppercase tracking-tight opacity-60 leading-tight">{faq.a}</p>
            </div>
          ))}
        </div>
      </SwissSection>

      {/* Modal for image zoom */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-swiss-black/95 p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className="relative w-full h-full max-w-7xl border-8 border-swiss-white shadow-[24px_24px_0_0_rgba(255,0,0,1)] bg-swiss-black flex items-center justify-center p-8"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <div className="absolute top-8 right-8 z-50">
                <SwissButton variant="primary" onClick={() => setIsOpen(false)} className="h-16 w-16 p-0 group">
                  <X className="h-8 w-8 group-hover:rotate-90 transition-transform" />
                </SwissButton>
              </div>
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={`/ai-preview-${currentTheme}.png`}
                  alt="AI-Connect Interface"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
