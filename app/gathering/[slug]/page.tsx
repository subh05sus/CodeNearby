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
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  Edit3,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { AnimatePresence, motion } from "framer-motion";
import { IconArrowsExchange2 } from "@tabler/icons-react";
import InfiniteMenu from "@/components/reactbits/InfiniteMenu";

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
  const [gathering, setGathering] = useState<Gathering | null>(null);
  const [loading, setLoading] = useState(true);
  const [hostOnlyMode, setHostOnlyMode] = useState(false);
  const [participantImagesWithIds, setParticipantImagesWithIds] = useState<
    { image: string; id: string }[]
  >([]);
  const [showCheckIcon, setShowCheckIcon] = useState(false);
  const [showConnectView, setShowConnectView] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(gathering?.name || "");
  const [filteredParticipants, setFilteredParticipants] = useState({
    participants: gathering?.participants || [],
  });

  const handleSaveName = async () => {
    if (!isHost) return;
    try {
      const response = await fetch(`/api/gathering/${params.slug}/moderate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rename", newName: editedName }),
      });
      if (!response.ok) {
        throw new Error("Failed to update name");
      }
      setIsEditing(false);
      fetchGathering();
      toast.success("Gathering name updated successfully.");
    } catch {
      toast.error("Failed to update gathering name. Please try again.");
    }
  };

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
      setFilteredParticipants({ participants: data.participants });
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
      toast.error("Failed to fetch gathering. Please try again.");
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
      toast.success("User has been blocked from the gathering.");
    } catch {
      toast.error("Failed to block user. Please try again.");
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

      toast.success("User has been unblocked from the gathering.");
    } catch {
      toast.error("Failed to unblock user. Please try again.");
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

      toast.success("User has been muted in the gathering.");
    } catch {
      toast.error("Failed to mute user. Please try again.");
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

      toast.success("User has been unmuted in the gathering.");
    } catch {
      toast.error("Failed to unmute user. Please try again.");
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

      toast.success(`Host-only mode ${hostOnlyMode ? "disabled" : "enabled"}.`);
    } catch {
      toast.error("Failed to toggle host-only mode. Please try again.");
    }
  };

  const copyInviteLink = () => {
    const inviteLink = `${window.location.origin}/gathering/join/${gathering?.slug}`;
    navigator.clipboard.writeText(inviteLink);

    toast.success("Invite link copied to clipboard.");
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
          <div className="flex gap-3 items-center">
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="text-4xl font-bold bg-transparent border-b-2 border-primary outline-none"
                />
                <div className="flex gap-2">
                  <Check
                    className="h-5 w-5 text-primary/60 hover:text-primary cursor-pointer"
                    onClick={handleSaveName}
                  />
                  <X
                    className="h-5 w-5 text-primary/60 hover:text-primary cursor-pointer"
                    onClick={() => {
                      setIsEditing(false);
                      setEditedName(gathering.name);
                    }}
                  />
                </div>
              </>
            ) : (
              <>
                <h1 className="text-4xl font-bold">{gathering.name}</h1>
                {isHost && (
                  <Edit3
                    className="h-5 w-5 text-primary/60 hover:text-primary cursor-pointer"
                    onClick={() => {
                      setIsEditing(true);
                      setEditedName(gathering.name);
                    }}
                  />
                )}
              </>
            )}
          </div>
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
        {gathering?.blockedUsers?.includes(session?.user?.id) ? (
          <Button size="lg" className="shrink-0" disabled>
            <UserX className="mr-2 h-5 w-5" />
            You are blocked
          </Button>
        ) : (
          <Button asChild size="lg" className="shrink-0">
            <Link href={`/gathering/${gathering.slug}/chat`}>
              <MessageSquare className="mr-2 h-5 w-5" />
              Join Chat Room
            </Link>
          </Button>
        )}
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
              <TabsContent value="connect" className="mt-4 relative">
                <AnimatePresence mode="wait">
                  {showConnectView ? (
                    <motion.div
                      key="connect"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="relative aspect-square w-full bg-background/50 rounded-lg"
                    >
                      <Ripple mainCircleSize={10} numCircles={10} />
                      <RandomProfileCircles
                        profiles={participantImagesWithIds}
                        OwnProfileImage={session.user?.image || ""}
                        OwnProfileImageSize={80}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="sphere"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="relative aspect-square w-full bg-background/50 rounded-lg"
                    >
                      <div className="grid gap-4 p-2">
                        {(() => {
                          const items = participantImagesWithIds.map(
                            (user) => ({
                              image: user.image,
                              link: `/u/${user.id}`,
                              title: user.id,
                              description: "",
                            })
                          );
                          return (
                            <>
                              <div className="max-h-[600px] w-full aspect-square relative rounded-xl overflow-hidden">
                                <InfiniteMenu items={items} />
                                <motion.div
                                  initial={{ opacity: 1 }}
                                  animate={{
                                    opacity: items.length === 0 ? 1 : 0,
                                  }}
                                  onTapStart={() => ({
                                    opacity: 0,
                                    transition: { duration: 0.5 },
                                  })}
                                  transition={{ delay: 3, duration: 0.5 }}
                                  className=" pointer-events-none absolute inset-0 bg-background/50 z-40 flex items-center justify-center"
                                >
                                  <div className="text-center relative w-full h-full">
                                    <p className="text-xl text-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40">
                                      Move it around!
                                    </p>
                                    <ArrowUpIcon className="w-8 h-8 absolute top-10 left-1/2 -translate-x-1/2 text-foreground z-40" />
                                    <ArrowDownIcon className="w-8 h-8 absolute bottom-10 left-1/2 -translate-x-1/2 text-foreground z-40" />
                                    <ArrowLeftIcon className="w-8 h-8 absolute left-10 top-1/2 -translate-y-1/2 text-foreground z-40" />
                                    <ArrowRightIcon className="w-8 h-8 absolute right-10 top-1/2 -translate-y-1/2 text-foreground z-40" />
                                  </div>
                                </motion.div>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="absolute top-4 right-4 z-50 flex gap-2">
                  <Button
                    variant={showConnectView ? "default" : "secondary"}
                    size="icon"
                    onClick={fetchGathering}
                  >
                    <RefreshCcw size={20} />
                  </Button>
                  <Button
                    variant={showConnectView ? "default" : "secondary"}
                    size="icon"
                    onClick={() => setShowConnectView(!showConnectView)}
                  >
                    <IconArrowsExchange2 size={20} />
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="view-all" className="mt-4">
                <ScrollArea className=" pr-4 h-[400px]">
                  <div className="space-y-3">
                    <div className="mb-4">
                      <Input
                        type="text"
                        placeholder="Filter participants..."
                        onChange={(e) => {
                          const filter = e.target.value.toLowerCase();
                          const filtered = gathering.participants.filter(
                            (user) => user.name.toLowerCase().includes(filter)
                          );
                          setFilteredParticipants({ participants: filtered });
                        }}
                        className="m-1 w-[-webkit-fill-available]"
                      />
                    </div>
                    {filteredParticipants.participants.map((user) => (
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
