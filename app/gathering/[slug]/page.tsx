/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
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
  Edit3,
  X,
} from "lucide-react";
import { toast } from "sonner";

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
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 bg-white dark:bg-black transition-colors duration-300">
        <div className="border-8 border-black dark:border-white p-12 bg-white dark:bg-black text-center shadow-[12px_12px_0_0_rgba(0,0,0,1)] dark:shadow-[12px_12px_0_0_rgba(255,255,255,1)]">
          <h1 className="font-black text-6xl uppercase tracking-tighter mb-6 leading-none text-black dark:text-white">
            ACCESS<br />RESTRICTED
          </h1>
          <p className="font-bold uppercase tracking-tight text-xl mb-8 opacity-60 text-black dark:text-white">
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
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-white dark:bg-black transition-colors duration-300">
        <div className="w-32 h-32 bg-black dark:bg-white animate-pulse border-8 border-gray-100 dark:border-gray-900" />
        <p className="font-black mt-6 uppercase  text-xs text-black dark:text-white">JOINING_SESSION...</p>
      </div>
    );
  }

  if (!gathering) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 bg-white dark:bg-black transition-colors duration-300">
        <div className="border-8 border-black dark:border-white p-12 bg-white dark:bg-black text-center shadow-[12px_12px_0_0_rgba(0,0,0,1)] dark:shadow-[12px_12px_0_0_rgba(255,255,255,1)]">
          <h1 className="font-black text-6xl uppercase tracking-tighter mb-6 text-black dark:text-white">404_NOT_FOUND</h1>
          <p className="font-bold uppercase tracking-tight text-xl mb-8 opacity-60 text-black dark:text-white">ROOM_SIGNAL_NOT_DETECTED</p>
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
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 bg-white dark:bg-black transition-colors duration-300">
        <div className="border-8 border-black dark:border-white p-12 bg-white dark:bg-black text-center shadow-[12px_12px_0_0_rgba(0,0,0,1)] dark:shadow-[12px_12px_0_0_rgba(255,255,255,1)]">
          <h1 className="font-black text-6xl uppercase tracking-tighter mb-6 text-black dark:text-white">UNAUTHORIZED</h1>
          <p className="font-bold uppercase tracking-tight text-xl mb-8 opacity-60 text-black dark:text-white">NOT_A_PARTICIPANT_OF_THIS_NODE</p>
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
    <div className="bg-white dark:bg-black min-h-screen pb-24 transition-colors duration-300">
      {/* Swiss Header */}
      <div className="border-b-8 border-black dark:border-white bg-white dark:bg-black sticky top-0 z-20 transition-colors">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              {isEditing ? (
                <div className="flex flex-1 gap-4 items-center">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="font-black text-7xl uppercase tracking-tighter bg-gray-100 dark:bg-gray-900 text-black dark:text-white border-b-8 border-black dark:border-white outline-none w-full transition-colors"
                  />
                  <div className="flex gap-2">
                    <button onClick={handleSaveName} className="p-4 bg-black dark:bg-white text-white dark:text-black hover:bg-swiss-red dark:hover:bg-swiss-red hover:text-white transition-colors">
                      <Check className="h-8 w-8" />
                    </button>
                    <button onClick={() => { setIsEditing(false); setEditedName(gathering.name); }} className="p-4 border-4 border-black dark:border-white text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
                      <X className="h-8 w-8" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="font-black text-8xl uppercase tracking-tighter leading-[0.8] text-black dark:text-white">
                    {gathering.name}
                  </h1>
                  {isHost && (
                    <button onClick={() => setIsEditing(true)} className="p-2 border-4 border-black dark:border-white text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
                      <Edit3 className="h-6 w-6 stroke-[3]" />
                    </button>
                  )}
                </>
              )}
            </div>

            <div className="flex flex-wrap gap-4 font-black text-[10px] uppercase  mt-6">
              <div className="px-3 py-1 bg-black dark:bg-white text-white dark:text-black flex items-center gap-2 transition-colors">
                <Clock className="w-4 h-4 text-swiss-red" />
                {hoursLeft}H {minutesLeft}M REMAINING
              </div>
              <div className="px-3 py-1 border-2 border-black dark:border-white text-black dark:text-white flex items-center gap-2 transition-colors">
                <Users className="w-4 h-4 text-swiss-red" />
                {gathering.participants.length} NODES_SYNCED
              </div>
              {isHost && (
                <div className="px-3 py-1 bg-swiss-red text-white flex items-center gap-2">
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
        <div className="border-8 border-black dark:border-white bg-white dark:bg-black shadow-[16px_16px_0_0_rgba(0,0,0,1)] dark:shadow-[16px_16px_0_0_rgba(255,255,255,1)] flex flex-col min-h-[600px] transition-colors">
          <div className="p-6 border-b-8 border-black dark:border-white flex justify-between items-center bg-gray-50/10 dark:bg-gray-950/10 transition-colors">
            <h2 className="font-black text-3xl uppercase tracking-tighter text-black dark:text-white">PARTICIPANTS</h2>
            {isHost && (
              <div className="flex items-center gap-4 bg-white dark:bg-black border-4 border-black dark:border-white px-4 py-2 transition-colors">
                <span className="font-black text-[10px] uppercase  text-black dark:text-white">HOST_ONLY</span>
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
              <TabsList className="grid grid-cols-2 rounded-none h-14 p-0 bg-black dark:bg-white border-b-8 border-black dark:border-white transition-colors">
                <TabsTrigger
                  value="connect"
                  className="rounded-none h-full font-black uppercase  text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-black data-[state=active]:text-black dark:data-[state=active]:text-white text-white dark:text-black transition-all"
                >
                  CONNECT_MODE
                </TabsTrigger>
                <TabsTrigger
                  value="view-all"
                  className="rounded-none h-full font-black uppercase  text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-black data-[state=active]:text-black dark:data-[state=active]:text-white text-white dark:text-black transition-all"
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
                      className="relative aspect-square w-full bg-gray-50/20 dark:bg-gray-950/20 border-4 border-black dark:border-white overflow-hidden transition-colors"
                    >
                      <Ripple mainCircleSize={10} numCircles={10} className="opacity-40 dark:opacity-20" />
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
                      className="relative aspect-square w-full bg-black dark:bg-white border-4 border-black dark:border-white overflow-hidden transition-colors"
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
                  <button onClick={fetchGathering} className="w-14 h-14 bg-white dark:bg-black text-black dark:text-white border-4 border-black dark:border-white flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all active:translate-y-1">
                    <RefreshCcw className="h-6 w-6" />
                  </button>
                  <button onClick={() => setShowConnectView(!showConnectView)} className="w-14 h-14 bg-white dark:bg-black text-black dark:text-white border-4 border-black dark:border-white flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all active:translate-y-1">
                    <IconArrowsExchange2 className="h-8 w-8" />
                  </button>
                </div>
              </TabsContent>

              <TabsContent value="view-all" className="flex-1 m-0 p-8 h-full min-h-[450px]">
                <div className="flex flex-col h-full gap-6">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 opacity-40 text-black dark:text-white" />
                    <Input
                      type="text"
                      placeholder="SCAN_FOR_PEERS..."
                      onChange={(e) => {
                        const filter = e.target.value.toLowerCase();
                        setFilteredParticipants(gathering.participants.filter(user => user.name.toLowerCase().includes(filter)));
                      }}
                      className="h-14 pl-12 bg-white dark:bg-black border-4 border-black dark:border-white rounded-none font-black uppercase tracking-tight focus:bg-gray-100 dark:focus:bg-gray-900 text-black dark:text-white transition-colors outline-none w-full"
                    />
                  </div>

                  <ScrollArea className="flex-1 pr-4 border-4 border-black dark:border-white p-4 bg-gray-50/10 dark:bg-gray-950/10 transition-colors">
                    <div className="space-y-3">
                      {filteredParticipants.map((user) => (
                        <div key={user.id} className="group bg-white dark:bg-black border-2 border-black dark:border-white p-4 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 relative border-2 border-black dark:border-white grayscale group-hover:grayscale-0 transition-all">
                              <Avatar className="w-full h-full rounded-none">
                                <AvatarImage src={user.image} className="rounded-none object-cover" />
                                <AvatarFallback className="rounded-none font-black text-black dark:text-white">{user.name[0]}</AvatarFallback>
                              </Avatar>
                            </div>
                            <div>
                              <p className="font-black text-sm uppercase tracking-tight text-black dark:text-white">{user.name}</p>
                              {user._id === gathering.hostId && (
                                <p className="font-bold text-[8px] uppercase  text-swiss-red mt-1">PRIMARY_HOST</p>
                              )}
                            </div>
                          </div>

                          {isHost && user._id !== session.user?.id && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleModeration(gathering.blockedUsers?.includes(user._id) ? "unblock" : "block", user._id)}
                                className={cn("p-2 border-2 border-black dark:border-white transition-colors", gathering.blockedUsers?.includes(user._id) ? "bg-black dark:bg-white text-white dark:text-black" : "text-black dark:text-white hover:bg-swiss-red hover:text-white")}
                              >
                                {gathering.blockedUsers?.includes(user._id) ? <UserCheck2Icon className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                              </button>
                              <button
                                onClick={() => handleModeration(gathering.mutedUsers?.includes(user._id) ? "unmute" : "mute", user._id)}
                                className={cn("p-2 border-2 border-black dark:border-white transition-colors", gathering.mutedUsers?.includes(user._id) ? "bg-black dark:bg-white text-white dark:text-black" : "text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black")}
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
        <div className="border-8 border-black dark:border-white bg-white dark:bg-black shadow-[16px_16px_0_0_rgba(0,0,0,1)] dark:shadow-[16px_16px_0_0_rgba(255,255,255,1)] p-12 h-fit flex flex-col transition-colors">
          <div className="mb-12 border-l-8 border-black dark:border-white pl-8 transition-colors">
            <h2 className="font-black text-4xl uppercase tracking-tighter text-black dark:text-white">INVITE_PEERS</h2>
            <p className="font-bold uppercase  text-xs text-swiss-red">EXPAND_LOCAL_NETWORK</p>
          </div>

          <div className="space-y-12">
            <div className="flex justify-center p-8 border-4 border-black dark:border-white bg-white dark:bg-black relative transition-colors">
              <QRCodeDisplay slug={gathering.slug} />
              <div className="absolute top-0 right-0 p-2 bg-black dark:bg-white text-white dark:text-black transition-colors">
                <Zap className="h-4 w-4 fill-swiss-red text-swiss-red" />
              </div>
            </div>

            <div className="space-y-6 text-black dark:text-white">
              <div className="space-y-3">
                <label className="font-black text-[10px] uppercase ">TRANSMISSION_LINK</label>
                <div className="flex gap-3">
                  <Input
                    readOnly
                    value={`${window.location.origin}/gathering/join/${gathering.slug}`}
                    className="h-14 px-6 bg-gray-100 dark:bg-gray-900 text-black dark:text-white border-4 border-black dark:border-white rounded-none font-black tracking-tight outline-none w-full text-xs transition-colors"
                  />
                  <button
                    onClick={() => {
                      copyInviteLink();
                      setShowCheckIcon(true);
                      setTimeout(() => setShowCheckIcon(false), 1000);
                    }}
                    className="h-14 w-14 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center hover:bg-swiss-red dark:hover:bg-swiss-red hover:text-white transition-all shrink-0 active:translate-y-1"
                  >
                    {showCheckIcon ? <Check className="h-6 w-6" /> : <LinkIcon className="h-6 w-6" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t-4 border-black dark:border-white transition-colors">
              <p className="font-bold uppercase tracking-tight text-[10px] opacity-40 text-center text-black dark:text-white transition-colors">
                SCAN QR CODE OR COPY LINK TO SYNCHRONIZE WITH NEW NODES.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
