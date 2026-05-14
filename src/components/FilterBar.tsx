"use client";

import { Region, NoticeType, Organization, REGIONS, NOTICE_TYPES, ORGANIZATIONS } from "@/lib/types";

interface FilterBarProps {
  regions: Region[];
  types: NoticeType[];
  organizations: Organization[];
  keyword: string;
  onRegionsChange: (r: Region[]) => void;
  onTypesChange: (t: NoticeType[]) => void;
  onOrganizationsChange: (o: Organization[]) => void;
  onKeywordChange: (k: string) => void;
}

function ChipGroup<T extends string>({
  items,
  selected,
  onChange,
}: {
  items: T[];
  selected: T[];
  onChange: (v: T[]) => void;
}) {
  const toggle = (item: T) => {
    if (selected.includes(item)) {
      onChange(selected.filter((s) => s !== item));
    } else {
      onChange([...selected, item]);
    }
  };

  return (
    <div className="flex gap-1.5 flex-wrap">
      {items.map((item) => {
        const active = selected.includes(item);
        return (
          <button
            key={item}
            onClick={() => toggle(item)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              active
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}

export default function FilterBar({
  regions,
  types,
  organizations,
  keyword,
  onRegionsChange,
  onTypesChange,
  onOrganizationsChange,
  onKeywordChange,
}: FilterBarProps) {
  return (
    <div className="space-y-3">
      {/* 검색 */}
      <div className="relative">
        <input
          type="text"
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          placeholder="공고명 검색..."
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {keyword && (
          <button
            onClick={() => onKeywordChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* 필터 칩들 */}
      <div className="space-y-2">
        <div>
          <p className="text-[11px] font-medium text-gray-400 mb-1">지역</p>
          <ChipGroup items={REGIONS} selected={regions} onChange={onRegionsChange} />
        </div>
        <div>
          <p className="text-[11px] font-medium text-gray-400 mb-1">유형</p>
          <ChipGroup items={NOTICE_TYPES} selected={types} onChange={onTypesChange} />
        </div>
        <div>
          <p className="text-[11px] font-medium text-gray-400 mb-1">기관</p>
          <ChipGroup items={ORGANIZATIONS} selected={organizations} onChange={onOrganizationsChange} />
        </div>
      </div>
    </div>
  );
}
