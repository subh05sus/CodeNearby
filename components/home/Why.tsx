"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

const reasons = [
  {
    number: "01",
    category: "Networking",
    title: "Find Developers Near You",
    body: "Your next coding partner is just a connection away. Whether you need a co-founder, mentor, or someone to debug with — CodeNearby puts you next to the right people.",
    src: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop",
  },
  {
    number: "02",
    category: "Collaboration",
    title: "Build Projects Together",
    body: "Great projects start with great teams. Find developers with matching interests for hackathons, open-source work, or that startup idea you can't stop thinking about.",
    src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop",
  },
  {
    number: "03",
    category: "Feed & Discussions",
    title: "Your Ideas, Your Space",
    body: "Post polls, share code snippets, start discussions. Debugging help or JavaScript memes — the feed is where developers show up as people, not just profiles.",
    src: "https://images.unsplash.com/photo-1554177255-61502b352de3?q=80&w=1200&auto=format&fit=crop",
  },
  {
    number: "04",
    category: "Messaging",
    title: "Code Together, Chat Together",
    body: "Real-time messaging built for developers. Share GitHub links, discuss frameworks, brainstorm ideas — everything in one place, no switching tabs.",
    src: "https://images.unsplash.com/photo-1611511574646-3c5a5824e12b?q=80&w=1200&auto=format&fit=crop",
  },
  {
    number: "05",
    category: "Gatherings",
    title: "Meet, Code, Connect",
    body: "Host or join developer meetups, coding sessions, and tech talks. Virtual or in-person — find events that match your timezone and interests.",
    src: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1200&auto=format&fit=crop",
  },
];

export function Why() {
  const [active, setActive] = useState(0);

  return (
    <section className="w-full py-20">
      <div className="mb-12">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary mb-3">
          Why CodeNearby
        </p>
        <h2 className="text-3xl md:text-5xl font-heading tracking-tight">
          Built for how developers actually work
        </h2>
      </div>

      {/* Desktop: side-by-side */}
      <div className="hidden md:grid md:grid-cols-5 gap-8 items-start">
        {/* Left: numbered tabs */}
        <div className="col-span-2 flex flex-col gap-1">
          {reasons.map((r, i) => (
            <button
              key={r.number}
              onClick={() => setActive(i)}
              className={`group text-left px-5 py-4 rounded-xl transition-all duration-200 ${
                active === i
                  ? "bg-primary/8 border border-primary/20"
                  : "hover:bg-muted/60 border border-transparent"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span
                    className={`font-mono text-xs font-semibold tracking-widest block mb-0.5 transition-colors duration-200 ${
                      active === i ? "text-primary" : "text-muted-foreground/50"
                    }`}
                  >
                    {r.number}
                  </span>
                  <span
                    className={`font-heading text-lg transition-colors duration-200 ${
                      active === i ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {r.title}
                  </span>
                </div>
                <ChevronRight
                  className={`w-4 h-4 flex-shrink-0 transition-all duration-200 ${
                    active === i
                      ? "text-primary translate-x-0.5"
                      : "text-muted-foreground/30 group-hover:text-muted-foreground/60"
                  }`}
                />
              </div>
            </button>
          ))}
        </div>

        {/* Right: content panel */}
        <div className="col-span-3 sticky top-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <div className="relative rounded-2xl overflow-hidden aspect-video mb-6 bg-muted">
                <Image
                  src={reasons[active].src}
                  alt={reasons[active].title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <span
                  className="absolute bottom-4 left-4 text-[11px] font-mono font-semibold uppercase tracking-[0.18em] px-2.5 py-1 rounded-full text-white"
                  style={{ background: "hsl(24 95% 53% / 0.85)" }}
                >
                  {reasons[active].category}
                </span>
              </div>
              <p className="text-muted-foreground leading-relaxed text-base">
                {reasons[active].body}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile: accordion */}
      <div className="md:hidden flex flex-col gap-3">
        {reasons.map((r, i) => (
          <div
            key={r.number}
            className={`rounded-xl border transition-colors duration-200 overflow-hidden ${
              active === i ? "border-primary/20" : "border-border"
            }`}
          >
            <button
              onClick={() => setActive(active === i ? -1 : i)}
              className="w-full text-left px-5 py-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-primary font-semibold tracking-widest">
                  {r.number}
                </span>
                <span className="font-heading text-base">{r.title}</span>
              </div>
              <motion.div
                animate={{ rotate: active === i ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </motion.div>
            </button>

            <AnimatePresence>
              {active === i && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5">
                    <div className="relative rounded-xl overflow-hidden aspect-video mb-4 bg-muted">
                      <Image
                        src={r.src}
                        alt={r.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {r.body}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}
