"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Notice } from "@/lib/types";
import {
  formatDate,
  getStatusColor,
  getOrgColor,
  getNaverMapUrl,
  getKakaoMapUrl,
} from "@/lib/utils";

export default function NoticeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/notices");
        const data = await res.json();
        const found = data.notices?.find(
          (n: Notice) => n.id === decodeURIComponent(params.id as string)
        );
        setNotice(found ?? null);
      } catch {
        setNotice(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!notice) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <p className="text-4xl">😢</p>
        <p className="text-sm text-gray-500">공고를 찾을 수 없습니다</p>
        <button
          onClick={() => router.back()}
          className="text-sm text-blue-600 underline"
        >
          돌아가기
        </button>
      </div>
    );
  }

  const hasCoords = notice.lat && notice.lng;

  return (
    <div className="max-w-lg mx-auto">
      {/* 상단 바 */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-lg border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900"
        >
          ← 뒤로
        </button>
        <h1 className="text-sm font-semibold truncate flex-1">공고 상세</h1>
      </div>

      {/* 콘텐츠 */}
      <div className="px-4 py-5 space-y-5 pb-28">
        {/* 배지 */}
        <div className="flex gap-2 flex-wrap">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getOrgColor(notice.organization)}`}>
            {notice.organization}
          </span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusColor(notice.status)}`}>
            {notice.status}
          </span>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
            {notice.type}
          </span>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
            {notice.region}
          </span>
        </div>

        {/* 제목 */}
        <h2 className="text-lg font-bold leading-snug text-gray-900">
          {notice.title}
        </h2>

        {/* 정보 테이블 */}
        <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
          {notice.address && (
            <InfoRow label="📍 위치" value={notice.address} />
          )}
          {notice.announceDate && (
            <InfoRow label="📅 공고일" value={formatDate(notice.announceDate)} />
          )}
          {notice.applyStartDate && (
            <InfoRow
              label="📝 접수기간"
              value={`${formatDate(notice.applyStartDate)} ~ ${formatDate(notice.applyEndDate)}`}
            />
          )}
          {notice.supplyCount && (
            <InfoRow label="🏢 공급세대" value={`${notice.supplyCount}세대`} />
          )}
        </div>

        {/* 지도 링크 */}
        {(hasCoords || notice.address) && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-400">외부 지도에서 보기</p>
            <div className="flex gap-2">
              <a
                href={
                  hasCoords
                    ? getNaverMapUrl(notice.lat!, notice.lng!, notice.title)
                    : `https://map.naver.com/v5/search/${encodeURIComponent(notice.address || notice.title)}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center py-2.5 bg-green-500 text-white text-sm font-medium rounded-xl hover:bg-green-600 transition-colors"
              >
                네이버 지도
              </a>
              <a
                href={
                  hasCoords
                    ? getKakaoMapUrl(notice.lat!, notice.lng!, notice.title)
                    : `https://map.kakao.com/link/search/${encodeURIComponent(notice.address || notice.title)}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center py-2.5 bg-yellow-400 text-yellow-900 text-sm font-medium rounded-xl hover:bg-yellow-500 transition-colors"
              >
                카카오 지도
              </a>
            </div>
          </div>
        )}
      </div>

      {/* 하단 고정 버튼 3개 */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="max-w-lg mx-auto flex gap-2">
          {notice.detailUrl && (
            <a
              href={notice.detailUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              📄 공고문 보기
            </a>
          )}
          <button
            onClick={() => router.push(`/map?id=${encodeURIComponent(notice.id)}`)}
            className="flex-1 text-center py-3 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-colors"
          >
            🗺️ 지도에서 보기
          </button>
          {notice.detailUrl && (
            <a
              href={notice.detailUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-black transition-colors"
            >
              🔗 해당 공고로
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-xs text-gray-500 whitespace-nowrap min-w-[72px]">
        {label}
      </span>
      <span className="text-sm text-gray-800 font-medium">{value}</span>
    </div>
  );
}
