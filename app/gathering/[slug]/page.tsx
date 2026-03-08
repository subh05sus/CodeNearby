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
import { QRCodeDisplay } from "@/components/qr-code-display";
import { Input } from "@/components/ui/input";
import { Ripple } from "@/components/magicui/ripple";
import { RandomProfileCircles } from "@/components/random-profile-circles";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import LoginButton from "@/components/login-button";
import { Search, Zap } from "lucide-react";
import { Session } from "next-auth";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnimatePresence, motion } from "framer-motion";
import { IconArrowsExchange2 } from "@tabler/icons-react";
import InfiniteMenu from "@/components/reactbits/InfiniteMenu";
import SwissButton from "@/components/swiss/SwissButton";
import { cn } from "@/lib/utils";

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
  const [editedName, setEditedName] = useState("");
  const [filteredParticipants, setFilteredParticipants] = useState<User[]>([]);

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
      setFilteredParticipants(data.participants);
      setEditedName(data.name);
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

  const handleModeration = async (action: string, userId?: string, enabled?: boolean) => {
    try {
      const response = await fetch(`/api/gathering/${params.slug}/moderate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, userId, enabled }),
      });
      if (!response.ok) {
        throw new Error("Action failed");
      }
      if (action === "hostOnly") {
        setHostOnlyMode(!!enabled);
      }
      fetchGathering();
      toast.success(`Action: ${action} executed.`);
    } catch {
      toast.error("Moderation action failed.");
    }
  };

  const copyInviteLink = () => {
    const inviteLink = `${window.location.origin}/gathering/join/${gathering?.slug}`;
    navigator.clipboard.writeText(inviteLink);
    toast.success("Invite link copied to clipboard.");
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
        <div className="border-8 border-swiss-black p-12 bg-swiss-white text-center shadow-[12px_12px_0_0_rgba(0,0,0,1)]">
          <h1 className="font-black text-6xl uppercase tracking-tighter mb-6 leading-none">
            ACCESS<br />RESTRICTED
          </h1>
          <p className="font-bold uppercase tracking-tight text-xl mb-8 opacity-60">
            SIGN IN TO ACCESS THIS ROOM
          </p>
          <div className="flex justify-center">
            <LoginButton />
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="w-32 h-32 bg-swiss-black animate-pulse border-8 border-swiss-muted" />
        <p className="font-black mt-6 uppercase tracking-widest text-xs">JOINING_SESSION...</p>
      </div>
    );
  }

  if (!gathering) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
        <div className="border-8 border-swiss-black p-12 bg-swiss-white text-center shadow-[12px_12px_0_0_rgba(0,0,0,1)]">
          <h1 className="font-black text-6xl uppercase tracking-tighter mb-6">404_NOT_FOUND</h1>
          <p className="font-bold uppercase tracking-tight text-xl mb-8 opacity-60">ROOM_SIGNAL_NOT_DETECTED</p>
          <SwissButton asChild variant="secondary" className="px-8">
            <Link href="/gathering">RETURN_TO_BASE</Link>
          </SwissButton>
        </div>
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
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
        <div className="border-8 border-swiss-black p-12 bg-swiss-white text-center shadow-[12px_12px_0_0_rgba(0,0,0,1)]">
          <h1 className="font-black text-6xl uppercase tracking-tighter mb-6">UNAUTHORIZED</h1>
          <p className="font-bold uppercase tracking-tight text-xl mb-8 opacity-60">NOT_A_PARTICIPANT_OF_THIS_NODE</p>
          <SwissButton asChild className="px-12 text-xl py-6">
            <Link href={`/gathering/join/${params.slug}`}>JOIN_GATHERING</Link>
          </SwissButton>
        </div>
      </div>
    );
  }

  const isHost = session.user.id === gathering.hostId;
  const timeLeft = new Date(gathering.expiresAt).getTime() - new Date().getTime();
  const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <div className="bg-swiss-white min-h-screen pb-24">
      {/* Swiss Header */}
      <div className="border-b-8 border-swiss-black bg-swiss-white sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              {isEditing ? (
                <div className="flex flex-1 gap-4 items-center">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="font-black text-7xl uppercase tracking-tighter bg-swiss-muted/50 border-b-8 border-swiss-black outline-none w-full"
                  />
                  <div className="flex gap-2">
                    <button onClick={handleSaveName} className="p-4 bg-swiss-black text-swiss-white hover:bg-swiss-red transition-colors">
                      <Check className="h-8 w-8" />
                    </button>
                    <button onClick={() => { setIsEditing(false); setEditedName(gathering.name); }} className="p-4 border-4 border-swiss-black hover:bg-swiss-muted transition-colors">
                      <X className="h-8 w-8" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="font-black text-8xl uppercase tracking-tighter leading-[0.8]">
                    {gathering.name}
                  </h1>
                  {isHost && (
                    <button onClick={() => setIsEditing(true)} className="p-2 border-4 border-swiss-black hover:bg-swiss-muted transition-colors">
                      <Edit3 className="h-6 w-6 stroke-[3]" />
                    </button>
                  )}
                </>
              )}
            </div>

            <div className="flex flex-wrap gap-4 font-black text-[10px] uppercase tracking-widest mt-6">
              <div className="px-3 py-1 bg-swiss-black text-swiss-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-swiss-red" />
                {hoursLeft}H {minutesLeft}M REMAINING
              </div>
              <div className="px-3 py-1 border-2 border-swiss-black flex items-center gap-2">
                <Users className="w-4 h-4 text-swiss-red" />
                {gathering.participants.length} NODES_SYNCED
              </div>
              {isHost && (
                <div className="px-3 py-1 bg-swiss-red text-swiss-white flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  ADMIN_HOST
                </div>
              )}
            </div>
          </div>

          <div className="flex shrink-0 gap-3">
            {gathering?.blockedUsers?.includes(session?.user?.id) ? (
              <SwissButton variant="secondary" disabled className="h-16 px-10">
                <UserX className="mr-3 h-6 w-6" /> BLOCKED
              </SwissButton>
            ) : (
              <SwissButton asChild className="h-16 px-10 text-xl">
                <Link href={`/gathering/${gathering.slug}/chat`}>
                  <MessageSquare className="mr-3 h-6 w-6 stroke-[3]" /> JOIN_CHAT_ROOM
                </Link>
              </SwissButton>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-12">
        {/* Participants Section */}
        <div className="border-8 border-swiss-black bg-swiss-white shadow-[16px_16px_0_0_rgba(0,0,0,1)] flex flex-col min-h-[600px]">
          <div className="p-6 border-b-8 border-swiss-black flex justify-between items-center bg-swiss-muted/10">
            <h2 className="font-black text-3xl uppercase tracking-tighter">PARTICIPANTS</h2>
            {isHost && (
              <div className="flex items-center gap-4 bg-swiss-white border-4 border-swiss-black px-4 py-2">
                <span className="font-black text-[10px] uppercase tracking-widest">HOST_ONLY</span>
                <Switch
                  checked={hostOnlyMode}
                  onCheckedChange={(checked) => handleModeration("hostOnly", undefined, checked)}
                  className="data-[state=checked]:bg-swiss-red"
                />
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col">
            <Tabs defaultValue="connect" className="flex flex-col flex-1 h-full">
              <TabsList className="grid grid-cols-2 rounded-none h-14 p-0 bg-swiss-black border-b-8 border-swiss-black">
                <TabsTrigger
                  value="connect"
                  className="rounded-none h-full font-black uppercase tracking-widest text-xs data-[state=active]:bg-swiss-white data-[state=active]:text-swiss-black text-swiss-white transition-all"
                >
                  CONNECT_MODE
                </TabsTrigger>
                <TabsTrigger
                  value="view-all"
                  className="rounded-none h-full font-black uppercase tracking-widest text-xs data-[state=active]:bg-swiss-white data-[state=active]:text-swiss-black text-swiss-white transition-all"
                >
                  DATA_GRID
                </TabsTrigger>
              </TabsList>

              <TabsContent value="connect" className="flex-1 m-0 p-8 relative min-h-[450px]">
                <AnimatePresence mode="wait">
                  {showConnectView ? (
                    <motion.div
                      key="connect"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="relative aspect-square w-full bg-swiss-muted/20 border-4 border-swiss-black overflow-hidden"
                    >
                      <Ripple mainCircleSize={10} numCircles={10} className="opacity-40" />
                      <RandomProfileCircles
                        profiles={participantImagesWithIds}
                        OwnProfileImage={session.user?.image || ""}
                        OwnProfileImageSize={100}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="sphere"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="relative aspect-square w-full bg-swiss-black border-4 border-swiss-black overflow-hidden"
                    >
                      <div className="h-full">
                        {(() => {
                          const items = participantImagesWithIds.map(user => ({
                            image: user.image,
                            link: `/u/${user.id}`,
                            title: user.id.toUpperCase(),
                            description: "NODE_ACTIVE",
                          }));
                          return (
                            <div className="h-full relative font-black uppercase tracking-tighter">
                              <InfiniteMenu items={items} />
                              <div className="absolute inset-x-0 bottom-4 text-center pointer-events-none z-10">
                                <p className="px-4 py-1 bg-swiss-red text-swiss-white inline-block text-[10px] animate-pulse">
                                  ACTIVE_STREAMING_UI
                                </p>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="absolute bottom-12 right-12 z-50 flex gap-4">
                  <button onClick={fetchGathering} className="w-14 h-14 bg-swiss-white border-4 border-swiss-black flex items-center justify-center hover:bg-swiss-black hover:text-swiss-white transition-all active:translate-y-1">
                    <RefreshCcw className="h-6 w-6" />
                  </button>
                  <button onClick={() => setShowConnectView(!showConnectView)} className="w-14 h-14 bg-swiss-white border-4 border-swiss-black flex items-center justify-center hover:bg-swiss-black hover:text-swiss-white transition-all active:translate-y-1">
                    <IconArrowsExchange2 className="h-8 w-8" />
                  </button>
                </div>
              </TabsContent>

              <TabsContent value="view-all" className="flex-1 m-0 p-8 h-full min-h-[450px]">
                <div className="flex flex-col h-full gap-6">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 opacity-40" />
                    <Input
                      type="text"
                      placeholder="SCAN_FOR_PEERS..."
                      onChange={(e) => {
                        const filter = e.target.value.toLowerCase();
                        setFilteredParticipants(gathering.participants.filter(user => user.name.toLowerCase().includes(filter)));
                      }}
                      className="h-14 pl-12 bg-swiss-white border-4 border-swiss-black rounded-none font-black uppercase tracking-tight focus:bg-swiss-muted transition-colors outline-none w-full"
                    />
                  </div>

                  <ScrollArea className="flex-1 pr-4 border-4 border-swiss-black p-4 bg-swiss-muted/10">
                    <div className="space-y-3">
                      {filteredParticipants.map((user) => (
                        <div key={user.id} className="group bg-swiss-white border-2 border-swiss-black p-4 flex items-center justify-between hover:bg-swiss-muted transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 relative border-2 border-swiss-black grayscale group-hover:grayscale-0 transition-all">
                              <Avatar className="w-full h-full rounded-none">
                                <AvatarImage src={user.image} className="rounded-none object-cover" />
                                <AvatarFallback className="rounded-none font-black">{user.name[0]}</AvatarFallback>
                              </Avatar>
                            </div>
                            <div>
                              <p className="font-black text-sm uppercase tracking-tight">{user.name}</p>
                              {user._id === gathering.hostId && (
                                <p className="font-bold text-[8px] uppercase tracking-widest text-swiss-red mt-1">PRIMARY_HOST</p>
                              )}
                            </div>
                          </div>

                          {isHost && user._id !== session.user?.id && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleModeration(gathering.blockedUsers?.includes(user._id) ? "unblock" : "block", user._id)}
                                className={cn("p-2 border-2 border-swiss-black transition-colors", gathering.blockedUsers?.includes(user._id) ? "bg-swiss-black text-swiss-white" : "hover:bg-swiss-red hover:text-swiss-white")}
                              >
                                {gathering.blockedUsers?.includes(user._id) ? <UserCheck2Icon className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                              </button>
                              <button
                                onClick={() => handleModeration(gathering.mutedUsers?.includes(user._id) ? "unmute" : "mute", user._id)}
                                className={cn("p-2 border-2 border-swiss-black transition-colors", gathering.mutedUsers?.includes(user._id) ? "bg-swiss-black text-swiss-white" : "hover:bg-swiss-black hover:text-swiss-white")}
                              >
                                {gathering.mutedUsers?.includes(user._id) ? <UserPlus2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Invite Section */}
        <div className="border-8 border-swiss-black bg-swiss-white shadow-[16px_16px_0_0_rgba(0,0,0,1)] p-12 h-fit flex flex-col">
          <div className="mb-12 border-l-8 border-swiss-black pl-8">
            <h2 className="font-black text-4xl uppercase tracking-tighter">INVITE_PEERS</h2>
            <p className="font-bold uppercase tracking-widest text-xs text-swiss-red">EXPAND_LOCAL_NETWORK</p>
          </div>

          <div className="space-y-12">
            <div className="flex justify-center p-8 border-4 border-swiss-black bg-swiss-white relative">
              <QRCodeDisplay slug={gathering.slug} />
              <div className="absolute top-0 right-0 p-2 bg-swiss-black text-swiss-white">
                <Zap className="h-4 w-4 fill-swiss-red text-swiss-red" />
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="font-black text-[10px] uppercase tracking-widest">TRANSMISSION_LINK</label>
                <div className="flex gap-3">
                  <Input
                    readOnly
                    value={`${window.location.origin}/gathering/join/${gathering.slug}`}
                    className="h-14 px-6 bg-swiss-muted border-4 border-swiss-black rounded-none font-black tracking-tight outline-none w-full text-xs"
                  />
                  <button
                    onClick={() => {
                      copyInviteLink();
                      setShowCheckIcon(true);
                      setTimeout(() => setShowCheckIcon(false), 1000);
                    }}
                    className="h-14 w-14 bg-swiss-black text-swiss-white flex items-center justify-center hover:bg-swiss-red transition-all shrink-0 active:translate-y-1"
                  >
                    {showCheckIcon ? <Check className="h-6 w-6" /> : <LinkIcon className="h-6 w-6" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t-4 border-swiss-black">
              <p className="font-bold uppercase tracking-tight text-[10px] opacity-40 text-center">
                SCAN QR CODE OR COPY LINK TO SYNCHRONIZE WITH NEW NODES.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
