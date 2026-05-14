"use client";

import { Notice } from "@/lib/types";
import { formatDate, getStatusColor, getOrgColor } from "@/lib/utils";
import Link from "next/link";

export default function NoticeCard({ notice }: { notice: Notice }) {
  return (
    <Link
      href={`/notices/${encodeURIComponent(notice.id)}`}
      className="block bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow active:scale-[0.98]"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex gap-1.5 flex-wrap">
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getOrgColor(notice.organization)}`}
          >
            {notice.organization}
          </span>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getStatusColor(notice.status)}`}
          >
            {notice.status}
          </span>
        </div>
        <span className="text-xs text-gray-400 shrink-0">
          {notice.region}
        </span>
      </div>

      <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 mb-2">
        {notice.title}
      </h3>

      {notice.address && (
        <p className="text-xs text-gray-500 mb-2 truncate">
          📍 {notice.address}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-400">
        <span className="bg-gray-50 px-2 py-0.5 rounded-md">{notice.type}</span>
        <div className="flex gap-2">
          {notice.applyStartDate && (
            <span>
              접수 {formatDate(notice.applyStartDate)}
              {notice.applyEndDate && ` ~ ${formatDate(notice.applyEndDate)}`}
            </span>
          )}
          {!notice.applyStartDate && notice.announceDate && (
            <span>공고 {formatDate(notice.announceDate)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
