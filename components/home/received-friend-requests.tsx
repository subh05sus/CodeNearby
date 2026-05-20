/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, X, UserCheck, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface FriendRequest {
  sender: any;
  _id: string;
  senderId: string;
  senderName: string;
  senderImage: string;
  status: string;
}

const SHOW_DEFAULT = 3;

export function ReceivedFriendRequests() {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  const fetchRequests = async () => {
    try {
      const data = await fetch("/api/friends/requests/received").then((r) =>
        r.json()
      );
      setRequests(data.filter((r: FriendRequest) => r.status === "pending"));
    } catch {
      console.error("Error fetching friend requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleRequest = async (id: string, action: "accept" | "reject") => {
    try {
      const r = await fetch(`/api/friends/request/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: action === "accept" ? "accepted" : "rejected",
        }),
      });
      if (!r.ok) throw new Error();
      toast.success(`Request ${action}ed!`);
      setRequests((prev) => prev.filter((req) => req._id !== id));
    } catch {
      toast.error("Failed to update request.");
    }
  };

  if (!loading && requests.length === 0) return null;

  const visible = expanded ? requests : requests.slice(0, SHOW_DEFAULT);
  const hidden = requests.length - SHOW_DEFAULT;

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 mb-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 pt-5 pb-4 border-b border-primary/15">
        <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
          <UserCheck className="w-3.5 h-3.5 text-primary" />
        </div>
        <h2 className="font-heading text-base">Friend Requests</h2>
        {!loading && requests.length > 0 && (
          <span className="ml-auto text-[11px] font-mono font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            {requests.length}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        {loading ? (
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-7 w-16 rounded-full" />
                <Skeleton className="h-7 w-7 rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="relative">
            <ul className="space-y-2">
              <AnimatePresence>
                {visible.map((req) => (
                  <motion.li
                    key={req._id}
                    initial={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-between gap-3 rounded-xl bg-background px-4 py-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-9 w-9 flex-shrink-0">
                        <AvatarImage
                          src={req.sender.image}
                          alt={req.sender.name}
                        />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                          {req.sender.name?.charAt(0) ?? "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {req.sender.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          wants to connect
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        className="h-8 rounded-full px-3 text-xs"
                        onClick={() => handleRequest(req._id, "accept")}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:border-destructive/40 hover:text-destructive"
                        onClick={() => handleRequest(req._id, "reject")}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>

            {/* Shadow + expand when collapsed and more items exist */}
            {!expanded && hidden > 0 && (
              <div className="relative">
                <div className="absolute -top-10 left-0 right-0 h-10 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
                <button
                  onClick={() => setExpanded(true)}
                  className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                  Show {hidden} more
                </button>
              </div>
            )}

            {expanded && requests.length > SHOW_DEFAULT && (
              <button
                onClick={() => setExpanded(false)}
                className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-muted/50 transition-colors"
              >
                <ChevronDown className="h-3.5 w-3.5 rotate-180" />
                Show less
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
