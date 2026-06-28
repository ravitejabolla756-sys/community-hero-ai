"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
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

const osmZoom = 13;
const tileSize = 256;

function latToTileY(lat: number, zoom: number) {
  const radians = (lat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(radians) + 1 / Math.cos(radians)) / Math.PI) / 2) * 2 ** zoom;
}

function lngToTileX(lng: number, zoom: number) {
  return ((lng + 180) / 360) * 2 ** zoom;
}

function severityPinColor(severity: Issue["severity"]) {
  if (severity === "Critical") return "bg-red-600 ring-red-200";
  if (severity === "High") return "bg-orange-500 ring-orange-200";
  if (severity === "Medium") return "bg-amber-500 ring-amber-200";
  return "bg-emerald-500 ring-emerald-200";
}

function OpenStreetIssueMap({ issues }: { issues: Issue[] }) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 900, height: 560 });
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const locatedIssues = issues.filter((issue) => typeof issue.lat === "number" && typeof issue.lng === "number");

  useEffect(() => {
    if (!wrapperRef.current) return;

    const observer = new ResizeObserver(([entry]) => {
      setSize({
        width: Math.max(320, entry.contentRect.width),
        height: Math.max(420, entry.contentRect.height)
      });
    });

    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  if (locatedIssues.length === 0) {
    return (
      <div className="grid h-[560px] place-items-center bg-gradient-to-br from-slate-100 to-civic-blue/10 p-8 text-center">
        <div>
          <p className="text-2xl font-black text-civic-navy">No coordinates yet</p>
          <p className="mt-3 max-w-lg text-slate-600">Use current location while reporting an issue to place it on the free OpenStreetMap view.</p>
        </div>
      </div>
    );
  }

  const centerLat = locatedIssues.reduce((sum, issue) => sum + issue.lat!, 0) / locatedIssues.length;
  const centerLng = locatedIssues.reduce((sum, issue) => sum + issue.lng!, 0) / locatedIssues.length;
  const centerTileX = lngToTileX(centerLng, osmZoom);
  const centerTileY = latToTileY(centerLat, osmZoom);
  const centerPixelX = centerTileX * tileSize;
  const centerPixelY = centerTileY * tileSize;
  const startTileX = Math.floor(centerTileX) - 3;
  const startTileY = Math.floor(centerTileY) - 2;
  const tiles = Array.from({ length: 42 }, (_, index) => {
    const x = startTileX + (index % 7);
    const y = startTileY + Math.floor(index / 7);
    return { x, y };
  });

  return (
    <div ref={wrapperRef} className="relative h-[560px] overflow-hidden bg-slate-200">
      <div className="absolute inset-0">
        {tiles.map((tile) => {
          const left = tile.x * tileSize - centerPixelX + size.width / 2;
          const top = tile.y * tileSize - centerPixelY + size.height / 2;

          return (
            <img
              key={`${tile.x}-${tile.y}`}
              alt=""
              className="absolute h-64 w-64 select-none"
              draggable={false}
              src={`https://tile.openstreetmap.org/${osmZoom}/${tile.x}/${tile.y}.png`}
              style={{ left, top }}
            />
          );
        })}
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.05),rgba(15,35,55,0.18))]" />

      {locatedIssues.map((issue) => {
        const markerX = lngToTileX(issue.lng!, osmZoom) * tileSize - centerPixelX + size.width / 2;
        const markerY = latToTileY(issue.lat!, osmZoom) * tileSize - centerPixelY + size.height / 2;

        return (
          <button
            key={issue.id}
            aria-label={issue.title}
            className={`absolute z-10 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-4 shadow-lg transition hover:scale-125 ${severityPinColor(issue.severity)}`}
            onClick={() => setSelectedIssue(issue)}
            style={{ left: markerX, top: markerY }}
          />
        );
      })}

      <div className="absolute left-4 top-4 rounded-lg bg-white/95 p-4 shadow-lift ring-1 ring-slate-200 backdrop-blur">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-civic-green">Free map active</p>
        <p className="mt-1 text-sm font-bold text-civic-navy">OpenStreetMap, no API key</p>
      </div>

      {selectedIssue && (
        <div className="absolute bottom-4 left-4 right-4 z-20 max-w-md rounded-lg bg-white p-4 shadow-lift ring-1 ring-slate-200">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{selectedIssue.category}</p>
              <h2 className="mt-1 font-black text-civic-navy">{selectedIssue.title}</h2>
              <p className="mt-1 text-sm text-slate-500">{selectedIssue.locationText}</p>
              <p className="mt-2 text-xs font-bold text-slate-400">
                {selectedIssue.severity} severity • {selectedIssue.status}
              </p>
            </div>
            <button className="text-xl font-black text-slate-400 hover:text-civic-navy" onClick={() => setSelectedIssue(null)}>
              ×
            </button>
          </div>
          <Link href={`/issues/${selectedIssue.id}`} className="mt-4 inline-flex rounded-md bg-civic-navy px-4 py-2 text-sm font-black text-white">
            View issue
          </Link>
        </div>
      )}

      <p className="absolute bottom-2 right-3 rounded bg-white/85 px-2 py-1 text-[10px] font-bold text-slate-500">
        © OpenStreetMap contributors
      </p>
    </div>
  );
}

export function GoogleIssueMap({ apiKey, issues }: { apiKey?: string; issues: Issue[] }) {
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

  if (!apiKey) return <OpenStreetIssueMap issues={issues} />;

  if (error) {
    return (
      <div className="grid h-[560px] place-items-center bg-red-50 p-8 text-center text-red-700">
        <p className="font-black">{error}</p>
      </div>
    );
  }

  return <div ref={mapRef} className="h-[560px] w-full" />;
}
