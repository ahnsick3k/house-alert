"use client";

import { useState, useEffect } from "react";
import { UserProfile, DEFAULT_PROFILE, REGIONS, NOTICE_TYPES, Region, NoticeType } from "@/lib/types";

const STORAGE_KEY = "house-alert-profile";

function loadProfile(): UserProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
}

function saveProfile(profile: UserProfile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setProfile(loadProfile());
  }, []);

  const toggleRegion = (r: Region) => {
    setProfile((prev) => ({
      ...prev,
      regions: prev.regions.includes(r)
        ? prev.regions.filter((x) => x !== r)
        : [...prev.regions, r],
    }));
    setSaved(false);
  };

  const toggleType = (t: NoticeType) => {
    setProfile((prev) => ({
      ...prev,
      noticeTypes: prev.noticeTypes.includes(t)
        ? prev.noticeTypes.filter((x) => x !== t)
        : [...prev.noticeTypes, t],
    }));
    setSaved(false);
  };

  const handleSave = () => {
    saveProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-4">
      <header className="mb-6">
        <h1 className="text-xl font-black tracking-tight">👤 내 설정</h1>
        <p className="text-xs text-gray-400">관심 조건을 설정하면 맞춤 공고를 볼 수 있어요</p>
      </header>

      <div className="space-y-6">
        {/* 관심 지역 */}
        <section>
          <h2 className="text-sm font-bold text-gray-700 mb-2">관심 지역</h2>
          <div className="flex gap-2 flex-wrap">
            {REGIONS.map((r) => (
              <button
                key={r}
                onClick={() => toggleRegion(r)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  profile.regions.includes(r)
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </section>

        {/* 관심 유형 */}
        <section>
          <h2 className="text-sm font-bold text-gray-700 mb-2">관심 유형</h2>
          <div className="flex gap-2 flex-wrap">
            {NOTICE_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => toggleType(t)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  profile.noticeTypes.includes(t)
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </section>

        {/* 세대 유형 */}
        <section>
          <h2 className="text-sm font-bold text-gray-700 mb-2">세대 유형</h2>
          <input
            type="text"
            value={profile.householdType}
            onChange={(e) => {
              setProfile((p) => ({ ...p, householdType: e.target.value }));
              setSaved(false);
            }}
            placeholder="예: 1인 가구, 신혼부부, 다자녀..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </section>

        {/* 저장 버튼 */}
        <button
          onClick={handleSave}
          className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors ${
            saved
              ? "bg-green-500 text-white"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {saved ? "✓ 저장됨!" : "설정 저장"}
        </button>
      </div>
    </div>
  );
}
