/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, MapPin, Search, GithubIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { Developer } from "@/types";
import { getLocationByIp } from "@/lib/location";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function ExplorePage() {
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [developers, setDevelopers] = useState<Developer[]>([]);

  const handleLocationSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!location) return;
      setLoading(true);
      try {
        const response = await fetch(
          `/api/developers?location=${encodeURIComponent(location)}`
        );
        const data = await response.json();
        console.log(data);
        setDevelopers(data);
      } catch {
        toast.error("Failed to fetch developers. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [location]
  );

  const initialLocationSubmit = async (location: string) => {
    if (!location) return;
    setLoading(true);
    try {
      const response = await fetch(
        `/api/developers?location=${encodeURIComponent(location)}`
      );
      const data = await response.json();
      setDevelopers(data);
    } catch {
      toast.error("Failed to fetch developers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const data = await getLocationByIp();
        setLocation(data.city);
        if (data.city) {
          initialLocationSubmit(data.city);
        }
      } catch {}
    };

    if (!location) {
      fetchLocation();
    }
  }, [handleLocationSubmit]);

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
    } else {
      toast.error(
        "Geolocation is not supported by your browser. Please enter your location manually."
      );
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h1
        className="text-4xl font-bold mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        Explore Nearby Developers
      </motion.h1>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <form
          onSubmit={handleLocationSubmit}
          className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mb-8"
        >
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="Enter location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-10"
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
          </div>
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
            <MapPin className="mr-2 h-4 w-4" />
            Use My Location
          </Button>
        </form>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {developers.map((dev, index) => (
          <motion.div
            key={dev.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="h-full flex gap-4 p-3 items-center">
              <Image
                src={dev.avatar_url || "/placeholder.svg"}
                alt={dev.login}
                className="w-24 h-24 rounded-full"
                width={128}
                height={128}
              />
              <div className="flex-1 flex flex-col gap-2 w-fit">
                <span>{dev.login}</span>
                <Button asChild className="w-fit border" variant={"secondary"}>
                  <Link
                    href={dev.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <GithubIcon className="inline" />
                    View GitHub Profile
                  </Link>
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
