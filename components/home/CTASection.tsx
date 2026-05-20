"use client";

import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Github, ArrowRight } from "lucide-react";

const floatingTags = [
  "React", "TypeScript", "Rust", "Python", "Go",
  "Solidity", "Next.js", "Kubernetes", "ML", "WebAssembly",
];

export function CTASection() {
  return (
    <section className="mb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative rounded-3xl overflow-hidden border border-primary/20 p-10 md:p-16 text-center"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, hsl(24 95% 53% / 0.10), transparent 70%), hsl(var(--card))",
        }}
      >
        {/* Floating tech tags — decorative */}
        <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          {floatingTags.map((tag, i) => (
            <span
              key={tag}
              className="absolute font-mono text-[11px] font-medium px-2.5 py-1 rounded-full border"
              style={{
                color: "hsl(24 95% 53% / 0.6)",
                borderColor: "hsl(24 95% 53% / 0.15)",
                background: "hsl(24 95% 53% / 0.05)",
                top: `${10 + (i % 3) * 30 + Math.sin(i * 1.5) * 10}%`,
                left: i < 5 ? `${3 + i * 4}%` : undefined,
                right: i >= 5 ? `${3 + (i - 5) * 4}%` : undefined,
                opacity: 0.5 + (i % 3) * 0.2,
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-2xl mx-auto">
          <span
            className="inline-block font-mono text-[11px] font-semibold uppercase tracking-[0.18em] px-3 py-1 rounded-full mb-6 text-primary"
            style={{
              background: "hsl(24 95% 53% / 0.10)",
              border: "1px solid hsl(24 95% 53% / 0.25)",
            }}
          >
            Join the community
          </span>

          <h2 className="font-heading text-4xl md:text-6xl tracking-tight mb-5">
            Ready to find
            <br />
            <span className="text-primary italic">your people?</span>
          </h2>

          <p className="text-muted-foreground leading-relaxed mb-10 max-w-md mx-auto">
            Connect with 100M+ GitHub developers. One click to sign up — your
            GitHub profile does the talking.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => signIn("github")}
              className="group flex items-center gap-2.5 px-7 py-3.5 rounded-full font-semibold text-white transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
              style={{ background: "hsl(24 95% 53%)" }}
            >
              <Github className="w-5 h-5" />
              Sign in with GitHub
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>

            <span className="text-sm text-muted-foreground">
              Free forever · No credit card
            </span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
