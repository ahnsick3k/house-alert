import { Notice } from "../types";

const YEAR = new Date().getFullYear().toString();

function isThisYear(dateStr: string | undefined): boolean {
  if (!dateStr) return true;
  return dateStr.startsWith(YEAR);
}

// 인천도시공사 공고정보 조회서비스 — 올해 전체 페이지네이션
export async function fetchIHNotices(apiKey: string): Promise<Notice[]> {
  const notices: Notice[] = [];
  const NUM_OF_ROWS = 100;
  const MAX_PAGES = 10;

  for (let page = 1; page <= MAX_PAGES; page++) {
    try {
      const url = `https://apis.data.go.kr/6280000/icNoticeInfo/getNoticeInfoList?serviceKey=${encodeURIComponent(apiKey)}&pageNo=${page}&numOfRows=${NUM_OF_ROWS}&type=json`;
      const res = await fetch(url, { next: { revalidate: 3600 } });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.warn("iH API returned non-JSON:", text.slice(0, 200));
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
        const title = item.noticeSj ?? item.sj ?? "제목 없음";
        const announceDate = item.noticeBgnde ?? item.ntcBgnde ?? "";

        if (!isThisYear(announceDate)) continue;

        let noticeType: Notice["type"] = "기타";
        if (title.includes("분양")) noticeType = "분양";
        else if (title.includes("임대")) noticeType = "임대";

        let status: Notice["status"] = "기타";
        if (item.noticeStatus?.includes("공고") || item.sttus?.includes("공고")) status = "공고중";
        else if (item.noticeStatus?.includes("접수") || item.sttus?.includes("접수")) status = "신청중";

        notices.push({
          id: `ih-${item.noticeId ?? item.nttNo ?? notices.length}`,
          title,
          organization: "iH",
          type: noticeType,
          status,
          region: "인천",
          address: item.adres ?? item.lctn ?? "",
          announceDate,
          applyStartDate: item.rcptBgnde ?? "",
          applyEndDate: item.rcptEndde ?? "",
          detailUrl: item.dtlUrl ?? item.url ?? "https://www.ih.co.kr/main/info/notice.asp",
          rawData: item,
        });
      }

      if (page * NUM_OF_ROWS >= totalCount) break;
    } catch (e) {
      console.error(`iH API error page ${page}:`, e);
      break;
    }
  }

  return notices;
}
