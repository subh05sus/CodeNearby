/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, MapPin, X, Heart, SkipForward } from "lucide-react";
import Image from "next/image";
import type { Developer, UserProfile } from "@/types";
import { Session } from "next-auth";
import { AnimatePresence, motion } from "framer-motion";
import { getLocationByIp } from "@/lib/location";
import LoginButton from "@/components/login-button";
import { toast } from "sonner";
import DeveloperGrid from "@/components/developer-grid";

interface ExtendedDeveloper extends Developer {
  distance?: string;
}

export default function DiscoverPage() {
  const { data: session } = useSession() as { data: Session | null };
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [connectDevelopers, setConnectDevelopers] = useState<
    ExtendedDeveloper[]
  >([]);
  const [exploreDevelopers, setExploreDevelopers] = useState<Developer[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const data = await getLocationByIp();
        setLocation(data.city);
        // load the developers based on the location initally
        initialLocationSubmit(data.city);
      } catch {
        toast.error("Failed to get your location automatically.");
      }
    };

    if (!location) {
      fetchLocation();
    }
  }, []);

  useEffect(() => {
    if (session) {
      fetchUserProfile();
    }
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
      const declinedIds = new Set(
        declinedData.map((profile: any) => profile.githubId)
      );
      const filteredDevelopers = data
        .filter(
          (dev: Developer) =>
            dev.id !== session?.user?.id &&
            dev.id !== session?.user?.githubId &&
            dev.login !== session?.user?.githubUsername &&
            !userProfile?.friends.some(
              (friend) => friend.githubId.toString() === dev.id
            ) &&
            !userProfile?.sentRequests.includes(dev.id) &&
            !declinedIds.has(dev.id)
        )
        .map((dev: Developer) => ({ ...dev }));

      const shuffledDevelopers = [...filteredDevelopers].sort(
        () => Math.random() - 0.5
      );
      setConnectDevelopers(shuffledDevelopers);

      setExploreDevelopers(data);
    } catch {
      toast.error("Failed to fetch developers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const initialLocationSubmit = async (location: string) => {
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

      const filteredDevelopers = data
        .filter(
          (dev: Developer) =>
            dev.id !== session?.user?.id &&
            !userProfile?.friends.some(
              (friend) => friend.githubId.toString() === dev.id
            ) &&
            !userProfile?.sentRequests.includes(dev.id) &&
            !declinedIds.has(dev.id)
        )
        .map((dev: Developer) => ({ ...dev }));

      setConnectDevelopers(filteredDevelopers.reverse());
      setExploreDevelopers(data);
    } catch {
      toast.error("Failed to fetch developers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGeolocation = () => {
    if ("geolocation" in navigator) {
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
          initialLocationSubmit(
            location
              ? locationName
              : data.address.city ||
                  data.address.town ||
                  data.address.village ||
                  data.address.county
          );
        } catch {
          toast.error("Failed to get your location.");
          setLoading(false);
        }
      });
    }
  };

  const handleSwipe = async (direction: string, developer: Developer) => {
    if (!session) return;

    if (direction === "right") {
      try {
        await fetch("/api/friends/request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(developer),
        });
        toast.success("Friend request sent!");
      } catch {
        toast.error("Failed to send request.");
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

    setConnectDevelopers((prev) =>
      prev.filter((dev) => dev.id !== developer.id)
    );
  };

  const handleAddFriend = async (developer: any) => {
    try {
      const response = await fetch("/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(developer),
      });

      if (!response.ok) throw new Error("Failed to send friend request");

      toast.success("Friend request sent!");
    } catch {
      toast.error("Failed to send request.");
    }
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
        <p>You need to be signed in to discover developers.</p>
        <LoginButton />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6">Discover Developers</h1>
      <form
        onSubmit={handleLocationSubmit}
        className="md:flex grid grid-cols-2 gap-2 mb-6"
      >
        <Input
          type="text"
          placeholder="Enter location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="flex-grow portrait:col-span-2"
        />
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Search
        </Button>
        <Button
          type="button"
          onClick={handleGeolocation}
          variant="outline"
          disabled={loading}
        >
          <MapPin className="h-4 w-4 mr-2" />
          Use My Location
        </Button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Connect</h2>
          {connectDevelopers.length > 0 ? (
            <div className="relative h-[60vh]">
              <AnimatePresence>
                {connectDevelopers.length > 0 && (
                  <motion.div
                    key={connectDevelopers[0].id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    transition={{ duration: 0.3 }}
                    className="absolute w-full  h-[60vh]"
                  >
                    <Card className="w-full overflow-hidden h-full shadow-lg">
                      <CardContent className="relative h-[-webkit-fill-available]">
                        <Image
                          src={
                            connectDevelopers[0].avatar_url ||
                            "/placeholder.svg"
                          }
                          alt={connectDevelopers[0].login}
                          fill
                          objectFit="cover"
                          style={{ objectFit: "cover" }}
                          className="rounded-lg h-[-webkit-fill-available] w-[-webkit-fill-available] object-cover"
                        />
                        <div className="p-4 bg-gradient-to-t from-black/80 to-transparent absolute bottom-0 left-0 w-full">
                          <h3 className="text-2xl font-bold text-white">
                            {connectDevelopers[0].login}
                          </h3>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() =>
                              window.open(
                                connectDevelopers[0].html_url,
                                "_blank"
                              )
                            }
                          >
                            View GitHub
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <p>No developers to connect with at the moment.</p>
          )}
          {connectDevelopers.length > 0 && (
            <div className="flex justify-center gap-4 mt-4">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full p-6"
                onClick={() =>
                  connectDevelopers.length > 0 &&
                  handleSwipe("left", connectDevelopers[0])
                }
              >
                <X className="h-6 w-6 text-destructive" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full p-6"
                onClick={() =>
                  connectDevelopers.length > 0 &&
                  setConnectDevelopers((prev) => prev.slice(1))
                }
              >
                <SkipForward className="h-6 w-6" />
              </Button>
              <Button
                size="lg"
                className="rounded-full p-6"
                onClick={() =>
                  connectDevelopers.length > 0 &&
                  handleSwipe("right", connectDevelopers[0])
                }
              >
                <Heart className="h-6 w-6" />
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Explore</h2>
          <div className="relative">
            <DeveloperGrid
              session={session}
              handleAddFriend={handleAddFriend}
              developers={exploreDevelopers}
            />
            <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-background to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
