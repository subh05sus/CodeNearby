/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, UserPlus, Users } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import Link from "next/link";
import { toast } from "sonner";

interface User {
  githubId: any;
  _id: string;
  name: string;
  image: string;
  githubUsername: string;
}

export function NewPeopleToConnect() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await fetch("/api/users/random").then((r) => r.json());
      setUsers(data);
    } catch {
      console.error("Error fetching random users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleConnect = async (developer: any) => {
    try {
      await fetch("/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: developer.githubId,
          login: developer.githubUsername,
          avatar_url: developer.image,
          html_url: `https://github.com/${developer.githubUsername}`,
        }),
      });
      setSentIds((prev) => new Set(prev).add(developer._id));
      toast.success("Friend request sent!");
    } catch {
      toast.error("Failed to send request.");
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users className="w-3.5 h-3.5 text-primary" />
          </div>
          <h2 className="font-heading text-base">People to Connect</h2>
        </div>
        <button
          onClick={fetchUsers}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
          aria-label="Refresh"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-muted-foreground ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Body */}
      <ScrollArea className="h-full px-5 py-4">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-7 w-20 rounded-full" />
              </div>
            ))}
          </div>
        ) : users.length > 0 ? (
          <ul className="space-y-2">
            {users.map((user) => (
              <li
                key={user._id}
                className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 hover:bg-muted/50 transition-colors"
              >
                <Link
                  href={`/user/${user.githubId}`}
                  className="flex items-center gap-3 min-w-0 group"
                >
                  <Avatar className="h-9 w-9 flex-shrink-0">
                    <AvatarImage src={user.image} alt={user.name} />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                      {user.name}
                    </p>
                    <p className="font-mono text-[11px] text-muted-foreground truncate">
                      @{user.githubUsername}
                    </p>
                  </div>
                </Link>

                {sentIds.has(user._id) ? (
                  <span className="text-[11px] text-muted-foreground flex-shrink-0">
                    Sent ✓
                  </span>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-shrink-0 h-7 text-xs rounded-full px-3 hover:border-primary/30 hover:text-primary hover:bg-primary/5"
                    onClick={() => handleConnect(user)}
                  >
                    <UserPlus className="h-3 w-3 mr-1" />
                    Connect
                  </Button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
            <Users className="w-8 h-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No new users available</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
