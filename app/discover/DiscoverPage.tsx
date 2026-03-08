/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, MapPin, X, Heart, SkipForward } from 'lucide-react';
import Image from 'next/image';
import type { Developer, UserProfile } from '@/types';
import { Session } from 'next-auth';
import TinderCard from 'react-tinder-card';
import { getLocationByIp } from '@/lib/location';
import LoginButton from '@/components/login-button';
import { toast } from 'sonner';
import SwissButton from '@/components/swiss/SwissButton';
import DeveloperGrid from '@/components/developer-grid';

interface ExtendedDeveloper extends Developer {
  distance?: string;
}

export const shuffleArray = <T,>(items: T[], passes = 2): T[] => {
  const arr = [...items];

  const getRandom = (max: number): number => {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const buffer = new Uint32Array(1);
      crypto.getRandomValues(buffer);
      return buffer[0] % (max + 1);
    }
    return Math.floor(Math.random() * (max + 1));
  };

  for (let pass = 0; pass < passes; pass++) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = getRandom(i);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  return arr;
};

export default function DiscoverPage() {
  const { data: session } = useSession() as { data: Session | null };
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [connectDevelopers, setConnectDevelopers] = useState<
    ExtendedDeveloper[]
  >([]);
  const [exploreDevelopers, setExploreDevelopers] = useState<Developer[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const cardRefs = useRef<any[]>([]);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const data = await getLocationByIp();
        setLocation(data.city);
        // load the developers based on the location initally
        initialLocationSubmit(data.city);
      } catch {
        toast.error('Failed to get your location automatically.');
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
      const response = await fetch('/api/profile');
      const data = await response.json();
      setUserProfile(data);
    } catch {
      toast.error('Failed to fetch user profile.');
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

      const declinedResponse = await fetch('/api/declined-profiles');
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

      const shuffledDevelopers =
        shuffleArray<ExtendedDeveloper>(filteredDevelopers);
      setConnectDevelopers(shuffledDevelopers);

      setExploreDevelopers(data);
    } catch {
      toast.error('Failed to fetch developers. Please try again.');
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

      const declinedResponse = await fetch('/api/declined-profiles');
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
      toast.error('Failed to fetch developers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGeolocation = () => {
    if ('geolocation' in navigator) {
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
          toast.error('Failed to get your location.');
          setLoading(false);
        }
      });
    }
  };

  const handleSwipe = async (direction: string, developer: Developer) => {
    if (!session) return;

    if (direction === 'right') {
      try {
        await fetch('/api/friends/request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(developer),
        });
        toast.success('Friend request sent!');
      } catch {
        toast.error('Failed to send request.');
      }
    } else if (direction === 'left') {
      try {
        await fetch('/api/declined-profiles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ githubId: developer.id }),
        });
      } catch (error) {
        console.error('Error storing declined profile:', error);
      }
    }

    setConnectDevelopers((prev) =>
      prev.filter((dev) => dev.id !== developer.id)
    );
  };

  const swipeCard = async (dir: string) => {
    if (connectDevelopers.length === 0) return;

    const cardRef = cardRefs.current[connectDevelopers.length - 1];

    if (cardRef) {
      await cardRef.swipe(dir);
    }
  };

  const handleAddFriend = async (developer: any) => {
    try {
      const response = await fetch('/api/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(developer),
      });

      if (!response.ok) throw new Error('Failed to send friend request');

      toast.success('Friend request sent!');
    } catch {
      toast.error('Failed to send request.');
    }
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
        <div className="border-8 border-swiss-black p-12 bg-swiss-white text-center shadow-[12px_12px_0_0_rgba(0,0,0,1)]">
          <h1 className="font-black text-6xl uppercase tracking-tighter mb-6 leading-none">
            RESTRICTED<br />ACCESS
          </h1>
          <p className="font-bold uppercase tracking-tight text-xl mb-8 opacity-60">
            SIGN IN TO DISCOVER DEVELOPERS
          </p>
          <div className="flex justify-center">
            <LoginButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-swiss-white min-h-screen">
      {/* Swiss Header */}
      <div className="border-b-8 border-swiss-black bg-swiss-white sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-black text-8xl uppercase tracking-tighter leading-[0.8] mb-2">
              DISCOVER<br />PEOPLE
            </h1>
            <p className="font-bold uppercase tracking-[0.2em] text-xs text-swiss-red">
              NETWORK / GEOLOCATION_SYNC / V_1.0
            </p>
          </div>

          <form
            onSubmit={handleLocationSubmit}
            className="flex flex-wrap items-center gap-3"
          >
            <div className="relative group">
              <Input
                type="text"
                placeholder="ENTER_LOCATION..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-14 px-6 bg-swiss-white border-4 border-swiss-black rounded-none font-black uppercase tracking-tight focus:bg-swiss-muted transition-colors outline-none w-64"
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Swiper Section */}
          <div className="lg:col-span-12 xl:col-span-5 space-y-8">
            <div className="flex items-center justify-between border-b-4 border-swiss-black pb-4">
              <h2 className="font-black text-4xl uppercase tracking-tighter">CONNECT</h2>
              <span className="bg-swiss-red text-swiss-white px-3 py-1 font-black text-xs uppercase">
                {connectDevelopers.length} MATCHES
              </span>
            </div>

            <div className="flex flex-col items-center gap-8">
              {connectDevelopers.length > 0 ? (
                <div className="relative w-full aspect-[3/4] max-w-sm">
                  {connectDevelopers.map((developer, index) => (
                    <TinderCard
                      key={developer.id}
                      ref={(el) => {
                        cardRefs.current[index] = el;
                      }}
                      onSwipe={(dir) => handleSwipe(dir, developer)}
                      preventSwipe={['up', 'down']}
                      swipeRequirementType="velocity"
                      className="absolute inset-0 select-none"
                      flickOnSwipe={true}
                    >
                      <div className="w-full h-full border-8 border-swiss-black bg-swiss-white shadow-[12px_12px_0_0_rgba(0,0,0,1)] group overflow-hidden">
                        <div className="relative w-full h-full grayscale hover:grayscale-0 transition-all duration-500">
                          <Image
                            src={developer.avatar_url || '/placeholder.svg'}
                            alt={developer.login}
                            fill
                            style={{ objectFit: 'cover' }}
                            className="object-cover"
                          />
                          {/* Bold Label */}
                          <div className="absolute inset-x-0 bottom-0 bg-swiss-black p-6">
                            <h3 className="text-4xl font-black text-swiss-white uppercase tracking-tighter leading-none mb-4">
                              {developer.login}
                            </h3>
                            <button
                              onClick={() => window.open(developer.html_url, '_blank')}
                              className="font-bold uppercase tracking-widest text-[10px] text-swiss-red flex items-center gap-2 hover:translate-x-2 transition-transform"
                            >
                              VIEW_GITHUB_PROFILE <SkipForward className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </TinderCard>
                  ))}
                </div>
              ) : (
                <div className="w-full aspect-[3/4] max-w-sm border-8 border-swiss-muted flex flex-col items-center justify-center p-8 text-center bg-swiss-muted/10">
                  <p className="font-black text-2xl uppercase tracking-tighter opacity-40">NO_MORE_MATCHES</p>
                  <p className="font-bold uppercase tracking-tight text-xs mt-4 opacity-40">EXPAND YOUR SEARCH AREA OR REFRESH LATER</p>
                </div>
              )}

              {connectDevelopers.length > 0 && (
                <div className="flex justify-center gap-6">
                  <button
                    onClick={() => swipeCard('left')}
                    className="w-20 h-20 bg-swiss-white border-4 border-swiss-black flex items-center justify-center hover:bg-swiss-black group transition-colors shadow-[6px_6px_0_0_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
                  >
                    <X className="h-8 w-8 text-swiss-red group-hover:text-swiss-white" />
                  </button>
                  <button
                    onClick={() =>
                      connectDevelopers.length > 0 &&
                      setConnectDevelopers((prev) => prev.slice(0, -1))
                    }
                    className="w-20 h-20 bg-swiss-white border-4 border-swiss-black flex items-center justify-center hover:bg-swiss-black group transition-colors shadow-[6px_6px_0_0_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
                  >
                    <SkipForward className="h-8 w-8 group-hover:text-swiss-white" />
                  </button>
                  <button
                    onClick={() => swipeCard('right')}
                    className="w-20 h-20 bg-swiss-white border-4 border-swiss-black flex items-center justify-center hover:bg-swiss-red hover:border-swiss-red group transition-colors shadow-[6px_6px_0_0_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
                  >
                    <Heart className="h-8 w-8 group-hover:text-swiss-white" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Explore Section */}
          <div className="lg:col-span-12 xl:col-span-7 space-y-8">
            <div className="flex items-center justify-between border-b-4 border-swiss-black pb-4">
              <h2 className="font-black text-4xl uppercase tracking-tighter">EXPLORE</h2>
              <p className="font-bold uppercase tracking-widest text-[10px] text-swiss-red">REGION: {location || 'GLOBAL'}</p>
            </div>

            <div className="relative border-4 border-swiss-black p-6 bg-swiss-muted/10 min-h-[60vh]">
              <DeveloperGrid
                session={session}
                handleAddFriend={handleAddFriend}
                developers={exploreDevelopers}
              />
              {exploreDevelopers.length > 10 && (
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-swiss-white to-transparent pointer-events-none" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
