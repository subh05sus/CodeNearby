import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MapPin } from "lucide-react";
import SwissButton from "./swiss/SwissButton";

interface ShareLocationProps {
  onShareLocation: (latitude: number, longitude: number) => void;
}

export function ShareLocation({ onShareLocation }: ShareLocationProps) {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [isOpen, setIsOpen] = useState(false);

  const handleGetLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      });
    } else {
      alert("Geolocation is not supported by your browser");
    }
  };

  const handleShareLocation = () => {
    if (location) {
      onShareLocation(location.lat, location.lng);
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <SwissButton
          variant="secondary"
          size="sm"
          className="w-10 h-10 p-0"
        >
          <MapPin className="w-5 h-5" />
        </SwissButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-none border-4 border-black p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase tracking-tightest mb-4">Share Your Location</DialogTitle>
        </DialogHeader>
        <div className="py-4 border-t-2 border-black/10">
          {location ? (
            <div className="flex flex-col gap-4">
              <div className="bg-muted p-4 border-2 border-black font-mono text-xs">
                <p>LAT: {location.lat}</p>
                <p>LNG: {location.lng}</p>
              </div>
              <SwissButton onClick={handleShareLocation} variant="accent" className="w-full">
                SHARE THIS LOCATION
              </SwissButton>
            </div>
          ) : (
            <SwissButton onClick={handleGetLocation} className="w-full">GET MY LOCATION</SwissButton>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
