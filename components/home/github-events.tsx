"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { GitCommit, GitBranch, GitPullRequest, Star } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";

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
        return <GitCommit className="h-4 w-4" />;
      case "CreateEvent":
        return <GitBranch className="h-4 w-4" />;
      case "PullRequestEvent":
        return <GitPullRequest className="h-4 w-4" />;
      case "WatchEvent":
        return <Star className="h-4 w-4" />;
      default:
        return null;
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
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Your GitHub Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea
          className={`h-[160px] ${events.length < 1 && " portrait:h-fit"} pr-4`}
        >
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : events.length > 0 ? (
            <ul className="space-y-2">
              {events.map((event) => (
                <li key={event.id} className="flex items-center space-x-2">
                  {getEventIcon(event.type)}
                  <span className="text-sm">{getEventDescription(event)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">
              No recent GitHub activity
            </p>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
