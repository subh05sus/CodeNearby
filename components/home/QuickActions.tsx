"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Compass, Sparkles, Rss, Users, ArrowRight } from "lucide-react";

const actions = [
  {
    icon: Compass,
    label: "Discover",
    description: "Find developers near you",
    href: "/discover",
  },
  {
    icon: Sparkles,
    label: "AI-Connect",
    description: "Let AI find your match",
    href: "/ai-connect",
  },
  {
    icon: Rss,
    label: "Feed",
    description: "See what's happening",
    href: "/feed",
  },
  {
    icon: Users,
    label: "Gatherings",
    description: "Join or host a session",
    href: "/gathering",
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {actions.map((action, i) => (
        <motion.div
          key={action.href}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07, duration: 0.35, ease: "easeOut" }}
        >
          <Link
            href={action.href}
            className={`group flex flex-col gap-2 rounded-2xl border p-4 h-full transition-all duration-200 hover:border-primary/30 hover:bg-card/95 border-border bg-card
            }`}
          >
            <div className="flex items-center justify-between">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${
                  "bg-muted group-hover:bg-primary/10"
                }`}
              >
                <action.icon
                  className={`w-4 h-4 transition-colors duration-200 ${
                    "text-muted-foreground group-hover:text-primary"
                  }`}
                />
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary/60 transition-all duration-200 group-hover:translate-x-0.5" />
            </div>
            <div>
              <p
                className={`text-sm font-semibold leading-tight transition-colors duration-200 ${
                  "group-hover:text-primary"
                }`}
              >
                {action.label}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                {action.description}
              </p>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
