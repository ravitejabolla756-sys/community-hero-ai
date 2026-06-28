"use client";

import { useEffect, useRef, useState } from "react";
import { Issue } from "@/lib/types";

declare global {
  interface Window {
    google?: {
      maps: {
        Map: new (element: HTMLElement, options: Record<string, unknown>) => google.maps.Map;
        Marker: new (options: Record<string, unknown>) => google.maps.Marker;
        InfoWindow: new (options: Record<string, unknown>) => google.maps.InfoWindow;
      };
    };
  }

  namespace google.maps {
    class Map {}
    class Marker {
      addListener(eventName: string, handler: () => void): void;
    }
    class InfoWindow {
      open(map: Map, marker: Marker): void;
    }
  }
}

let mapsScriptPromise: Promise<void> | null = null;

function loadMaps(apiKey: string) {
  if (window.google?.maps) return Promise.resolve();
  if (mapsScriptPromise) return mapsScriptPromise;

  mapsScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google Maps failed to load."));
    document.head.appendChild(script);
  });

  return mapsScriptPromise;
}

export function GoogleIssueMap({ apiKey, issues }: { apiKey: string; issues: Issue[] }) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const locatedIssues = issues.filter((issue) => typeof issue.lat === "number" && typeof issue.lng === "number");
    if (!apiKey || !mapRef.current || locatedIssues.length === 0) return;

    loadMaps(apiKey)
      .then(() => {
        const center = { lat: locatedIssues[0].lat, lng: locatedIssues[0].lng };
        const map = new window.google!.maps.Map(mapRef.current!, {
          center,
          zoom: 12,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true
        });

        locatedIssues.forEach((issue) => {
          const marker = new window.google!.maps.Marker({
            position: { lat: issue.lat, lng: issue.lng },
            map,
            title: issue.title
          });
          const infoWindow = new window.google!.maps.InfoWindow({
            content: `<div style="font-family:Arial;max-width:220px"><strong>${issue.title}</strong><br/>${issue.category} - ${issue.severity}<br/>${issue.status}</div>`
          });
          marker.addListener("click", () => infoWindow.open(map, marker));
        });
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Google Maps failed to load."));
  }, [apiKey, issues]);

  if (!issues.some((issue) => typeof issue.lat === "number" && typeof issue.lng === "number")) {
    return (
      <div className="grid h-[560px] place-items-center bg-gradient-to-br from-slate-100 to-civic-blue/10 p-8 text-center">
        <div>
          <p className="text-2xl font-black text-civic-navy">No coordinates yet</p>
          <p className="mt-3 max-w-lg text-slate-600">Use current location while reporting an issue to place it on the map.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid h-[560px] place-items-center bg-red-50 p-8 text-center text-red-700">
        <p className="font-black">{error}</p>
      </div>
    );
  }

  return <div ref={mapRef} className="h-[560px] w-full" />;
}
