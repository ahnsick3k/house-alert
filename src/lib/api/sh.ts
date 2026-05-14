import { Notice } from "../types";

const YEAR = new Date().getFullYear().toString();

function isThisYear(dateStr: string | undefined): boolean {
  if (!dateStr) return true;
  return dateStr.startsWith(YEAR);
}

// SH 서울주택도시공사 분양정보 API — 올해 전체 페이지네이션
export async function fetchSHNotices(apiKey: string): Promise<Notice[]> {
  const notices: Notice[] = [];
  const PER_PAGE = 100;
  const MAX_PAGES = 10;

  for (let page = 1; page <= MAX_PAGES; page++) {
    try {
      const url = `https://api.odcloud.kr/api/15049669/v1/uddi:sharing-data?page=${page}&perPage=${PER_PAGE}&serviceKey=${encodeURIComponent(apiKey)}`;
      const res = await fetch(url, { next: { revalidate: 3600 } });
      const data = await res.json();

      const totalCount = data?.totalCount ?? data?.matchCount ?? 0;
      const items = data?.data ?? [];
      if (!Array.isArray(items) || items.length === 0) break;

      for (const item of items) {
        const announceDate = item["공고일"] ?? "";
        if (!isThisYear(announceDate)) continue;

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
          announceDate,
          applyStartDate: item["접수시작일"] ?? "",
          applyEndDate: item["접수종료일"] ?? "",
          detailUrl: item["상세URL"] ?? "https://www.i-sh.co.kr/main/lay2/program/S1T295C297/www/brd/m_249/list.do",
          rawData: item,
        });
      }

      if (page * PER_PAGE >= totalCount || items.length < PER_PAGE) break;
    } catch (e) {
      console.error(`SH API error page ${page}:`, e);
      break;
    }
  }

  return notices;
}
