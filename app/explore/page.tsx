/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, MapPin, GitBranch, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Developer } from "@/types";
import { getLocationByIp } from "@/lib/location";

export default function ExplorePage() {
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const { toast } = useToast();

  const handleLocationSubmit = useCallback(
    async (e: any) => {
      e.preventDefault();
      if (!location) return;
      setLoading(true);
      try {
        const response = await fetch(
          `/api/developers?location=${encodeURIComponent(location)}`
        );
        const data = await response.json();
        setDevelopers(data);
      } catch {
        toast({
          title: "Error",
          description: "Failed to fetch developers. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [location, toast]
  );

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const data = await getLocationByIp();
        setLocation(data.city);
        if (data.city) {
          setLoading(true);
          try {
            const response = await fetch(
              `/api/developers?location=${encodeURIComponent(data.city)}`
            );
            const responseData = await response.json();
            setDevelopers(responseData);
          } catch {
            toast({
              title: "Error",
              description: "Failed to fetch developers. Please try again.",
              variant: "destructive",
            });
          } finally {
            setLoading(false);
          }
        }
      } catch {
        toast({
          title: "Error",
          description: "Failed to get your location automatically.",
          variant: "destructive",
        });
      }
    };

    if (!location) {
      fetchLocation();
    }
  }, [location, toast, handleLocationSubmit]);

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
            handleLocationSubmit({ preventDefault: () => {} });
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
    } else {
      toast({
        title: "Error",
        description:
          "Geolocation is not supported by your browser. Please enter your location manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Explore Nearby Developers</h1>
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
          disabled={loading}
          variant="outline"
        >
          Use My Location
        </Button>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {developers.map((dev) => (
          <Card key={dev.id}>
            <CardHeader>
              <CardTitle>{dev.login}</CardTitle>
            </CardHeader>
            <CardContent>
              <Image
                src={dev.avatar_url || "/placeholder.svg"}
                alt={dev.login}
                className="w-20 h-20 rounded-full mb-2"
                height={80}
                width={80}
              />
              {dev.name && (
                <p className="text-sm text-muted-foreground mb-1">{dev.name}</p>
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
              <Button asChild variant={"secondary"}>
                <Link
                  href={dev.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block"
                >
                  View Profile
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
