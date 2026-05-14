"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Notice } from "@/lib/types";
import { getOrgColor } from "@/lib/utils";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

// 수도권 중심 (서울시청 근처)
const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };
const DEFAULT_ZOOM = 10;

// 기관별 마커 색상
const ORG_MARKER_COLORS: Record<string, string> = {
  LH: "#4F46E5",   // indigo
  SH: "#7C3AED",   // purple
  iH: "#0D9488",   // teal
  GH: "#EA580C",   // orange
  기타: "#6B7280", // gray
};

interface GoogleMapProps {
  notices: Notice[];
  onNoticeSelect: (notice: Notice) => void;
  selectedId?: string;
}

export default function GoogleMap({ notices, onNoticeSelect, selectedId }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Google Maps 스크립트 로드
  useEffect(() => {
    if (window.google?.maps) {
      setMapLoaded(true);
      return;
    }

    const existing = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existing) {
      existing.addEventListener("load", () => setMapLoaded(true));
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=marker&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapLoaded(true);
    document.head.appendChild(script);
  }, []);

  // 지도 초기화
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || googleMapRef.current) return;

    googleMapRef.current = new google.maps.Map(mapRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      mapId: "house-alert-map",
      disableDefaultUI: false,
      zoomControl: true,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: false,
    });

    infoWindowRef.current = new google.maps.InfoWindow();
  }, [mapLoaded]);

  // 마커 생성/업데이트
  const updateMarkers = useCallback(() => {
    const map = googleMapRef.current;
    if (!map) return;

    // 기존 마커 제거
    markersRef.current.forEach((m) => (m.map = null));
    markersRef.current = [];

    const noticesWithAddress = notices.filter((n) => n.address);

    // Geocoding 서비스로 주소 → 좌표 변환
    const geocoder = new google.maps.Geocoder();
    const bounds = new google.maps.LatLngBounds();
    let geocodedCount = 0;

    noticesWithAddress.forEach((notice) => {
      // 이미 좌표가 있는 경우
      if (notice.lat && notice.lng) {
        addMarker(notice, { lat: notice.lat, lng: notice.lng }, map, bounds);
        geocodedCount++;
        if (geocodedCount === noticesWithAddress.length && geocodedCount > 0) {
          map.fitBounds(bounds, { top: 60, bottom: 100, left: 20, right: 20 });
        }
        return;
      }

      // 주소로 geocoding
      geocoder.geocode({ address: notice.address }, (results, status) => {
        geocodedCount++;
        if (status === "OK" && results?.[0]) {
          const location = results[0].geometry.location;
          addMarker(
            notice,
            { lat: location.lat(), lng: location.lng() },
            map,
            bounds
          );
        }
        if (geocodedCount === noticesWithAddress.length && geocodedCount > 0) {
          map.fitBounds(bounds, { top: 60, bottom: 100, left: 20, right: 20 });
        }
      });
    });

    if (noticesWithAddress.length === 0) {
      map.setCenter(DEFAULT_CENTER);
      map.setZoom(DEFAULT_ZOOM);
    }
  }, [notices, onNoticeSelect]);

  const addMarker = useCallback(
    (
      notice: Notice,
      position: { lat: number; lng: number },
      map: google.maps.Map,
      bounds: google.maps.LatLngBounds
    ) => {
      const color = ORG_MARKER_COLORS[notice.organization] ?? ORG_MARKER_COLORS["기타"];

      // 커스텀 마커 엘리먼트
      const pinEl = document.createElement("div");
      pinEl.innerHTML = `
        <div style="
          background: ${color};
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          cursor: pointer;
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
        ">${notice.organization}</div>
      `;

      const marker = new google.maps.marker.AdvancedMarkerElement({
        position,
        map,
        content: pinEl,
        title: notice.title,
      });

      marker.addListener("click", () => {
        onNoticeSelect(notice);
        infoWindowRef.current?.setContent(`
          <div style="max-width:240px;font-family:system-ui">
            <div style="font-size:11px;color:#6B7280;margin-bottom:4px">${notice.organization} · ${notice.region} · ${notice.type}</div>
            <div style="font-size:13px;font-weight:700;margin-bottom:4px">${notice.title}</div>
            ${notice.address ? `<div style="font-size:11px;color:#9CA3AF">📍 ${notice.address}</div>` : ""}
          </div>
        `);
        infoWindowRef.current?.open(map, marker);
      });

      markersRef.current.push(marker);
      bounds.extend(position);
    },
    [onNoticeSelect]
  );

  useEffect(() => {
    if (mapLoaded && googleMapRef.current) {
      updateMarkers();
    }
  }, [mapLoaded, updateMarkers]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
