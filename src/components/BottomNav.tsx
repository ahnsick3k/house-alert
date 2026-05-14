"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, MapIcon, UserIcon } from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeIconSolid,
  MapIcon as MapIconSolid,
  UserIcon as UserIconSolid,
} from "@heroicons/react/24/solid";

const tabs = [
  { href: "/", label: "홈", Icon: HomeIcon, ActiveIcon: HomeIconSolid },
  { href: "/map", label: "지도", Icon: MapIcon, ActiveIcon: MapIconSolid },
  { href: "/profile", label: "내 설정", Icon: UserIcon, ActiveIcon: UserIconSolid },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-t border-gray-200 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-lg mx-auto flex">
        {tabs.map((tab) => {
          const active =
            tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          const Ico = active ? tab.ActiveIcon : tab.Icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex flex-col items-center justify-center min-h-[56px] py-2 text-sm transition-colors ${
                active
                  ? "text-blue-600 font-semibold"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Ico className="w-6 h-6 mb-0.5" />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
