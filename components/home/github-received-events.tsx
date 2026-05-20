"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GitBranch, GitFork, Star, GitPullRequest, GitCommit, Bell } from "lucide-react";
import type React from "react";

interface GitHubEvent {
  id: string;
  type: string;
  actor: { login: string; avatar_url: string };
  repo: { name: string };
  payload: { action?: string; ref_type?: string };
  created_at: string;
}

const eventConfig: Record<
  string,
  { icon: React.ElementType; color: string; verb: string }
> = {
  WatchEvent: { icon: Star, color: "text-yellow-400", verb: "starred" },
  CreateEvent: { icon: GitBranch, color: "text-green-400", verb: "created a branch in" },
  ForkEvent: { icon: GitFork, color: "text-blue-400", verb: "forked" },
  PullRequestEvent: { icon: GitPullRequest, color: "text-purple-400", verb: "opened a PR in" },
  PushEvent: { icon: GitCommit, color: "text-primary", verb: "pushed to" },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return "just now";
}

export function GitHubReceivedEvents({ username }: { username: string }) {
  const [events, setEvents] = useState<GitHubEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://api.github.com/users/${username}/received_events`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d) => setEvents(Array.isArray(d) ? d.slice(0, 20) : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [username]);

  return (
    <div className="rounded-2xl border border-border bg-card flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 pt-5 pb-4 border-b border-border">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <Bell className="w-3.5 h-3.5 text-primary" />
        </div>
        <h2 className="font-heading text-base">Network Activity</h2>
      </div>

      {/* Body */}
      <ScrollArea className="h-full px-5 py-4 relative">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-3/4" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : events.length > 0 ? (
          <ul className="space-y-1">
            {events.map((event) => {
              const cfg = eventConfig[event.type];
              if (!cfg) return null;
              const Icon = cfg.icon;
              const repoShort = event.repo.name.split("/")[1] ?? event.repo.name;
              return (
                <li
                  key={event.id}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-muted/50 transition-colors"
                >
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={event.actor.avatar_url} alt={event.actor.login} />
                      <AvatarFallback className="text-xs bg-muted">
                        {event.actor.login.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-card border border-border flex items-center justify-center">
                      <Icon className={`h-2.5 w-2.5 ${cfg.color}`} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-snug">
                      <span className="font-semibold">{event.actor.login}</span>{" "}
                      <span className="text-muted-foreground">{cfg.verb} </span>
                      <span className="font-mono text-[12px] font-semibold">
                        {repoShort}
                      </span>
                    </p>
                    <p className="font-mono text-[10px] text-muted-foreground/60 mt-0.5">
                      {timeAgo(event.created_at)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
            <Bell className="w-8 h-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No network activity yet</p>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card to-transparent pointer-events-none" />
      </ScrollArea>
    </div>
  );
}
