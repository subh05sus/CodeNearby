/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  MessageSquare,
  UserX,
  VolumeX,
  UserCheck2Icon,
  UserPlus2,
  RefreshCcw,
  Crown,
  Clock,
  Users,
  LinkIcon,
  Check,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { QRCodeDisplay } from "@/components/qr-code-display";
import { Input } from "@/components/ui/input";
import { Ripple } from "@/components/magicui/ripple";
import { RandomProfileCircles } from "@/components/random-profile-circles";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import LoginButton from "@/components/login-button";
import { Separator } from "@/components/ui/separator";
import { Session } from "next-auth";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  createdAt: string;
  hostOnly: boolean;
}

export default function GatheringRoomPage() {
  const { data: session } = useSession() as { data: Session | null };
  const params = useParams();
  const { toast } = useToast();
  const [gathering, setGathering] = useState<Gathering | null>(null);
  const [loading, setLoading] = useState(true);
  const [hostOnlyMode, setHostOnlyMode] = useState(false);
  const [participantImagesWithIds, setParticipantImagesWithIds] = useState<
    { image: string; id: string }[]
  >([]);
  const [showCheckIcon, setShowCheckIcon] = useState(false);

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
      const imagesWithIds = data.participants
        .map((participant: any) => ({
          image: participant.image,
          id: participant.githubUsername,
        }))
        .filter(
          (participant: any) => participant.image !== session?.user?.image
        );
      setParticipantImagesWithIds(imagesWithIds);
      setHostOnlyMode(data.hostOnly);
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
        <LoginButton />
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

  if (
    gathering.participants &&
    !gathering.participants.some(
      (participant: any) => participant._id === session.user.id
    )
  ) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold mb-4">Unauthorized</h1>
        <p>You are not a participant of this gathering.</p>
        <p className="mb-4">Would you like to join this gathering?</p>
        <Button asChild>
          <Link href={`/gathering/join/${params.slug}`}>Join Gathering</Link>
        </Button>
      </div>
    );
  }

  const isHost = session.user.id === gathering.hostId;

  const timeLeft =
    new Date(gathering.expiresAt).getTime() - new Date().getTime();
  const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold">{gathering.name}</h1>
          <div className="flex items-center gap-2 mt-2 cursor-default">
            <Badge variant="secondary">
              <Clock className="w-3 h-3 mr-1" />
              {hoursLeft}h {minutesLeft}m left
            </Badge>
            <Badge variant="secondary">
              <Users className="w-3 h-3 mr-1" />
              {gathering.participants.length} participants
            </Badge>
            {isHost && (
              <Badge variant="default">
                <Crown className="w-3 h-3 mr-1" />
                Host
              </Badge>
            )}
          </div>
        </div>
        <Button asChild size="lg" className="shrink-0">
          <Link href={`/gathering/${gathering.slug}/chat`}>
            <MessageSquare className="mr-2 h-5 w-5" />
            Join Chat Room
          </Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="md:order-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Participants</CardTitle>
            {isHost && (
              <div className="flex items-center gap-2">
                <Switch
                  checked={hostOnlyMode}
                  onCheckedChange={handleHostOnlyMode}
                  id="host-only-mode"
                />
                <span className="text-sm text-muted-foreground">Host Only</span>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="connect" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="connect" className="flex-1">
                  Connect
                </TabsTrigger>
                <TabsTrigger value="view-all" className="flex-1">
                  View All
                </TabsTrigger>
              </TabsList>
              <TabsContent value="connect" className="mt-4">
                <div className="relative aspect-square w-full bg-background/50 rounded-lg">
                  <Ripple mainCircleSize={10} numCircles={10} />
                  <RandomProfileCircles
                    profiles={participantImagesWithIds}
                    OwnProfileImage={session.user?.image || ""}
                    OwnProfileImageSize={80}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={fetchGathering}
                    className="absolute top-4 right-4 z-30"
                  >
                    <RefreshCcw size={20} />
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="view-all" className="mt-4">
                <ScrollArea className=" pr-4 h-[400px]">
                  <div className="space-y-3">
                    {gathering.participants.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.image} alt={user.name} />
                            <AvatarFallback>{user.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            {user._id === gathering.hostId && (
                              <p className="text-xs text-muted-foreground">
                                Host
                              </p>
                            )}
                          </div>
                        </div>
                        {isHost && user._id !== session.user?.id && (
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                gathering.blockedUsers?.includes(user._id)
                                  ? handleUnblockUser(user._id)
                                  : handleBlockUser(user._id)
                              }
                            >
                              {gathering.blockedUsers?.includes(user._id) ? (
                                <UserCheck2Icon className="h-4 w-4" />
                              ) : (
                                <UserX className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                gathering.mutedUsers?.includes(user._id)
                                  ? handleUnmuteUser(user._id)
                                  : handleMuteUser(user._id)
                              }
                            >
                              {gathering.mutedUsers?.includes(user._id) ? (
                                <UserPlus2 className="h-4 w-4" />
                              ) : (
                                <VolumeX className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="md:order-2">
          <CardHeader>
            <CardTitle>Invite Others</CardTitle>
            <CardDescription>
              Share this gathering with your friends
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <QRCodeDisplay slug={gathering.slug} />
            </div>
            <Separator />
            <div className="space-y-2">
              <label className="text-sm font-medium">Invite Link</label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={`${window.location.origin}/gathering/join/${gathering.slug}`}
                />
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => {
                    copyInviteLink();
                    setShowCheckIcon(true);
                    setTimeout(() => setShowCheckIcon(false), 1000);
                  }}
                >
                  {showCheckIcon ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <LinkIcon className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
