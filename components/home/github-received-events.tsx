"use client";

import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import {
  GitBranch,
  GitFork,
  Star,
  GitPullRequest,
  GitCommit,
} from "lucide-react";
import type React from "react";
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
    action?: string;
    ref_type?: string;
  };
  created_at: string;
}

const eventIcons: { [key: string]: React.ReactNode } = {
  WatchEvent: <Star className="h-4 w-4 text-swiss-red" />,
  CreateEvent: <GitBranch className="h-4 w-4 text-swiss-red" />,
  ForkEvent: <GitFork className="h-4 w-4 text-swiss-red" />,
  PullRequestEvent: <GitPullRequest className="h-4 w-4 text-swiss-red" />,
  PushEvent: <GitCommit className="h-4 w-4 text-swiss-red" />,
};

export function GitHubReceivedEvents({ username }: { username: string }) {
  const [events, setEvents] = useState<GitHubEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(
          `https://api.github.com/users/${username}/received_events`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }
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

  const getEventDescription = (event: GitHubEvent) => {
    switch (event.type) {
      case "WatchEvent":
        return `starred ${event.repo.name}`;
      case "CreateEvent":
        return `created ${event.payload.ref_type} in ${event.repo.name}`;
      case "ForkEvent":
        return `forked ${event.repo.name}`;
      case "PullRequestEvent":
        return `${event.payload.action} a pull request in ${event.repo.name}`;
      case "PushEvent":
        return `pushed to ${event.repo.name}`;
      default:
        return `performed action on ${event.repo.name}`;
    }
  };

  return (
    <SwissCard variant="white" pattern="dots" className="w-full h-full">
      <div className="mb-8 border-b-4 border-black dark:border-white pb-4 flex justify-between items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.4em] text-swiss-red mb-1">Global Feed</p>
          <h2 className="text-4xl font-black uppercase tracking-tightest leading-none text-black dark:text-white">Received Activity</h2>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 dark:opacity-20 italic text-black dark:text-white">Target</p>
          <p className="text-sm font-black uppercase tracking-widest leading-none text-black dark:text-white">@{username}</p>
        </div>
      </div>
      <div>
        <ScrollArea className="h-[400px] pr-4">
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-6 mb-8 border-2 border-black dark:border-white p-4 animate-pulse">
                <div className="h-16 w-16 bg-muted dark:bg-neutral-800 border-2 border-black dark:border-white" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-3/4 bg-muted dark:bg-neutral-800 border-black/10 dark:border-white/10" />
                  <div className="h-3 w-1/2 bg-muted dark:bg-neutral-800 border-black/10 dark:border-white/10" />
                </div>
              </div>
            ))
          ) : events.length > 0 ? (
            events.map((event) => (
              <div key={event.id} className="flex items-start space-x-6 mb-6 p-6 border-4 border-black dark:border-white bg-white dark:bg-black hover:-translate-x-1 hover:-translate-y-1 transition-transform cursor-default relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-1 bg-black dark:bg-white text-white dark:text-black transform translate-x-1/2 -translate-y-1/2 rotate-45 group-hover:bg-swiss-red dark:group-hover:bg-swiss-red transition-colors w-12 h-12" />

                <Image
                  src={event.actor.avatar_url}
                  alt={event.actor.login}
                  width={64}
                  height={64}
                  className="rounded-none border-4 border-black dark:border-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,1)] flex-shrink-0"
                />

                <div className="flex-1">
                  <p className="text-base font-black uppercase tracking-tight leading-tight mb-2 text-black dark:text-white">
                    <span className="text-swiss-red">@{event.actor.login}</span> {getEventDescription(event)}
                  </p>
                  <div className="flex items-center gap-4">
                    {eventIcons[event.type] && (
                      <span className="p-1.5 border-2 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black">
                        {eventIcons[event.type]}
                      </span>
                    )}
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 dark:opacity-20 italic text-black dark:text-white">
                      {new Date(event.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center font-black uppercase tracking-[0.5em] opacity-20 dark:opacity-10 py-24 border-4 border-dashed border-black/10 dark:border-white/10 text-black dark:text-white">NO RECEIVED DATA</p>
          )}
        </ScrollArea>
      </div>
    </SwissCard>
  );
}
