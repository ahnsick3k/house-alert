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
  // 상세 데이터 (상세페이지용)
  complexes?: ComplexInfo[];
  schedule?: ScheduleInfo;
  contactInfo?: ContactInfo;
}

export type Organization = "LH" | "SH" | "iH" | "GH" | "기타";

export type NoticeType = "분양" | "임대" | "신혼희망타운" | "공공지원민간임대" | "기타";

export type NoticeStatus =
  | "공고예정"
  | "공고중"
  | "신청중"
  | "서류심사중"
  | "당첨"
  | "낙첨"
  | "접수마감"
  | "기타";

export type Region = "서울" | "경기" | "인천";

export const REGIONS: Region[] = ["서울", "경기", "인천"];

export const ORGANIZATIONS: Organization[] = ["LH", "SH", "iH", "GH", "기타"];

export const NOTICE_TYPES: NoticeType[] = ["분양", "임대", "신혼희망타운", "공공지원민간임대", "기타"];

export const NOTICE_STATUSES: NoticeStatus[] = [
  "공고예정", "공고중", "신청중", "서류심사중", "당첨", "낙첨", "접수마감",
];

// 단지(Complex) 정보 — 하나의 공고에 여러 단지 포함 가능
export interface ComplexInfo {
  id: string;
  name: string;            // 단지 이름 (예: 엘리프 미아역)
  address: string;         // 주소 (예: 강북구 미아동)
  lat?: number;
  lng?: number;
  units: UnitTypeInfo[];   // 주택형별 정보
  heatingType?: string;    // 난방방식
  moveInDate?: string;     // 입주시작(예정)
}

// 주택형(Unit Type) 정보
export interface UnitTypeInfo {
  housingType: string;     // 주택형 (예: 59)
  exclusiveArea: number;   // 전용면적 (m²)
  exclusiveAreaPy?: number; // 전용면적 (평)
  supplyCount: number;     // 공급세대수
  supplyCountGeneral?: number;  // 일반공급
  supplyCountPriority?: number; // 우선공급
  floorPlanUrl?: string;   // 평면도 이미지 URL
  // 금액 정보
  deposit?: number;        // 전세보증금/분양가 (천원)
  contractDeposit?: number; // 계약금 (천원)
  balance?: number;        // 잔금 (천원)
  monthlyRent?: number;    // 월세 (천원)
  // 면적 정보
  contractArea?: number;   // 계약면적 합계 (m²)
  residentialExclusive?: number; // 주거전용 (m²)
  residentialCommon?: number;    // 주거공용 (m²)
  otherCommon?: number;          // 기타공용 (m²)
}

// 공급일정
export interface ScheduleInfo {
  applicationPeriod?: string;    // 접수기간
  applicationPeriod1st?: string; // 1순위 접수기간
  applicationPeriod2nd?: string; // 2순위 접수기간
  documentAnnouncementDate?: string; // 서류제출 대상자 발표일
  documentSubmitPeriod?: string;     // 서류 접수기간
  winnerAnnouncementDate?: string;   // 당첨자 발표일
  contractPeriod?: string;           // 계약기간
}

// 접수처 정보
export interface ContactInfo {
  phone?: string;           // 전화번호
  address?: string;         // 접수처 주소
  website?: string;         // 웹사이트
  operatingHours?: string;  // 운영시간
}

// 보증금 전환 계산
export interface DepositConversion {
  baseDeposit: number;       // 기준 보증금 (천원)
  conversionRate: number;    // 전환율 (%)
  convertedMonthlyRent: number; // 전환 월세 (천원)
  convertedDeposit: number;  // 전환 보증금 (천원)
}

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
