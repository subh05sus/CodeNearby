"use client";

import { useEffect, useState } from "react";
import { GitCommit, GitBranch, GitPullRequest, Star } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import SwissCard from "../swiss/SwissCard";

interface GitHubEvent {
  id: string;
  type: string;
  actor: {
    login: string;
    avatar_url: string;
  };
  repo: {
    name: string;
  };
  payload: {
    ref?: string;
    ref_type?: string;
    action?: string;
  };
  created_at: string;
}

export function GitHubEvents({ username }: { username: string }) {
  const [events, setEvents] = useState<GitHubEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(
          `https://api.github.com/users/${username}/events/public`
        );
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error("Error fetching GitHub events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [username]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case "PushEvent":
        return <GitCommit size={14} className="text-swiss-red" />;
      case "CreateEvent":
        return <GitBranch size={14} className="text-swiss-red" />;
      case "PullRequestEvent":
        return <GitPullRequest size={14} className="text-swiss-red" />;
      case "WatchEvent":
        return <Star size={14} className="text-swiss-red" />;
      default:
        return <span className="text-swiss-red">✽</span>;
    }
  };

  const getEventDescription = (event: GitHubEvent) => {
    switch (event.type) {
      case "PushEvent":
        return `Pushed to ${event.repo.name}`;
      case "CreateEvent":
        return `Created ${event.payload.ref_type} ${event.payload.ref} in ${event.repo.name}`;
      case "PullRequestEvent":
        return `${event.payload.action} pull request in ${event.repo.name}`;
      case "WatchEvent":
        return `Starred ${event.repo.name}`;
      default:
        return `Action on ${event.repo.name}`;
    }
  };

  return (
    <SwissCard variant="white" pattern="grid" className="h-full">
      <div className="mb-6 border-b-2 border-black dark:border-white pb-2">
        <h2 className="text-xl font-black uppercase tracking-widest text-black dark:text-white">
          System Logs
        </h2>
      </div>
      <div>
        <ScrollArea
          className={`h-[240px] pr-4`}
        >
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 w-full bg-muted dark:bg-neutral-800 border-2 border-black dark:border-white animate-pulse" />
              ))}
            </div>
          ) : events.length > 0 ? (
            <ul className="space-y-3">
              {events.map((event) => (
                <li key={event.id} className="flex gap-4 p-3 border-2 border-black dark:border-white bg-white dark:bg-black hover:bg-muted dark:hover:bg-neutral-900 transition-colors">
                  <div className="mt-1">{getEventIcon(event.type)}</div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase leading-tight text-black dark:text-white">{getEventDescription(event)}</span>
                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-30 dark:opacity-40 mt-1 italic text-black dark:text-white">
                      {new Date(event.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm font-black uppercase tracking-widest opacity-30 dark:opacity-20 italic py-8 border-2 border-dashed border-black/20 dark:border-white/20 text-center text-black dark:text-white">
              NO SYSTEM ACTIVITY
            </p>
          )}
        </ScrollArea>
      </div>
    </SwissCard>
  );
}
