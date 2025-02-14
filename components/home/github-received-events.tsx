"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  GitBranch,
  GitFork,
  Star,
  GitPullRequest,
  GitCommit,
} from "lucide-react";
import type React from "react"; // Added import for React

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
  WatchEvent: <Star className="h-4 w-4" />,
  CreateEvent: <GitBranch className="h-4 w-4" />,
  ForkEvent: <GitFork className="h-4 w-4" />,
  PullRequestEvent: <GitPullRequest className="h-4 w-4" />,
  PushEvent: <GitCommit className="h-4 w-4" />,
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
    <Card className="w-full col-span-1 xl:col-span-2">
      <CardHeader>
        <CardTitle>Received Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea
          className={`h-[400px] ${
            events.length < 1 && " portrait:h-fit"
          } pr-4 relative`}
        >
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-4 mb-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))
          ) : events.length > 0 ? (
            events.map((event) => (
              <div key={event.id} className="flex items-start space-x-4 mb-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={event.actor.avatar_url}
                    alt={event.actor.login}
                  />
                  <AvatarFallback>
                    {event.actor.login.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">
                    {eventIcons[event.type] && (
                      <span className="mr-2 inline-block align-text-bottom">
                        {eventIcons[event.type]}
                      </span>
                    )}
                    <span className="font-semibold">{event.actor.login}</span>{" "}
                    {getEventDescription(event)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(event.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-sm">No activities found</p>
          )}
          <div className="absolute w-full bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-card to-transparent" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
