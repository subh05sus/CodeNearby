"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { MapPin } from "lucide-react"
import "ol/ol.css"
import { Map, View } from "ol"
import TileLayer from "ol/layer/Tile"
import OSM from "ol/source/OSM"

interface LocationPreviewProps {
  lat: number
  lng: number
}

export function LocationPreview({ lat, lng }: LocationPreviewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<Map | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return

    mapInstance.current = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: [lng, lat], // Longitude first in OpenLayers
        zoom: 13,
        projection: "EPSG:4326", // Use lat/lng coordinates
      }),
    })
  }, [lat, lng])

  const openInMaps = () => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank")
  }

  return (
    <div className="rounded-lg overflow-hidden border bg-card">
      <div ref={mapRef} className="h-[200px] w-full" />
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mr-1" />
          <span>
            {lat.toFixed(4)}, {lng.toFixed(4)}
          </span>
        </div>
        <Button size="sm" onClick={openInMaps}>
          View in Maps
        </Button>
      </div>
    </div>
  )
}
