"use client";

import { useEffect, useRef } from "react";
import { MapPin, ExternalLink } from "lucide-react";
import "ol/ol.css";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import { Style, Icon } from "ol/style";
import SwissButton from "./swiss/SwissButton";

interface LocationPreviewProps {
  lat: number;
  lng: number;
}

export function LocationPreview({ lat, lng }: LocationPreviewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const marker = new Feature({
      geometry: new Point([lng, lat]),
    });

    const vectorLayer = new VectorLayer({
      source: new VectorSource({
        features: [marker],
      }),
      style: new Style({
        image: new Icon({
          anchor: [0.5, 0.5],
          src: "https://cdn0.iconfinder.com/data/icons/essentials-solid-glyphs-vol-1/100/Location-Pin-Map-24.png",
          scale: 1.5,
        }),
      }),
    });

    mapInstance.current = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        vectorLayer,
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
    <div className="border-4 border-swiss-black bg-swiss-white overflow-hidden">
      <div ref={mapRef} className="h-[200px] w-full grayscale contrast-125 border-b-4 border-swiss-black" />
      <div className="p-4 flex items-center justify-between bg-swiss-muted">
        <div className="flex items-center text-xs font-black uppercase tracking-tighter">
          <MapPin className="h-5 w-5 mr-2 text-swiss-red" />
          <span>
            {lat.toFixed(4)} / {lng.toFixed(4)}
          </span>
        </div>
        <SwissButton size="sm" variant="primary" onClick={openInMaps}>
          <ExternalLink className="h-4 w-4 mr-2" />
          VIEW MAPS
        </SwissButton>
      </div>
    </div>
  );
}
