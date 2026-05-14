"use client";

import { Notice } from "@/lib/types";
import { formatDate, getStatusColor, getOrgColor } from "@/lib/utils";
import Link from "next/link";
import { MapPinIcon, CalendarIcon } from "@heroicons/react/20/solid";

export default function NoticeCard({ notice }: { notice: Notice }) {
  return (
    <Link
      href={`/notices/${encodeURIComponent(notice.id)}`}
      className="block bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow active:scale-[0.98]"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex gap-1.5 flex-wrap">
          <span
            className={`text-sm font-semibold px-2.5 py-1 rounded-full ${getOrgColor(notice.organization)}`}
          >
            {notice.organization}
          </span>
          <span
            className={`text-sm font-semibold px-2.5 py-1 rounded-full ${getStatusColor(notice.status)}`}
          >
            {notice.status}
          </span>
        </div>
        <span className="text-sm text-gray-400 shrink-0">{notice.region}</span>
      </div>

      <h3 className="text-base font-bold text-gray-900 leading-snug line-clamp-2 mb-3">
        {notice.title}
      </h3>

      {notice.address && (
        <p className="text-sm text-gray-500 mb-3 truncate flex items-center gap-1">
          <MapPinIcon className="w-4 h-4 shrink-0 text-gray-400" />
          {notice.address}
        </p>
      )}

      <div className="flex items-center justify-between text-sm text-gray-400">
        <span className="bg-gray-50 px-2.5 py-1 rounded-lg">{notice.type}</span>
        <div className="flex items-center gap-1">
          <CalendarIcon className="w-4 h-4" />
          {notice.applyStartDate && (
            <span>
              {formatDate(notice.applyStartDate)}
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
