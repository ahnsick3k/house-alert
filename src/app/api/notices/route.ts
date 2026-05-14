import { NextResponse } from "next/server";
import { fetchLHNotices } from "@/lib/api/lh";
import { fetchIHNotices } from "@/lib/api/ih";
import { fetchMyHomeNotices } from "@/lib/api/myhome";
import { fetchSHNotices } from "@/lib/api/sh";
import { Notice } from "@/lib/types";

export const revalidate = 1800; // 30분 ISR

export async function GET() {
  const apiKey = process.env.DATA_GO_KR_API_KEY ?? "";

  if (!apiKey) {
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  const results = await Promise.allSettled([
    fetchLHNotices(apiKey),
    fetchIHNotices(apiKey),
    fetchMyHomeNotices(apiKey),
    fetchSHNotices(apiKey),
  ]);

  const notices: Notice[] = [];
  const errors: string[] = [];

  results.forEach((r, i) => {
    const names = ["LH", "iH", "마이홈", "SH"];
    if (r.status === "fulfilled") {
      notices.push(...r.value);
    } else {
      errors.push(`${names[i]}: ${r.reason?.message ?? "unknown error"}`);
    }
  });

  // 중복 제거 (제목 + 기관 기준)
  const seen = new Set<string>();
  const unique = notices.filter((n) => {
    const key = `${n.organization}-${n.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // 공고일 기준 최신순 정렬
  unique.sort((a, b) => {
    const da = a.announceDate ?? "";
    const db = b.announceDate ?? "";
    return db.localeCompare(da);
  });

  return NextResponse.json({
    notices: unique,
    total: unique.length,
    errors: errors.length > 0 ? errors : undefined,
    fetchedAt: new Date().toISOString(),
  });
}
