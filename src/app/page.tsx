"use client";

import { useState, useEffect, useCallback } from "react";
import { Notice, Region, NoticeType, Organization } from "@/lib/types";
import { filterNotices, formatDate, getStatusColor, getOrgColor } from "@/lib/utils";
import GoogleMap from "@/components/GoogleMap";
import NoticeCard from "@/components/NoticeCard";
import FilterBar from "@/components/FilterBar";

interface ApiResponse {
  notices: Notice[];
  total: number;
  errors?: string[];
  fetchedAt: string;
}

export default function HomePage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [showList, setShowList] = useState(false);

  const [regions, setRegions] = useState<Region[]>([]);
  const [types, setTypes] = useState<NoticeType[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [keyword, setKeyword] = useState("");

  const fetchNotices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/notices");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: ApiResponse = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "데이터를 불러올 수 없습니다");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const filtered = data
    ? filterNotices(data.notices, { regions, types, organizations, keyword })
    : [];

  const activeFilterCount =
    regions.length + types.length + organizations.length + (keyword ? 1 : 0);

  return (
    <div className="fixed inset-0 flex flex-col">
      {/* 상단 헤더 */}
      <header className="z-40 bg-white/95 backdrop-blur-lg border-b border-gray-200 px-4 pt-[env(safe-area-inset-top)] pb-2">
        <div className="flex items-center justify-between py-2">
          <div>
            <h1 className="text-lg font-black tracking-tight">🏠 House Alert</h1>
            <p className="text-[10px] text-gray-400">수도권 공공주택 공고</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`relative px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                showFilters || activeFilterCount > 0
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              필터
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowList(!showList)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                showList
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {showList ? "지도" : "목록"}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="pb-2">
            <FilterBar
              regions={regions}
              types={types}
              organizations={organizations}
              keyword={keyword}
              onRegionsChange={setRegions}
              onTypesChange={setTypes}
              onOrganizationsChange={setOrganizations}
              onKeywordChange={setKeyword}
            />
          </div>
        )}

        {/* 공고 수 표시 */}
        {!loading && data && (
          <div className="flex items-center justify-between pb-1">
            <p className="text-[11px] text-gray-400">
              총 <span className="font-bold text-gray-700">{filtered.length}</span>건
              {activeFilterCount > 0 && ` (전체 ${data.total}건)`}
            </p>
            {data.errors && data.errors.length > 0 && (
              <p className="text-[10px] text-orange-500">⚠️ 일부 API 오류</p>
            )}
          </div>
        )}
      </header>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-30">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm text-gray-400">공고 데이터 수집 중...</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-30">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center mx-4">
              <p className="text-sm text-red-600 mb-2">{error}</p>
              <button
                onClick={fetchNotices}
                className="text-xs bg-red-600 text-white px-4 py-1.5 rounded-lg"
              >
                다시 시도
              </button>
            </div>
          </div>
        )}

        {/* 지도 뷰 */}
        {!showList && (
          <GoogleMap
            notices={filtered}
            onNoticeSelect={setSelectedNotice}
            selectedId={selectedNotice?.id}
          />
        )}

        {/* 목록 뷰 */}
        {showList && (
          <div className="h-full overflow-y-auto px-4 py-3 space-y-3 pb-24">
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-sm text-gray-400">
                  {activeFilterCount > 0
                    ? "필터 조건에 맞는 공고가 없습니다"
                    : "현재 수도권 공고가 없습니다"}
                </p>
              </div>
            ) : (
              filtered.map((notice) => (
                <NoticeCard key={notice.id} notice={notice} />
              ))
            )}
          </div>
        )}

        {/* 하단 선택된 공고 카드 (지도 모드에서) */}
        {!showList && selectedNotice && (
          <div className="absolute bottom-20 left-4 right-4 z-30">
            <NoticeCard notice={selectedNotice} />
          </div>
        )}
      </div>
    </div>
  );
}
