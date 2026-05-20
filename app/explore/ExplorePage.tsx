/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin, Search, Compass } from "lucide-react";
import type { Developer } from "@/types";
import { getLocationByIp } from "@/lib/location";
import { motion } from "framer-motion";
import { toast } from "sonner";
import ExploreDeveloperGrid from "@/components/exploreDeveloperGrid";

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
        const response = await fetch(`/api/developers?location=${encodeURIComponent(location)}`);
        const data = await response.json();
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
      const response = await fetch(`/api/developers?location=${encodeURIComponent(location)}`);
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
        if (data.city) initialLocationSubmit(data.city);
      } catch {}
    };

    if (!location) fetchLocation();
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
              data.address.city || data.address.town || data.address.village || data.address.county;
            setLocation(locationName);
            handleLocationSubmit({ preventDefault: () => {} } as React.FormEvent);
          } catch {
            toast.error("Failed to get your location. Please enter it manually.");
            setLoading(false);
          }
        },
        () => {
          toast.error("Failed to get your location. Please enter it manually.");
          setLoading(false);
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser. Please enter your location manually.");
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-8"
      >
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "hsl(24 95% 53% / 0.12)", border: "1px solid hsl(24 95% 53% / 0.25)" }}
        >
          <Compass className="w-6 h-6 text-primary" />
        </div>
        <h1 className="font-heading text-3xl md:text-4xl mb-2">Explore Nearby Developers</h1>
        <p className="text-sm text-muted-foreground">
          Discover developers in your city or anywhere in the world.
        </p>
      </motion.div>

      {/* Search bar */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="max-w-2xl mx-auto mb-10"
      >
        <form onSubmit={handleLocationSubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Enter a city or location..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-10 rounded-2xl h-11 bg-card border-border focus-visible:ring-primary/30"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="rounded-2xl h-11 px-5 text-white flex-shrink-0"
            style={{ background: "hsl(24 95% 53%)" }}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            <span className="ml-2">Search</span>
          </Button>
          <Button
            type="button"
            onClick={handleGeolocation}
            disabled={loading}
            variant="outline"
            className="rounded-2xl h-11 flex-shrink-0"
          >
            <MapPin className="h-4 w-4 mr-1.5" />
            Use My Location
          </Button>
        </form>

        {/* Current location pill */}
        {location && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center gap-1.5 mt-3"
          >
            <MapPin className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs text-muted-foreground">
              Showing developers near{" "}
              <span className="font-semibold text-foreground">{location}</span>
            </span>
          </motion.div>
        )}
      </motion.div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center gap-3 py-16">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{ background: "hsl(24 95% 53%)" }}
                animate={{ y: [-4, 4, -4] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">Finding developers...</p>
        </div>
      )}

      {/* Results */}
      {!loading && (
        <ExploreDeveloperGrid developers={developers} />
      )}
    </div>
  );
}
