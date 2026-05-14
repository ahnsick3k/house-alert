import { Notice } from "../types";

const BASE = "https://apis.data.go.kr/B552555";
const YEAR = new Date().getFullYear().toString();

function isThisYear(dateStr: string | undefined): boolean {
  if (!dateStr) return true; // 날짜 없으면 포함
  return dateStr.startsWith(YEAR);
}

function parseLHItem(item: Record<string, string>, region: "서울" | "경기" | "인천"): Notice {
  const typeCode = item.UPP_AIS_TP_CD ?? "";
  let noticeType: Notice["type"] = "기타";
  if (typeCode === "05" || item.AIS_TP_CD_NM?.includes("분양")) noticeType = "분양";
  else if (typeCode === "06" || item.AIS_TP_CD_NM?.includes("임대")) noticeType = "임대";
  else if (item.AIS_TP_CD_NM?.includes("신혼")) noticeType = "신혼희망타운";

  let status: Notice["status"] = "기타";
  const panSs = item.PAN_SS ?? "";
  if (panSs.includes("예정")) status = "공고예정";
  else if (panSs.includes("접수") && !panSs.includes("마감")) status = "신청중";
  else if (panSs.includes("심사")) status = "서류심사중";
  else if (panSs.includes("당첨")) status = "당첨";
  else if (panSs.includes("낙첨") || panSs.includes("미당첨")) status = "낙첨";
  else if (panSs.includes("마감")) status = "접수마감";
  else if (panSs.includes("공고")) status = "공고중";

  return {
    id: `lh-${item.PAN_ID ?? "0"}`,
    title: item.PAN_NM ?? "제목 없음",
    organization: "LH",
    type: noticeType,
    status,
    region,
    address: item.CNP_CD_NM ?? "",
    announceDate: item.PAN_NT_ST_DT ?? "",
    applyStartDate: item.RCPT_BGNDT ?? "",
    applyEndDate: item.RCPT_ENDDT ?? "",
    detailUrl: item.DTL_URL ?? `https://apply.lh.or.kr/LH/index.html#/CN/CNPJ03`,
    rawData: item,
  };
}

// LH 분양임대공고문 조회 — 올해 전체 공고 페이지네이션
export async function fetchLHNotices(apiKey: string): Promise<Notice[]> {
  const notices: Notice[] = [];
  const PAGE_SIZE = 100;
  const MAX_PAGES = 10;

  const regionMap: Record<string, "서울" | "경기" | "인천"> = {
    "11": "서울",
    "41": "경기",
    "28": "인천",
  };

  for (const [code, region] of Object.entries(regionMap)) {
    for (let page = 1; page <= MAX_PAGES; page++) {
      try {
        const url = `${BASE}/lhLeaseNoticeInfo1/lhLeaseNoticeInfo1?ServiceKey=${encodeURIComponent(apiKey)}&PG_SZ=${PAGE_SIZE}&PAGE=${page}&CNP_CD=${code}&PAN_ST_DT=${YEAR}0101&type=json`;
        const res = await fetch(url, { next: { revalidate: 3600 } });
        const data = await res.json();

        const items = data?.[1]?.dsList ?? data?.[1] ?? [];
        if (!Array.isArray(items) || items.length === 0) break;

        for (const item of items) {
          const notice = parseLHItem(item, region);
          if (isThisYear(notice.announceDate)) {
            notices.push(notice);
          }
        }

        if (items.length < PAGE_SIZE) break;
      } catch (e) {
        console.error(`LH API error for region ${region} page ${page}:`, e);
        break;
      }
    }
  }

  return notices;
}

// LH 공고별 공급정보 상세
export async function fetchLHNoticeDetail(apiKey: string, panId: string) {
  try {
    const url = `${BASE}/lhLeaseNoticeSplInfo1/getLeaseNoticeSplInfo1?ServiceKey=${encodeURIComponent(apiKey)}&PAN_ID=${panId}&type=json`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    return await res.json();
  } catch (e) {
    console.error("LH detail API error:", e);
    return null;
  }
}
