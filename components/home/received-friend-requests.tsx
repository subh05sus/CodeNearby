/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useEffect, useState } from "react";
import { Check, X, UserSearch } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import SwissCard from "../swiss/SwissCard";
import SwissButton from "../swiss/SwissButton";
import Image from "next/image";

interface FriendRequest {
  sender: any;
  _id: string;
  senderId: string;
  senderName: string;
  senderImage: string;
  status: string;
}

export function ReceivedFriendRequests() {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const response = await fetch("/api/friends/requests/received");
      const data = await response.json();
      setRequests(
        data.filter((request: FriendRequest) => request.status === "pending")
      );
    } catch (error) {
      console.error("Error fetching friend requests:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchRequests();
  }, []);

  const handleRequest = async (
    requestId: string,
    action: "accept" | "reject"
  ) => {
    try {
      const response = await fetch(`/api/friends/request/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: action === "accept" ? "accepted" : "rejected",
        }),
      });

      if (!response.ok) throw new Error("Failed to update request");

      toast.success(`Request ${action}ed successfully!`);

      fetchRequests();
    } catch {
      toast.error("Failed to fetch friend requests. Please try again.");
    }
  };

  if (requests.length === 0 && !loading) {
    return null;
  }

  return (
    <SwissCard variant="accent" pattern="grid" className="mb-8">
      <div className="flex justify-between items-center mb-6 border-b-4 border-black dark:border-white pb-2">
        <h2 className="text-2xl font-black uppercase tracking-tightest flex items-center gap-2 text-white dark:text-black">
          <UserSearch size={24} />
          Incoming Signals
        </h2>
        <span className="bg-black dark:bg-white text-white dark:text-black px-2 py-1 text-xs font-black">{requests.length} PENDING</span>
      </div>
      <div>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 w-full bg-white/20 dark:bg-black/20 border-2 border-black dark:border-white animate-pulse" />
            ))}
          </div>
        ) : requests.length > 0 ? (
          <ul className="space-y-4">
            {requests.map((request) => (
              <li
                key={request._id}
                className="flex items-center justify-between p-4 border-4 border-black dark:border-white bg-white dark:bg-black group"
              >
                <div className="flex items-center space-x-4">
                  <div className="relative w-12 h-12 border-2 border-black dark:border-white overflow-hidden shadow-[3px_3px_0_0_rgba(0,0,0,1)] dark:shadow-[3px_3px_0_0_rgba(255,255,255,1)] flex-shrink-0">
                    <Image
                      src={request.sender.image || "/placeholder.svg"}
                      alt={request.sender.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-black uppercase tracking-tight text-sm leading-none mb-1 text-black dark:text-white">{request.sender.name}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40 dark:opacity-30 italic text-black dark:text-white">PENDING AUTHENTICATION</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <SwissButton
                    variant="secondary"
                    size="sm"
                    className="w-10 h-10 p-0 border-2"
                    onClick={() => handleRequest(request._id!, "accept")}
                  >
                    <Check className="h-5 w-5" />
                  </SwissButton>
                  <SwissButton
                    variant="secondary"
                    size="sm"
                    className="w-10 h-10 p-0 hover:bg-swiss-red hover:text-white transition-colors border-2"
                    onClick={() => handleRequest(request._id!, "reject")}
                  >
                    <X className="h-5 w-5" />
                  </SwissButton>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center font-black uppercase tracking-widest opacity-50 dark:opacity-20 py-12 border-4 border-dashed border-black/10 dark:border-white/10 text-white dark:text-black">NO SIGNAL DETECTED</p>
        )}
      </div>
    </SwissCard>
  );
}
