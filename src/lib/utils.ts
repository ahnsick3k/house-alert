import { Notice, Region, NoticeType, NoticeStatus, Organization } from "./types";

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
    case "공고중":
      return "bg-blue-100 text-blue-800";
    case "접수중":
      return "bg-green-100 text-green-800";
    case "접수마감":
      return "bg-gray-100 text-gray-500";
    default:
      return "bg-yellow-100 text-yellow-800";
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
    if (filters.keyword && !n.title.includes(filters.keyword)) return false;
    return true;
  });
}
