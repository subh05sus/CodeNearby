import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { MapPin } from "lucide-react"

interface ShareLocationProps {
  onShareLocation: (latitude: number, longitude: number) => void
}

export function ShareLocation({ onShareLocation }: ShareLocationProps) {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)

  const handleGetLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        
      )
    } else {
      alert("Geolocation is not supported by your browser")
    }
  }

  const handleShareLocation = () => {
    if (location) {
      onShareLocation(location.lat, location.lng)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
      <Button
          variant="ghost"
          size="icon"
          className="text-primary hover:bg-primary/10 rounded-full"
        >
          <MapPin className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Your Location</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {location ? (
            <div>
              <p>Latitude: {location.lat}</p>
              <p>Longitude: {location.lng}</p>
              <Button onClick={handleShareLocation} className="mt-4">
                Share This Location
              </Button>
            </div>
          ) : (
            <Button onClick={handleGetLocation}>Get My Location</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

