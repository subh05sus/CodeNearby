/* eslint-disable react-hooks/exhaustive-deps */
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Send } from "lucide-react";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useToast } from "./ui/use-toast";
import Image from "next/image";
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

export function SharePost() {
  const { data: session } = useSession() as { data: Session | null };
  const [isOpen, setIsOpen] = useState(false);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [loadingGatherings, setLoadingGatherings] = useState(true);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [gatherings, setGatherings] = useState<Gathering[]>([]);
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
    console.log("Sharing to friend", friendId);
  };

  const handleShareToGathering = async (gatheringId: string) => {
    console.log("Sharing to gathering", gatheringId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size={"icon"} variant={"ghost"}>
          <Send />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Post To</DialogTitle>
          <DialogDescription>
            Share your posts to your friends and gatherings
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="mb-2 text-sm font-medium">Friends</h4>
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {friends.length > 0 ? (
                friends.map((friend) => (
                  <div
                    key={friend.id}
                    onClick={() => handleShareToFriend(friend.id)}
                    className="flex-shrink-0 flex flex-col items-center cursor-pointer"
                  >
                    <Image
                      height={48}
                      width={48}
                      src={friend.image}
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
                gatherings.map((gathering) => (
                  <div
                    key={gathering.id}
                    onClick={() => handleShareToGathering(gathering.id)}
                    className="flex-shrink-0 flex flex-col items-center cursor-pointer"
                  >
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      {gathering.name[0]}
                    </div>
                    <span className="text-xs mt-1 max-w-[60px] truncate">
                      {gathering.name}
                    </span>
                  </div>
                ))
              ) : loadingGatherings ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <p className="text-sm text-gray-500">No Gatherings found</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
