/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

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
  const { toast } = useToast();

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

      toast({
        title: "Success",
        description: `Request ${action}ed successfully!`,
      });

      fetchRequests();
    } catch {
      toast({
        title: "Error",
        description: `Failed to ${action} request.`,
        variant: "destructive",
      });
    }
  };

  if (requests.length === 0) {
    return;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Friend Requests</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : requests.length > 0 ? (
          <ul className="space-y-2">
            {requests
              // .filter((request) => request.status === "pending")
              .map((request) => (
                <li
                  key={request._id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <Avatar>
                      <AvatarImage
                        src={request.sender.image}
                        alt={request.sender.name}
                      />
                      <AvatarFallback>
                        {request.sender.name
                          ? request.sender.name.charAt(0)
                          : ""}
                      </AvatarFallback>
                    </Avatar>
                    <span>{request.sender.name}</span>
                  </div>
                  <div className="space-x-2">
                    <Button
                      className="rounded-full"
                      variant="outline"
                      size="icon"
                      onClick={() => handleRequest(request._id!, "accept")}
                    >
                      <Check className="h-4 w-4 " />
                    </Button>
                    <Button
                      className="rounded-full"
                      variant="outline"
                      size="icon"
                      onClick={() => handleRequest(request._id!, "reject")}
                    >
                      <X className="h-4 w-4 " />
                    </Button>
                  </div>
                </li>
              ))}
          </ul>
        ) : (
          <p>No pending friend requests</p>
        )}
      </CardContent>
    </Card>
  );
}
