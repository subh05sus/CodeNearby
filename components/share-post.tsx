/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Send, MapPin, BarChart, Calendar } from "lucide-react";
import type { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useToast } from "./ui/use-toast";
import Image from "next/image";
import { Card, CardContent } from "./ui/card";
import { format } from "date-fns";

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

interface Gathering {
  id: string;
  name: string;
  slug: string;
  expiresAt: string;
  hostId: string;
}

interface Post {
  _id: string;
  content: string;
  imageUrl?: string;
  poll?: {
    question: string;
    options: string[];
  };
  location?: {
    lat: number;
    lng: number;
  };
  schedule?: any;
}

interface SharePostProps {
  post: Post;
}

export function SharePost({ post }: SharePostProps) {
  const { data: session } = useSession() as { data: Session | null };
  const [isOpen, setIsOpen] = useState(false);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [loadingGatherings, setLoadingGatherings] = useState(true);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [gatherings, setGatherings] = useState<Gathering[]>([]);
  const [sharing, setSharing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (session) {
      fetchFriends();
      fetchGatherings();
    }
  }, [session]);

  if (!session) {
    return null;
  }

  const fetchFriends = async () => {
    try {
      setLoadingFriends(true);
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
      setLoadingFriends(false);
    }
  };

  const fetchGatherings = async () => {
    try {
      setLoadingGatherings(true);
      const response = await fetch("/api/gathering");
      if (!response.ok) {
        throw new Error("Failed to fetch gatherings");
      }
      const data = await response.json();
      setGatherings(data);
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch gatherings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingGatherings(false);
    }
  };

  const handleShareToFriend = async (friendId: string) => {
    setSharing(true);
    try {
      const response = await fetch("/api/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId: post._id,
          recipientId: friendId,
          messageType: "post",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to share post");
      }

      toast({
        title: "Success",
        description: "Post shared successfully",
      });
      setIsOpen(false);
    } catch {
      toast({
        title: "Error",
        description: "Failed to share post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSharing(false);
    }
  };

  const handleShareToGathering = async (gatheringId: string) => {
    setSharing(true);
    try {
      const response = await fetch("/api/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId: post._id,
          recipientId: `gathering_${gatheringId}`,
          messageType: "post",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to share post");
      }

      toast({
        title: "Success",
        description: "Post shared successfully to the gathering",
      });
      setIsOpen(false);
    } catch {
      toast({
        title: "Error",
        description: "Failed to share post to the gathering. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSharing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size={"icon"} variant={"ghost"}>
          <Send className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Post To</DialogTitle>
          <DialogDescription>
            Share your posts to your friends and gatherings
          </DialogDescription>
        </DialogHeader>
        <Card className="mb-4">
          <CardContent className="p-4">
            <p className="text-sm mb-2 line-clamp-2">{post.content}</p>
            {post.imageUrl && (
              <div className="relative w-full h-32 mb-2">
                <Image
                  src={post.imageUrl || "/placeholder.svg"}
                  alt="Post image"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-md"
                />
              </div>
            )}
            {post.poll && (
              <div className="flex items-center text-sm text-muted-foreground">
                <BarChart className="h-4 w-4 mr-1" />
                Poll: {post.poll.question}
              </div>
            )}
            {post.location && (
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1" />
                Location attached
              </div>
            )}
            {post.schedule && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1" />
                {post.schedule && format(new Date(post.schedule), "PPp")}
              </div>
            )}
          </CardContent>
        </Card>
        <div className="space-y-4">
          <div>
            <h4 className="mb-2 text-sm font-medium">Friends</h4>
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {friends.length > 0 ? (
                friends.map((friend) => (
                  <div
                    key={friend.id}
                    onClick={() =>
                      handleShareToFriend(friend.githubId.toString())
                    }
                    className="flex-shrink-0 flex flex-col items-center cursor-pointer"
                  >
                    <Image
                      height={48}
                      width={48}
                      src={friend.image || "/placeholder.svg"}
                      alt={friend.name}
                      className="h-12 w-12 rounded-full"
                    />
                    <span className="text-xs mt-1 max-w-[60px] truncate">
                      {friend.name}
                    </span>
                  </div>
                ))
              ) : loadingFriends ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <p className="text-sm text-gray-500">No friends found</p>
              )}
            </div>
          </div>
          <div>
            <h4 className="mb-2 text-sm font-medium">Gatherings</h4>
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {gatherings.length > 0 ? (
                gatherings.map((gathering) => {
                  return (
                    <div
                      key={gathering.id}
                      onClick={() => handleShareToGathering(gathering.slug)}
                      className="flex-shrink-0 flex flex-col items-center cursor-pointer"
                    >
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        {gathering.name[0]}
                      </div>
                      <span className="text-xs mt-1 max-w-[60px] truncate">
                        {gathering.name}
                      </span>
                    </div>
                  );
                })
              ) : loadingGatherings ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <p className="text-sm text-gray-500">No Gatherings found</p>
              )}
            </div>
          </div>
        </div>
        {sharing && (
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Sharing...</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
