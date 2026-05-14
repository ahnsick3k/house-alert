import { NextResponse } from "next/server";
import { fetchLHNoticeDetail } from "@/lib/api/lh";
import { ComplexInfo, UnitTypeInfo, ScheduleInfo } from "@/lib/types";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const apiKey = process.env.DATA_GO_KR_API_KEY ?? "";

  if (!apiKey) {
    return NextResponse.json({ complexes: [], schedule: {}, message: "API key not configured" });
  }

  // LH 공고 상세 데이터
  if (id.startsWith("lh-")) {
    const panId = id.replace("lh-", "");
    try {
      const detail = await fetchLHNoticeDetail(apiKey, panId);
      if (!detail) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      // LH API 응답을 통합 포맷으로 변환
      const items = detail?.[1] ?? [];
      const complexMap = new Map<string, ComplexInfo>();

      if (Array.isArray(items)) {
        for (const item of items) {
          const complexName = item.DAN_NM ?? item.HSH_NM ?? "단지 정보 없음";
          const complexId = `${complexName}-${item.HSH_ADRES ?? ""}`;

          if (!complexMap.has(complexId)) {
            complexMap.set(complexId, {
              id: complexId,
              name: complexName,
              address: item.HSH_ADRES ?? "",
              units: [],
              heatingType: item.HTN_FMLA_DS ?? "",
              moveInDate: item.MVN_PRNM_YM ?? "",
            });
          }

          const complex = complexMap.get(complexId)!;
          const exclusiveArea = parseFloat(item.DDO_AR ?? "0");

          const unit: UnitTypeInfo = {
            housingType: item.HSH_TP_NM ?? item.HSH_TP ?? "",
            exclusiveArea,
            exclusiveAreaPy: exclusiveArea > 0 ? Math.round(exclusiveArea * 0.3025 * 100) / 100 : undefined,
            supplyCount: parseInt(item.TOT_SL_CNT ?? "0"),
            supplyCountGeneral: parseInt(item.GNR_SL_CNT ?? "0"),
            supplyCountPriority: parseInt(item.SPC_SL_CNT ?? "0"),
            deposit: parseInt(item.LS_GMY ?? "0") || undefined,
            contractDeposit: parseInt(item.CNT_GMY ?? "0") || undefined,
            balance: parseInt(item.RMN_GMY ?? "0") || undefined,
            monthlyRent: parseInt(item.MM_RFE ?? "0") || undefined,
            contractArea: parseFloat(item.CNT_AR ?? "0") || undefined,
            residentialExclusive: parseFloat(item.DDO_AR ?? "0") || undefined,
            residentialCommon: parseFloat(item.PBL_AR ?? "0") || undefined,
            otherCommon: parseFloat(item.ETC_AR ?? "0") || undefined,
          };
          complex.units.push(unit);
        }
      }

      const complexes = Array.from(complexMap.values());

      // 일정 정보 (rawData에서 추출)
      const schedule: ScheduleInfo = {
        applicationPeriod: detail?.applicationPeriod,
        winnerAnnouncementDate: detail?.winnerAnnouncementDate,
        contractPeriod: detail?.contractPeriod,
      };

      return NextResponse.json({
        complexes,
        schedule,
        rawDetail: detail,
      });
    } catch (e) {
      console.error("LH detail fetch error:", e);
      return NextResponse.json({ error: "Failed to fetch detail" }, { status: 500 });
    }
  }

  // 다른 기관은 현재 상세 API 미지원
  return NextResponse.json({
    complexes: [],
    schedule: {},
    message: "이 기관의 상세 데이터는 공고문에서 확인해주세요",
  });
}
