"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    quote:
      "Found collaborators for a side project within days. The GitHub-first approach means no awkward cold intros — people can see your work before they even say hello.",
    name: "Rohit Debnath",
    handle: "@rohitdebnath",
    role: "Developer at Intervue.io",
    initials: "RD",
  },
  {
    quote:
      "Coming from a research background at ISRO, I wasn't sure how to break into the indie dev world. CodeNearby connected me with people building real products — that peer learning changed everything.",
    name: "Souradip Pal",
    handle: "@souradippal",
    role: "Ex-Intern at ISRO",
    initials: "SP",
    featured: true,
  },
  {
    quote:
      "As an SDE at a fintech, it's hard to find developers working on similar problems. CodeNearby surfaced people I wouldn't have found on LinkedIn in months.",
    name: "Subinoy Biswas",
    handle: "@subinoybiswas",
    role: "SDE-I at Juspay",
    initials: "SB",
  },
  {
    quote:
      "Building solo is rough. Used CodeNearby to find a design partner for my product. We shipped v1 in three weeks — wouldn't have happened otherwise.",
    name: "Sayan Ghosh",
    handle: "@sayanghost_dev",
    role: "Indie Hacker",
    initials: "SG",
  },
  {
    quote:
      "The gatherings feature is underrated. Hosted a session on side-project ideation, got 8 devs to show up. Now we have a group chat and two collabs running.",
    name: "Samiran Pal",
    handle: "@samiranpal",
    role: "Indie Hacker",
    initials: "SM",
  },
];

function TestimonialCard({
  quote,
  name,
  handle,
  role,
  initials,
  featured,
  delay,
}: (typeof testimonials)[0] & { delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className={`relative flex flex-col justify-between rounded-2xl border p-6 transition-colors duration-300 ${
        featured
          ? "bg-primary/5 border-primary/25 md:row-span-2"
          : "bg-card border-border hover:border-primary/20"
      }`}
    >
      <span
        className="absolute top-4 right-5 font-heading text-6xl leading-none select-none"
        style={{
          color: featured
            ? "hsl(24 95% 53% / 0.20)"
            : "hsl(24 95% 53% / 0.10)",
        }}
        aria-hidden
      >
        &ldquo;
      </span>

      <p
        className={`font-heading leading-relaxed relative z-10 ${
          featured
            ? "text-xl md:text-2xl text-foreground"
            : "text-base text-foreground/80"
        }`}
      >
        &ldquo;{quote}&rdquo;
      </p>

      <div className="flex items-center gap-3 mt-6">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
            featured ? "bg-primary text-white" : "bg-muted text-foreground"
          }`}
        >
          {initials}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground leading-tight">
            {name}
          </p>
          <p className="font-mono text-[11px] text-muted-foreground">{handle}</p>
        </div>
        <span className="ml-auto text-[11px] text-muted-foreground hidden sm:block whitespace-nowrap">
          {role}
        </span>
      </div>
    </motion.div>
  );
}

export function TestimonialsSection() {
  return (
    <section className="mb-24">
      <div className="text-center mb-12">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary mb-3">
          Community
        </p>
        <h2 className="text-3xl md:text-5xl font-heading tracking-tight">
          Developers love it. Here&apos;s why.
        </h2>
      </div>

      {/* Desktop: 3-col, featured spans 2 rows — layout: [Rohit][Souradip★][Subinoy] / [Sayan][★cont][Samiran] */}
      <div className="hidden md:grid grid-cols-3 gap-4">
        <TestimonialCard {...testimonials[0]} delay={0} />
        <TestimonialCard {...testimonials[1]} delay={0.06} />
        <TestimonialCard {...testimonials[2]} delay={0.12} />
        <TestimonialCard {...testimonials[3]} delay={0.18} />
        <TestimonialCard {...testimonials[4]} delay={0.24} />
      </div>

      {/* Mobile: single col */}
      <div className="md:hidden flex flex-col gap-4">
        {testimonials.map((t, i) => (
          <TestimonialCard key={t.handle} {...t} delay={i * 0.06} />
        ))}
      </div>
    </section>
  );
}
