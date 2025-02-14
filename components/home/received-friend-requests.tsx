"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, X } from "lucide-react";

interface FriendRequest {
  _id: string;
  senderId: string;
  senderName: string;
  senderImage: string;
}

export function ReceivedFriendRequests() {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch("/api/friends/requests");
        const data = await response.json();
        setRequests(data);
      } catch (error) {
        console.error("Error fetching friend requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleAccept = async (requestId: string) => {
    try {
      await fetch(`/api/friends/request/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "accepted" }),
      });
      setRequests(requests.filter((request) => request._id !== requestId));
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await fetch(`/api/friends/request/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      });
      setRequests(requests.filter((request) => request._id !== requestId));
    } catch (error) {
      console.error("Error rejecting friend request:", error);
    }
  };

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
            {requests.map((request) => (
              <li
                key={request._id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <Avatar>
                    <AvatarImage
                      src={request.senderImage}
                      alt={request.senderName}
                    />
                    <AvatarFallback>
                      {request.senderName ? request.senderName.charAt(0) : ""}
                    </AvatarFallback>
                  </Avatar>
                  <span>{request.senderName}</span>
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAccept(request._id)}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Accept
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReject(request._id)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
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
