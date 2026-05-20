"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Github, Star, GitFork, Heart } from "lucide-react";

interface RepoStats {
  stars: number;
  forks: number;
}

function useRepoStats(): RepoStats | null {
  const [stats, setStats] = useState<RepoStats | null>(null);

  useEffect(() => {
    fetch("https://api.github.com/repos/subh05sus/CodeNearby")
      .then((r) => r.json())
      .then((d) => {
        if (d.stargazers_count !== undefined) {
          setStats({ stars: d.stargazers_count, forks: d.forks_count });
        }
      })
      .catch(() => {});
  }, []);

  return stats;
}

export function OpenSourceSection() {
  const stats = useRepoStats();

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mb-20"
    >
      <div className="rounded-2xl border border-border bg-card px-6 py-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left */}
        <div className="flex items-center gap-4">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "hsl(24 95% 53% / 0.10)", border: "1px solid hsl(24 95% 53% / 0.20)" }}
          >
            <Heart className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-heading text-lg leading-tight">
              Built in public. Open source. Forever free.
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              CodeNearby is MIT-licensed and community-driven.
            </p>
          </div>
        </div>

        {/* Right: stats + link */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {stats && (
            <>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Star className="w-4 h-4" />
                <span className="font-mono font-semibold text-foreground">
                  {stats.stars.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <GitFork className="w-4 h-4" />
                <span className="font-mono font-semibold text-foreground">
                  {stats.forks.toLocaleString()}
                </span>
              </div>
              <div className="w-px h-5 bg-border" />
            </>
          )}

          <a
            href="https://github.com/subh05sus/CodeNearby"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-colors duration-200 hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
          >
            <Github className="w-4 h-4" />
            Star on GitHub
          </a>
        </div>
      </div>
    </motion.section>
  );
}
