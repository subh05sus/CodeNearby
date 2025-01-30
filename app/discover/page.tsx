/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import {
  Loader2,
  MapPin,
  GitBranch,
  Users,
  X,
  Heart,
  SkipForward,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import TinderCard from "react-tinder-card";
import type { Developer, UserProfile } from "@/types";
import { Session } from "next-auth";

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
  const { toast } = useToast();

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
      toast({
        title: "Error",
        description: "Failed to fetch user profile.",
        variant: "destructive",
      });
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
            !userProfile?.friends.some(
              (friend) => friend.githubId.toString() === dev.id
            ) &&
            !userProfile?.sentRequests.includes(dev.id) &&
            !declinedIds.has(dev.id)
        )
        .map((dev: Developer) => ({ ...dev }));

      setConnectDevelopers(filteredDevelopers);
      setExploreDevelopers(data);
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch developers. Please try again.",
        variant: "destructive",
      });
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
              preventDefault: () => {},
            } as React.FormEvent);
          } catch {
            toast({
              title: "Error",
              description:
                "Failed to get your location. Please enter it manually.",
              variant: "destructive",
            });
            setLoading(false);
          }
        },
        () => {
          toast({
            title: "Error",
            description:
              "Failed to get your location. Please enter it manually.",
            variant: "destructive",
          });
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

        toast({
          title: "Success",
          description: "Friend request sent!",
        });
      } catch {
        toast({
          title: "Error",
          description: "Failed to send friend request.",
          variant: "destructive",
        });
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

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
        <p>You need to be signed in to discover developers.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Discover Developers</h1>
      <form onSubmit={handleLocationSubmit} className="flex space-x-2 mb-6">
        <Input
          type="text"
          placeholder="Enter location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="flex-grow"
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
              {connectDevelopers.map((developer) => (
                <TinderCard
                  key={developer.id}
                  onSwipe={(dir) => onSwipe(dir, developer)}
                  preventSwipe={["up", "down"]}
                  className="absolute w-full"
                >
                  <Card className="w-full">
                    <CardContent className="p-0">
                      <div className="relative w-full h-48">
                        <Image
                          src={developer.avatar_url || "/placeholder.svg"}
                          alt={developer.login}
                          layout="fill"
                          objectFit="cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-xl font-bold">{developer.login}</h3>
                        {developer.name && (
                          <p className="text-sm text-muted-foreground">
                            {developer.name}
                          </p>
                        )}
                        {developer.location && (
                          <p className="text-sm text-muted-foreground mt-1">
                            <MapPin className="inline-block w-4 h-4 mr-1" />
                            {developer.location}
                          </p>
                        )}
                        {developer.public_repos && (
                          <p className="text-sm text-muted-foreground mt-1">
                            <GitBranch className="inline-block w-4 h-4 mr-1" />
                            {developer.public_repos} public repos
                          </p>
                        )}
                        {developer.followers && (
                          <p className="text-sm text-muted-foreground mt-1">
                            <Users className="inline-block w-4 h-4 mr-1" />
                            {developer.followers} followers
                          </p>
                        )}
                        {developer.bio && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {developer.bio}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TinderCard>
              ))}
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
                  onSwipe("left", connectDevelopers[0])
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
                  onSwipe("right", connectDevelopers[0])
                }
              >
                <Heart className="h-6 w-6" />
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Explore</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {exploreDevelopers.map((dev) => (
              <Card key={dev.id}>
                <CardHeader>
                  <CardTitle>{dev.login}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Image
                    src={dev.avatar_url || "/placeholder.svg"}
                    alt={dev.login}
                    width={80}
                    height={80}
                    className="rounded-full mb-2"
                  />
                  {dev.name && (
                    <p className="text-sm text-muted-foreground mb-1">
                      {dev.name}
                    </p>
                  )}
                  {dev.location && (
                    <p className="text-sm text-muted-foreground mb-1">
                      <MapPin className="inline-block w-4 h-4 mr-1" />
                      {dev.location}
                    </p>
                  )}
                  {dev.public_repos && (
                    <p className="text-sm text-muted-foreground mb-1">
                      <GitBranch className="inline-block w-4 h-4 mr-1" />
                      {dev.public_repos} public repos
                    </p>
                  )}
                  {dev.followers && (
                    <p className="text-sm text-muted-foreground mb-1">
                      <Users className="inline-block w-4 h-4 mr-1" />
                      {dev.followers} followers
                    </p>
                  )}
                  <Link
                    href={dev.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline mt-2 inline-block"
                  >
                    View Profile
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
