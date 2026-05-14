"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Notice, ComplexInfo, ScheduleInfo } from "@/lib/types";
import {
  formatDate,
  getStatusColor,
  getOrgColor,
  formatMoney,
  calculateDepositConversion,
} from "@/lib/utils";
import { loadGoogleMaps } from "@/lib/google-maps-loader";

export default function NoticeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [complexes, setComplexes] = useState<ComplexInfo[]>([]);
  const [schedule, setSchedule] = useState<ScheduleInfo>({});
  const [contactInfo, setContactInfo] = useState<Notice["contactInfo"]>(undefined);
  const [loading, setLoading] = useState(true);
  const [expandedComplex, setExpandedComplex] = useState<string | null>(null);
  const [conversionRate, setConversionRate] = useState(2.5);

  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [listRes, detailRes] = await Promise.all([
          fetch("/api/notices"),
          fetch(`/api/notices/${encodeURIComponent(params.id as string)}`),
        ]);
        const data = await listRes.json();
        const found = data.notices?.find(
          (n: Notice) => n.id === decodeURIComponent(params.id as string)
        );
        setNotice(found ?? null);

        if (detailRes.ok) {
          const detailData = await detailRes.json();
          if (detailData.complexes?.length) {
            setComplexes(detailData.complexes);
            setExpandedComplex(detailData.complexes[0]?.id);
          }
          if (detailData.schedule) setSchedule(detailData.schedule);
          if (detailData.contactInfo) setContactInfo(detailData.contactInfo);
        }
      } catch {
        setNotice(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  // 지도 로드 — 공유 로더 사용
  useEffect(() => {
    loadGoogleMaps()
      .then(() => setMapReady(true))
      .catch(() => {});
  }, []);

  // 지도 초기화
  useEffect(() => {
    if (!mapReady || !mapRef.current || googleMapRef.current) return;
    googleMapRef.current = new google.maps.Map(mapRef.current, {
      center: { lat: 37.5665, lng: 126.978 },
      zoom: 12,
      disableDefaultUI: true,
      zoomControl: true,
    });
  }, [mapReady]);

  const moveMapToComplex = useCallback((complex: ComplexInfo) => {
    const map = googleMapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: complex.address || complex.name }, (results, status) => {
      if (status === "OK" && results?.[0]) {
        const loc = results[0].geometry.location;
        map.setCenter(loc);
        map.setZoom(15);

        const marker = new google.maps.Marker({
          position: loc,
          map,
          title: complex.name,
          label: { text: complex.name.charAt(0), color: "white", fontWeight: "bold" },
        });
        markersRef.current.push(marker);
      }
    });
  }, []);

  useEffect(() => {
    if (expandedComplex && mapReady && googleMapRef.current) {
      const complex = complexes.find((c) => c.id === expandedComplex);
      if (complex) moveMapToComplex(complex);
    }
  }, [expandedComplex, complexes, moveMapToComplex, mapReady]);

  // 공고 주소로 초기 지도 위치 (단지 정보 없을 때)
  useEffect(() => {
    if (notice?.address && mapReady && googleMapRef.current && complexes.length === 0) {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: notice.address }, (results, status) => {
        if (status === "OK" && results?.[0]) {
          googleMapRef.current!.setCenter(results[0].geometry.location);
          googleMapRef.current!.setZoom(14);
        }
      });
    }
  }, [notice, complexes]);

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
        <button onClick={() => router.back()} className="text-sm text-blue-600 underline">돌아가기</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* 상단 탭바 */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900 text-sm font-medium">
          ← 뒤로
        </button>
        <h1 className="text-sm font-semibold truncate mx-4 flex-1 text-center">공고 상세</h1>
        {notice.detailUrl && (
          <a href={notice.detailUrl} target="_blank" rel="noopener noreferrer"
            className="text-blue-600 text-sm font-medium whitespace-nowrap">
            공고문 →
          </a>
        )}
      </div>

      {/* 공고 기본 정보 */}
      <div className="bg-white px-4 py-4 border-b border-gray-100">
        <div className="flex gap-1.5 flex-wrap mb-2">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getOrgColor(notice.organization)}`}>
            {notice.organization}
          </span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusColor(notice.status)}`}>
            {notice.status}
          </span>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">{notice.type}</span>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">{notice.region}</span>
        </div>
        <h2 className="text-base font-bold leading-snug text-gray-900">{notice.title}</h2>
      </div>

      {/* 지도 */}
      <div className="h-48 bg-gray-200">
        <div ref={mapRef} className="w-full h-full" />
      </div>

      <div className="px-4 py-4 space-y-5">
        {/* 단지 목록 아코디언 */}
        {complexes.length > 0 && (
          <Section title="📍 단지 목록">
            <div className="space-y-2">
              {complexes.map((complex) => (
                <div key={complex.id} className="border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedComplex(expandedComplex === complex.id ? null : complex.id)}
                    className={`w-full px-4 py-3 flex items-center justify-between text-left transition-colors ${
                      expandedComplex === complex.id ? "bg-blue-50" : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-bold text-gray-900">{complex.name}</p>
                      <p className="text-xs text-gray-500">{complex.address}</p>
                    </div>
                    <span className={`text-gray-400 transition-transform ${expandedComplex === complex.id ? "rotate-180" : ""}`}>
                      ▼
                    </span>
                  </button>

                  {expandedComplex === complex.id && (
                    <div className="border-t border-gray-100 bg-white">
                      {/* 상세스펙 표 */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                              <th className="px-3 py-2 text-left font-semibold text-gray-600">주택형</th>
                              <th className="px-3 py-2 text-left font-semibold text-gray-600">전용면적</th>
                              <th className="px-3 py-2 text-center font-semibold text-gray-600">공급세대수</th>
                              <th className="px-3 py-2 text-center font-semibold text-gray-600">평면도</th>
                            </tr>
                          </thead>
                          <tbody>
                            {complex.units.map((unit, i) => (
                              <tr key={i} className="border-b border-gray-50">
                                <td className="px-3 py-2.5 font-medium text-gray-900">{unit.housingType}</td>
                                <td className="px-3 py-2.5 text-gray-700">
                                  {unit.exclusiveArea}m²
                                  {unit.exclusiveAreaPy && <span className="text-gray-400 ml-1">({unit.exclusiveAreaPy}평)</span>}
                                </td>
                                <td className="px-3 py-2.5 text-center text-gray-700">{unit.supplyCount}</td>
                                <td className="px-3 py-2.5 text-center">
                                  {unit.floorPlanUrl ? (
                                    <a href={unit.floorPlanUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">보기</a>
                                  ) : <span className="text-gray-300">-</span>}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* 공급종류 */}
                      {complex.units.some((u) => u.supplyCountGeneral || u.supplyCountPriority) && (
                        <div className="border-t border-gray-100 overflow-x-auto">
                          <p className="px-3 py-2 text-[11px] font-bold text-gray-500 bg-gray-50">공급종류</p>
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-3 py-2 text-left font-semibold text-gray-600">주택형</th>
                                <th className="px-3 py-2 text-center font-semibold text-gray-600">계</th>
                                <th className="px-3 py-2 text-center font-semibold text-gray-600">일반</th>
                                <th className="px-3 py-2 text-center font-semibold text-gray-600">우선</th>
                              </tr>
                            </thead>
                            <tbody>
                              {complex.units.map((unit, i) => (
                                <tr key={i} className="border-b border-gray-50">
                                  <td className="px-3 py-2.5 font-medium">{unit.housingType}</td>
                                  <td className="px-3 py-2.5 text-center">{unit.supplyCount}</td>
                                  <td className="px-3 py-2.5 text-center">{unit.supplyCountGeneral ?? "-"}</td>
                                  <td className="px-3 py-2.5 text-center">{unit.supplyCountPriority ?? "-"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* 금액 정보 */}
                      {complex.units.some((u) => u.deposit) && (
                        <div className="border-t border-gray-100 overflow-x-auto">
                          <p className="px-3 py-2 text-[11px] font-bold text-gray-500 bg-gray-50">금액 정보 (천원)</p>
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-3 py-2 text-left font-semibold text-gray-600">주택형</th>
                                <th className="px-3 py-2 text-right font-semibold text-gray-600">보증금</th>
                                <th className="px-3 py-2 text-right font-semibold text-gray-600">계약금</th>
                                <th className="px-3 py-2 text-right font-semibold text-gray-600">잔금</th>
                                <th className="px-3 py-2 text-right font-semibold text-gray-600">월세</th>
                              </tr>
                            </thead>
                            <tbody>
                              {complex.units.map((unit, i) => (
                                <tr key={i} className="border-b border-gray-50">
                                  <td className="px-3 py-2.5 font-medium">{unit.housingType}</td>
                                  <td className="px-3 py-2.5 text-right">{formatMoney(unit.deposit)}</td>
                                  <td className="px-3 py-2.5 text-right">{formatMoney(unit.contractDeposit)}</td>
                                  <td className="px-3 py-2.5 text-right">{formatMoney(unit.balance)}</td>
                                  <td className="px-3 py-2.5 text-right">{formatMoney(unit.monthlyRent)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* 계약면적 */}
                      {complex.units.some((u) => u.contractArea) && (
                        <div className="border-t border-gray-100 overflow-x-auto">
                          <p className="px-3 py-2 text-[11px] font-bold text-gray-500 bg-gray-50">세대당 계약면적 (m²)</p>
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-3 py-2 text-left font-semibold text-gray-600">주택형</th>
                                <th className="px-3 py-2 text-right font-semibold text-gray-600">주거전용</th>
                                <th className="px-3 py-2 text-right font-semibold text-gray-600">주거공용</th>
                                <th className="px-3 py-2 text-right font-semibold text-gray-600">기타공용</th>
                                <th className="px-3 py-2 text-right font-semibold text-gray-600">합계</th>
                              </tr>
                            </thead>
                            <tbody>
                              {complex.units.map((unit, i) => (
                                <tr key={i} className="border-b border-gray-50">
                                  <td className="px-3 py-2.5 font-medium">{unit.housingType}</td>
                                  <td className="px-3 py-2.5 text-right">{unit.residentialExclusive ?? "-"}</td>
                                  <td className="px-3 py-2.5 text-right">{unit.residentialCommon ?? "-"}</td>
                                  <td className="px-3 py-2.5 text-right">{unit.otherCommon ?? "-"}</td>
                                  <td className="px-3 py-2.5 text-right font-semibold">{unit.contractArea ?? "-"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* 기타 */}
                      <div className="px-4 py-3 bg-gray-50 text-xs text-gray-500 space-y-1">
                        {complex.heatingType && <p>🔥 난방방식: {complex.heatingType}</p>}
                        {complex.moveInDate && <p>📅 입주시작(예정): {complex.moveInDate}</p>}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* 보증금 전환 계산기 */}
        {complexes.some((c) => c.units.some((u) => u.deposit)) && (
          <Section title="🧮 보증금 전환 계산기">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-3 mb-3">
                <label className="text-xs text-gray-500 whitespace-nowrap">전환율 (%):</label>
                <input
                  type="number"
                  value={conversionRate}
                  onChange={(e) => setConversionRate(parseFloat(e.target.value) || 0)}
                  step="0.5" min="0" max="10"
                  className="w-20 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-3 py-2 text-left font-semibold text-gray-600">단지/형</th>
                      <th className="px-3 py-2 text-right font-semibold text-gray-600">보증금</th>
                      <th className="px-3 py-2 text-right font-semibold text-blue-600">→ 월세전환</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complexes.flatMap((c) =>
                      c.units.filter((u) => u.deposit).map((u, i) => {
                        const conv = calculateDepositConversion(u.deposit!, conversionRate);
                        return (
                          <tr key={`${c.id}-${i}`} className="border-b border-gray-50">
                            <td className="px-3 py-2.5">
                              <span className="font-medium">{c.name}</span>
                              <span className="text-gray-400 ml-1">{u.housingType}</span>
                            </td>
                            <td className="px-3 py-2.5 text-right">{formatMoney(u.deposit)}</td>
                            <td className="px-3 py-2.5 text-right font-semibold text-blue-600">
                              월 {formatMoney(conv.convertedMonthlyRent)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-gray-400 mt-2">* 전환월세 = 보증금 × 전환율 ÷ 12 (실제 조건은 공고문 확인)</p>
            </div>
          </Section>
        )}

        {/* 공급일정 */}
        <Section title="📅 공급일정">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-xs">
              <tbody>
                <ScheduleRow label="접수기간" value={schedule.applicationPeriod || fmtRange(notice.applyStartDate, notice.applyEndDate)} />
                {schedule.applicationPeriod1st && <ScheduleRow label="1순위 접수" value={schedule.applicationPeriod1st} />}
                {schedule.applicationPeriod2nd && <ScheduleRow label="2순위 접수" value={schedule.applicationPeriod2nd} />}
                {schedule.documentAnnouncementDate && <ScheduleRow label="서류제출 대상자 발표" value={schedule.documentAnnouncementDate} />}
                {schedule.documentSubmitPeriod && <ScheduleRow label="서류 접수기간" value={schedule.documentSubmitPeriod} />}
                {schedule.winnerAnnouncementDate && <ScheduleRow label="당첨자 발표일" value={schedule.winnerAnnouncementDate} />}
                {schedule.contractPeriod && <ScheduleRow label="계약기간" value={schedule.contractPeriod} />}
                <ScheduleRow label="공고일" value={formatDate(notice.announceDate)} />
              </tbody>
            </table>
          </div>
        </Section>

        {/* 접수처 정보 */}
        {(contactInfo || notice.contactInfo) && (() => {
          const ci = contactInfo ?? notice.contactInfo!;
          return (
            <Section title="📞 접수처 정보">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-xs">
                  <tbody>
                    {ci.phone && <ScheduleRow label="전화번호" value={ci.phone} />}
                    {ci.address && <ScheduleRow label="접수처 주소" value={ci.address} />}
                  </tbody>
                </table>
              </div>
            </Section>
          );
        })()}

        {/* 기본 정보 */}
        <Section title="ℹ️ 기본정보">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-xs">
              <tbody>
                {notice.address && <ScheduleRow label="위치" value={notice.address} />}
                <ScheduleRow label="공고일" value={formatDate(notice.announceDate)} />
                <ScheduleRow label="접수기간" value={fmtRange(notice.applyStartDate, notice.applyEndDate)} />
                {notice.supplyCount && <ScheduleRow label="공급세대" value={`${notice.supplyCount}세대`} />}
              </tbody>
            </table>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-sm font-bold text-gray-800 mb-2">{title}</h3>
      {children}
    </section>
  );
}

function ScheduleRow({ label, value }: { label: string; value: string }) {
  return (
    <tr className="border-b border-gray-50 last:border-0">
      <td className="px-4 py-3 text-gray-500 font-medium whitespace-nowrap w-[100px] bg-gray-50">{label}</td>
      <td className="px-4 py-3 text-gray-800">{value || "-"}</td>
    </tr>
  );
}

function fmtRange(start?: string, end?: string): string {
  if (!start) return "-";
  return end ? `${formatDate(start)} ~ ${formatDate(end)}` : formatDate(start);
}
