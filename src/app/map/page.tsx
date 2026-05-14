"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Notice } from "@/lib/types";
import { getOrgColor } from "@/lib/utils";

// 수도권 중심 좌표
const DEFAULT_CENTER = { lat: 37.5, lng: 127.0 };
const DEFAULT_ZOOM = 10;

// 기관별 마커 색상
const ORG_MARKER_COLOR: Record<string, string> = {
  LH: "#4f46e5",
  SH: "#9333ea",
  iH: "#14b8a6",
  GH: "#f97316",
  기타: "#6b7280",
};

function MapContent() {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("id");

  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  // Google Maps 스크립트 로드
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || document.getElementById("google-maps-script")) {
      if (window.google?.maps) setMapReady(true);
      return;
    }

    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker&v=weekly&language=ko`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapReady(true);
    document.head.appendChild(script);
  }, []);

  // 공고 데이터 로드
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/notices");
        const data = await res.json();
        setNotices(data.notices ?? []);

        if (highlightId) {
          const found = data.notices?.find(
            (n: Notice) => n.id === decodeURIComponent(highlightId)
          );
          if (found) setSelectedNotice(found);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [highlightId]);

  // 지도 초기화
  useEffect(() => {
    if (!mapReady || !mapRef.current || googleMapRef.current) return;

    googleMapRef.current = new google.maps.Map(mapRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      mapId: "house-alert-map",
      disableDefaultUI: true,
      zoomControl: true,
      gestureHandling: "greedy",
    });
    geocoderRef.current = new google.maps.Geocoder();
  }, [mapReady]);

  // 마커 생성 함수
  const addMarker = useCallback(
    (notice: Notice, position: google.maps.LatLngLiteral) => {
      if (!googleMapRef.current) return;

      const color = ORG_MARKER_COLOR[notice.organization] ?? "#6b7280";

      const pin = new google.maps.marker.PinElement({
        background: color,
        borderColor: color,
        glyphColor: "#fff",
      });

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map: googleMapRef.current,
        position,
        title: notice.title,
        content: pin.element,
      });

      marker.addListener("click", () => {
        setSelectedNotice(notice);
        googleMapRef.current?.panTo(position);
      });

      markersRef.current.push(marker);
    },
    []
  );

  // 주소 → 좌표 변환 + 마커 배치
  useEffect(() => {
    if (!mapReady || !googleMapRef.current || !geocoderRef.current || loading)
      return;

    // 기존 마커 제거
    markersRef.current.forEach((m) => (m.map = null));
    markersRef.current = [];

    const withCoords = notices.filter((n) => n.lat && n.lng);
    const withAddress = notices.filter((n) => !n.lat && !n.lng && n.address);

    // 좌표 있는 공고는 바로 마커
    withCoords.forEach((n) => {
      addMarker(n, { lat: n.lat!, lng: n.lng! });
    });

    // 주소만 있는 공고는 지오코딩 (최대 10개, API 쿼터 보호)
    withAddress.slice(0, 10).forEach((n) => {
      geocoderRef.current!.geocode({ address: n.address }, (results, status) => {
        if (status === "OK" && results?.[0]) {
          const loc = results[0].geometry.location;
          addMarker(n, { lat: loc.lat(), lng: loc.lng() });
        }
      });
    });

    // 하이라이트 공고로 포커스
    if (selectedNotice?.lat && selectedNotice?.lng) {
      googleMapRef.current.panTo({
        lat: selectedNotice.lat,
        lng: selectedNotice.lng,
      });
      googleMapRef.current.setZoom(14);
    }
  }, [mapReady, notices, loading, selectedNotice, addMarker]);

  if (loading || !mapReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)]">
      {/* 지도 영역 */}
      <div ref={mapRef} className="flex-1 w-full" />

      {/* 하단 패널 */}
      <div className="bg-white border-t max-h-[40%] overflow-y-auto">
        {/* 선택된 공고 */}
        {selectedNotice && (
          <div className="bg-blue-50 border-b border-blue-200 p-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${getOrgColor(selectedNotice.organization)}`}
                  >
                    {selectedNotice.organization}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {selectedNotice.region}
                  </span>
                </div>
                <p className="text-sm font-bold text-gray-900 line-clamp-2">
                  {selectedNotice.title}
                </p>
                {selectedNotice.address && (
                  <p className="text-xs text-gray-500 mt-1">
                    📍 {selectedNotice.address}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedNotice(null)}
                className="ml-2 text-gray-400 text-lg"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* 공고 목록 */}
        <div className="divide-y divide-gray-50">
          {notices
            .filter((n) => n.address || (n.lat && n.lng))
            .map((notice) => (
              <button
                key={notice.id}
                onClick={() => setSelectedNotice(notice)}
                className={`w-full text-left p-3 flex items-center gap-3 hover:bg-gray-50 ${
                  selectedNotice?.id === notice.id ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${getOrgColor(notice.organization)}`}
                    >
                      {notice.organization}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {notice.region}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-gray-900 truncate">
                    {notice.title}
                  </p>
                  {notice.address && (
                    <p className="text-[11px] text-gray-400 truncate">
                      {notice.address}
                    </p>
                  )}
                </div>
                <span className="shrink-0 text-lg">📍</span>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}

export default function MapPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <MapContent />
    </Suspense>
  );
}
