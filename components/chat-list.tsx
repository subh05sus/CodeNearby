/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { useParams } from "next/navigation";

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
  const { toast } = useToast();
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
      toast({
        title: "Error",
        description: "Failed to fetch friends.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-2 p-2">
      {friends.map((friend) => (
        <Link key={friend.id} href={`/messages/${friend.githubId}`}>
          <div
            className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
              params.id === friend.githubId.toString()
                ? "bg-gray-200 dark:bg-zinc-800"
                : "hover:bg-gray-100 dark:hover:bg-zinc-900"
            }`}
          >
            <Image
              height={48}
              width={48}
              src={friend.image || "/placeholder.svg"}
              alt={friend.name}
              className="w-12 h-12 rounded-full mr-4"
            />
            <div className="flex-grow min-w-0">
              <div className="flex justify-between items-baseline">
                <h3 className="font-semibold truncate">{friend.name}</h3>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(
                    friend.lastMessage?.timestamp || Date.now(),
                    { addSuffix: true }
                  )}
                </span>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {friend.lastMessage?.content}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
