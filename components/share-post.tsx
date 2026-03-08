/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Send, MapPin, BarChart, Heart } from "lucide-react";
import type { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import SwissCard from "./swiss/SwissCard";
import SwissButton from "./swiss/SwissButton";

interface Friend {
  id: string;
  name: string;
  githubUsername: string;
  image: string;
  githubId: number;
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
  const [, setSharing] = useState(false);

  useEffect(() => {
    if (session && isOpen) {
      if (friends.length === 0) fetchFriends();
      if (gatherings.length === 0) fetchGatherings();
    }
  }, [session, isOpen]);

  if (!session) return null;

  const fetchFriends = async () => {
    try {
      setLoadingFriends(true);
      const response = await fetch("/api/friends");
      const data = await response.json();
      setFriends(data);
    } catch {
      toast.error("Failed to fetch friends.");
    } finally {
      setLoadingFriends(false);
    }
  };

  const fetchGatherings = async () => {
    try {
      setLoadingGatherings(true);
      const response = await fetch("/api/gathering");
      const data = await response.json();
      setGatherings(data);
    } catch {
      toast.error("Failed to fetch gatherings.");
    } finally {
      setLoadingGatherings(false);
    }
  };

  const handleShareToFriend = async (friendId: string) => {
    setSharing(true);
    try {
      const response = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: post._id,
          recipientId: friendId,
          messageType: "post",
        }),
      });

      if (!response.ok) throw new Error();
      toast.success("Post successfully shared with node.");
      setIsOpen(false);
    } catch {
      toast.error("Packet transmission failed.");
    } finally {
      setSharing(false);
    }
  };

  const handleShareToGathering = async (gatheringId: string) => {
    setSharing(true);
    try {
      const response = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: post._id,
          recipientId: `gathering_${gatheringId}`,
          messageType: "post",
        }),
      });

      if (!response.ok) throw new Error();
      toast.success("Packet broadcasted to gathering stream.");
      setIsOpen(false);
    } catch {
      toast.error("Broadcast protocol failure.");
    } finally {
      setSharing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="p-2 hover:bg-swiss-red hover:text-swiss-white transition-colors group">
          <Send className="h-4 w-4 grayscale group-hover:grayscale-0 transition-all" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-xl p-0 border-0 bg-transparent shadow-none">
        <SwissCard className="p-0 border-8 border-swiss-black shadow-[24px_24px_0_0_rgba(255,0,0,1)] bg-swiss-white overflow-hidden flex flex-col">
          <DialogHeader className="p-8 border-b-8 border-swiss-black bg-swiss-black text-swiss-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-swiss-red p-1.5 border-2 border-swiss-white">
                <Send className="h-4 w-4 text-swiss-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">SHARE_PROTOCOL // OUTBOUND</span>
            </div>
            <DialogTitle className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic leading-none">
              BROADCAST_CONTENT
            </DialogTitle>
          </DialogHeader>

          <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
            {/* Post Preview */}
            <div className="border-4 border-swiss-black p-6 bg-swiss-muted/10 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-2 h-full bg-swiss-red" />
              <p className="text-sm font-bold uppercase tracking-tight italic leading-relaxed line-clamp-2 mb-4 pl-4">
                {post.content}
              </p>

              <div className="flex flex-wrap gap-4 pl-4">
                {post.imageUrl && (
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase  bg-swiss-black text-swiss-white px-2 py-1">
                    <Heart className="h-3 w-3 fill-swiss-red text-swiss-red" /> VISUAL_DATA
                  </div>
                )}
                {post.poll && (
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase  bg-swiss-black text-swiss-white px-2 py-1">
                    <BarChart className="h-3 w-3" /> POLL_ARRAY
                  </div>
                )}
                {post.location && (
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase  bg-swiss-black text-swiss-white px-2 py-1">
                    <MapPin className="h-3 w-3" /> GEO_SYNC
                  </div>
                )}
              </div>
            </div>

            {/* Recipient Selection */}
            <div className="space-y-8">
              {/* Friends */}
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] mb-4 border-b-4 border-swiss-black pb-2">
                  TARGET_USER_NODES
                </h4>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
                  {friends.length > 0 ? (
                    friends.map((friend) => (
                      <button
                        key={friend.id}
                        onClick={() => handleShareToFriend(friend.githubId.toString())}
                        className="flex flex-col items-center group gap-2"
                      >
                        <div className="w-16 h-16 border-4 border-swiss-black bg-swiss-white grayscale group-hover:grayscale-0 transition-all shadow-[4px_4px_0_0_rgba(0,0,0,1)] group-hover:shadow-[4px_4px_0_0_rgba(255,0,0,1)] group-hover:-translate-y-1 group-hover:translate-x-1 overflow-hidden">
                          <Image
                            height={64}
                            width={64}
                            src={friend.image || "/placeholder.svg"}
                            alt={friend.name}
                            className="object-cover h-full w-full"
                          />
                        </div>
                        <span className="text-[8px] font-black uppercase  truncate w-16 text-center">
                          {friend.name}
                        </span>
                      </button>
                    ))
                  ) : loadingFriends ? (
                    <div className="col-span-full flex justify-center py-4">
                      <Loader2 className="h-8 w-8 animate-spin text-swiss-red" />
                    </div>
                  ) : (
                    <p className="col-span-full text-[10px] font-bold uppercase  opacity-20 text-center py-4">
                      NO_ACTIVE_UPLINKS_FOUND
                    </p>
                  )}
                </div>
              </div>

              {/* Gatherings */}
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] mb-4 border-b-4 border-swiss-black pb-2">
                  COLLECTIVE_STREAMS
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {gatherings.length > 0 ? (
                    gatherings.map((gathering) => (
                      <button
                        key={gathering.id}
                        onClick={() => handleShareToGathering(gathering.slug)}
                        className="flex items-center gap-4 p-4 border-4 border-swiss-black hover:bg-swiss-black hover:text-swiss-white transition-all shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[8px_8px_0_0_rgba(0,0,0,1)] group"
                      >
                        <div className="w-10 h-10 bg-swiss-red border-2 border-swiss-black flex items-center justify-center font-black italic text-swiss-white group-hover:border-swiss-white">
                          {gathering.name[0].toUpperCase()}
                        </div>
                        <span className="text-xs font-black uppercase tracking-tight truncate flex-1 text-left italic">
                          {gathering.name}
                        </span>
                      </button>
                    ))
                  ) : loadingGatherings ? (
                    <div className="col-span-full flex justify-center py-4">
                      <Loader2 className="h-8 w-8 animate-spin text-swiss-red" />
                    </div>
                  ) : (
                    <p className="col-span-full text-[10px] font-bold uppercase  opacity-20 text-center py-4">
                      NO_STREAMS_AVAILABLE
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 bg-swiss-muted/30 border-t-8 border-swiss-black mt-auto">
            <SwissButton
              variant="secondary"
              className="w-full h-16"
              onClick={() => setIsOpen(false)}
            >
              TERMINATE_PROTOCOL
            </SwissButton>
          </div>
        </SwissCard>
      </DialogContent>
    </Dialog>
  );
}
