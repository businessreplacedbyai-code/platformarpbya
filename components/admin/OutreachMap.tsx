"use client";
import { useEffect, useRef } from "react";

type MapLead = {
  id: string;
  businessName: string;
  city: string;
  category: string;
  phone: string | null;
  website: string | null;
  rating: number | null;
  status: string;
  lat: number;
  lng: number;
};

const STATUS_COLOR: Record<string, string> = {
  new: "#6B7280",
  ready: "#2563EB",
  sent: "#059669",
  replied: "#7C3AED",
  ignored: "#D1D5DB",
};

const CAT_EMOJI: Record<string, string> = {
  restaurant: "🍽️", cafenea: "☕", hotel: "🏨", clinica: "🏥",
  stomatolog: "🦷", salon: "💇", farmacie: "💊", contabil: "📊",
  avocat: "⚖️", auto: "🔧", imobiliare: "🏠", constructii: "🏗️",
  it: "💻", retail: "🛍️",
};

interface Props {
  leads: MapLead[];
  onSelectLead?: (id: string) => void;
}

export function OutreachMap({ leads, onSelectLead }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Dynamic import Leaflet (client-only)
    import("leaflet").then((L) => {
      // Fix default icon paths broken by webpack
      // @ts-expect-error - leaflet icon hack
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Center on Romania if no leads, else fit bounds
      const map = L.map(containerRef.current!, {
        center: [47.05, 27.58], // Iași/Moldova area
        zoom: 8,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;

      // Add pins
      addPins(L, map, leads, onSelectLead);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update pins when leads change
  useEffect(() => {
    if (!mapRef.current) return;
    import("leaflet").then((L) => {
      if (!mapRef.current) return;
      // Remove existing markers layer
      mapRef.current.eachLayer((layer) => {
        if (layer instanceof L.CircleMarker || layer instanceof L.Marker) {
          layer.remove();
        }
      });
      addPins(L, mapRef.current, leads, onSelectLead);

      // Fit bounds if we have leads
      if (leads.length > 0) {
        const bounds = L.latLngBounds(leads.map((l) => [l.lat, l.lng]));
        mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leads]);

  return (
    <>
      {/* Leaflet CSS */}
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div ref={containerRef} className="w-full h-full rounded-xl" />
    </>
  );
}

function addPins(
  L: typeof import("leaflet"),
  map: L.Map,
  leads: MapLead[],
  onSelectLead?: (id: string) => void
) {
  for (const lead of leads) {
    const color = STATUS_COLOR[lead.status] ?? "#6B7280";
    const emoji = CAT_EMOJI[lead.category] ?? "📍";
    const hasWebsite = !!lead.website;

    const marker = L.circleMarker([lead.lat, lead.lng], {
      radius: 8,
      fillColor: hasWebsite ? "#3B82F6" : "#7C3AED",
      color: "#fff",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.85,
    }).addTo(map);

    marker.bindPopup(`
      <div style="font-family:system-ui;min-width:200px;padding:2px">
        <div style="font-weight:700;font-size:14px;margin-bottom:4px">${emoji} ${lead.businessName}</div>
        <div style="font-size:12px;color:#666;margin-bottom:6px">${lead.city} · ${lead.category}</div>
        ${lead.rating ? `<div style="font-size:12px;margin-bottom:4px">⭐ ${lead.rating.toFixed(1)}</div>` : ""}
        ${lead.phone ? `<div style="font-size:12px;margin-bottom:4px">📞 <a href="tel:${lead.phone}">${lead.phone}</a></div>` : ""}
        <div style="margin-top:8px;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:600;display:inline-block;
          background:${hasWebsite ? "#EFF6FF" : "#F5F3FF"};
          color:${hasWebsite ? "#1D4ED8" : "#6D28D9"}">
          ${hasWebsite ? "🌐 Are site → pitch AI" : "🚫 Fără site → pitch Site+AI"}
        </div>
        ${onSelectLead ? `
        <div style="margin-top:8px">
          <button onclick="window.__outreachSelect?.('${lead.id}')"
            style="width:100%;padding:6px;border-radius:8px;background:#0a0a0a;color:#fff;font-size:12px;font-weight:600;border:none;cursor:pointer">
            Deschide în listă →
          </button>
        </div>` : ""}
      </div>
    `, { maxWidth: 260 });

    // Bridge pentru callback din popup HTML
    if (onSelectLead) {
      marker.on("popupopen", () => {
        (window as { __outreachSelect?: (id: string) => void }).__outreachSelect = onSelectLead;
      });
    }

    void color; // suppress unused
  }
}
