"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import "ol/ol.css";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import { Style, Icon } from "ol/style";

interface LocationPreviewProps {
  lat: number;
  lng: number;
}

export function LocationPreview({ lat, lng }: LocationPreviewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Create marker feature
    const marker = new Feature({
      geometry: new Point([lng, lat]),
    });

    // Create vector layer with marker
    const vectorLayer = new VectorLayer({
      source: new VectorSource({
        features: [marker],
      }),
      style: new Style({
        image: new Icon({
          anchor: [0.5, 0.5],
          src: "https://cdn0.iconfinder.com/data/icons/essentials-solid-glyphs-vol-1/100/Location-Pin-Map-24.png",
        }),
      }),
    });

    mapInstance.current = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        vectorLayer, // Add the vector layer with marker
      ],
      view: new View({
        center: [lng, lat],
        zoom: 13,
        projection: "EPSG:4326",
      }),
    });
  }, [lat, lng]);

  const openInMaps = () => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
  };

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
        <Button size="sm" onClick={openInMaps} className="rounded-full">
          View in Maps
        </Button>
      </div>
    </div>
  );
}
