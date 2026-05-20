"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface HelloProps {
  name: string;
  picture: string;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function Hello({ name, picture }: HelloProps) {
  const firstName = name.split(" ")[0];
  const greeting = getGreeting();
  const date = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex items-center justify-between mb-8 cursor-default"
    >
      <div>
        <p className="text-xs font-mono font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-1">
          {date}
        </p>
        <h1 className="text-3xl md:text-4xl font-heading tracking-tight">
          {greeting},{" "}
          <span className="text-primary">{firstName}.</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Here&apos;s what&apos;s happening in your network today.
        </p>
      </div>

      <div
        className="relative flex-shrink-0 hidden sm:block"
        style={{
          padding: "3px",
          borderRadius: "9999px",
          background: "linear-gradient(135deg, hsl(24 95% 53%), hsl(24 95% 70%))",
        }}
      >
        <Image
          src={picture || "/placeholder.svg"}
          alt={name || "User"}
          width={56}
          height={56}
          className="rounded-full block"
          style={{ background: "hsl(var(--background))" }}
        />
      </div>
    </motion.div>
  );
}

export default Hello;
