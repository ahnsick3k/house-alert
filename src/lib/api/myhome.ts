import { Notice, Region } from "../types";

// 마이홈포털 공공주택 통합 공고 API
export async function fetchMyHomeNotices(apiKey: string): Promise<Notice[]> {
  const notices: Notice[] = [];

  try {
    const url = `https://apis.data.go.kr/1613000/OpenPblcNtcInfoService/getOpenPblcNtcInfo?serviceKey=${encodeURIComponent(apiKey)}&pageNo=1&numOfRows=100&type=json`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.warn("MyHome API returned non-JSON:", text.slice(0, 200));
      return notices;
    }

    const items =
      data?.response?.body?.items?.item ??
      data?.response?.body?.items ??
      [];
    const itemArray = Array.isArray(items) ? items : [items];

    for (const item of itemArray) {
      if (!item) continue;

      // 수도권 필터
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
        announceDate: item.pblcNtcDe ?? "",
        applyStartDate: item.rcptBgnde ?? "",
        applyEndDate: item.rcptEndde ?? "",
        detailUrl: item.dtlUrl ?? `https://www.myhome.go.kr`,
        rawData: item,
      });
    }
  } catch (e) {
    console.error("MyHome API error:", e);
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
