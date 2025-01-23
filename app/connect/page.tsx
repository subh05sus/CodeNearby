"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import TinderCard from "react-tinder-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, X, Heart, MapPin } from "lucide-react";
import type { Developer } from "@/types";

export default function ConnectPage() {
  const { data: session } = useSession();
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const { toast } = useToast();

  const handleLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!location) {
      toast({
        title: "Error",
        description: "Please enter a location.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/developers?location=${encodeURIComponent(location)}`
      );
      const data = await response.json();
      setDevelopers(data);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to fetch developers: ${
          error instanceof Error ? error.message : "Please try again."
        }`,
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

            // Simulate form submission
            handleLocationSubmit({
              preventDefault: () => {},
            } as React.FormEvent);
          } catch (error) {
            toast({
              title: "Error",
              description: `Failed to get your location: ${
                error instanceof Error
                  ? error.message
                  : "Please enter it manually."
              }`,
              variant: "destructive",
            });
          } finally {
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

  const onSwipe = async (direction: string, developerId: string) => {
    if (!session) return;

    if (direction === "right") {
      try {
        const response = await fetch("/api/friends/request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ receiverId: developerId }),
        });

        if (!response.ok) throw new Error("Failed to send friend request");

        toast({
          title: "Success",
          description: "Friend request sent!",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: `Failed to send friend request: ${
            error instanceof Error ? error.message : "Please try again."
          }`,
          variant: "destructive",
        });
      }
    }

    setDevelopers((prev) => prev.filter((dev) => dev.id !== developerId));
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
        <p>You need to be signed in to connect with developers.</p>
      </div>
    );
  }

  if (developers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Find Developers Nearby</h1>
        <form onSubmit={handleLocationSubmit} className="w-full space-y-4">
          <Input
            type="text"
            placeholder="Enter your location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={loading}>
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
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center max-w-md mx-auto min-h-[50vh]">
      <div className="w-full text-center mb-6">
        <p className="text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 inline mr-1" />
          {location}
        </p>
      </div>

      <div className="relative w-full h-[60vh]">
        {developers.map((developer) => (
          <TinderCard
            key={developer.id}
            onSwipe={(dir) => onSwipe(dir, developer.id)}
            preventSwipe={["up", "down"]}
            className="absolute w-full h-full"
          >
            <div className="relative w-full h-full bg-card rounded-xl shadow-xl overflow-hidden">
              <div className="relative w-full h-1/2">
                <Image
                  src={developer.avatar_url || "/placeholder.svg"}
                  alt={developer.login}
                  layout="fill"
                  objectFit="cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold">{developer.login}</h3>
                {developer.bio && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {developer.bio}
                  </p>
                )}
              </div>
            </div>
          </TinderCard>
        ))}
      </div>

      <div className="flex justify-center gap-4 mt-6">
        <Button
          size="lg"
          variant="outline"
          className="rounded-full p-6"
          onClick={() =>
            developers.length > 0 &&
            onSwipe("left", developers[developers.length - 1].id)
          }
        >
          <X className="h-6 w-6 text-destructive" />
        </Button>
        <Button
          size="lg"
          className="rounded-full p-6"
          onClick={() =>
            developers.length > 0 &&
            onSwipe("right", developers[developers.length - 1].id)
          }
        >
          <Heart className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
