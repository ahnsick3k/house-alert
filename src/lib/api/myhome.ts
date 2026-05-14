import { Notice, Region } from "../types";

const YEAR = new Date().getFullYear().toString();

function isThisYear(dateStr: string | undefined): boolean {
  if (!dateStr) return true;
  return dateStr.startsWith(YEAR);
}

// 마이홈포털 공공주택 통합 공고 API — 올해 전체 페이지네이션
export async function fetchMyHomeNotices(apiKey: string): Promise<Notice[]> {
  const notices: Notice[] = [];
  const NUM_OF_ROWS = 100;
  const MAX_PAGES = 10;

  for (let page = 1; page <= MAX_PAGES; page++) {
    try {
      const url = `https://apis.data.go.kr/1613000/OpenPblcNtcInfoService/getOpenPblcNtcInfo?serviceKey=${encodeURIComponent(apiKey)}&pageNo=${page}&numOfRows=${NUM_OF_ROWS}&type=json`;
      const res = await fetch(url, { next: { revalidate: 3600 } });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.warn("MyHome API returned non-JSON:", text.slice(0, 200));
        break;
      }

      const totalCount = data?.response?.body?.totalCount ?? 0;
      const items =
        data?.response?.body?.items?.item ??
        data?.response?.body?.items ??
        [];
      const itemArray = Array.isArray(items) ? items : [items];

      if (itemArray.length === 0 || !itemArray[0]) break;

      for (const item of itemArray) {
        if (!item) continue;

        const announceDate = item.pblcNtcDe ?? "";
        if (!isThisYear(announceDate)) continue;

        const region = detectRegion(item);
        if (!region) continue;

        const title = item.pblcNtcSj ?? item.bsnsMbyNm ?? "제목 없음";
        let noticeType: Notice["type"] = "기타";
        const combined = `${title} ${item.suplyTy ?? ""}`;
        if (combined.includes("분양")) noticeType = "분양";
        else if (combined.includes("임대")) noticeType = "임대";
        else if (combined.includes("신혼")) noticeType = "신혼희망타운";

        let org: Notice["organization"] = "기타";
        const orgStr = item.suplyInsttNm ?? "";
        if (orgStr.includes("LH") || orgStr.includes("토지주택")) org = "LH";
        else if (orgStr.includes("SH") || orgStr.includes("서울주택")) org = "SH";
        else if (orgStr.includes("경기") || orgStr.includes("GH")) org = "GH";
        else if (orgStr.includes("인천") || orgStr.includes("iH")) org = "iH";

        notices.push({
          id: `mh-${item.pblcNtcNo ?? notices.length}`,
          title,
          organization: org,
          type: noticeType,
          status: "공고중",
          region,
          address: item.hssplyAdres ?? item.lctn ?? "",
          announceDate,
          applyStartDate: item.rcptBgnde ?? "",
          applyEndDate: item.rcptEndde ?? "",
          detailUrl: item.dtlUrl ?? `https://www.myhome.go.kr`,
          rawData: item,
        });
      }

      if (page * NUM_OF_ROWS >= totalCount) break;
    } catch (e) {
      console.error(`MyHome API error page ${page}:`, e);
      break;
    }
  }

  return notices;
}

function detectRegion(item: Record<string, string>): Region | null {
  const searchStr = `${item.hssplyAdres ?? ""} ${item.bsnsMbyNm ?? ""} ${item.pblcNtcSj ?? ""} ${item.lctn ?? ""}`;
  if (searchStr.includes("서울")) return "서울";
  if (searchStr.includes("경기")) return "경기";
  if (searchStr.includes("인천")) return "인천";
  return null;
}
