"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const stats = [
  {
    value: "100M",
    suffix: "+",
    label: "GitHub Developers",
    sub: "Every GitHub user is part of the network",
  },
  {
    value: "600",
    suffix: "+",
    label: "Active Members",
    sub: "And growing every day",
  },
  {
    value: "50",
    suffix: "+",
    label: "Countries",
    sub: "Truly global from day one",
  },
  {
    value: "∞",
    suffix: "",
    label: "Connections Possible",
    sub: "GitHub's graph is CodeNearby's graph",
  },
];

export function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="mb-20">
      <div className="border border-border rounded-2xl overflow-hidden bg-card">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.08, duration: 0.4, ease: "easeOut" }}
              className="flex flex-col items-center text-center gap-1 py-8 px-5"
            >
              <span className="font-heading text-4xl md:text-5xl tracking-tight">
                {stat.value}
                <span className="text-primary">{stat.suffix}</span>
              </span>
              <span className="text-sm font-semibold text-foreground mt-1">
                {stat.label}
              </span>
              <span className="text-[11px] text-muted-foreground leading-snug max-w-[140px]">
                {stat.sub}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
