"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, MessageSquare, UserX, UserMinus } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { QRCodeDisplay } from "@/components/qr-code-display";
import { Session } from "next-auth";

interface User {
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
  }, [session]); // Removed params.slug from dependencies

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

  const handleKickUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/gathering/${params.slug}/moderate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "kick", userId }),
      });
      if (!response.ok) {
        throw new Error("Failed to kick user");
      }
      fetchGathering();
      toast({
        title: "Success",
        description: "User has been kicked from the gathering.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to kick user. Please try again.",
        variant: "destructive",
      });
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
        description: "User has been blocked from sending messages.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to block user. Please try again.",
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
      <Card>
        <CardHeader>
          <CardTitle>{gathering.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Expires: {new Date(gathering.expiresAt).toLocaleString()}
          </p>
          <div className="flex justify-between items-center mb-6">
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
          <h3 className="text-lg font-semibold mb-2">Participants</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {gathering.participants.slice(0, 10).map((user) => (
              <div key={user.id} className="flex flex-col items-center">
                <Avatar className="h-12 w-12 mb-2">
                  <AvatarImage src={user.image} alt={user.name} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                <p className="text-sm text-center">{user.name}</p>
                {isHost && user.id !== session.user.id && (
                  <div className="flex mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBlockUser(user.id)}
                      className="mr-1"
                    >
                      <UserX className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleKickUser(user.id)}
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
          {gathering.participants.length > 10 && (
            <p className="text-sm text-muted-foreground mt-4">
              And {gathering.participants.length - 10} more participants...
            </p>
          )}
        </CardContent>
      </Card>
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Invite Others</h3>
        <QRCodeDisplay slug={gathering.slug} />
      </div>
    </div>
  );
}
