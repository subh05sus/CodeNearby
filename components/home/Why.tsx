"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, MapPin, GitMerge, Users, Rss, Code2, Star, Bot, Sparkles } from "lucide-react";

// ── Visual panels ──────────────────────────────────────────────────────────

function NetworkPanel() {
  const nodes = [
    { cx: 50, cy: 50, r: 18, label: "You", main: true },
    { cx: 15, cy: 20, r: 11, label: "Sara", main: false },
    { cx: 85, cy: 18, r: 11, label: "Mike", main: false },
    { cx: 10, cy: 72, r: 11, label: "Priya", main: false },
    { cx: 88, cy: 75, r: 11, label: "Leo", main: false },
    { cx: 50, cy: 88, r: 11, label: "Aiko", main: false },
  ];
  const edges = [[0,1],[0,2],[0,3],[0,4],[0,5],[1,2],[3,5]];

  return (
    <div className="w-full aspect-video rounded-2xl border border-border bg-gradient-to-br from-muted/60 to-muted/20 flex items-center justify-center p-4 overflow-hidden relative">
      <svg viewBox="0 0 100 100" className="w-full max-w-[260px]">
        {/* Edges */}
        {edges.map(([a,b], i) => (
          <motion.line
            key={i}
            x1={nodes[a].cx} y1={nodes[a].cy}
            x2={nodes[b].cx} y2={nodes[b].cy}
            stroke="hsl(24 95% 53% / 0.25)"
            strokeWidth="0.6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.08 }}
          />
        ))}
        {/* Nodes */}
        {nodes.map((n, i) => (
          <motion.g key={i} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.1, type: "spring", stiffness: 260 }}
            style={{ transformOrigin: `${n.cx}px ${n.cy}px` }}>
            <circle cx={n.cx} cy={n.cy} r={n.r}
              fill={n.main ? "hsl(24 95% 53%)" : "hsl(var(--card))"}
              stroke={n.main ? "hsl(24 95% 53%)" : "hsl(24 95% 53% / 0.35)"}
              strokeWidth={n.main ? 0 : 0.8}
            />
            {n.main && (
              <text x={n.cx} y={n.cy + 1} textAnchor="middle" dominantBaseline="middle"
                fill="white" fontSize="5" fontWeight="bold">You</text>
            )}
            {!n.main && (
              <>
                <circle cx={n.cx} cy={n.cy} r={n.r - 1}
                  fill="hsl(24 95% 53% / 0.08)" />
                <text x={n.cx} y={n.cy + 4} textAnchor="middle" dominantBaseline="middle"
                  fill="hsl(24 95% 53%)" fontSize="3.2" fontWeight="600">{n.label}</text>
                <MapPin x={n.cx - 2} y={n.cy - 5.5} width="4" height="4"
                  fill="hsl(24 95% 53% / 0.7)" />
              </>
            )}
          </motion.g>
        ))}
      </svg>
      {/* Decorative ping on center */}
      <span className="absolute" style={{ top: "43%", left: "50%", transform: "translate(-50%,-50%)" }}>
        <span className="absolute inline-flex h-6 w-6 rounded-full opacity-30 animate-ping"
          style={{ background: "hsl(24 95% 53%)" }} />
      </span>
    </div>
  );
}

function CollabPanel() {
  const cols = 20;
  const rows = 6;
  const levels = ["00", "1a", "38", "60", "90"];
  return (
    <div className="w-full aspect-video rounded-2xl border border-border bg-gradient-to-br from-muted/60 to-muted/20 flex flex-col items-center justify-center gap-5 p-6 overflow-hidden">
      {/* Contribution graph */}
      <div>
        <p className="text-[10px] text-muted-foreground font-mono mb-2 text-center">contributions · last 120 days</p>
        <div className="flex gap-0.5">
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="flex flex-col gap-0.5">
              {Array.from({ length: rows }).map((_, r) => {
                const seed = (c * 7 + r * 3 + c * r) % 5;
                const alpha = levels[seed];
                return (
                  <motion.div
                    key={r}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (c * rows + r) * 0.003, duration: 0.2 }}
                    className="w-3 h-3 rounded-sm"
                    style={{ background: `hsl(24 95% 53% / 0.${alpha})` }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {/* Branch merge visual */}
      <div className="flex items-center gap-2">
        {[
          { label: "feat/auth", color: "#6366f1" },
          { label: "main", color: "hsl(24 95% 53%)", active: true },
          { label: "fix/ui", color: "#22c55e" },
        ].map((b) => (
          <span key={b.label}
            className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
            style={{ background: `${b.color}18`, color: b.color, border: `1px solid ${b.color}35` }}>
            <GitMerge className="w-2.5 h-2.5" />{b.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function FeedPanel() {
  return (
    <div className="w-full aspect-video rounded-2xl border border-border bg-gradient-to-br from-muted/60 to-muted/20 flex items-center justify-center p-4 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm rounded-xl border border-border bg-card p-3 shadow-sm space-y-2.5"
      >
        {/* Post header */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold"
            style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}>RK</div>
          <div>
            <p className="text-[11px] font-semibold">@rohan_k</p>
            <p className="text-[9px] text-muted-foreground">5 min ago</p>
          </div>
          <span className="ml-auto">
            <Rss className="w-3 h-3 text-primary" />
          </span>
        </div>
        {/* Code block */}
        <div className="rounded-lg bg-muted/60 border border-border px-2.5 py-2 font-mono text-[9px] text-muted-foreground leading-relaxed">
          <span className="text-blue-400">const</span>{" "}
          <span className="text-green-400">debounce</span> = (fn, ms) =&gt; {"{"}
          <br />
          {"  "}<span className="text-blue-400">let</span> t;
          <br />
          {"  "}<span className="text-blue-400">return</span> (...args) =&gt; {"{"} clearTimeout(t); t = setTimeout(fn, ms) {"}"}
          <br />
          {"}"}
        </div>
        {/* Poll */}
        <div className="space-y-1">
          {[{ label: "TypeScript", pct: 68 }, { label: "JavaScript", pct: 32 }].map((opt) => (
            <div key={opt.label} className="flex items-center gap-2">
              <div className="flex-1 h-4 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${opt.pct}%` }}
                  transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ background: "hsl(24 95% 53%)" }}
                />
              </div>
              <span className="text-[9px] font-mono text-muted-foreground w-6 text-right">{opt.pct}%</span>
              <span className="text-[9px] text-muted-foreground">{opt.label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function ChatPanel() {
  const messages = [
    { side: "left",  text: "Hey, wanna pair on the auth module?", code: false, delay: 0 },
    { side: "right", text: "Sure! Check this snippet first:", code: false, delay: 0.15 },
    { side: "right", text: "jwt.verify(token, secret)", code: true,  delay: 0.28 },
    { side: "left",  text: "Nice — let's add refresh tokens too 🔑", code: false, delay: 0.42 },
  ];
  return (
    <div className="w-full aspect-video rounded-2xl border border-border bg-gradient-to-br from-muted/60 to-muted/20 flex items-end justify-center p-4 overflow-hidden">
      <div className="w-full max-w-xs space-y-2">
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8, x: m.side === "left" ? -8 : 8 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            transition={{ delay: m.delay, duration: 0.3, ease: "easeOut" }}
            className={`flex ${m.side === "right" ? "justify-end" : "justify-start"}`}
          >
            <span
              className={`px-3 py-1.5 rounded-2xl text-[10px] leading-relaxed max-w-[75%] ${
                m.code ? "font-mono" : ""
              }`}
              style={
                m.side === "right"
                  ? { background: "hsl(24 95% 53%)", color: "white" }
                  : { background: "hsl(var(--muted))", color: "hsl(var(--foreground))" }
              }
            >
              {m.code && <Code2 className="w-2.5 h-2.5 inline mr-1 opacity-70" />}
              {m.text}
            </span>
          </motion.div>
        ))}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex justify-start"
        >
          <span className="px-3 py-1.5 rounded-2xl bg-muted flex gap-1 items-center">
            {[0,1,2].map(i => (
              <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 block"
                animate={{ y: [-2, 2, -2] }}
                transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }} />
            ))}
          </span>
        </motion.div>
      </div>
    </div>
  );
}

function GatheringPanel() {
  const avatars = [
    { i: "JL", g: "linear-gradient(135deg,#f97316,#ea580c)" },
    { i: "MP", g: "linear-gradient(135deg,#6366f1,#7c3aed)" },
    { i: "AY", g: "linear-gradient(135deg,#22c55e,#16a34a)" },
    { i: "RK", g: "linear-gradient(135deg,#ec4899,#db2777)" },
  ];
  return (
    <div className="w-full aspect-video rounded-2xl border border-border bg-gradient-to-br from-muted/60 to-muted/20 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm rounded-2xl border bg-card p-4 space-y-3 shadow-sm"
        style={{ borderColor: "hsl(24 95% 53% / 0.25)" }}
      >
        {/* Badge + title */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full text-white"
              style={{ background: "hsl(24 95% 53%)" }}>Live</span>
            <h4 className="font-heading text-sm mt-1.5">Rust Beginners Meetup</h4>
            <p className="text-[10px] text-muted-foreground">Sat · 3 PM UTC · Online</p>
          </div>
          <div className="text-right">
            <Star className="w-4 h-4 text-primary ml-auto" />
          </div>
        </div>
        {/* Tags */}
        <div className="flex gap-1.5 flex-wrap">
          {["Rust","Systems","Beginner-friendly"].map(t => (
            <span key={t} className="text-[9px] px-2 py-0.5 rounded-full border font-medium"
              style={{ borderColor: "hsl(24 95% 53% / 0.3)", color: "hsl(24 95% 53%)", background: "hsl(24 95% 53% / 0.08)" }}>
              {t}
            </span>
          ))}
        </div>
        {/* Attendees */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {avatars.map((a, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.07 }}
                  className="w-6 h-6 rounded-full border-2 border-card flex items-center justify-center text-white text-[8px] font-bold"
                  style={{ background: a.g }}>
                  {a.i}
                </motion.div>
              ))}
            </div>
            <span className="text-[10px] text-muted-foreground ml-2">+38 attending</span>
          </div>
          <button className="text-[10px] font-semibold px-3 py-1 rounded-full text-white"
            style={{ background: "hsl(24 95% 53%)" }}>
            Join <Users className="inline w-2.5 h-2.5 ml-0.5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function AiPanel() {
  const results = [
    { i: "SK", g: "linear-gradient(135deg,#f97316,#ea580c)", name: "Sara Kim", loc: "San Francisco", skills: ["React","TypeScript"] },
    { i: "MP", g: "linear-gradient(135deg,#6366f1,#7c3aed)", name: "Miguel P.", loc: "Lisbon", skills: ["Python","ML"] },
    { i: "AY", g: "linear-gradient(135deg,#22c55e,#16a34a)", name: "Aiko Yuki", loc: "Tokyo", skills: ["Go","Rust"] },
  ];
  return (
    <div className="w-full aspect-video rounded-2xl border border-border bg-gradient-to-br from-muted/60 to-muted/20 flex items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-sm space-y-2.5">
        {/* User prompt */}
        <motion.div
          initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
          className="flex justify-end"
        >
          <span className="text-[10px] px-3 py-1.5 rounded-2xl text-white font-medium"
            style={{ background: "hsl(24 95% 53%)" }}>
            Find React devs in San Francisco
          </span>
        </motion.div>

        {/* AI response header */}
        <motion.div
          initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.35 }}
          className="flex items-center gap-1.5"
        >
          <div className="w-5 h-5 rounded-lg flex items-center justify-center"
            style={{ background: "hsl(24 95% 53% / 0.15)" }}>
            <Bot className="w-3 h-3 text-primary" />
          </div>
          <span className="text-[10px] text-muted-foreground font-medium">AI-Connect found 3 matches</span>
          <Sparkles className="w-3 h-3 text-primary" />
        </motion.div>

        {/* Dev result cards */}
        <div className="space-y-1.5">
          {results.map((r, i) => (
            <motion.div
              key={r.name}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.1, duration: 0.3 }}
              className="flex items-center gap-2 rounded-xl border border-border bg-card px-2.5 py-2"
            >
              <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0"
                style={{ background: r.g }}>{r.i}</div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold truncate">{r.name}</p>
                <p className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                  <MapPin className="w-2.5 h-2.5" />{r.loc}
                </p>
              </div>
              <div className="flex gap-1">
                {r.skills.map(s => (
                  <span key={s} className="text-[8px] px-1.5 py-0.5 rounded-full font-medium"
                    style={{ background: "hsl(24 95% 53% / 0.10)", color: "hsl(24 95% 53%)" }}>{s}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Data ───────────────────────────────────────────────────────────────────

const reasons = [
  {
    number: "01",
    category: "Networking",
    title: "Find Developers Near You",
    body: "Your next coding partner is just a connection away. Whether you need a co-founder, mentor, or someone to debug with — CodeNearby puts you next to the right people.",
    panel: <NetworkPanel />,
  },
  {
    number: "02",
    category: "Collaboration",
    title: "Build Projects Together",
    body: "Great projects start with great teams. Find developers with matching interests for hackathons, open-source work, or that startup idea you can't stop thinking about.",
    panel: <CollabPanel />,
  },
  {
    number: "03",
    category: "Feed & Discussions",
    title: "Your Ideas, Your Space",
    body: "Post polls, share code snippets, start discussions. Debugging help or JavaScript memes — the feed is where developers show up as people, not just profiles.",
    panel: <FeedPanel />,
  },
  {
    number: "04",
    category: "Messaging",
    title: "Code Together, Chat Together",
    body: "Real-time messaging built for developers. Share GitHub links, discuss frameworks, brainstorm ideas — everything in one place, no switching tabs.",
    panel: <ChatPanel />,
  },
  {
    number: "05",
    category: "Gatherings",
    title: "Meet, Code, Connect",
    body: "Host or join developer meetups, coding sessions, and tech talks. Virtual or in-person — find events that match your timezone and interests.",
    panel: <GatheringPanel />,
  },
  {
    number: "06",
    category: "AI-Connect",
    title: "Discover with AI",
    body: "Just describe who you're looking for in plain language. AI-Connect searches GitHub profiles, matches skills and location, and surfaces the right developers — in seconds, not hours.",
    panel: <AiPanel />,
  },
];

// ── Component ──────────────────────────────────────────────────────────────

export function Why() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setActive((a) => (a + 1) % reasons.length);
    }, 3000);
    return () => clearInterval(id);
  }, [paused]);

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
      <div className="hidden md:grid md:grid-cols-5 gap-8 items-start"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Left: numbered tabs */}
        <div className="col-span-2 flex flex-col gap-1">
          {reasons.map((r, i) => (
            <button
              key={r.number}
              onClick={() => { setActive(i); setPaused(true); }}
              className={`group text-left px-5 py-4 rounded-xl transition-all duration-200 ${
                active === i
                  ? "border"
                  : "hover:bg-muted/60 border border-transparent"
              }`}
              style={
                active === i
                  ? { background: "hsl(24 95% 53% / 0.06)", borderColor: "hsl(24 95% 53% / 0.2)" }
                  : {}
              }
            >
              <div className="flex items-center justify-between">
                <div>
                  <span
                    className="font-mono text-xs font-semibold tracking-widest block mb-0.5 transition-colors duration-200"
                    style={{ color: active === i ? "hsl(24 95% 53%)" : "hsl(var(--muted-foreground) / 0.5)" }}
                  >
                    {r.number}
                  </span>
                  <span
                    className="font-heading text-lg transition-colors duration-200"
                    style={{ color: active === i ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))" }}
                  >
                    {r.title}
                  </span>
                </div>
                <ChevronRight
                  className="w-4 h-4 flex-shrink-0 transition-all duration-200"
                  style={{
                    color: active === i ? "hsl(24 95% 53%)" : "hsl(var(--muted-foreground) / 0.3)",
                    transform: active === i ? "translateX(2px)" : undefined,
                  }}
                />
              </div>
              {active === i && !paused && (
                <motion.div
                  key={active}
                  className="mt-2 h-0.5 rounded-full"
                  style={{ background: "hsl(24 95% 53% / 0.35)" }}
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3, ease: "linear" }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Right: panel */}
        <div className="col-span-3 sticky top-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {reasons[active].panel}
              <div className="mt-5">
                <span
                  className="inline-block text-[10px] font-mono font-semibold uppercase tracking-[0.18em] px-2.5 py-1 rounded-full mb-3"
                  style={{ background: "hsl(24 95% 53% / 0.10)", color: "hsl(24 95% 53%)" }}
                >
                  {reasons[active].category}
                </span>
                <p className="text-muted-foreground leading-relaxed text-base">
                  {reasons[active].body}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile: accordion */}
      <div className="md:hidden flex flex-col gap-3">
        {reasons.map((r, i) => (
          <div
            key={r.number}
            className="rounded-xl border transition-colors duration-200 overflow-hidden"
            style={{ borderColor: active === i ? "hsl(24 95% 53% / 0.25)" : "hsl(var(--border))" }}
          >
            <button
              onClick={() => setActive(active === i ? -1 : i)}
              className="w-full text-left px-5 py-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-semibold tracking-widest"
                  style={{ color: "hsl(24 95% 53%)" }}>{r.number}</span>
                <span className="font-heading text-base">{r.title}</span>
              </div>
              <motion.div animate={{ rotate: active === i ? 90 : 0 }} transition={{ duration: 0.2 }}>
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
                  <div className="px-5 pb-5 space-y-4">
                    {r.panel}
                    <p className="text-muted-foreground text-sm leading-relaxed">{r.body}</p>
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
