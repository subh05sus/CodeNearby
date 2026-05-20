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
  Radio,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { QRCodeDisplay } from "@/components/qr-code-display";
import { Input } from "@/components/ui/input";
import { Ripple } from "@/components/magicui/ripple";
import { RandomProfileCircles } from "@/components/random-profile-circles";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
      if (!response.ok) throw new Error();
      setIsEditing(false);
      fetchGathering();
      toast.success("Gathering name updated.");
    } catch {
      toast.error("Failed to update name.");
    }
  };

  useEffect(() => {
    if (session) fetchGathering();
  }, [session]);

  const fetchGathering = async () => {
    try {
      const response = await fetch(`/api/gathering/${params.slug}`);
      if (!response.ok) throw new Error();
      const data = await response.json();
      setGathering(data);
      setFilteredParticipants({ participants: data.participants });
      const imagesWithIds = data.participants
        .map((p: any) => ({ image: p.image, id: p.githubUsername }))
        .filter((p: any) => p.image !== session?.user?.image);
      setParticipantImagesWithIds(imagesWithIds);
      setHostOnlyMode(data.hostOnly);
    } catch {
      toast.error("Failed to fetch gathering.");
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId: string) => {
    try {
      await fetch(`/api/gathering/${params.slug}/moderate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "block", userId }),
      });
      fetchGathering();
      toast.success("User blocked.");
    } catch {
      toast.error("Failed to block user.");
    }
  };

  const handleUnblockUser = async (userId: string) => {
    try {
      await fetch(`/api/gathering/${params.slug}/moderate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unblock", userId }),
      });
      fetchGathering();
      toast.success("User unblocked.");
    } catch {
      toast.error("Failed to unblock user.");
    }
  };

  const handleMuteUser = async (userId: string) => {
    try {
      await fetch(`/api/gathering/${params.slug}/moderate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mute", userId }),
      });
      fetchGathering();
      toast.success("User muted.");
    } catch {
      toast.error("Failed to mute user.");
    }
  };

  const handleUnmuteUser = async (userId: string) => {
    try {
      await fetch(`/api/gathering/${params.slug}/moderate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unmute", userId }),
      });
      fetchGathering();
      toast.success("User unmuted.");
    } catch {
      toast.error("Failed to unmute user.");
    }
  };

  const handleHostOnlyMode = async () => {
    try {
      await fetch(`/api/gathering/${params.slug}/moderate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "hostOnly", enabled: !hostOnlyMode }),
      });
      setHostOnlyMode(!hostOnlyMode);
      toast.success(`Host-only mode ${hostOnlyMode ? "disabled" : "enabled"}.`);
    } catch {
      toast.error("Failed to toggle host-only mode.");
    }
  };

  const copyInviteLink = () => {
    const inviteLink = `${window.location.origin}/gathering/join/${gathering?.slug}`;
    navigator.clipboard.writeText(inviteLink);
    toast.success("Invite link copied!");
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center px-4">
        <h2 className="font-heading text-xl">Sign in to view this gathering</h2>
        <LoginButton />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!gathering) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-center px-4">
        <h2 className="font-heading text-xl">Gathering Not Found</h2>
        <p className="text-sm text-muted-foreground">This gathering could not be found.</p>
      </div>
    );
  }

  if (
    gathering.participants &&
    !gathering.participants.some((p: any) => p._id === session.user.id)
  ) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center px-4">
        <Radio className="w-10 h-10 text-muted-foreground/30" />
        <h2 className="font-heading text-xl">Not a participant</h2>
        <p className="text-sm text-muted-foreground">Would you like to join?</p>
        <Link
          href={`/gathering/join/${params.slug}`}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm text-white"
          style={{ background: "hsl(24 95% 53%)" }}
        >
          Join Gathering
        </Link>
      </div>
    );
  }

  const isHost = session.user.id === gathering.hostId;
  const timeLeft = new Date(gathering.expiresAt).getTime() - Date.now();
  const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <div className="container max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-mono font-semibold text-primary uppercase tracking-widest">
              Live Gathering
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="font-heading text-2xl sm:text-3xl bg-transparent border-b-2 border-primary outline-none min-w-0"
                />
                <button onClick={handleSaveName} className="p-1 hover:text-primary transition-colors">
                  <Check className="h-5 w-5" />
                </button>
                <button
                  onClick={() => { setIsEditing(false); setEditedName(gathering.name); }}
                  className="p-1 hover:text-destructive transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </>
            ) : (
              <>
                <h1 className="font-heading text-2xl sm:text-3xl">{gathering.name}</h1>
                {isHost && (
                  <button
                    onClick={() => { setIsEditing(true); setEditedName(gathering.name); }}
                    className="p-1 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                )}
              </>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
              <Clock className="h-3 w-3" />
              {hoursLeft}h {minutesLeft}m left
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
              <Users className="h-3 w-3" />
              {gathering.participants.length} participants
            </span>
            {isHost && (
              <span
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full text-white"
                style={{ background: "hsl(24 95% 53%)" }}
              >
                <Crown className="h-3 w-3" />
                Host
              </span>
            )}
          </div>
        </div>

        {gathering?.blockedUsers?.includes(session?.user?.id) ? (
          <button
            disabled
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold text-sm border border-border text-muted-foreground opacity-60 flex-shrink-0"
          >
            <UserX className="h-4 w-4" />
            You are blocked
          </button>
        ) : (
          <Link
            href={`/gathering/${gathering.slug}/chat`}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold text-sm text-white hover:opacity-90 transition-opacity flex-shrink-0"
            style={{ background: "hsl(24 95% 53%)" }}
          >
            <MessageSquare className="h-4 w-4" />
            Join Chat Room
          </Link>
        )}
      </div>

      {/* Main grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Participants card */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-3.5 h-3.5 text-primary" />
              </div>
              <h2 className="font-heading text-base">Participants</h2>
            </div>
            {isHost && (
              <div className="flex items-center gap-2">
                <Switch
                  checked={hostOnlyMode}
                  onCheckedChange={handleHostOnlyMode}
                  id="host-only-mode"
                />
                <span className="text-xs text-muted-foreground">Host Only</span>
              </div>
            )}
          </div>

          <div className="p-4">
            <Tabs defaultValue="connect" className="w-full">
              <TabsList className="w-full rounded-xl">
                <TabsTrigger value="connect" className="flex-1 rounded-lg">
                  Connect
                </TabsTrigger>
                <TabsTrigger value="view-all" className="flex-1 rounded-lg">
                  View All
                </TabsTrigger>
              </TabsList>

              <TabsContent value="connect" className="mt-4 relative">
                <AnimatePresence mode="wait">
                  {showConnectView ? (
                    <motion.div
                      key="connect"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="relative aspect-square w-full bg-muted/30 rounded-2xl"
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
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="relative aspect-square w-full bg-muted/30 rounded-2xl"
                    >
                      <div className="grid gap-4 p-2">
                        {(() => {
                          const items = participantImagesWithIds.map((user) => ({
                            image: user.image,
                            link: `/u/${user.id}`,
                            title: user.id,
                            description: "",
                          }));
                          return (
                            <div className="max-h-[600px] w-full aspect-square relative rounded-xl overflow-hidden">
                              <InfiniteMenu items={items} />
                              <motion.div
                                initial={{ opacity: 1 }}
                                animate={{ opacity: items.length === 0 ? 1 : 0 }}
                                transition={{ delay: 3, duration: 0.5 }}
                                className="pointer-events-none absolute inset-0 bg-background/50 z-40 flex items-center justify-center"
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
                          );
                        })()}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="absolute top-4 right-4 z-50 flex gap-2">
                  <Button variant="secondary" size="icon" onClick={fetchGathering} className="rounded-xl">
                    <RefreshCcw size={16} />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => setShowConnectView(!showConnectView)}
                    className="rounded-xl"
                  >
                    <IconArrowsExchange2 size={16} />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="view-all" className="mt-4">
                <ScrollArea className="h-[400px] pr-2">
                  <div className="space-y-1">
                    <div className="mb-3">
                      <Input
                        type="text"
                        placeholder="Filter participants..."
                        onChange={(e) => {
                          const filter = e.target.value.toLowerCase();
                          const filtered = gathering.participants.filter((u) =>
                            u.name.toLowerCase().includes(filter)
                          );
                          setFilteredParticipants({ participants: filtered });
                        }}
                        className="rounded-xl"
                      />
                    </div>
                    {filteredParticipants.participants.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.image} alt={user.name} />
                            <AvatarFallback className="text-xs">{user.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{user.name}</p>
                            {user._id === gathering.hostId && (
                              <p className="text-[10px] text-primary font-semibold">Host</p>
                            )}
                          </div>
                        </div>
                        {isHost && user._id !== session.user?.id && (
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-lg"
                              onClick={() =>
                                gathering.blockedUsers?.includes(user._id)
                                  ? handleUnblockUser(user._id)
                                  : handleBlockUser(user._id)
                              }
                            >
                              {gathering.blockedUsers?.includes(user._id) ? (
                                <UserCheck2Icon className="h-3.5 w-3.5" />
                              ) : (
                                <UserX className="h-3.5 w-3.5" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-lg"
                              onClick={() =>
                                gathering.mutedUsers?.includes(user._id)
                                  ? handleUnmuteUser(user._id)
                                  : handleMuteUser(user._id)
                              }
                            >
                              {gathering.mutedUsers?.includes(user._id) ? (
                                <UserPlus2 className="h-3.5 w-3.5" />
                              ) : (
                                <VolumeX className="h-3.5 w-3.5" />
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
          </div>
        </div>

        {/* Invite card */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
            <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
              <LinkIcon className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <h2 className="font-heading text-base">Invite Others</h2>
              <p className="text-[11px] text-muted-foreground">Share with your friends</p>
            </div>
          </div>

          <div className="p-5 space-y-5">
            <div className="flex justify-center">
              <QRCodeDisplay slug={gathering.slug} />
            </div>
            <Separator />
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Invite Link
              </label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={`${window.location.origin}/gathering/join/${gathering.slug}`}
                  className="rounded-xl text-sm font-mono"
                />
                <Button
                  variant="secondary"
                  size="icon"
                  className="flex-shrink-0 rounded-xl"
                  onClick={() => {
                    copyInviteLink();
                    setShowCheckIcon(true);
                    setTimeout(() => setShowCheckIcon(false), 1000);
                  }}
                >
                  {showCheckIcon ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <LinkIcon className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
