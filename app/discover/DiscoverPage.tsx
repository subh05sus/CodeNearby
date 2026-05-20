/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Loader2,
  MapPin,
  X,
  Heart,
  SkipForward,
  Compass,
  Search,
  Github,
  ArrowRight,
  Users,
} from "lucide-react";
import Image from "next/image";
import type { Developer, UserProfile } from "@/types";
import { Session } from "next-auth";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
  PanInfo,
} from "framer-motion";
import { getLocationByIp } from "@/lib/location";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import DeveloperGrid from "@/components/developer-grid";

interface ExtendedDeveloper extends Developer {
  distance?: string;
}

// ── Swipe card ────────────────────────────────────────────────────────────────

function SwipeCard({
  developer,
  onSwipe,
  isTop,
  stackIndex,
}: {
  developer: ExtendedDeveloper;
  onSwipe: (direction: "left" | "right") => void;
  isTop: boolean;
  stackIndex: number;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 0, 220], [-22, 0, 22]);
  const connectOpacity = useTransform(x, [30, 120], [0, 1]);
  const passOpacity = useTransform(x, [-120, -30], [1, 0]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > 100) {
      onSwipe("right");
    } else if (info.offset.x < -100) {
      onSwipe("left");
    }
  };

  // Back-of-stack cards: static, peeking
  if (!isTop) {
    const yOffset = stackIndex * 10;
    const rot = stackIndex % 2 === 0 ? stackIndex * 3 : -(stackIndex * 3);
    const scale = 1 - stackIndex * 0.05;
    return (
      <div
        className="absolute inset-0 rounded-3xl border border-border bg-card overflow-hidden"
        style={{
          transform: `translateY(${yOffset}px) rotate(${rot}deg) scale(${scale})`,
          transformOrigin: "bottom center",
          zIndex: 10 - stackIndex,
          pointerEvents: "none",
        }}
      />
    );
  }

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{ x, rotate, zIndex: 20 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.65}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.93, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
      whileDrag={{ scale: 1.03 }}
    >
      <div
        className="w-full h-full rounded-3xl overflow-hidden relative border border-border/60 shadow-2xl"
        style={{ touchAction: "none" }}
      >
        <Image
          src={developer.avatar_url || "/placeholder.svg"}
          alt={developer.login}
          fill
          className="object-cover"
          priority
          draggable={false}
        />

        {/* Swipe direction overlays */}
        <motion.div
          className="absolute inset-0 rounded-3xl flex items-start justify-end p-6"
          style={{
            opacity: connectOpacity,
            background: "linear-gradient(135deg, transparent, rgba(34,197,94,0.25))",
          }}
        >
          <div
            className="border-4 border-green-400 text-green-300 font-bold text-xl px-4 py-1 rounded-xl"
            style={{ transform: "rotate(-20deg)" }}
          >
            CONNECT
          </div>
        </motion.div>

        <motion.div
          className="absolute inset-0 rounded-3xl flex items-start justify-start p-6"
          style={{
            opacity: passOpacity,
            background: "linear-gradient(225deg, transparent, rgba(239,68,68,0.25))",
          }}
        >
          <div
            className="border-4 border-red-400 text-red-300 font-bold text-xl px-4 py-1 rounded-xl"
            style={{ transform: "rotate(20deg)" }}
          >
            PASS
          </div>
        </motion.div>

        {/* Info gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/85 via-black/40 to-transparent">
          <h3 className="text-white font-heading text-2xl">
            {developer.name || developer.login}
          </h3>
          {developer.name && (
            <p className="text-white/60 text-sm font-mono mt-0.5">
              @{developer.login}
            </p>
          )}
          {developer.location && (
            <p className="text-white/50 text-xs flex items-center gap-1 mt-1.5">
              <MapPin className="h-3 w-3" />
              {developer.location}
            </p>
          )}
          <div className="flex gap-4 mt-2">
            {developer.followers !== undefined && (
              <span className="text-white/50 text-xs font-mono">
                {developer.followers} followers
              </span>
            )}
            {developer.public_repos !== undefined && (
              <span className="text-white/50 text-xs font-mono">
                {developer.public_repos} repos
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Location search bar ───────────────────────────────────────────────────────

function LocationBar({
  location,
  setLocation,
  onSubmit,
  onGPS,
  loading,
}: {
  location: string;
  setLocation: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onGPS: () => void;
  loading: boolean;
}) {
  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <div className="flex-1 flex items-center gap-2.5 bg-card border border-border rounded-2xl px-4 py-2.5 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
        <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <input
          type="text"
          placeholder="Enter city or location..."
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
        />
        {loading && (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground flex-shrink-0" />
        )}
      </div>
      <button
        type="button"
        onClick={onGPS}
        disabled={loading}
        title="Use GPS location"
        className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-2xl border border-border bg-card text-sm font-medium hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-all disabled:opacity-50 flex-shrink-0"
      >
        <Compass className="h-4 w-4" />
        <span className="hidden sm:inline">GPS</span>
      </button>
      <button
        type="submit"
        disabled={loading || !location}
        className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-2xl font-semibold text-sm text-white transition-all hover:opacity-90 active:scale-[0.97] disabled:opacity-50 flex-shrink-0"
        style={{ background: "hsl(24 95% 53%)" }}
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search</span>
      </button>
    </form>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function DiscoverPage() {
  const { data: session } = useSession() as { data: Session | null };
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [connectDevelopers, setConnectDevelopers] = useState<ExtendedDeveloper[]>([]);
  const [exploreDevelopers, setExploreDevelopers] = useState<Developer[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<"connect" | "explore">("connect");

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const data = await getLocationByIp();
        setLocation(data.city);
        initialLocationSubmit(data.city);
      } catch {
        toast.error("Failed to get your location automatically.");
      }
    };
    if (!location) fetchLocation();
  }, []);

  useEffect(() => {
    if (session) fetchUserProfile();
  }, [session]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      const data = await response.json();
      setUserProfile(data);
    } catch {
      toast.error("Failed to fetch user profile.");
    }
  };

  const handleLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) return;
    setLoading(true);
    try {
      const response = await fetch(
        `/api/developers?location=${encodeURIComponent(location)}`
      );
      const data = await response.json();

      const declinedResponse = await fetch("/api/declined-profiles");
      const declinedData = await declinedResponse.json();
      const declinedIds = new Set(declinedData.map((p: any) => p.githubId));

      const filtered = data
        .filter(
          (dev: Developer) =>
            dev.id !== session?.user?.id &&
            dev.id !== session?.user?.githubId &&
            dev.login !== session?.user?.githubUsername &&
            !userProfile?.friends.some(
              (f) => f.githubId.toString() === dev.id
            ) &&
            !userProfile?.sentRequests.includes(dev.id) &&
            !declinedIds.has(dev.id)
        )
        .sort(() => Math.random() - 0.5);

      setConnectDevelopers(filtered);
      setExploreDevelopers(data);
    } catch {
      toast.error("Failed to fetch developers.");
    } finally {
      setLoading(false);
    }
  };

  const initialLocationSubmit = async (loc: string) => {
    if (!loc) return;
    setLoading(true);
    try {
      const response = await fetch(
        `/api/developers?location=${encodeURIComponent(loc)}`
      );
      const data = await response.json();

      const declinedResponse = await fetch("/api/declined-profiles");
      const declinedData = await declinedResponse.json();
      const declinedIds = new Set(declinedData.map((p: any) => p.githubId));

      const filtered = data
        .filter(
          (dev: Developer) =>
            dev.id !== session?.user?.id &&
            !userProfile?.friends.some(
              (f) => f.githubId.toString() === dev.id
            ) &&
            !userProfile?.sentRequests.includes(dev.id) &&
            !declinedIds.has(dev.id)
        )
        .reverse();

      setConnectDevelopers(filtered);
      setExploreDevelopers(data);
    } catch {
      toast.error("Failed to fetch developers.");
    } finally {
      setLoading(false);
    }
  };

  const handleGeolocation = () => {
    if (!("geolocation" in navigator)) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const data = await response.json();
        const locationName =
          data.address.city ||
          data.address.town ||
          data.address.village ||
          data.address.county;
        setLocation(locationName);
        initialLocationSubmit(locationName);
      } catch {
        toast.error("Failed to get your location.");
        setLoading(false);
      }
    });
  };

  const handleSwipe = async (direction: "left" | "right", developer: ExtendedDeveloper) => {
    if (!session) return;

    if (direction === "right") {
      try {
        await fetch("/api/friends/request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(developer),
        });
        toast.success("Connection request sent!");
      } catch {
        toast.error("Failed to send request.");
      }
    } else {
      try {
        await fetch("/api/declined-profiles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ githubId: developer.id }),
        });
      } catch (err) {
        console.error("Error storing declined profile:", err);
      }
    }

    setConnectDevelopers((prev) =>
      prev.filter((dev) => dev.id !== developer.id)
    );
  };

  const handleSkip = () => {
    setConnectDevelopers((prev) => {
      if (prev.length === 0) return prev;
      // move top card to bottom
      const [top, ...rest] = prev;
      return [...rest, top];
    });
  };

  const handleAddFriend = async (developer: any) => {
    try {
      const response = await fetch("/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(developer),
      });
      if (!response.ok) throw new Error();
      toast.success("Friend request sent!");
    } catch {
      toast.error("Failed to send request.");
    }
  };

  // Sign-in wall
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{
            background: "hsl(24 95% 53% / 0.10)",
            border: "1px solid hsl(24 95% 53% / 0.25)",
          }}
        >
          <Compass className="w-8 h-8 text-primary" />
        </div>
        <div className="text-center max-w-sm">
          <h2 className="font-heading text-2xl mb-2">Discover Developers</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Find GitHub developers near you. Swipe right to connect, left to
            pass — like Tinder but for code.
          </p>
        </div>
        <button
          onClick={() => signIn("github")}
          className="flex items-center gap-2.5 px-6 py-3 rounded-full font-semibold text-white transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
          style={{ background: "hsl(24 95% 53%)" }}
        >
          <Github className="w-4 h-4" />
          Sign in with GitHub
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Top card is index 0; we display up to 3 cards stacked
  const currentDev = connectDevelopers[0];
  const stackedCards = connectDevelopers.slice(0, 3);

  return (
    <div className="container mx-auto px-4 py-4 max-w-7xl">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "hsl(24 95% 53% / 0.12)" }}
        >
          <Compass className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h1 className="font-heading text-lg leading-tight">
            Discover Developers
          </h1>
          <p className="text-[11px] text-muted-foreground leading-tight">
            Find devs near you · swipe to connect
          </p>
        </div>
      </div>

      {/* Location bar */}
      <div className="mb-5">
        <LocationBar
          location={location}
          setLocation={setLocation}
          onSubmit={handleLocationSubmit}
          onGPS={handleGeolocation}
          loading={loading}
        />
      </div>

      {/* Mobile tabs */}
      <div className="flex md:hidden gap-1 mb-5 p-1 rounded-2xl bg-muted/60">
        {(["connect", "explore"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-2 text-sm font-semibold rounded-xl capitalize transition-all"
            style={
              activeTab === tab
                ? { background: "hsl(24 95% 53%)", color: "white" }
                : { color: "hsl(var(--muted-foreground))" }
            }
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
        {/* ── Connect panel ── */}
        <div className={activeTab !== "connect" ? "hidden md:block" : "block"}>
          {/* Section header */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
              <Heart className="w-3.5 h-3.5 text-primary" />
            </div>
            <h2 className="font-heading text-base">Connect</h2>
            {connectDevelopers.length > 0 && !loading && (
              <span className="ml-auto text-[11px] font-mono font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {connectDevelopers.length} left
              </span>
            )}
          </div>

          {loading ? (
            <div className="h-[460px] rounded-3xl bg-muted/60 animate-pulse border border-border" />
          ) : connectDevelopers.length > 0 ? (
            <>
              {/* Card stack */}
              <div className="relative h-[460px] select-none touch-none">
                <AnimatePresence>
                  {stackedCards
                    .slice()
                    .reverse()
                    .map((dev, revIdx) => {
                      const stackIndex = stackedCards.length - 1 - revIdx;
                      const isTop = stackIndex === 0;
                      return (
                        <SwipeCard
                          key={dev.id}
                          developer={dev}
                          isTop={isTop}
                          stackIndex={stackIndex}
                          onSwipe={(dir) => handleSwipe(dir, currentDev)}
                        />
                      );
                    })}
                </AnimatePresence>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-center gap-5 mt-6">
                <button
                  onClick={() => handleSwipe("left", currentDev)}
                  title="Pass"
                  className="w-14 h-14 rounded-full border-2 border-red-200 dark:border-red-900/60 bg-card flex items-center justify-center hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all hover:scale-110 active:scale-95 shadow-sm"
                >
                  <X className="h-6 w-6 text-red-500" />
                </button>
                <button
                  onClick={handleSkip}
                  title="Skip"
                  className="w-11 h-11 rounded-full border border-border bg-card flex items-center justify-center hover:bg-muted transition-all hover:scale-105 active:scale-95 shadow-sm"
                >
                  <SkipForward className="h-4.5 w-4.5 text-muted-foreground" />
                </button>
                <button
                  onClick={() => handleSwipe("right", currentDev)}
                  title="Connect"
                  className="w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm"
                  style={{
                    borderColor: "hsl(24 95% 53% / 0.4)",
                    background: "hsl(24 95% 53% / 0.10)",
                  }}
                >
                  <Heart className="h-6 w-6 text-primary" />
                </button>
              </div>

              <p className="text-center text-[11px] text-muted-foreground/40 mt-3 font-mono">
                drag right to connect · drag left to pass
              </p>
            </>
          ) : (
            <div className="h-[460px] rounded-3xl border border-dashed border-border/60 flex flex-col items-center justify-center gap-3">
              <Users className="w-10 h-10 text-muted-foreground/20" />
              <p className="text-sm font-medium text-muted-foreground">
                No more developers here
              </p>
              <p className="text-xs text-muted-foreground/60">
                Try a different city or location
              </p>
            </div>
          )}
        </div>

        {/* ── Explore panel ── */}
        <div className={activeTab !== "explore" ? "hidden md:block" : "block"}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
              <Search className="w-3.5 h-3.5 text-primary" />
            </div>
            <h2 className="font-heading text-base">Explore</h2>
            {exploreDevelopers.length > 0 && !loading && (
              <span className="ml-auto text-[11px] font-mono font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {exploreDevelopers.length} devs
              </span>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-[72px] rounded-2xl bg-muted/60 animate-pulse border border-border"
                />
              ))}
            </div>
          ) : exploreDevelopers.length > 0 ? (
            <div className="relative">
              <DeveloperGrid
                session={session}
                handleAddFriend={handleAddFriend}
                developers={exploreDevelopers}
              />
              <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-background to-transparent pointer-events-none" />
            </div>
          ) : (
            <div className="h-64 rounded-3xl border border-dashed border-border/60 flex flex-col items-center justify-center gap-2">
              <Search className="w-8 h-8 text-muted-foreground/20" />
              <p className="text-sm text-muted-foreground">
                Search a location to explore developers
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
