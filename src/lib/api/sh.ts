import { Notice } from "../types";

// SH 서울주택도시공사 분양정보 API
export async function fetchSHNotices(apiKey: string): Promise<Notice[]> {
  const notices: Notice[] = [];

  try {
    const url = `https://api.odcloud.kr/api/15049669/v1/uddi:sharing-data?page=1&perPage=50&serviceKey=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    const data = await res.json();

    const items = data?.data ?? [];
    if (!Array.isArray(items)) return notices;

    for (const item of items) {
      const title = item["공고명"] ?? item["사업명"] ?? item["단지명"] ?? "제목 없음";
      let noticeType: Notice["type"] = "기타";
      const typeStr = JSON.stringify(item).toLowerCase();
      if (typeStr.includes("분양")) noticeType = "분양";
      else if (typeStr.includes("임대")) noticeType = "임대";

      notices.push({
        id: `sh-${item["순번"] ?? notices.length}`,
        title,
        organization: "SH",
        type: noticeType,
        status: "공고중",
        region: "서울",
        address: item["소재지"] ?? item["위치"] ?? "",
        announceDate: item["공고일"] ?? "",
        applyStartDate: item["접수시작일"] ?? "",
        applyEndDate: item["접수종료일"] ?? "",
        detailUrl: item["상세URL"] ?? "https://www.i-sh.co.kr/main/lay2/program/S1T295C297/www/brd/m_249/list.do",
        rawData: item,
      });
    }
  } catch (e) {
    console.error("SH API error:", e);
  }

  return notices;
}
