/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";

import { useEffect, useState, useCallback } from "react";
import SwissButton from "@/components/swiss/SwissButton";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin, Search } from "lucide-react";
import type { Developer } from "@/types";
import { getLocationByIp } from "@/lib/location";
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
      } catch { }
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
    } else {
      toast.error(
        "Geolocation is not supported by your browser. Please enter your location manually."
      );
      setLoading(false);
    }
  };

  return (
    <div className="bg-swiss-white min-h-screen">
      {/* Swiss Header */}
      <div className="border-b-8 border-swiss-black bg-swiss-white sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-black text-8xl uppercase tracking-tighter leading-[0.8] mb-2">
              EXPLORE<br />NEARBY
            </h1>
            <p className="font-bold uppercase tracking-[0.2em] text-xs text-swiss-red">
              GEOLOCATION / NETWORK_NODES / V_1.0
            </p>
          </div>

          <form
            onSubmit={handleLocationSubmit}
            className="flex flex-wrap items-center gap-3"
          >
            <div className="relative group flex-grow md:flex-grow-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-swiss-black opacity-30 group-focus-within:opacity-100 transition-opacity" />
              <Input
                type="text"
                placeholder="ENTER_LOCATION..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-14 pl-12 pr-6 bg-swiss-white border-4 border-swiss-black rounded-none font-black uppercase tracking-tight focus:bg-swiss-muted transition-colors outline-none w-full md:w-64"
              />
            </div>
            <SwissButton type="submit" disabled={loading} className="h-14 px-8">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              SEARCH
            </SwissButton>
            <SwissButton
              type="button"
              onClick={handleGeolocation}
              variant="secondary"
              disabled={loading}
              className="h-14 px-6"
            >
              <MapPin className="h-5 w-5 mr-2" />
              LOCATE
            </SwissButton>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="border-l-8 border-swiss-black pl-8 mb-12">
          <p className="font-bold uppercase tracking-widest text-xs text-swiss-red mb-2">RESULTS_FEED</p>
          <h2 className="font-black text-4xl uppercase tracking-tighter">
            {developers.length} DEVELOPERS FOUND {location && `IN ${location.toUpperCase()}`}
          </h2>
        </div>

        <div className="relative">
          <ExploreDeveloperGrid developers={developers} />
          {developers.length === 0 && !loading && (
            <div className="border-8 border-swiss-black p-12 bg-swiss-muted/10 text-center">
              <p className="font-black text-2xl uppercase tracking-tighter opacity-40">NO_DATA_AVAILABLE</p>
              <p className="font-bold uppercase tracking-tight text-xs mt-4 opacity-40">ENTER A LOCATION TO BEGIN EXPLORATION</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
