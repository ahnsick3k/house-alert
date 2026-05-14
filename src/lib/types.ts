// 공통 타입 정의 — 각 기관 API 응답을 통일된 형태로 변환

export interface Notice {
  id: string;
  title: string;
  organization: Organization;
  type: NoticeType;
  status: NoticeStatus;
  region: Region;
  address?: string;
  lat?: number;
  lng?: number;
  applyStartDate?: string;
  applyEndDate?: string;
  announceDate?: string;
  supplyCount?: number;
  detailUrl?: string;
  rawData?: Record<string, unknown>;
}

export type Organization = "LH" | "SH" | "iH" | "GH" | "기타";

export type NoticeType = "분양" | "임대" | "신혼희망타운" | "공공지원민간임대" | "기타";

export type NoticeStatus = "공고중" | "접수중" | "접수마감" | "기타";

export type Region = "서울" | "경기" | "인천";

export const REGIONS: Region[] = ["서울", "경기", "인천"];

export const ORGANIZATIONS: Organization[] = ["LH", "SH", "iH", "GH", "기타"];

export const NOTICE_TYPES: NoticeType[] = ["분양", "임대", "신혼희망타운", "공공지원민간임대", "기타"];

export interface UserProfile {
  regions: Region[];
  noticeTypes: NoticeType[];
  householdType: string;
  incomeLevel: string;
}

export const DEFAULT_PROFILE: UserProfile = {
  regions: ["서울", "경기", "인천"],
  noticeTypes: ["분양", "임대"],
  householdType: "",
  incomeLevel: "",
};

export interface FilterState {
  regions: Region[];
  types: NoticeType[];
  organizations: Organization[];
  status: NoticeStatus | "전체";
  keyword: string;
}
