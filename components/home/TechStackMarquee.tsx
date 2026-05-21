"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const row1 = [
  { name: "TypeScript", color: "#3178C6" },
  { name: "React", color: "#61DAFB" },
  { name: "Python", color: "#3776AB" },
  { name: "Rust", color: "#CE422B" },
  { name: "Go", color: "#00ADD8" },
  { name: "Next.js", color: "#888" },
  { name: "Solidity", color: "#9B59B6" },
  { name: "Swift", color: "#F05138" },
  { name: "Kubernetes", color: "#326CE5" },
  { name: "GraphQL", color: "#E10098" },
  { name: "TensorFlow", color: "#FF6F00" },
  { name: "Docker", color: "#2496ED" },
];

const row2 = [
  { name: "Vue.js", color: "#42B883" },
  { name: "Kotlin", color: "#7F52FF" },
  { name: "WebAssembly", color: "#654FF0" },
  { name: "Elixir", color: "#6E4A7E" },
  { name: "Haskell", color: "#5D4F85" },
  { name: "C++", color: "#00599C" },
  { name: "Java", color: "#ED8B00" },
  { name: "Flutter", color: "#54C5F8" },
  { name: "Svelte", color: "#FF3E00" },
  { name: "Ruby", color: "#CC342D" },
  { name: "Terraform", color: "#7B42BC" },
  { name: "PostgreSQL", color: "#4169E1" },
];

function MarqueeRow({
  items,
  reverse = false,
}: {
  items: typeof row1;
  reverse?: boolean;
}) {
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden">
      <div
        className="flex gap-3 w-max"
        style={{
          animation: `${reverse ? "marquee-reverse" : "marquee"} 30s linear infinite`,
        }}
      >
        {doubled.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium whitespace-nowrap select-none"
            style={{
              borderColor: `${item.color}30`,
              background: `${item.color}10`,
              color: item.color,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: item.color }}
            />
            {item.name}
          </span>
        ))}
      </div>
    </div>
  );
}

export function TechStackMarquee() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="mb-20 overflow-hidden">
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0) }
          to   { transform: translateX(-50%) }
        }
        @keyframes marquee-reverse {
          from { transform: translateX(-50%) }
          to   { transform: translateX(0) }
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary mb-2">
          Every stack welcome
        </p>
        <h2 className="text-2xl md:text-3xl font-heading tracking-tight">
          Connect across every language &amp; framework
        </h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex flex-col gap-3"
        style={{ maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }}
      >
        <MarqueeRow items={row1} />
        <MarqueeRow items={row2} reverse />
      </motion.div>
    </section>
  );
}
