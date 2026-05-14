"use client";

import { useState, useEffect, useCallback } from "react";
import { Notice, Region, NoticeType, Organization } from "@/lib/types";
import { filterNotices } from "@/lib/utils";
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
    <div className="max-w-lg mx-auto px-4">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-gray-50/90 backdrop-blur-lg pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-black tracking-tight">🏠 House Alert</h1>
            <p className="text-xs text-gray-400">수도권 공공주택 공고 모아보기</p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`relative px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              showFilters || activeFilterCount > 0
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            필터
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
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
        )}
      </header>

      {/* 상태 표시 */}
      {!loading && data && (
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-gray-400">
            총 <span className="font-bold text-gray-700">{filtered.length}</span>건
            {activeFilterCount > 0 && ` (전체 ${data.total}건)`}
          </p>
          {data.errors && data.errors.length > 0 && (
            <p className="text-[10px] text-orange-500">⚠️ 일부 API 오류</p>
          )}
        </div>
      )}

      {/* 로딩 */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm text-gray-400">공고 데이터 수집 중...</p>
        </div>
      )}

      {/* 에러 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-sm text-red-600 mb-2">{error}</p>
          <button
            onClick={fetchNotices}
            className="text-xs bg-red-600 text-white px-4 py-1.5 rounded-lg"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* 공고 목록 */}
      {!loading && !error && (
        <div className="space-y-3 pb-4">
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
    </div>
  );
}
