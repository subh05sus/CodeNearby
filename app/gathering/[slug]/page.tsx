/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import {
  Loader2,
  MessageSquare,
  UserX,
  VolumeX,
  Copy,
  UserCheck2Icon,
  UserPlus2,
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { QRCodeDisplay } from "@/components/qr-code-display";
import type { Session } from "next-auth";
import { Input } from "@/components/ui/input";

interface User {
  _id: string;
  id: string;
  name: string;
  image: string;
}

interface Gathering {
  id: string;
  name: string;
  slug: string;
  expiresAt: string;
  hostId: string;
  participants: User[];
  blockedUsers: string[];
  mutedUsers: string[];
}

export default function GatheringRoomPage() {
  const { data: session } = useSession() as { data: Session | null };
  const params = useParams();
  const { toast } = useToast();
  const [gathering, setGathering] = useState<Gathering | null>(null);
  const [loading, setLoading] = useState(true);
  const [hostOnlyMode, setHostOnlyMode] = useState(false);

  useEffect(() => {
    if (session) {
      fetchGathering();
    }
  }, [session]);

  const fetchGathering = async () => {
    try {
      const response = await fetch(`/api/gathering/${params.slug}`);
      if (!response.ok) {
        throw new Error("Failed to fetch gathering");
      }
      const data = await response.json();
      setGathering(data);
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch gathering. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/gathering/${params.slug}/moderate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "block", userId }),
      });
      if (!response.ok) {
        throw new Error("Failed to block user");
      }
      fetchGathering();
      toast({
        title: "Success",
        description: "User has been blocked from the gathering.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to block user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUnblockUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/gathering/${params.slug}/moderate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unblock", userId }),
      });
      if (!response.ok) {
        throw new Error("Failed to unblock user");
      }
      fetchGathering();
      toast({
        title: "Success",
        description: "User has been unblocked from the gathering.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to unblock user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMuteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/gathering/${params.slug}/moderate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mute", userId }),
      });
      if (!response.ok) {
        throw new Error("Failed to mute user");
      }
      fetchGathering();
      toast({
        title: "Success",
        description: "User has been muted in the gathering.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to mute user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUnmuteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/gathering/${params.slug}/moderate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unmute", userId }),
      });
      if (!response.ok) {
        throw new Error("Failed to unmute user");
      }
      fetchGathering();
      toast({
        title: "Success",
        description: "User has been unmuted in the gathering.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to unmute user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleHostOnlyMode = async () => {
    try {
      const response = await fetch(`/api/gathering/${params.slug}/moderate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "hostOnly", enabled: !hostOnlyMode }),
      });
      if (!response.ok) {
        throw new Error("Failed to toggle host-only mode");
      }
      setHostOnlyMode(!hostOnlyMode);
      toast({
        title: "Success",
        description: `Host-only mode ${hostOnlyMode ? "disabled" : "enabled"}.`,
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to toggle host-only mode. Please try again.",
        variant: "destructive",
      });
    }
  };

  const copyInviteLink = () => {
    const inviteLink = `${window.location.origin}/gathering/join/${gathering?.slug}`;
    navigator.clipboard.writeText(inviteLink);
    toast({
      title: "Success",
      description: "Invite link copied to clipboard.",
    });
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
        <p>You need to be signed in to view this gathering.</p>
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

  if (!gathering) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold mb-4">Gathering Not Found</h1>
        <p>The requested gathering could not be found.</p>
      </div>
    );
  }

  const isHost = session.user.id === gathering.hostId;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{gathering.name}</h1>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/2">
          <Card>
            <CardHeader>
              <CardTitle>Participants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {gathering.participants.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.image} alt={user.name} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <span>{user.name}</span>
                    </div>
                    {isHost && user.id !== session.user.id && (
                      <div className="flex space-x-2">
                        {!gathering.blockedUsers?.includes(user._id) ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleBlockUser(user._id)}
                            disabled={
                              gathering.blockedUsers?.includes(user._id) ??
                              false
                            }
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnblockUser(user._id)}
                          >
                            <UserCheck2Icon className="h-4 w-4" />
                          </Button>
                        )}

                        {!gathering.mutedUsers?.includes(user._id) ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMuteUser(user._id)}
                            disabled={
                              gathering.mutedUsers?.includes(user._id) ?? false
                            }
                          >
                            <VolumeX className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnmuteUser(user._id)}
                          >
                            <UserPlus2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="w-full md:w-1/2">
          <Card>
            <CardHeader>
              <CardTitle>Invite Others</CardTitle>
            </CardHeader>
            <CardContent>
              <QRCodeDisplay slug={gathering.slug} />
              <div className="mt-4 flex items-center space-x-2">
                <Input
                  readOnly
                  value={`${window.location.origin}/gathering/join/${gathering.slug}`}
                />
                <Button onClick={copyInviteLink}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card className="mt-4">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <Button asChild>
                  <Link href={`/gathering/${gathering.slug}/chat`}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Join Chat
                  </Link>
                </Button>
                {isHost && (
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={hostOnlyMode}
                      onCheckedChange={handleHostOnlyMode}
                      id="host-only-mode"
                    />
                    <label htmlFor="host-only-mode">Host-only mode</label>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
