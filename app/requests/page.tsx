/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import type { FriendRequest, Developer } from "@/types";
import Image from "next/image";

export default function RequestsPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<
    (FriendRequest & { sender?: Developer; receiver?: Developer })[]
  >([]);
  const { toast } = useToast();

  useEffect(() => {
    if (session) {
      fetchRequests();
    }
  }, [session]);

  const fetchRequests = async () => {
    try {
      const response = await fetch("/api/friends/requests");
      const data = await response.json();
      setRequests(data);
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch requests.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
        <p>You need to be signed in to view requests.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Friend Requests</h1>

      <Tabs defaultValue="received">
        <TabsList>
          <TabsTrigger value="received">Received</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
        </TabsList>

        <TabsContent value="received">
          <div className="grid gap-4">
            {requests
              .filter(
                (req) =>
                  req.receiverId === session?.user?.id &&
                  req.status === "pending"
              )
              .map((request) => (
                <Card key={request._id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-4">
                      <Image
                        width={40}
                        height={40}
                        src={request.sender?.avatar_url || "/placeholder.svg"}
                        alt={request.sender?.name}
                        className="w-10 h-10 rounded-full"
                      />
                      {request.sender?.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleRequest(request._id!, "accept")}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleRequest(request._id!, "reject")}
                      >
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="sent">
          <div className="grid gap-4">
            {requests
              .filter((req) => req.senderId === session?.user?.id)
              .map((request) => (
                <Card key={request._id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-4">
                      <Image
                        height={40}
                        width={40}
                        src={
                          request.receiver?.avatar_url || request.receiverAvatar
                        }
                        alt={request.receiver?.name}
                        className="w-10 h-10 rounded-full"
                      />
                      {request.receiver?.name}
                      {!request.receiver && (
                        <span className="text-muted-foreground">
                          Not in CodeNearby {request.receiverGithubUrl}
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <span className="capitalize text-muted-foreground">
                      Status: {request.status}
                    </span>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
