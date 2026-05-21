"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Check, Minus } from "lucide-react";

const features = [
  { label: "GitHub-native profiles", cn: true, li: false, tw: false },
  { label: "Location-based discovery", cn: true, li: true, tw: false },
  { label: "Developer-only community", cn: true, li: false, tw: false },
  { label: "AI developer search", cn: true, li: false, tw: false },
  { label: "Virtual gatherings / meetups", cn: true, li: true, tw: false },
  { label: "Real-time direct messaging", cn: true, li: true, tw: true },
  { label: "Open source & transparent", cn: true, li: false, tw: false },
  { label: "Free, no credit card", cn: true, li: true, tw: true },
  { label: "Skill & repo verification", cn: true, li: false, tw: false },
];

const platforms = [
  { name: "CodeNearby", highlight: true },
  { name: "LinkedIn", highlight: false },
  { name: "Twitter / X", highlight: false },
];

function Cell({ value, highlight }: { value: boolean; highlight: boolean }) {
  if (value) {
    return (
      <div className="flex justify-center">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center"
          style={
            highlight
              ? { background: "hsl(24 95% 53%)", color: "white" }
              : { background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }
          }
        >
          <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-center">
      <Minus className="w-4 h-4 text-muted-foreground/40" />
    </div>
  );
}

export function CompareSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="mb-24">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4 }}
        className="text-center mb-10"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary mb-3">
          Built differently
        </p>
        <h2 className="text-3xl md:text-4xl font-heading tracking-tight">
          Why developers choose CodeNearby
        </h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="max-w-3xl mx-auto rounded-2xl border border-border bg-card overflow-hidden"
      >
        {/* Header row */}
        <div className="grid grid-cols-4 border-b border-border">
          <div className="p-4 col-span-1" />
          {platforms.map((p) => (
            <div
              key={p.name}
              className="p-4 text-center flex flex-col items-center justify-center gap-1"
              style={
                p.highlight
                  ? { background: "hsl(24 95% 53% / 0.06)" }
                  : {}
              }
            >
              <span
                className="text-xs font-bold"
                style={p.highlight ? { color: "hsl(24 95% 53%)" } : { color: "hsl(var(--muted-foreground))" }}
              >
                {p.name}
              </span>
              {p.highlight && (
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white"
                  style={{ background: "hsl(24 95% 53%)" }}
                >
                  YOU ARE HERE
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Feature rows */}
        {features.map((f, i) => (
          <motion.div
            key={f.label}
            initial={{ opacity: 0, x: -8 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2 + i * 0.05 }}
            className="grid grid-cols-4 border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
          >
            <div className="p-3.5 px-4 text-xs text-muted-foreground leading-snug flex items-center">
              {f.label}
            </div>
            <div
              className="p-3.5 flex items-center justify-center"
              style={{ background: "hsl(24 95% 53% / 0.04)" }}
            >
              <Cell value={f.cn} highlight />
            </div>
            <div className="p-3.5 flex items-center justify-center">
              <Cell value={f.li} highlight={false} />
            </div>
            <div className="p-3.5 flex items-center justify-center">
              <Cell value={f.tw} highlight={false} />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
