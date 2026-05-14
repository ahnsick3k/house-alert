"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Notice } from "@/lib/types";
import { getOrgColor } from "@/lib/utils";

function MapContent() {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("id");
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

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

  // 주소 기반 지도 검색 링크
  const getMapSearchUrl = (notice: Notice) => {
    const query = notice.address || notice.title;
    return `https://map.naver.com/v5/search/${encodeURIComponent(query)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const withAddress = notices.filter((n) => n.address);

  return (
    <div className="max-w-lg mx-auto px-4 pt-4">
      <header className="mb-4">
        <h1 className="text-xl font-black tracking-tight">🗺️ 지도</h1>
        <p className="text-xs text-gray-400">공고 위치를 지도에서 확인하세요</p>
      </header>

      {/* 선택된 공고 하이라이트 */}
      {selectedNotice && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-4">
          <p className="text-xs text-blue-600 font-medium mb-1">선택된 공고</p>
          <p className="text-sm font-bold text-gray-900 mb-2">
            {selectedNotice.title}
          </p>
          {selectedNotice.address && (
            <p className="text-xs text-gray-500 mb-3">
              📍 {selectedNotice.address}
            </p>
          )}
          <div className="flex gap-2">
            <a
              href={getMapSearchUrl(selectedNotice)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center py-2 bg-green-500 text-white text-xs font-medium rounded-xl"
            >
              네이버 지도
            </a>
            <a
              href={`https://map.kakao.com/link/search/${encodeURIComponent(selectedNotice.address || selectedNotice.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center py-2 bg-yellow-400 text-yellow-900 text-xs font-medium rounded-xl"
            >
              카카오 지도
            </a>
          </div>
        </div>
      )}

      {/* 공고 위치 목록 */}
      <div className="space-y-2 pb-4">
        {withAddress.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🗺️</p>
            <p className="text-sm text-gray-400">위치 정보가 있는 공고가 없습니다</p>
          </div>
        ) : (
          withAddress.map((notice) => (
            <div
              key={notice.id}
              className={`bg-white rounded-xl border p-3 flex items-center gap-3 ${
                selectedNotice?.id === notice.id
                  ? "border-blue-400 ring-2 ring-blue-100"
                  : "border-gray-100"
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${getOrgColor(notice.organization)}`}>
                    {notice.organization}
                  </span>
                  <span className="text-[10px] text-gray-400">{notice.region}</span>
                </div>
                <p className="text-xs font-semibold text-gray-900 truncate">
                  {notice.title}
                </p>
                <p className="text-[11px] text-gray-400 truncate">
                  {notice.address}
                </p>
              </div>
              <a
                href={getMapSearchUrl(notice)}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 w-9 h-9 bg-green-50 text-green-600 rounded-lg flex items-center justify-center text-lg hover:bg-green-100"
              >
                📍
              </a>
            </div>
          ))
        )}
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
