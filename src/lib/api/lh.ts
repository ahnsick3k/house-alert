import { Notice } from "../types";

const BASE = "https://apis.data.go.kr/B552555";

// LH 분양임대공고문 조회
export async function fetchLHNotices(apiKey: string): Promise<Notice[]> {
  const notices: Notice[] = [];

  // 수도권 지역코드: 서울=11, 경기=41, 인천=28
  const regionMap: Record<string, "서울" | "경기" | "인천"> = {
    "11": "서울",
    "41": "경기",
    "28": "인천",
  };

  for (const [code, region] of Object.entries(regionMap)) {
    try {
      const url = `${BASE}/lhLeaseNoticeInfo1/lhLeaseNoticeInfo1?ServiceKey=${encodeURIComponent(apiKey)}&PG_SZ=50&PAGE=1&CNP_CD=${code}&PAN_SS=공고중&type=json`;
      const res = await fetch(url, { next: { revalidate: 3600 } });
      const data = await res.json();

      const items = data?.[1] ?? [];
      if (!Array.isArray(items)) continue;

      for (const item of items) {
        const typeCode = item.UPP_AIS_TP_CD ?? "";
        let noticeType: Notice["type"] = "기타";
        if (typeCode === "05" || item.AIS_TP_CD_NM?.includes("분양")) noticeType = "분양";
        else if (typeCode === "06" || item.AIS_TP_CD_NM?.includes("임대")) noticeType = "임대";
        else if (item.AIS_TP_CD_NM?.includes("신혼")) noticeType = "신혼희망타운";

        let status: Notice["status"] = "기타";
        const panSs = item.PAN_SS ?? "";
        if (panSs.includes("공고")) status = "공고중";
        else if (panSs.includes("접수")) status = "접수중";
        else if (panSs.includes("마감")) status = "접수마감";

        notices.push({
          id: `lh-${item.PAN_ID ?? notices.length}`,
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
        });
      }
    } catch (e) {
      console.error(`LH API error for region ${region}:`, e);
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
