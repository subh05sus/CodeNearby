/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import Image from "next/image"
import type { FriendRequest } from "@/types"

export default function RequestsPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState<FriendRequest[]>([])
  const { toast } = useToast()

  useEffect(() => {
    if (session) {
      fetchRequests()
    }
  }, [session])

  const fetchRequests = async () => {
    try {
      const response = await fetch("/api/friends/requests")
      const data = await response.json()
      setRequests(data)
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch requests.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRequest = async (requestId: string, action: "accept" | "reject") => {
    try {
      const response = await fetch(`/api/friends/request/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action === "accept" ? "accepted" : "rejected" }),
      })

      if (!response.ok) throw new Error("Failed to update request")

      toast({
        title: "Success",
        description: `Request ${action}ed successfully!`,
      })

      fetchRequests()
    } catch {
      toast({
        title: "Error",
        description: `Failed to ${action} request.`,
        variant: "destructive",
      })
    }
  }

  const handleInvite = (username: string) => {
    // Implement invitation logic here
    console.log(`Inviting ${username} to CodeNearby`)
    toast({
      title: "Invite Sent",
      description: `An invitation has been sent to ${username}`,
    })
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
        <p>You need to be signed in to view requests.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
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
              .filter((req) => req.receiverGithubId === session.user.githubId && req.status === "pending")
              .map((request) => (
                <Card key={request._id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-4">
                      <Image
                        src={request.sender?.image || "/placeholder.svg"}
                        alt={request.sender?.name || ""}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      {request.sender?.name || request.senderGithubUsername}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Sent on: {new Date(request.createdAt).toLocaleString()}
                    </p>
                    <div className="flex gap-2">
                      <Button onClick={() => handleRequest(request._id!, "accept")}>Accept</Button>
                      <Button variant="outline" onClick={() => handleRequest(request._id!, "reject")}>
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
              .filter((req) => req.senderId === session.user.id)
              .map((request) => (
                <Card key={request._id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-4">
                      <Image
                        src={request.receiver?.image || request.receiver?.avatar_url || "/placeholder.svg"}
                        alt={request.receiver?.name || request.receiverGithubUsername || ""}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      {request.receiver?.name || request.receiverGithubUsername}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">
                      Sent on: {new Date(request.createdAt).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Status: <span className="capitalize">{request.status}</span>
                    </p>
                    {request.receiverInCodeNearby ? (
                      <a
                        href={request.receiver?.githubProfileUrl || request.receiver?.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline mt-2 inline-block"
                      >
                        View GitHub Profile
                      </a>
                    ) : (
                      <div className="mt-2">
                        <p className="text-sm text-muted-foreground mb-2">Not in CodeNearby</p>
                        <Button onClick={() => handleInvite(request.receiverGithubUsername)}>
                          Invite to CodeNearby
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

