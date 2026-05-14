# Design System: House Alert

> 수도권 공공주택 공고 모바일 웹앱. Next.js 16 + Tailwind CSS 4 + Geist Sans.
> 영감: Polestar (미니멀 서피스), SpaceX (대담한 타이포), Bluesky (단일 블루 액센트 + 카드 피드).

---

## Colors

Tailwind 유틸리티를 토큰으로 사용한다. 커스텀 CSS variable은 쓰지 않는다.

### Accent

단일 액센트 `blue-600` (#2563EB). 모든 인터랙티브 요소에 사용.

| 역할 | Tailwind class | 사용처 |
|---|---|---|
| Primary CTA 배경 | `bg-blue-600` | 선택된 필터 칩, primary 버튼 |
| Primary 텍스트 | `text-blue-600` | 활성 탭, 링크, 선택된 공고 |
| Focus ring | `focus:ring-blue-500` | 검색 입력창 포커스 |
| Primary light | `bg-blue-50` | 선택된 공고 하이라이트 배경 |

### Surface

| 역할 | Tailwind class | 사용처 |
|---|---|---|
| Page background | `bg-gray-50` | body 배경 |
| Card background | `bg-white` | 카드, 모달, 시트 |
| Nav background | `bg-white/90 backdrop-blur-lg` | 하단 네비게이션 (프로스트 글래스) |
| Border | `border-gray-100` | 카드 테두리 |
| Border (강조) | `border-gray-200` | 입력창, nav border-top |

### Text

| 역할 | Tailwind class | 사용처 |
|---|---|---|
| Primary text | `text-gray-900` | 카드 제목 |
| Secondary text | `text-gray-500` | 주소, 설명 |
| Muted text | `text-gray-400` | 캡션, 타임스탬프, 비활성 탭, 필터 라벨 |
| On-primary | `text-white` | 파란 버튼/칩 위 텍스트 |

### Organization Badges (데이터 시각화 전용)

코드 위치: `src/lib/utils.ts` → `getOrgColor()`, `GoogleMap.tsx` → `ORG_MARKER_COLORS`

| 기관 | Badge class | 마커 hex |
|---|---|---|
| LH | `bg-indigo-100 text-indigo-800` | #4F46E5 |
| SH | `bg-purple-100 text-purple-800` | #7C3AED |
| iH | `bg-teal-100 text-teal-800` | #0D9488 |
| GH | `bg-orange-100 text-orange-800` | #EA580C |
| 기타 | `bg-gray-100 text-gray-600` | #6B7280 |

### Status Badges

코드 위치: `src/lib/utils.ts` → `getStatusColor()`

| 상태 | Class |
|---|---|
| 공고중 | `bg-blue-100 text-blue-800` |
| 접수중 | `bg-green-100 text-green-800` |
| 접수마감 | `bg-gray-100 text-gray-500` |
| 기타 | `bg-yellow-100 text-yellow-800` |

그라디언트 없음.

---

## Typography

### Font

`Geist Sans` (variable, `next/font/google`), 한글은 시스템 폰트 폴백.
`Geist Mono` — 현재 미사용.

### Scale (코드에서 관찰된 것)

| 용도 | Class | 비고 |
|---|---|---|
| 페이지 타이틀 | `text-xl font-black tracking-tight` | SpaceX 스타일 대담한 헤드라인 |
| 카드 제목 | `text-sm font-bold leading-snug` | 2줄 clamp |
| 본문/메타 | `text-xs` | 주소, 날짜, 기관 |
| 필터 라벨 | `text-[11px] font-medium` | 지역/유형/기관 섹션 헤더 |
| 배지 | `text-xs font-semibold` | 기관·상태 배지 |
| Nav 라벨 | `text-xs` | 하단 탭 |

### 원칙

- 헤드라인만 `font-black`(800) 사용. 나머지는 `font-bold`(700) 이하.
- `tracking-tight`는 헤드라인 전용. 본문은 기본 tracking.
- 전역 `word-break: keep-all` (한글) — layout.tsx의 `lang="ko"` 적용.

---

## Layout

- **최대 폭:** `max-w-lg` (~512px), 중앙 정렬.
- **수평 패딩:** `px-4` (16px).
- **카드 간격:** `space-y-2` (8px) 또는 `space-y-3` (12px).
- **카드 내부 패딩:** `p-4` (16px).
- **섹션 상단 여백:** `pt-4` (16px).
- **하단 nav 여유:** `pb-20` (80px) on body/main.

### 지도 페이지

상단 지도(flex-1) + 하단 리스트(max-h-[40%], overflow-y-auto), border-top 구분.

---

## Elevation

| Level | Treatment | 사용처 |
|---|---|---|
| 0 — Flat | 없음 | 캔버스 배경, 텍스트 |
| 1 — Hairline | `border border-gray-100` | 카드 기본 상태 |
| 2 — Subtle shadow | `shadow-sm` | 카드 기본 + hover 시 `shadow-md` |
| 3 — Frost glass | `bg-white/90 backdrop-blur-lg border-t` | 하단 nav |

그림자는 최소화. 카드 기본 상태에 `shadow-sm`만 사용하고, hover 시 `shadow-md`로 전환.

---

## Shapes

| 용도 | Class | 값 |
|---|---|---|
| 카드 | `rounded-2xl` | 16px |
| 입력창 | `rounded-xl` | 12px |
| 배지/칩 | `rounded-full` | pill |
| 유형 태그 | `rounded-md` | 6px |

---

## Motion

| 요소 | Effect | 비고 |
|---|---|---|
| 카드 hover | `hover:shadow-md transition-shadow` | shadow 전환 |
| 카드 press | `active:scale-[0.98]` | 물리적 누름 피드백 |
| 탭/칩 | `transition-colors` | 색상 전환 |
| 스피너 | `animate-spin` | 로딩 인디케이터 |

기본 transition은 Tailwind 기본값 (150ms ease). 커스텀 easing 없음.

---

## Components (실제 구현된 것)

### `BottomNav`
- 고정 하단, 3탭: 🏠홈 / 🗺️지도 / 👤내설정
- `bg-white/90 backdrop-blur-lg border-t border-gray-200`
- 활성: `text-blue-600 font-semibold`, 비활성: `text-gray-400`
- `pb-[env(safe-area-inset-bottom)]` — 노치 대응

### `NoticeCard`
- `bg-white rounded-2xl border border-gray-100 p-4 shadow-sm`
- 상단: 기관 배지(pill) + 상태 배지(pill) + 지역(text-xs gray)
- 중간: 제목 `text-sm font-bold line-clamp-2`
- 하단: 주소(📍) + 유형 태그(`bg-gray-50 rounded-md`) + 날짜
- 인터랙션: `hover:shadow-md active:scale-[0.98]`
- 전체가 `/notices/[id]` 링크

### `FilterBar`
- 검색: `bg-gray-50 border-gray-200 rounded-xl` + 클리어 버튼(✕)
- 칩 그룹 3행: 지역 / 유형 / 기관
- 칩 활성: `bg-blue-600 text-white rounded-full`
- 칩 비활성: `bg-gray-100 text-gray-600 rounded-full`
- 섹션 라벨: `text-[11px] font-medium text-gray-400`

### `GoogleMap`
- Google Maps JS API embed, `@types/google.maps`
- SVG 마커: 기관별 색상, 첫 글자 표시
- InfoWindow: 기관·지역·유형 + 제목 + 주소
- 지오코딩: 주소만 있는 공고 최대 10개, 200ms 딜레이로 rate limit 방지
- 기본 중심: 서울 (37.5665, 126.978), zoom 10

---

## Do's and Don'ts

### Do

- `blue-600` 하나로 모든 인터랙티브 요소 통일 — 링크, CTA, 포커스, 활성 탭, 선택 칩
- 카드는 `border-gray-100` + `shadow-sm` — 가볍게
- 헤드라인은 `font-black tracking-tight` — SpaceX 스타일 대담함
- 기관 배지는 반드시 tinted bg + 동일 계열 text (indigo/purple/teal/orange)
- 모든 터치 타겟 44px 이상
- `active:scale-[0.98]`로 버튼/카드에 물리적 피드백

### Don't

- 두 번째 액센트 색상 추가 금지
- 카드 기본 상태에 `shadow-md` 이상 금지
- 장식적 그라디언트, 패턴 배경 금지
- 기관 배지 색상을 배지 외부에서 사용 금지
- Body 텍스트에 `font-bold` 이상 금지
- Tailwind 외 커스텀 CSS variable 추가 금지 (globals.css의 유틸리티 제외)

---

## Known Gaps

- 다크모드 미정의
- Form validation / error 상태 미정의
- 토스트/스낵바 알림 미정의
- 프로필/설정 페이지 컴포넌트(토글, 라디오) 미정의
- 페이지네이션/무한 스크롤 패턴 미정의
- 접근성: aria-label 패턴 미정의
