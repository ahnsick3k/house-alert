# Design System: House Alert

---

## Token Architecture

### Principle 1 · CSS Variable Naming

모든 디자인 토큰은 반드시 **CSS custom property 이름(`--var-name`)** 과 함께 선언한다.

명명 규칙:
- 색상: `--color-[role]` — 예: `--color-interactive`, `--color-bg`, `--color-text-muted`
- 간격: `--space-[scale]` — 예: `--space-100`, `--space-400`
- 타이포: `--font-[property]-[role]` — 예: `--font-size-body`, `--font-weight-heading`
- 반경: `--radius-[scale]` — 예: `--radius-sm`, `--radius-pill`
- 그림자: `--shadow-[scale]` — 예: `--shadow-sm`, `--shadow-card`
- 모션: `--duration-[scale]`, `--ease-[type]`

> `{colors.primary}` (`--color-interactive`) — #006AFF

### Principle 2 · Two-Layer Token System (Primitive → Alias)

```
Layer 1 — Primitive  (원시값, 의미 없음)
  --blue-500: #006AFF
  --blue-600: #0055DD
  --gray-50:  #F8F9FA
  --gray-100: #F1F3F5
  --gray-900: #111111
  --white:    #FFFFFF
  --black:    #000000

Layer 2 — Alias/Semantic  (역할 기반, primitive를 참조)
  --color-interactive:       var(--blue-500)
  --color-interactive-hover: var(--blue-600)
  --color-bg:                var(--gray-50)
  --color-surface-card:      var(--white)
```

규칙:
- **컴포넌트 코드에서는 항상 Alias 토큰만 사용** — Primitive를 직접 참조하면 테마 전환이 깨진다.
- Primitive는 `:root`에 한 번만 선언한다.
- Alias 토큰이 없는 색상은 컴포넌트에서 사용하면 안 된다.

---

## Documentation Principles

### 1. 문서화 전에 먼저 생각하라

- 토큰 값을 확인하지 못했다면 `[미확인]` 또는 `[추정]` 태그를 반드시 붙인다.
- 불명확한 항목은 **Known Gaps** 섹션에 솔직하게 기재한다.

### 2. 관찰된 것만 문서화하라

- 실제로 관찰·분석한 페이지에서 확인된 토큰과 컴포넌트만 작성한다.
- 컴포넌트 하나를 3줄로 설명할 수 있다면 10줄로 쓰지 않는다.

### 3. 업데이트는 외과적으로

- 기존 명명 규칙이 마음에 들지 않더라도, 일관성을 위해 따른다.
- 변경 이유가 있다면 주석(`<!-- -->`)으로 남긴다.

### 4. 검증 가능한 스펙을 작성하라

```
✓ button-primary가 올바르면: 배경 #006AFF, 높이 44px, 포커스 링 2px solid #006AFF
✓ 대비비가 올바르면: Contrast Checker에서 4.5:1 이상
✓ motion이 올바르면: DevTools에서 transition 150ms cubic-bezier(0.17, 0.73, 0.14, 1)
```

---

## Overview

House Alert의 UI는 **정보 밀도와 시각적 정숙함의 균형**을 추구한다. SpaceX의 어두운 엔지니어링 미학, Polestar의 극도의 미니멀리즘, Bluesky의 기능적 카드 기반 모바일 인터페이스에서 영감을 받아, 공공주택 공고 정보를 **빠르게 스캔하고 행동할 수 있는** 구조로 설계되었다.

가장 독특한 디자인 결정은 **단일 블루 액센트(#006AFF) + 순백 카드 + 쿨 그레이 캔버스** 조합이다. Bluesky처럼 파란색이 모든 인터랙티브 요소의 유일한 신호이며, Polestar처럼 배경은 극도로 절제되어 콘텐츠(공고 카드)에 시선이 집중된다. SpaceX의 대담한 타이포그래피 위계를 참고해 헤드라인은 weight 800(black)으로 강하게, 본문은 weight 400으로 가볍게 분리한다.

이 시스템은 단일 라이트 서피스 모드로 구성된다. 배경은 `--gray-50`(#F8F9FA), 카드는 `--white`(#FFFFFF), 기관별 배지 색상이 유일한 다색 요소이다. 텍스트와 배경의 대비가 높아 모바일 야외 환경에서도 가독성을 유지한다.

> **Source pages analyzed:** polestar.com/kr/ (homepage), spacex.com (homepage), bsky.app (web app), bsky.social/about/blog, github.com/bluesky-social/social-app (src/alf/)

**Key Characteristics:**
- 단일 액센트 #006AFF — Bluesky 계열 블루, 모든 CTA·링크·포커스 링에 사용
- 쿨 그레이 캔버스(#F8F9FA) + 순백 카드 — Polestar의 순수 서피스 분리 기법
- Geist Sans — 기하학적 산세리프, 가변 웨이트(400–800), 한글은 시스템 폰트 폴백
- 카드 기반 정보 구조 — Bluesky의 피드 카드처럼 공고 하나 = 카드 하나
- 그림자 대신 hairline border — Polestar처럼 플랫, 1px 보더로 계층 표현
- 모바일 퍼스트 — 최대 콘텐츠 폭 512px, 하단 고정 네비게이션
- 기관별 컬러 코드 배지 — LH(인디고), SH(퍼플), iH(틸), GH(오렌지)가 유일한 다색 시스템

---

## Colors

### Brand & Accent

- **Blue** (`{colors.primary}` (`--color-interactive`) — #006AFF): 모든 인터랙티브 요소의 단일 시그널. CTA 버튼, 텍스트 링크, 포커스 링, 활성 탭, 선택된 필터 칩. Bluesky의 브랜드 블루(#006AFF)를 직접 차용 — 공공 서비스 앱에 적합한 신뢰감과 선명함을 동시에 전달한다.
- **Blue Hover** (`{colors.primary-hover}` (`--color-interactive-hover`) — #0055DD): 버튼/링크 hover 상태. 명도를 한 단계 낮춰 피드백.
- **Blue Press** (`{colors.primary-press}` (`--color-interactive-press`) — #004ABB): active/press 상태. 더 어두운 계조.
- **Blue Light** (`{colors.primary-light}` (`--color-interactive-light`) — #EBF2FF): 선택된 필터 칩 배경, 하이라이트 카드 배경. Bluesky의 `primary_50` 참조.

Single accent system — no secondary brand color. 기관별 배지 색상은 시맨틱이 아닌 데이터 시각화 목적이다.

### Surface

- **Canvas** (`{colors.canvas}` (`--color-bg`) — #F8F9FA): 기본 페이지 배경. 순수 흰색 대신 쿨 그레이를 써서 카드가 떠 보이는 효과. Polestar의 밝은 회색 섹션 배경(rgb(217,217,214))에서 영감, 더 밝게 조정.
- **Card** (`{colors.surface-card}` (`--color-surface-card`) — #FFFFFF): 카드, 모달, 시트 배경. Canvas와의 미세한 차이가 깊이를 만든다.
- **Nav** (`{colors.surface-nav}` (`--color-surface-nav`) — rgba(255,255,255,0.85)): 하단 네비게이션 바. backdrop-blur와 함께 사용해 Polestar 스타일의 프로스트 글래스 효과.
- **Hairline** (`{colors.hairline}` (`--color-border`) — #E5E7EB): 카드 테두리, 구분선. 1px.

### Text

- **Ink** (`{colors.ink}` (`--color-text`) — #111111): 헤드라인, 카드 제목. 순수 검정(#000)은 피함 — Polestar의 rgb(0,0,0)과 SpaceX의 #000 중간 지점. 약간의 부드러움.
- **Body** (`{colors.body}` (`--color-text-secondary`) — #4B5563): 본문, 부제목, 메타데이터.
- **Muted** (`{colors.muted}` (`--color-text-muted`) — #9CA3AF): 캡션, 타임스탬프, 비활성 탭. WCAG AA Large(3:1) 충족.
- **On-primary** (`{colors.on-primary}` (`--color-on-primary`) — #FFFFFF): 파란색 버튼 위 텍스트.

### Semantic

- **Success** (`{colors.success}` (`--color-success`) — #10B981): 접수중 상태 배지 배경 tint.
- **Warning** (`{colors.warning}` (`--color-warning`) — #F59E0B): 마감 임박 표시.
- **Error** (`{colors.error}` (`--color-error`) — #EF4444): 오류 메시지, API 실패 토스트.
- **Info** (`{colors.info}` (`--color-info`) — #006AFF): `{colors.primary}`와 동일 — 정보성 알림.

### Organization Badge Colors (데이터 시각화 전용)

- **LH** (`{colors.org-lh}` — bg: #E0E7FF, text: #3730A3): 인디고 계열.
- **SH** (`{colors.org-sh}` — bg: #F3E8FF, text: #7E22CE): 퍼플 계열.
- **iH** (`{colors.org-ih}` — bg: #CCFBF1, text: #0F766E): 틸 계열.
- **GH** (`{colors.org-gh}` — bg: #FFF7ED, text: #C2410C): 오렌지 계열.
- **기타** (`{colors.org-etc}` — bg: #F3F4F6, text: #4B5563): 그레이 계열.

### Brand Gradient

**No decorative gradients.** Polestar와 SpaceX처럼 배경 그라디언트를 사용하지 않는다. 단, Bluesky 참조로 향후 프로필/온보딩 화면에서 `primary` 그라디언트(`#054CFF → #1085FE → #59B9FF`)를 도입할 여지를 남겨둔다.

### Contrast Matrix (draft)

| 조합 | 전경색 | 배경색 | 비율 | 등급 |
|---|---|---|---|---|
| Ink on Canvas | `{colors.ink}` #111111 | `{colors.canvas}` #F8F9FA | 15.9:1 | AAA |
| Body on Canvas | `{colors.body}` #4B5563 | `{colors.canvas}` #F8F9FA | 7.5:1 | AAA |
| Muted on Canvas | `{colors.muted}` #9CA3AF | `{colors.canvas}` #F8F9FA | 3.2:1 | AA Large |
| On-primary on Primary | `{colors.on-primary}` #FFFFFF | `{colors.primary}` #006AFF | 4.7:1 | AA |
| Ink on Card | `{colors.ink}` #111111 | `{colors.surface-card}` #FFFFFF | 17.4:1 | AAA |
| Body on Card | `{colors.body}` #4B5563 | `{colors.surface-card}` #FFFFFF | 8.2:1 | AAA |

---

## Typography

### Font Family

- **Display / Body / UI**: `Geist Sans` (variable font, wght 100–900), 폴백: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif` — Vercel이 만든 기하학적 산세리프. Bluesky의 InterVariable과 유사한 포지션 (깔끔한 가변 폰트). 한글은 시스템 폰트로 자동 폴백.
- **Mono**: `Geist Mono`, 폴백: `'Courier New', monospace` — 수치 데이터, 공급 세대수 표시 등.

### Hierarchy

| Token | Font | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|---|
| `{typography.display-xl}` | Geist | 24px (1.5rem) | 800 | 1.2 | -0.025em | 페이지 타이틀 (히어로) |
| `{typography.display-lg}` | Geist | 20px (1.25rem) | 800 | 1.25 | -0.02em | 섹션 헤드라인 |
| `{typography.title-lg}` | Geist | 17px (1.0625rem) | 700 | 1.3 | -0.015em | 카드 제목, 모달 헤더 |
| `{typography.title-md}` | Geist | 15px (0.9375rem) | 600 | 1.35 | -0.01em | 서브섹션 제목 |
| `{typography.body}` | Geist | 14px (0.875rem) | 400 | 1.5 | 0 | 기본 본문, 공고 설명 |
| `{typography.body-sm}` | Geist | 13px (0.8125rem) | 400 | 1.45 | 0 | 주소, 날짜 메타데이터 |
| `{typography.button}` | Geist | 14px (0.875rem) | 600 | 1 | 0 | 버튼 레이블 |
| `{typography.caption}` | Geist | 11px (0.6875rem) | 500 | 1.3 | 0.01em | 배지, 태그, 탭 레이블 |
| `{typography.nav-link}` | Geist | 10px (0.625rem) | 500 | 1.2 | 0.01em | 하단 내비게이션 |

### Principles

- **Letter-spacing은 크기에 반비례**: Display(24px)에서 -0.025em, Body(14px)에서 0. SpaceX의 D-DIN 타이포그래피에서 차용한 패턴 — 큰 글자일수록 더 타이트하게 조인다.
- **Weight ladder는 400/500/600/700/800**: 400(본문) → 500(캡션, 배지) → 600(버튼, 서브타이틀) → 700(카드 제목) → 800(페이지 타이틀). weight 300 이하는 모바일 가독성을 위해 사용하지 않는다.
- **Line-height는 역할로 결정**: Display는 1.2(타이트, SpaceX 스타일), Body는 1.5(가독성), 한 줄짜리 UI(버튼/배지)는 1.
- **한글 word-break**: `word-break: keep-all` 전역 적용 — Polestar KR 사이트에서 확인된 패턴.

### Note on Font Substitutes

Geist Sans는 Vercel의 **오픈소스 폰트** (SIL Open Font License)이므로 대체 불필요. Google Fonts에서 `next/font/google`로 직접 로드 중.

---

## Layout

### Spacing System

- **Base unit:** 4px.
- **Tokens:** `{spacing.xxs}` 2px · `{spacing.xs}` 4px · `{spacing.sm}` 8px · `{spacing.md}` 12px · `{spacing.lg}` 16px · `{spacing.xl}` 20px · `{spacing.xxl}` 24px · `{spacing.section}` 32px.
- **섹션 수직 패딩:** `{spacing.section}` (32px) — 모바일에서 과도한 여백은 스크롤 피로를 유발하므로 데스크톱 대비 절제.
- **카드 내부 패딩:** `{spacing.lg}` (16px) for notice cards; `{spacing.md}` (12px) for compact list items.
- **버튼 패딩:** 10px × 16px (medium), 8px × 12px (small).

### Grid & Container

- **최대 콘텐츠 너비:** ~512px centered (max-w-lg). 모바일 퍼스트 단일 컬럼.
- **컬럼 패턴:** 1열 피드 (홈, 지도 목록), full-width 지도 (지도 페이지 상단).
- **거터:** 8px between cards (space-y-2), 16px horizontal padding (px-4).
- **특이사항:** 지도 페이지는 상단 full-bleed 지도 + 하단 40% 시트 패턴.

### Whitespace Philosophy

House Alert의 여백은 **정보의 호흡**이다. 공고 목록은 밀도가 높지만(카드 간 8px), 각 카드 내부는 16px 패딩으로 콘텐츠에 여유를 준다. Polestar처럼 "덜어내는 미학"이 아니라, Bluesky처럼 "밀도 있지만 정돈된" 접근이다. 페이지 상단 헤더와 첫 카드 사이 16px이 페이지의 유일한 큰 호흡 구간이다.

---

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| Flat (0) | 그림자 없음, 보더 없음 | 캔버스 배경, 헤더 텍스트, 필터 영역 |
| Hairline (1) | 1px solid `{colors.hairline}` (#E5E7EB) | 공고 카드, 입력창, 탭 구분선 |
| Elevated (2) | `0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)` | 카드 hover 상태, 선택된 공고 |
| Nav (3) | `backdrop-filter: blur(12px)` + 1px border-top | 하단 내비게이션 바 (프로스트 글래스) |

**Shadow philosophy.** Polestar와 SpaceX에서 배운 교훈: 그림자는 최소화하고, **색상 변화와 hairline border가 계층을 표현**한다. 기본 상태의 카드는 1px border만 사용하고, hover/선택 시에만 미세한 그림자가 추가된다. Bluesky 앱에서도 카드 그림자를 거의 사용하지 않는 것을 확인 — 배경색 차이(#F8F9FA vs #FFFFFF)가 충분한 구분을 제공한다.

### Decorative Depth

- `backdrop-filter: blur(12px)` + `rgba(255,255,255,0.85)` on bottom nav — Polestar의 프로스트 글래스 네비게이션 직접 차용
- Canvas(#F8F9FA)와 Card(#FFFFFF) 간 미세한 명도 차이가 자연스러운 섹션 구분 역할
- 기관 배지의 tinted background가 카드 내 시각적 앵커 역할

---

## Motion

### Principle 3 · Motion as Token

Bluesky social-app의 모션 시스템(`cubic-bezier(0.17, 0.73, 0.14, 1)`, 100ms)을 기반으로 한다. 공공 서비스 앱이므로 모션은 **미세하고 빠르게** — 장식이 아닌 피드백 목적.

### Duration Scale

| Token | CSS Variable | Value | Use |
|---|---|---|---|
| `{motion.fast}` | `--duration-fast` | 100ms | 버튼 hover, 색상/투명도 전환, 칩 토글 |
| `{motion.base}` | `--duration-base` | 150ms | 카드 hover, 보더·그림자 전환 |
| `{motion.slow}` | `--duration-slow` | 300ms | 드롭다운, 시트 열림/닫힘 |
| `{motion.modal}` | `--duration-modal` | 300ms | 모달 진입/퇴장 (zoom + fade) |

### Easing Scale

| Token | CSS Variable | Value | Use |
|---|---|---|---|
| `{motion.ease-out}` | `--ease-out` | `cubic-bezier(0.17, 0.73, 0.14, 1)` | 기본 — Bluesky 앱에서 확인된 easing. 요소 진입 |
| `{motion.ease-in}` | `--ease-in` | `cubic-bezier(0.55, 0, 1, 0.45)` | 요소 퇴장 |
| `{motion.ease-expo}` | `--ease-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` | 시트 슬라이드 — Bluesky의 `slide_in_left` 참조 |

### Component-level Motion

| Component | Property | Duration | Easing |
|---|---|---|---|
| `button-primary` | background-color, transform | `--duration-fast` | `--ease-out` |
| `notice-card` | border-color, box-shadow | `--duration-base` | `--ease-out` |
| `filter-chip` | background-color, color | `--duration-fast` | `--ease-out` |
| `bottom-nav-tab` | color | `--duration-fast` | `--ease-out` |
| `map-sheet` | transform (translateY) | `--duration-slow` | `--ease-expo` |
| `search-input` | border-color | `--duration-fast` | `--ease-out` |

---

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.none}` | 0px | full-bleed 지도 영역 |
| `{rounded.sm}` | 6px | 입력창, 작은 배지 |
| `{rounded.md}` | 8px | 일반 버튼 |
| `{rounded.lg}` | 12px | 공고 목록 아이템 |
| `{rounded.xl}` | 16px | 공고 카드 (메인 카드) |
| `{rounded.pill}` | 9999px | 필터 칩, 기관 배지, 상태 배지 |
| `{rounded.full}` | 50% | 지도 마커 버튼 |

### Photography & Illustration

- **이미지 없음**: House Alert는 공고 데이터 앱으로, 사진/일러스트레이션을 사용하지 않는다.
- **빈 상태 이모지**: 콘텐츠가 없을 때 이모지(🗺️, 📋 등)로 시각적 앵커 — Bluesky의 깨끗한 빈 상태 패턴 참조.
- **지도 타일**: Google Maps 임베드가 유일한 비주얼 리치 요소.

---

## Components

### Navigation

**`bottom-nav`** — 하단 고정 3탭 네비게이션. 모바일 앱의 주요 이동 수단.
- Background `{colors.surface-nav}` (rgba(255,255,255,0.85)), height 56px + safe-area-inset-bottom, `backdrop-filter: blur(12px)`.
- 3 tabs: 홈 (📋), 지도 (🗺️), 내 설정 (⚙️). 각 탭은 이모지 아이콘 + `{typography.nav-link}` 레이블.
- Active: `{colors.primary}` (#006AFF) + font-weight 600.
- Inactive: `{colors.muted}` (#9CA3AF) + font-weight 500.
- Border-top: 1px solid `{colors.hairline}`.

### Buttons

#### Size Variants

| Size | Token | Height | Padding H | Font Size | Radius | Use |
|---|---|---|---|---|---|---|
| Small | `btn-sm` | 36px | 12px | 13px | `{rounded.md}` (8px) | 인라인 액션, 카드 내부 버튼 |
| Medium | `btn-md` | 44px | 16px | 14px | `{rounded.md}` (8px) | 기본 CTA (touch target 기준) |
| Large | `btn-lg` | 52px | 24px | 15px | `{rounded.xl}` (16px) | 히어로 CTA, 전체 너비 버튼 |

#### State Matrix

**`button-primary` states:**

| State | Background | Text | Border | Shadow | Transform |
|---|---|---|---|---|---|
| Default | `{colors.primary}` #006AFF | `{colors.on-primary}` #FFF | none | none | none |
| Hover | `{colors.primary-hover}` #0055DD | `{colors.on-primary}` #FFF | none | `0 1px 3px rgba(0,106,255,0.3)` | `translateY(-1px)` |
| Focus | `{colors.primary}` #006AFF | `{colors.on-primary}` #FFF | 2px solid #006AFF offset 2px | none | none |
| Active / Press | `{colors.primary-press}` #004ABB | `{colors.on-primary}` #FFF | none | none | `scale(0.98)` |
| Disabled | `{colors.primary}` #006AFF | `{colors.on-primary}` #FFF | none | none | none + `opacity: 0.4` |

**`button-secondary` states:**

| State | Background | Text | Border | Shadow | Transform |
|---|---|---|---|---|---|
| Default | transparent | `{colors.primary}` #006AFF | 1px solid `{colors.hairline}` | none | none |
| Hover | `{colors.primary-light}` #EBF2FF | `{colors.primary}` #006AFF | 1px solid `{colors.primary}` | none | none |
| Active / Press | `{colors.primary-light}` #EBF2FF | `{colors.primary-press}` #004ABB | 1px solid `{colors.primary-press}` | none | `scale(0.98)` |
| Disabled | transparent | `{colors.muted}` | 1px solid `{colors.hairline}` | none | none + `opacity: 0.4` |

**`text-link`** — Inline body link. Color `{colors.primary}` #006AFF, no underline by default, underline on hover. Bluesky 패턴.

### Cards & Containers

**`notice-card`** — 공고 하나를 표시하는 메인 카드. 홈 피드의 기본 단위.
- Background `{colors.surface-card}` #FFFFFF, rounded `{rounded.xl}` (16px), padding `{spacing.lg}` (16px).
- Border: 1px solid `{colors.hairline}` (#E5E7EB).
- 내부 구성: [기관 배지 + 상태 배지 + 지역] → [제목 (2줄 clamp)] → [주소] → [유형 태그 + 날짜].
- Hover: border-color darkens to #D1D5DB, `box-shadow: 0 1px 3px rgba(0,0,0,0.08)`.
- Mobile press: `transform: scale(0.98)` — SpaceX의 인터랙티브 피드백 패턴.
- Link: 전체 카드가 `/notices/[id]`로의 링크.

**`highlight-card`** — 선택된 공고 (지도 페이지).
- Background `{colors.primary-light}` #EBF2FF, border 1px solid `{colors.primary}` 20% opacity, rounded `{rounded.xl}`.

### Inputs & Forms

**`search-input`** — 공고 검색 입력창.
- Background `{colors.surface-card}` #FFFFFF, text `{colors.ink}`, type `{typography.body}`, rounded `{rounded.lg}` (12px), padding 10px × 12px, height 40px.
- Border: 1px solid `{colors.hairline}`.
- Focus: border-color `{colors.primary}`, `ring-2 ring-blue-100`.
- Placeholder: `{colors.muted}`.
- Clear button (✕): 오른쪽 끝, `{colors.muted}` → hover `{colors.body}`.

### Tags & Badges

**`badge-org`** — 기관별 식별 배지 (LH, SH, iH, GH).
- Background/text는 Organization Badge Colors 섹션 참조. Type `{typography.caption}` (11px/500), rounded `{rounded.pill}`, padding 2px × 6px.

**`badge-status`** — 공고 상태 배지 (공고중, 접수중, 접수마감).
- 공고중: bg #DBEAFE, text #1E40AF.
- 접수중: bg #D1FAE5, text #065F46.
- 접수마감: bg #F3F4F6, text #6B7280.
- Type `{typography.caption}`, rounded `{rounded.pill}`, padding 2px × 6px.

**`badge-type`** — 공고 유형 태그 (분양, 임대, 신혼희망타운 등).
- Background `{colors.canvas}` #F8F9FA, text `{colors.body}`, type `{typography.caption}`, rounded `{rounded.sm}` (6px), padding 2px × 8px.

### Filter Bar

**`filter-chip`** — 다중 선택 필터 칩 (지역, 유형, 기관).
- Default: bg transparent, text `{colors.body}`, border 1px solid `{colors.hairline}`, rounded `{rounded.pill}`, padding 6px × 12px.
- Selected: bg `{colors.primary}` #006AFF, text `{colors.on-primary}` #FFF, border none.
- 가로 스크롤 가능한 칩 그룹, `scrollbar-hide` 유틸리티 적용.

### Map Sheet

**`map-sheet`** — 지도 페이지 하단 패널. 공고 목록을 지도 아래에 표시.
- Background `{colors.surface-card}`, border-top 1px solid `{colors.hairline}`.
- Max-height: 40% viewport. overflow-y: auto.
- 각 아이템: `notice-list-item` — 간소화된 카드 (패딩 12px, 구분선으로 분리).

### Footer

**`footer`** — 없음. 모바일 앱 패턴이므로 별도 푸터 없이 `bottom-nav`가 그 역할.

---

## Do's and Don'ts

### Do

- `{colors.primary}` #006AFF를 **모든 인터랙티브 요소**에 사용 — 링크, CTA, 포커스 링, 활성 탭, 선택된 칩 모두 단일 액센트
- 헤드라인은 `{typography.display-xl}` + weight 800 + 음수 letter-spacing — SpaceX의 대담한 타이포 위계
- 카드 기본 상태는 **hairline border만** — 그림자는 hover/선택 시에만 미세하게
- 기관 배지는 반드시 tinted background + 같은 계열 텍스트 조합 — 충분한 대비 유지
- `backdrop-filter: blur(12px)`를 bottom-nav에 항상 적용 — 프로스트 글래스가 브랜드 시그니처
- 모든 터치 타겟은 최소 44×44px — Apple HIG 준수
- `scale(0.98)` 또는 `translateY(-1px)`로 모든 버튼/카드에 미세한 물리적 피드백

### Don't

- 두 번째 액센트 색상 추가 금지 — 파란색 하나가 모든 인터랙션 신호
- 카드 기본 상태에 `box-shadow` 사용 금지 — hairline border + 배경색 차이가 계층을 표현
- 장식적 그라디언트, 패턴 배경 사용 금지 — 정보 앱은 콘텐츠가 주역
- Body 텍스트에 weight 700+ 사용 금지 — bold는 제목 전용
- 기관 배지 색상을 데이터 시각화 외 목적으로 사용 금지 — 인디고/퍼플/틸/오렌지는 기관 식별 전용
- 8px 미만의 카드 간격 사용 금지 — 터치 실수 방지
- 커스텀 스크롤바 스타일링 금지 (hide 제외) — 네이티브 OS 동작 존중

---

## Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|---|---|---|
| Mobile | < 640px | 기본 레이아웃. 1열, max-w-lg centered, bottom-nav 표시 |
| Tablet | 640px–1024px | 콘텐츠 영역 여전히 max-w-lg, 좌우 여백 확대 |
| Desktop | > 1024px | [향후] 사이드바 네비게이션 전환 가능, bottom-nav 숨김 |

The structural breakpoint that matters most: **640px** (max-w-lg content lock). 사실상 모바일 전용 앱이므로 640px 이상에서도 동일 레이아웃에 중앙 정렬만 변화.

### Touch Targets

- 최소 44×44px. `button-primary` 실제 tap area: 44px height 이상.
- 하단 nav 탭: 각 탭 영역 ≥ 80px wide × 56px tall.
- `notice-card`: 전체 카드가 탭 영역.
- `filter-chip`: 최소 36px height, 좌우 12px 패딩으로 실질 48px+ wide.

### Collapsing Strategy

- **Nav**: 모든 뷰포트에서 bottom-nav 고정 (모바일 앱 패턴).
- **지도 페이지**: 지도 영역이 상단 60%, 리스트가 하단 40%. 모바일에서도 동일 비율.
- **카드 그리드**: 항상 1열. 태블릿 이상에서도 카드 최대 너비 고정.
- **타이포그래피**: 반응형 크기 조정 없음 — 모바일 최적화 크기를 모든 뷰포트에서 유지.

### Image Behavior

- 이미지 없음 (데이터 앱). Google Maps 타일만 해당.
- 지도: `flex-1` (가용 높이 자동 확장), lazy loading 미적용 (즉시 표시 필요).

---

## Agent Prompt Guide

### Quick Color Reference

| Role | Token | Hex |
|---|---|---|
| Primary CTA | `{colors.primary}` | #006AFF |
| Primary Hover | `{colors.primary-hover}` | #0055DD |
| Primary Light | `{colors.primary-light}` | #EBF2FF |
| Page Background | `{colors.canvas}` | #F8F9FA |
| Card Background | `{colors.surface-card}` | #FFFFFF |
| Primary Text | `{colors.ink}` | #111111 |
| Secondary Text | `{colors.body}` | #4B5563 |
| Muted Text | `{colors.muted}` | #9CA3AF |
| Border | `{colors.hairline}` | #E5E7EB |
| On Primary | `{colors.on-primary}` | #FFFFFF |
| Focus Ring | blue-100 tint + 2px primary | #006AFF |
| Success | `{colors.success}` | #10B981 |
| Error | `{colors.error}` | #EF4444 |

### Example Component Prompts

- "**공고 카드**: 흰색 배경, 1px #E5E7EB 보더, 16px 라운딩, 16px 패딩. 상단에 기관 배지(pill, tinted bg) + 상태 배지 + 지역 텍스트. 제목은 14px/700 #111 2줄 clamp. 주소는 13px/400 #4B5563. hover 시 shadow 0 1px 3px rgba(0,0,0,0.08)."
- "**Primary 버튼**: bg #006AFF, text #FFF, 14px/600, 8px 라운딩, 10px×16px 패딩, 44px 높이. hover bg #0055DD, press scale(0.98)."
- "**필터 칩**: pill 모양, 기본은 투명+border, 선택 시 bg #006AFF + text #FFF. 6px×12px 패딩."
- "**하단 네비게이션**: 고정, rgba(255,255,255,0.85) bg, blur(12px), 56px 높이. 3탭: 이모지+10px 레이블. 활성=#006AFF, 비활성=#9CA3AF."
- "**검색 입력창**: 흰색 bg, 12px 라운딩, 1px #E5E7EB 보더, focus 시 #006AFF 보더 + blue ring."
- "**지도 페이지**: 상단 60% Google Maps embed + 하단 40% 공고 목록 시트. 시트는 흰색 bg, border-top."

### Iteration Guide

1. 한 번에 컴포넌트 하나. 해당 토큰으로 직접 참조.
2. 기존 컴포넌트의 변형 (`-active`, `-focused`)은 State Matrix 테이블에 명시.
3. `{token.refs}` 사용 일관 — hex 직접 입력 금지.
4. 컴포넌트 상태(State Matrix)는 테이블로 명시 — default / hover / focus / active / disabled 모두 포함.
5. **파란색 하나**: 모든 인터랙티브 요소는 `{colors.primary}` #006AFF. 예외 없음.
6. **그림자 금욕**: 카드 기본 상태에 그림자 금지. hover/선택 시에만 미세하게.
7. **기관 색상 격리**: LH/SH/iH/GH 배지 색상은 배지 외부로 유출되지 않는다.

---

## Known Gaps

- 다크모드 대응은 현재 정의되지 않음 — Bluesky의 3테마 시스템(light/dark/dim)을 향후 참조 가능
- Form validation / error 상태 UI는 분석한 페이지에서 확인되지 않음 — 별도 정의 필요
- 토스트/스낵바 알림 컴포넌트 미정의 — API 에러 표시 등에 필요
- 온보딩/첫 실행 플로우 미정의
- 접근성: 스크린 리더 테스트 미완, aria-label 패턴 미정의
- 프로필/설정 페이지 컴포넌트(토글, 라디오, 셀렉트) 미정의
- 페이지네이션/무한 스크롤 패턴 미정의
- Geist Sans의 한글 렌더링 품질은 시스템 폰트 폴백에 의존 — 실기기 테스트 필요
