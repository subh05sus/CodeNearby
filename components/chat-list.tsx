/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Loader2, MessageSquare } from "lucide-react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Friend {
  id: string;
  name: string;
  githubUsername: string;
  image: string;
  githubId: number;
  lastMessage?: {
    content: string;
    timestamp: number;
    type?: string;
  };
}

export function ChatList() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState<Friend[]>([]);
  const params = useParams();

  useEffect(() => {
    if (session) {
      fetchFriends();
    }
  }, [session]);

  const fetchFriends = async () => {
    try {
      const response = await fetch("/api/friends");
      const data = await response.json();
      setFriends(data);
    } catch {
      toast.error("MISSION_FAILURE", {
        description: "FAILED_TO_FETCH_COMMUNICATION_NODES.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-swiss-red" />
        <span className="text-xs font-black uppercase tracking-widest italic opacity-40">SCANNING_NODES...</span>
      </div>
    );
  }

  const sortedFriends = Array.isArray(friends)
    ? [...friends].sort((a, b) => (b.lastMessage?.timestamp || 0) - (a.lastMessage?.timestamp || 0))
    : [];

  return (
    <div className="divide-y-8 divide-black dark:divide-white transition-colors">
      {sortedFriends.length > 0 ? (
        sortedFriends.map((friend) => {
          const isActive = params.id === friend.githubId.toString();
          return (
            <Link key={friend.id} href={`/messages/${friend.githubId}`}>
              <div
                className={cn(
                  "group flex items-center p-6 transition-all duration-200 relative overflow-hidden",
                  isActive
                    ? "bg-swiss-red text-white"
                    : "bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-950"
                )}
              >
                {isActive && (
                  <div className="absolute top-0 right-0 p-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  </div>
                )}

                <div className="relative shrink-0 mr-6">
                  <div className={cn(
                    "absolute inset-0 translate-x-1 translate-y-1 -z-10",
                    isActive ? "bg-black dark:bg-white" : "bg-swiss-red"
                  )} />
                  <Image
                    height={64}
                    width={64}
                    src={friend.image || "/placeholder.svg"}
                    alt={friend.name}
                    className={cn(
                      "w-16 h-16 border-4 border-black dark:border-white object-cover transition-all duration-500",
                      isActive ? "grayscale-0" : "grayscale group-hover:grayscale-0"
                    )}
                  />
                </div>

                <div className="flex-grow min-w-0 space-y-1">
                  <div className="flex justify-between items-baseline gap-2">
                    <h3 className={cn(
                      "text-xl font-black uppercase tracking-tighter truncate italic",
                      isActive ? "text-white" : "text-black dark:text-white"
                    )}>
                      {friend.name}
                    </h3>
                    {friend.lastMessage?.timestamp && (
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest whitespace-nowrap opacity-60",
                        isActive ? "text-white" : "text-swiss-red"
                      )}>
                        {formatDistanceToNow(friend.lastMessage.timestamp, { addSuffix: false })}
                      </span>
                    )}
                  </div>

                  <p className={cn(
                    "text-xs font-bold uppercase tracking-tight truncate leading-none",
                    isActive ? "text-white/80" : "text-black/40 dark:text-white/40"
                  )}>
                    {(() => {
                      try {
                        const content = friend.lastMessage?.content;
                        if (!content) return "NO_DATA_TRANSFER";
                        const parsed = JSON.parse(content);
                        if (parsed.type) return "ENCRYPTED_MEDIA_PACKAGE";
                        return content;
                      } catch {
                        return friend.lastMessage?.content || "NO_DATA_TRANSFER";
                      }
                    })()}
                  </p>
                </div>
              </div>
            </Link>
          );
        })
      ) : (
        <div className="p-12 text-center space-y-6">
          <div className="inline-block p-4 border-4 border-dashed border-black dark:border-white opacity-20">
            <MessageSquare className="h-12 w-12 text-black dark:text-white" />
          </div>
          <p className="text-xl font-black uppercase tracking-tighter italic opacity-40 leading-tight text-black dark:text-white">
            {
              [
                "ZERO_CONNECTIONS_DETECTED_MODULE_ISOLATION_ACTIVE",
                "NETWORK_GRID_EMPTY_SEARCHING_FOR_SIGNALS",
                "COMMUNICATION_CHANNELS_OFFLINE_AWAITING_PROTOCOLS",
                "SOLITARY_NODE_STATUS_CONFIRMED_ENCRYPT_LIFELINE",
                "NO_ACTIVE_UPLINKS_FOUND_IN_THIS_SECTOR"
              ][Math.floor(Math.random() * 5)]
            }
          </p>
        </div>
      )}
    </div>
  );
}
