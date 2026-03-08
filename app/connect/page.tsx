/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import TinderCard from "react-tinder-card";
import {
  Loader2,
  X,
  Heart,
  MapPin,
  GitBranch,
  Users,
  SkipForward,
  Zap,
} from "lucide-react";
import type { Developer, UserProfile } from "@/types";
import type { Session } from "next-auth";
import { fetchGitHubData } from "@/lib/github";
import LoginButton from "@/components/login-button";
import { toast } from "sonner";
import SwissSection from "@/components/swiss/SwissSection";
import SwissCard from "@/components/swiss/SwissCard";
import SwissButton from "@/components/swiss/SwissButton";

interface ExtendedDeveloper extends Developer {
  distance?: string;
  details?: any;
}

export default function ConnectPage() {
  const { data: session } = useSession() as { data: Session | null };
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [developers, setDevelopers] = useState<ExtendedDeveloper[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [fetchedProfiles, setFetchedProfiles] = useState(0);
  const topCardRef = useRef<any>(null);

  useEffect(() => {
    if (session) {
      fetchUserProfile();
    }
  }, [session]);

  useEffect(() => {
    const fetchTopDeveloperDetails = async () => {
      if (developers.length > 0 && !developers[developers.length - 1].details) {
        const topDev = developers[developers.length - 1];
        try {
          const details = await fetchGitHubData(topDev.login);
          setDevelopers((prevDevs) =>
            prevDevs.map((dev, index) =>
              index === prevDevs.length - 1 ? { ...dev, details } : dev
            )
          );
        } catch (error) {
          console.error("Failed to fetch developer details:", error);
        }
      }
    };

    fetchTopDeveloperDetails();
  }, [developers]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      const data = await response.json();
      setUserProfile(data);
    } catch {
      toast.error("Failed to fetch user profile.");
    }
  };

  const calculateDistance = async (devLocation: string) => {
    if (!location || !devLocation) return null;

    try {
      const locResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          location
        )}`
      );
      const locData = await locResponse.json();
      if (!locData[0]) return null;

      const devResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          devLocation
        )}`
      );
      const devData = await devResponse.json();
      if (!devData[0]) return null;

      const R = 6371;
      const lat1 = Number.parseFloat(locData[0].lat);
      const lon1 = Number.parseFloat(locData[0].lon);
      const lat2 = Number.parseFloat(devData[0].lat);
      const lon2 = Number.parseFloat(devData[0].lon);

      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;

      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      return `${Math.round(distance)} KM_OFFSET`;
    } catch (error) {
      console.error("Error calculating distance:", error);
      return null;
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
      const declinedIds = new Set(
        declinedData.map((profile: any) => profile.githubId)
      );

      const filteredDevelopers = await Promise.all(
        data
          .filter(
            (dev: Developer) =>
              dev.id !== session?.user?.id &&
              !userProfile?.friends.some(
                (friend) => friend.githubId.toString() === dev.id
              ) &&
              !userProfile?.sentRequests.includes(dev.id) &&
              !declinedIds.has(dev.id)
          )
          .map(async (dev: Developer) => {
            const distance = dev.location
              ? await calculateDistance(dev.location)
              : null;
            return { ...dev, distance };
          })
      );

      setDevelopers(filteredDevelopers.reverse());
      setFetchedProfiles(filteredDevelopers.length);
    } catch {
      toast.error("Failed to fetch developers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGeolocation = () => {
    if ("geolocation" in navigator) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
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
            handleLocationSubmit({
              preventDefault: () => { },
            } as React.FormEvent);
          } catch {
            toast.error(
              "Failed to get your location. Please enter it manually."
            );
            setLoading(false);
          }
        },
        () => {
          toast.error("Failed to get your location. Please enter it manually.");
          setLoading(false);
        }
      );
    }
  };

  const onSwipe = async (direction: string, developer: Developer) => {
    if (!session) return;

    if (direction === "right") {
      try {
        const response = await fetch("/api/friends/request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(developer),
        });

        if (!response.ok) throw new Error("Failed to send friend request");

        toast.success("Friend request sent!");
      } catch {
        toast.error("Failed to send friend request.");
      }
    } else if (direction === "left") {
      try {
        await fetch("/api/declined-profiles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ githubId: developer.id }),
        });
      } catch (error) {
        console.error("Error storing declined profile:", error);
      }
    }

    setDevelopers((prev) => prev.filter((dev) => dev.id !== developer.id));
  };

  const handleChangeLocation = () => {
    setFetchedProfiles(0);
    setDevelopers([]);
  };

  if (!session) {
    return (
      <SwissSection variant="white" className="py-24">
        <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto text-center">
          <div className="mb-12 p-8 border-8 border-swiss-black bg-swiss-red shadow-[16px_16px_0_0_rgba(0,0,0,1)]">
            <h1 className="text-6xl font-black uppercase tracking-tighter italic text-swiss-white leading-none mb-4">
              RESTRICTED_ACCESS
            </h1>
            <p className="text-xl font-black uppercase tracking-widest text-swiss-black">
              AUTHENTICATION_REQUIRED_FOR_NODE_CONNECT
            </p>
          </div>
          <LoginButton />
        </div>
      </SwissSection>
    );
  }

  if (fetchedProfiles === 0) {
    return (
      <SwissSection variant="white" className="py-24">
        <div className="flex flex-col items-start max-w-2xl mx-auto">
          <div className="mb-16">
            <h1 className="text-7xl font-black uppercase tracking-tighter italic leading-none border-b-8 border-swiss-black pb-4 mb-4">
              NODE_SCANNER
            </h1>
            <p className="text-sm font-bold uppercase tracking-widest opacity-40">
              LOCATE_DEVELOPERS_IN_YOUR_PROXIMITY
            </p>
          </div>

          <SwissCard className="p-10 w-full border-8 border-swiss-black shadow-[16px_16px_0_0_rgba(0,0,0,1)]">
            <form onSubmit={handleLocationSubmit} className="space-y-10">
              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest opacity-60">LOCATION_VECTOR_INPUT</label>
                <input
                  type="text"
                  placeholder="ENTER_CITY_OR_COORD"
                  className="w-full h-16 bg-swiss-muted/10 border-4 border-swiss-black px-6 text-xl font-black uppercase tracking-tighter italic placeholder:opacity-10 focus:outline-none focus:bg-swiss-white transition-all"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <SwissButton
                  type="submit"
                  className="h-16 flex-1 text-lg border-4 shadow-[4px_4px_0_0_rgba(255,0,0,1)]"
                  disabled={loading}
                  variant="primary"
                >
                  {loading ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : <Zap className="mr-3 h-6 w-6" />}
                  INIT_SCAN
                </SwissButton>
                <SwissButton
                  type="button"
                  onClick={handleGeolocation}
                  variant="secondary"
                  className="h-16 flex-1 text-lg border-4"
                  disabled={loading}
                >
                  <MapPin className="h-6 w-6 mr-3 text-swiss-red" />
                  AUTO_DETECT
                </SwissButton>
              </div>
            </form>
          </SwissCard>
        </div>
      </SwissSection>
    );
  }

  return (
    <SwissSection variant="white" className="py-12">
      <div className="flex flex-col items-center max-w-2xl mx-auto">
        <div className="w-full flex items-center justify-between mb-12 border-b-8 border-swiss-black pb-6">
          <div className="flex items-center gap-4">
            <div className="bg-swiss-red p-2 border-4 border-swiss-black">
              <MapPin className="h-6 w-6 text-swiss-white" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest opacity-40">ACTIVE_GRID_SECTOR</p>
              <h2 className="text-2xl font-black uppercase tracking-tighter italic">{location || "UNKNOWN_SECTOR"}</h2>
            </div>
          </div>
          <SwissButton variant="secondary" size="sm" className="h-12 px-6 border-4" onClick={handleChangeLocation}>
            RECALIBRATE
          </SwissButton>
        </div>

        <div className="relative w-full aspect-[4/5] md:aspect-[3/4] mb-20">
          {developers.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center border-8 border-dashed border-swiss-black opacity-20">
              <Users className="h-20 w-20 mb-4" />
              <p className="text-2xl font-black uppercase tracking-tighter italic">SECTOR_EMPTY</p>
            </div>
          )}

          {developers.map((developer, index) => {
            const isTopCard = index === developers.length - 1;
            return (
              <TinderCard
                key={developer.id}
                ref={isTopCard ? topCardRef : null}
                onSwipe={(dir) => onSwipe(dir, developer)}
                preventSwipe={["up", "down"]}
                className="absolute w-full h-full select-none"
              >
                <SwissCard className="relative w-full h-full p-0 overflow-hidden border-8 border-swiss-black shadow-[16px_16px_0_0_rgba(0,0,0,1)] bg-swiss-white flex flex-col">
                  <div className="relative w-full flex-1 grayscale group-hover:grayscale-0 transition-all overflow-hidden border-b-8 border-swiss-black">
                    <Image
                      src={developer.avatar_url || "/placeholder.svg"}
                      alt={developer.login}
                      layout="fill"
                      objectFit="cover"
                      className="grayscale contrast-125"
                      priority={index >= developers.length - 2}
                    />
                    <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                      <div className="bg-swiss-black text-swiss-white p-4 border-4 border-swiss-white shadow-[8px_8px_0_0_rgba(255,0,0,1)]">
                        <h3 className="text-3xl font-black uppercase tracking-tighter italic leading-none">{developer.login}</h3>
                        {developer.name && (
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] mt-2 opacity-60">
                            {developer.name}
                          </p>
                        )}
                      </div>
                      {developer.distance && (
                        <div className="bg-swiss-white text-swiss-black px-4 py-2 border-4 border-swiss-black font-black text-xs tracking-widest uppercase">
                          {developer.distance}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-8 space-y-4 bg-[url('/grid.svg')] bg-repeat">
                    <div className="grid grid-cols-2 gap-4">
                      {developer.details?.public_repos !== undefined && (
                        <div className="border-4 border-swiss-black p-4 bg-swiss-white">
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">REPOS</p>
                          <div className="flex items-center gap-2">
                            <GitBranch className="h-4 w-4 text-swiss-red" />
                            <span className="text-xl font-black italic">{developer.details.public_repos}</span>
                          </div>
                        </div>
                      )}
                      {developer.details?.followers !== undefined && (
                        <div className="border-4 border-swiss-black p-4 bg-swiss-white">
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">FOLLOWERS</p>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-swiss-red" />
                            <span className="text-xl font-black italic">{developer.details.followers}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    {developer.details?.bio && (
                      <div className="p-4 border-4 border-swiss-black bg-swiss-black text-swiss-white italic text-sm font-bold uppercase leading-tight line-clamp-2">
                        {developer.details.bio}
                      </div>
                    )}
                  </div>
                </SwissCard>
              </TinderCard>
            );
          })}
        </div>

        <div className="flex justify-center items-center gap-8 mb-12">
          <SwissButton
            variant="secondary"
            className="h-20 w-20 rounded-none border-8 border-swiss-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:bg-swiss-black hover:text-swiss-red transition-all p-0 flex items-center justify-center"
            onClick={() =>
              developers.length > 0 &&
              onSwipe("left", developers[developers.length - 1])
            }
          >
            <X className="h-10 w-10" />
          </SwissButton>

          <SwissButton
            variant="secondary"
            className="h-16 w-16 rounded-none border-4 border-swiss-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:bg-swiss-red hover:text-swiss-white transition-all p-0 flex items-center justify-center"
            onClick={() =>
              developers.length > 0 && setDevelopers((prev) => prev.slice(0, -1))
            }
          >
            <SkipForward className="h-6 w-6" />
          </SwissButton>

          <SwissButton
            variant="primary"
            className="h-24 w-24 rounded-none border-8 border-swiss-black bg-swiss-red text-swiss-white shadow-[12px_12px_0_0_rgba(0,0,0,1)] hover:bg-swiss-black transition-all p-0 flex items-center justify-center"
            onClick={() =>
              developers.length > 0 &&
              onSwipe("right", developers[developers.length - 1])
            }
          >
            <Heart className="h-12 w-12" />
          </SwissButton>
        </div>
      </div>
    </SwissSection>
  );
}
