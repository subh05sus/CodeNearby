"use client";

import { motion, useInView } from "framer-motion";
import { Github, Compass, Rocket } from "lucide-react";
import { useRef } from "react";

const steps = [
  {
    number: "01",
    icon: Github,
    title: "Sign up with GitHub",
    description:
      "One click with your GitHub account. Your profile, repos, and activity come with you — no forms to fill, no setup required.",
  },
  {
    number: "02",
    icon: Compass,
    title: "Discover & Connect",
    description:
      "Browse developers by location and skill, or let AI-Connect find the right people through natural conversation. Send a request, start a conversation.",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Build Together",
    description:
      "Join gatherings, co-work on projects, discuss ideas in the feed. From first connection to shipped product — CodeNearby keeps you close.",
  },
];

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="mb-24">
      <div className="text-center mb-14">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary mb-3">
          How it works
        </p>
        <h2 className="text-3xl md:text-5xl font-heading tracking-tight">
          Three steps. Zero friction.
        </h2>
      </div>

      <div className="relative">
        {/* Connecting line — desktop only */}
        <div className="hidden md:block absolute top-10 left-[16.5%] right-[16.5%] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.15, duration: 0.45, ease: "easeOut" }}
              className="relative flex flex-col items-center text-center md:items-center"
            >
              {/* Icon circle */}
              <div
                className="relative z-10 w-20 h-20 rounded-full border-2 flex items-center justify-center mb-6 bg-background"
                style={{ borderColor: "hsl(24 95% 53% / 0.35)" }}
              >
                <step.icon className="w-8 h-8 text-primary" />
                <span
                  className="absolute -top-2 -right-2 font-mono text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center text-white"
                  style={{ background: "hsl(24 95% 53%)" }}
                >
                  {i + 1}
                </span>
              </div>

              <h3 className="text-xl font-heading mb-3">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
