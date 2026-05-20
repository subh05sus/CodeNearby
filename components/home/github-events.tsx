"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  GitCommit,
  GitBranch,
  GitPullRequest,
  Star,
  Activity,
} from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";

interface GitHubEvent {
  id: string;
  type: string;
  actor: { login: string; avatar_url: string };
  repo: { name: string };
  payload: { ref?: string; ref_type?: string; action?: string };
  created_at: string;
}

const eventConfig: Record<
  string,
  { icon: React.ElementType; color: string; label: string }
> = {
  PushEvent: { icon: GitCommit, color: "text-blue-400", label: "Pushed to" },
  CreateEvent: { icon: GitBranch, color: "text-green-400", label: "Created in" },
  PullRequestEvent: { icon: GitPullRequest, color: "text-purple-400", label: "PR in" },
  WatchEvent: { icon: Star, color: "text-yellow-400", label: "Starred" },
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

function repoName(full: string) {
  return full.split("/")[1] ?? full;
}

export function GitHubEvents({ username }: { username: string }) {
  const [events, setEvents] = useState<GitHubEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://api.github.com/users/${username}/events/public`)
      .then((r) => r.json())
      .then((d) => setEvents(Array.isArray(d) ? d.slice(0, 12) : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [username]);

  return (
    <div className="rounded-2xl border border-border bg-card flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 pt-5 pb-4 border-b border-border">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <Activity className="w-3.5 h-3.5 text-primary" />
        </div>
        <h2 className="font-heading text-base">Your GitHub Activity</h2>
      </div>

      {/* Body */}
      <ScrollArea className="h-full px-5 py-4">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-7 w-7 rounded-full flex-shrink-0" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-3 w-12" />
              </div>
            ))}
          </div>
        ) : events.length > 0 ? (
          <ul className="space-y-1">
            {events.map((event) => {
              const cfg = eventConfig[event.type];
              if (!cfg) return null;
              const Icon = cfg.icon;
              return (
                <li
                  key={event.id}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-muted/50 transition-colors group"
                >
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">
                      <span className="text-muted-foreground">{cfg.label} </span>
                      <span className="font-semibold font-mono text-[12px]">
                        {repoName(event.repo.name)}
                      </span>
                    </p>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground/60 flex-shrink-0">
                    {timeAgo(event.created_at)}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
            <Activity className="w-8 h-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No recent GitHub activity</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
