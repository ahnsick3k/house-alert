import { Notice } from "../types";

// 인천도시공사 공고정보 조회서비스
export async function fetchIHNotices(apiKey: string): Promise<Notice[]> {
  const notices: Notice[] = [];

  try {
    const url = `https://apis.data.go.kr/6280000/icNoticeInfo/getNoticeInfoList?serviceKey=${encodeURIComponent(apiKey)}&pageNo=1&numOfRows=50&type=json`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      // XML인 경우 fallback
      console.warn("iH API returned non-JSON:", text.slice(0, 200));
      return notices;
    }

    const items =
      data?.response?.body?.items?.item ??
      data?.response?.body?.items ??
      [];
    const itemArray = Array.isArray(items) ? items : [items];

    for (const item of itemArray) {
      if (!item) continue;
      const title = item.noticeSj ?? item.sj ?? "제목 없음";
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
        announceDate: item.noticeBgnde ?? item.ntcBgnde ?? "",
        applyStartDate: item.rcptBgnde ?? "",
        applyEndDate: item.rcptEndde ?? "",
        detailUrl: item.dtlUrl ?? item.url ?? "https://www.ih.co.kr/main/info/notice.asp",
        rawData: item,
      });
    }
  } catch (e) {
    console.error("iH API error:", e);
  }

  return notices;
}
