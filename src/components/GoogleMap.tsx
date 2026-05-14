"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Notice } from "@/lib/types";
import { loadGoogleMaps } from "@/lib/google-maps-loader";

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };
const DEFAULT_ZOOM = 10;

const ORG_MARKER_COLORS: Record<string, string> = {
  LH: "#4F46E5",
  SH: "#7C3AED",
  iH: "#0D9488",
  GH: "#EA580C",
  기타: "#6B7280",
};

interface GoogleMapProps {
  notices: Notice[];
  onNoticeSelect: (notice: Notice) => void;
  selectedId?: string;
}

export default function GoogleMap({ notices, onNoticeSelect, selectedId }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Google Maps 로드
  useEffect(() => {
    loadGoogleMaps()
      .then(() => setMapLoaded(true))
      .catch((err) => setMapError(err.message));
  }, []);

  // 지도 초기화
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || googleMapRef.current) return;

    googleMapRef.current = new google.maps.Map(mapRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      disableDefaultUI: false,
      zoomControl: true,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: false,
    });

    infoWindowRef.current = new google.maps.InfoWindow();
  }, [mapLoaded]);

  const addMarker = useCallback(
    (
      notice: Notice,
      position: { lat: number; lng: number },
      map: google.maps.Map,
      bounds: google.maps.LatLngBounds
    ) => {
      const color = ORG_MARKER_COLORS[notice.organization] ?? ORG_MARKER_COLORS["기타"];

      // SVG 마커 아이콘
      const svgIcon = {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
            <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 24 16 24s16-12 16-24C32 7.16 24.84 0 16 0z" fill="${color}"/>
            <circle cx="16" cy="16" r="8" fill="white" opacity="0.9"/>
            <text x="16" y="20" text-anchor="middle" font-size="10" font-weight="bold" fill="${color}">${notice.organization.charAt(0)}</text>
          </svg>`
        )}`,
        scaledSize: new google.maps.Size(32, 40),
        anchor: new google.maps.Point(16, 40),
      };

      const marker = new google.maps.Marker({
        position,
        map,
        icon: svgIcon,
        title: notice.title,
      });

      marker.addListener("click", () => {
        onNoticeSelect(notice);
        infoWindowRef.current?.setContent(`
          <div style="max-width:240px;font-family:system-ui;padding:4px">
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

  // 마커 업데이트
  const updateMarkers = useCallback(() => {
    const map = googleMapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const bounds = new google.maps.LatLngBounds();
    const geocoder = new google.maps.Geocoder();
    let pending = 0;

    const withCoords = notices.filter((n) => n.lat && n.lng);
    const withAddress = notices.filter((n) => !n.lat && !n.lng && n.address);

    // 좌표 있는 건 바로 마커
    withCoords.forEach((n) => addMarker(n, { lat: n.lat!, lng: n.lng! }, map, bounds));

    // 주소만 있으면 지오코딩 (최대 10개, rate limit 보호)
    const toGeocode = withAddress.slice(0, 10);
    pending = toGeocode.length;

    if (pending === 0 && withCoords.length > 0) {
      map.fitBounds(bounds, { top: 60, bottom: 100, left: 20, right: 20 });
    } else if (pending === 0) {
      map.setCenter(DEFAULT_CENTER);
      map.setZoom(DEFAULT_ZOOM);
    }

    toGeocode.forEach((n, i) => {
      // 딜레이로 rate limit 방지
      setTimeout(() => {
        geocoder.geocode({ address: n.address }, (results, status) => {
          pending--;
          if (status === "OK" && results?.[0]) {
            addMarker(n, {
              lat: results[0].geometry.location.lat(),
              lng: results[0].geometry.location.lng(),
            }, map, bounds);
          }
          if (pending === 0 && markersRef.current.length > 0) {
            map.fitBounds(bounds, { top: 60, bottom: 100, left: 20, right: 20 });
          }
        });
      }, i * 200);
    });
  }, [notices, addMarker]);

  useEffect(() => {
    if (mapLoaded && googleMapRef.current) {
      updateMarkers();
    }
  }, [mapLoaded, updateMarkers]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
      {!mapLoaded && !mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center px-6">
            <p className="text-3xl mb-2">🗺️</p>
            <p className="text-sm text-gray-500">{mapError}</p>
          </div>
        </div>
      )}
    </div>
  );
}
