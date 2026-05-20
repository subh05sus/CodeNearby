/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Loader2, MessageCircle } from "lucide-react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { useParams } from "next/navigation";
import { toast } from "sonner";

interface Friend {
  id: string;
  name: string;
  githubUsername: string;
  image: string;
  githubId: number;
  lastMessage?: {
    content: string;
    timestamp: number;
  };
}

export function ChatList() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState<Friend[]>([]);
  const params = useParams();

  useEffect(() => {
    if (session) fetchFriends();
  }, [session]);

  const fetchFriends = async () => {
    try {
      const response = await fetch("/api/friends");
      const data = await response.json();
      setFriends(data);
    } catch {
      toast.error("Failed to fetch friends.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 bg-muted animate-pulse rounded-lg w-28" />
              <div className="h-3 bg-muted animate-pulse rounded-lg w-40" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!Array.isArray(friends) || friends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 gap-3 text-center">
        <MessageCircle className="w-8 h-8 text-muted-foreground/25" />
        <p className="text-sm text-muted-foreground leading-relaxed">
          No conversations yet. Connect with developers to start chatting!
        </p>
      </div>
    );
  }

  const sorted = [...friends].sort((a, b) => {
    const timeA = a.lastMessage?.timestamp || 0;
    const timeB = b.lastMessage?.timestamp || 0;
    return timeB - timeA;
  });

  return (
    <div className="p-2 space-y-0.5">
      {sorted.map((friend) => {
        const isActive = params.id === friend.githubId.toString();
        const lastMsgContent = (() => {
          try {
            const parsed = JSON.parse(friend.lastMessage?.content || "");
            if (parsed.type) return "Shared a post";
            return friend.lastMessage?.content;
          } catch {
            return friend.lastMessage?.content;
          }
        })();

        return (
          <Link key={friend.id} href={`/messages/${friend.githubId}`}>
            <div
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150"
              style={
                isActive
                  ? { background: "hsl(24 95% 53% / 0.12)", borderColor: "transparent" }
                  : {}
              }
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = "hsl(var(--muted) / 0.6)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = "";
                }
              }}
            >
              <div className="relative flex-shrink-0">
                <Image
                  height={40}
                  width={40}
                  src={friend.image || "/placeholder.svg"}
                  alt={friend.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                {isActive && (
                  <span
                    className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background"
                    style={{ background: "hsl(24 95% 53%)" }}
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline gap-2">
                  <p
                    className="font-semibold text-sm truncate"
                    style={isActive ? { color: "hsl(24 95% 53%)" } : {}}
                  >
                    {friend.name}
                  </p>
                  {friend.lastMessage && (
                    <span className="text-[10px] text-muted-foreground font-mono flex-shrink-0">
                      {formatDistanceToNow(friend.lastMessage.timestamp, { addSuffix: false })}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {lastMsgContent || (
                    <span className="italic opacity-60">No messages yet</span>
                  )}
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
