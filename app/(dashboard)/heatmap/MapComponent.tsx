"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";
import { DISTRICTS } from "@/lib/districts";

interface Props {
  layer: "stress" | "water" | "crop";
}

function getStressColor(score: number): string {
  if (score >= 80) return "#ef4444";
  if (score >= 70) return "#f97316";
  if (score >= 60) return "#eab308";
  return "#10b981";
}

function getScore(district: (typeof DISTRICTS)[0], layer: Props["layer"]): number {
  if (layer === "stress") return district.stressScore;
  if (layer === "water") return district.waterStress;
  return district.cropDamageRisk;
}

const WEATHER_CITIES = [
  { city: "Nagpur", lat: 21.1458, lon: 79.0882 },
  { city: "Pune", lat: 18.5204, lon: 73.8567 },
  { city: "Aurangabad", lat: 19.8762, lon: 75.3433 },
  { city: "Solapur", lat: 17.6868, lon: 75.9064 },
  { city: "Kolhapur", lat: 16.7050, lon: 74.2433 },
  { city: "Akola", lat: 20.7002, lon: 77.0082 },
];

export default function MapComponent({ layer }: Props) {
  const mapRef = useRef<LeafletMap | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const circlesRef = useRef<import("leaflet").Circle[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    let L: typeof import("leaflet");
    import("leaflet").then((leaflet) => {
      L = leaflet.default;

      // Fix default icon
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (!mapRef.current && containerRef.current) {
        mapRef.current = L.map(containerRef.current).setView([19.7515, 75.7139], 7);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
          maxZoom: 18,
        }).addTo(mapRef.current);

        // Add city markers
        WEATHER_CITIES.forEach((city) => {
          if (!mapRef.current) return;
          const marker = L.marker([city.lat, city.lon]).addTo(mapRef.current);
          marker.bindPopup(
            `<div style="font-family:sans-serif;min-width:140px">
              <b style="color:#1a202c">${city.city}</b><br>
              <span style="color:#4a5568;font-size:0.85em">Loading weather...</span>
            </div>`
          );
          fetch(`/api/weather`)
            .then((r) => r.json())
            .then((data) => {
              const cityData = data.data?.find(
                (w: { city: string }) => w.city === city.city
              );
              if (cityData) {
                marker.setPopupContent(
                  `<div style="font-family:sans-serif;min-width:160px">
                    <b style="color:#1a202c;font-size:1.05em">${city.city}</b><br>
                    <span style="color:#e53e3e;font-weight:bold">🌡️ ${Math.round(cityData.temperature)}°C</span><br>
                    <span style="color:#4a5568;font-size:0.85em">
                      💧 Humidity: ${Math.round(cityData.humidity)}%<br>
                      💨 Wind: ${Math.round(cityData.windSpeed)} km/h<br>
                      🌤️ ${cityData.condition}
                    </span>
                  </div>`
                );
              }
            })
            .catch(() => {});
        });
      }
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update circles when layer changes
  useEffect(() => {
    if (!mapRef.current) return;

    import("leaflet").then((leaflet) => {
      const L = leaflet.default;
      if (!mapRef.current) return;

      // Remove old circles
      circlesRef.current.forEach((c) => c.remove());
      circlesRef.current = [];

      // Add new circles
      DISTRICTS.forEach((district) => {
        if (!mapRef.current) return;
        const score = getScore(district, layer);
        const color = getStressColor(score);
        const circle = L.circle([district.lat, district.lng], {
          color,
          fillColor: color,
          fillOpacity: 0.55,
          radius: 25000,
          weight: 1,
        }).addTo(mapRef.current!);

        const layerLabel =
          layer === "stress" ? "Heat Stress" : layer === "water" ? "Water Stress" : "Crop Risk";
        circle.bindPopup(
          `<div style="font-family:sans-serif">
            <b style="color:#1a202c">${district.name}</b><br>
            <span style="color:#4a5568;font-size:0.85em">Division: ${district.division}</span><br>
            <span style="color:#e53e3e;font-weight:bold">${layerLabel}: ${score}/100</span><br>
            <span style="color:#4a5568;font-size:0.8em">
              Pop: ${(district.population / 1000000).toFixed(1)}M | 
              Area: ${district.area.toLocaleString()} km²
            </span>
          </div>`
        );
        circlesRef.current.push(circle);
      });
    });
  }, [layer]);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      <div ref={containerRef} className="w-full h-full" style={{ minHeight: "500px" }} />
    </>
  );
}
