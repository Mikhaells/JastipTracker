"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export interface MapStop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface TripMapProps {
  stops: MapStop[];
  addMode?: boolean;
  pending?: { latitude: number; longitude: number } | null;
  center?: [number, number];
  focus?: { latitude: number; longitude: number } | null;
  onMapClick?: (latitude: number, longitude: number) => void;
}

function numberedIcon(index: number | string, className: string) {
  return L.divIcon({
    className: "",
    html: `<div class="${className}"><span>${index}</span></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
}

export default function TripMap({
  stops,
  addMode = false,
  pending = null,
  center,
  focus = null,
  onMapClick,
}: TripMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const centerRef = useRef(center);
  const stopsCountRef = useRef(0);

  useEffect(() => {
    centerRef.current = center;
    const map = mapRef.current;
    if (map && center && stopsCountRef.current === 0) {
      map.setView(center, map.getZoom());
    }
  }, [center]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const container = containerRef.current;
    const map = L.map(container, {
      center: centerRef.current ?? [-6.2088, 106.8456],
      zoom: 12,
      scrollWheelZoom: false,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    const enableScroll = () => map.scrollWheelZoom.enable();
    const disableScroll = () => map.scrollWheelZoom.disable();

    container.addEventListener("mouseenter", enableScroll);
    container.addEventListener("mouseleave", disableScroll);

    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      container.removeEventListener("mouseenter", enableScroll);
      container.removeEventListener("mouseleave", disableScroll);
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;

    stopsCountRef.current = stops.length;
    layer.clearLayers();

    stops.forEach((stop, i) => {
      L.marker([stop.latitude, stop.longitude], {
        icon: numberedIcon(i + 1, "trip-marker"),
      })
        .addTo(layer)
        .bindPopup(stop.name);
    });

    if (stops.length > 1) {
      L.polyline(
        stops.map((s) => [s.latitude, s.longitude] as [number, number]),
        { color: "#4f46e5", weight: 3.5, opacity: 0.85 }
      ).addTo(layer);
    }

    if (pending) {
      L.marker([pending.latitude, pending.longitude], {
        icon: numberedIcon("?", "trip-marker trip-marker-pending"),
      })
        .addTo(layer)
        .bindPopup("Titik baru");
    }

    if (stops.length > 1) {
      map.fitBounds(
        L.latLngBounds(stops.map((s) => L.latLng(s.latitude, s.longitude))),
        { padding: [40, 40] }
      );
    } else if (stops.length === 1) {
      map.setView([stops[0].latitude, stops[0].longitude], 14);
    } else if (pending) {
      map.setView([pending.latitude, pending.longitude], 14);
    }
  }, [stops, pending]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focus) return;
    map.setView([focus.latitude, focus.longitude], 15);
  }, [focus]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const container = map.getContainer();
    container.style.cursor = addMode ? "crosshair" : "";

    if (!addMode || !onMapClick) return;
    const handler = (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    };
    map.on("click", handler);
    return () => {
      map.off("click", handler);
      container.style.cursor = "";
    };
  }, [addMode, onMapClick]);

  return <div ref={containerRef} className="h-72 w-full" />;
}