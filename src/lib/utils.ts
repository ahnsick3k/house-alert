import { Notice, Region, NoticeType, NoticeStatus, Organization, DepositConversion } from "./types";

// 수도권 지역 코드 매핑 (LH API 기준)
export const REGION_CODES: Record<Region, string[]> = {
  서울: ["11"],
  경기: ["41"],
  인천: ["28"],
};

export function formatDate(dateStr?: string): string {
  if (!dateStr) return "-";
  try {
    if (dateStr.length === 8) {
      return `${dateStr.slice(0, 4)}.${dateStr.slice(4, 6)}.${dateStr.slice(6, 8)}`;
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("ko-KR");
  } catch {
    return dateStr;
  }
}

export function getStatusColor(status: NoticeStatus): string {
  switch (status) {
    case "공고예정":
      return "bg-yellow-100 text-yellow-800";
    case "공고중":
      return "bg-blue-100 text-blue-800";
    case "신청중":
      return "bg-green-100 text-green-800";
    case "서류심사중":
      return "bg-purple-100 text-purple-800";
    case "당첨":
      return "bg-emerald-100 text-emerald-800";
    case "낙첨":
      return "bg-red-100 text-red-800";
    case "접수마감":
      return "bg-gray-100 text-gray-500";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

export function getOrgColor(org: Organization): string {
  switch (org) {
    case "LH":
      return "bg-indigo-100 text-indigo-800";
    case "SH":
      return "bg-purple-100 text-purple-800";
    case "iH":
      return "bg-teal-100 text-teal-800";
    case "GH":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

export function getTypeLabel(type: NoticeType): string {
  return type;
}

export function getGoogleMapUrl(lat: number, lng: number, name: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${encodeURIComponent(name)}`;
}

export function filterNotices(
  notices: Notice[],
  filters: {
    regions?: Region[];
    types?: NoticeType[];
    organizations?: Organization[];
    status?: NoticeStatus | "전체";
    keyword?: string;
  }
): Notice[] {
  return notices.filter((n) => {
    if (filters.regions?.length && !filters.regions.includes(n.region)) return false;
    if (filters.types?.length && !filters.types.includes(n.type)) return false;
    if (filters.organizations?.length && !filters.organizations.includes(n.organization))
      return false;
    if (filters.status && filters.status !== "전체" && n.status !== filters.status) return false;
    if (filters.keyword && !n.title.toLowerCase().includes(filters.keyword.toLowerCase())) return false;
    return true;
  });
}

// m² → 평 변환
export function sqmToPyeong(sqm: number): number {
  return Math.round(sqm * 0.3025 * 100) / 100;
}

// 금액 포맷 (천원 → 억/만원)
export function formatMoney(thousandWon?: number): string {
  if (!thousandWon) return "-";
  const man = thousandWon / 10; // 만원 단위
  if (man >= 10000) {
    const eok = Math.floor(man / 10000);
    const remainder = man % 10000;
    return remainder > 0 ? `${eok}억 ${remainder.toLocaleString()}만` : `${eok}억`;
  }
  return `${man.toLocaleString()}만`;
}

// 보증금 ↔ 월세 전환 계산
export function calculateDepositConversion(
  deposit: number,       // 보증금 (천원)
  conversionRate: number  // 전환율 (%, 예: 2.5)
): DepositConversion {
  const monthlyRent = Math.round((deposit * (conversionRate / 100)) / 12);
  return {
    baseDeposit: deposit,
    conversionRate,
    convertedMonthlyRent: monthlyRent,
    convertedDeposit: deposit,
  };
}

// 월세를 보증금으로 전환
export function monthlyRentToDeposit(
  monthlyRent: number,   // 월세 (천원)
  conversionRate: number  // 전환율 (%)
): number {
  return Math.round((monthlyRent * 12) / (conversionRate / 100));
}

// 공고 상태 자동 결정 (날짜 기반)
export function determineNoticeStatus(notice: {
  announceDate?: string;
  applyStartDate?: string;
  applyEndDate?: string;
  panSs?: string;
}): NoticeStatus {
  const now = new Date();
  const today = now.toISOString().slice(0, 10).replace(/-/g, "");

  // API에서 직접 상태를 제공하는 경우
  const raw = notice.panSs ?? "";
  if (raw.includes("예정")) return "공고예정";
  if (raw.includes("접수") && !raw.includes("마감")) return "신청중";
  if (raw.includes("심사")) return "서류심사중";
  if (raw.includes("당첨")) return "당첨";
  if (raw.includes("낙첨") || raw.includes("미당첨")) return "낙첨";
  if (raw.includes("마감")) return "접수마감";

  // 날짜 기반 자동 판단
  const announce = notice.announceDate?.replace(/\D/g, "").slice(0, 8) ?? "";
  const start = notice.applyStartDate?.replace(/\D/g, "").slice(0, 8) ?? "";
  const end = notice.applyEndDate?.replace(/\D/g, "").slice(0, 8) ?? "";

  if (announce && announce > today) return "공고예정";
  if (start && start > today) return "공고중";
  if (start && end && start <= today && end >= today) return "신청중";
  if (end && end < today) return "접수마감";

  return "공고중";
}
