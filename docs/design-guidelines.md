# Design Guidelines — "Daylight"

The complete design specification for the Solar Calculator redesign. It is written so an implementing agent can build every screen without guessing. Read it top to bottom once, then use the section index.

- **Visual source of truth:** the Design canvas "Solar Calculator Redesign" (https://claude.ai/artifact/AJtdxiE7r7L2W5zWzfZ1C4 — private; the owner must share it). If this document and the canvas disagree, **this document wins** for tokens, behaviour and accessibility; the canvas wins for visual composition.
- **Project rules still apply:** everything in `CLAUDE.md` (no code comments, Tailwind over inline styles, DRY constants, nested media queries, no tool attribution in commits) overrides any example in this file.

---

## Contents

1. [How to use this document](#1-how-to-use-this-document)
2. [Audience and product principles](#2-audience-and-product-principles)
3. [Design principles](#3-design-principles)
4. [Foundations](#4-foundations) — colour, typography, spacing, radii, elevation, icons, illustration
5. [Layout and breakpoints](#5-layout-and-breakpoints)
6. [Motion](#6-motion)
7. [Components](#7-components)
8. [Screens](#8-screens)
9. [Content and voice](#9-content-and-voice)
10. [Accessibility](#10-accessibility)
11. [Implementation guide](#11-implementation-guide)
12. [Data dependencies and open questions](#12-data-dependencies-and-open-questions)
13. [Anti-patterns](#13-anti-patterns)

---

## 1. How to use this document

**Priority order when rules conflict:**

1. Accessibility (section 10) — never trade it away.
2. `CLAUDE.md` coding rules.
3. Tokens and components in this document.
4. The canvas composition.

**Terminology used here:**

| Term                      | Meaning                                                                                                    |
| ------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Token                     | A named design value (colour, size) defined once in `app/globals.css` and consumed via Tailwind utilities. |
| Public screens            | Home, Calculator, Results, Log in / Create account — used without an account.                              |
| Workspace screens         | Fleet dashboard, Team & activity — require login and a fleet.                                              |
| Desktop / Tablet / Mobile | ≥1024 px / 768–1023 px / <768 px (section 5).                                                              |
| MUST / SHOULD / MAY       | Mandatory / strong default, deviate only with a reason / optional.                                         |

**What is sample data:** every number, name and email on the canvas (€4,200, "Nordwind Logistics", "Anna Weber", "6.1 t", "300 trees") is placeholder. Never hard-code them. See section 12.

---

## 2. Audience and product principles

**Primary user (decided):** a non-technical owner or manager of a small-to-mid commercial fleet (1–50 vehicles) who wants a fast yes/no answer: _"Do solar panels pay off for my vehicles?"_ They do not know their vehicles' kWh/100 km or roof load.

**Secondary user:** a logged-in fleet manager who saves vehicle groups, compares results, downloads PDFs for a bank or boss, and manages a small team.

**Product principles:**

1. **Answer first, details on demand.** Every result screen leads with one sentence a person could repeat to their boss.
2. **Rough is fine, precise is possible.** Default inputs are plain-language choices; exact technical fields exist but are optional and collapsed.
3. **Honest numbers.** Sample or estimated figures are always labelled. Never show a number the engine did not produce.
4. **Nothing decorative that costs comprehension.** Animation and illustration exist to show state or direct attention.

---

## 3. Design principles

| #   | Principle                       | Do                                                                                   | Don't                                              |
| --- | ------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------- |
| 1   | **One primary action per view** | One lime button per screen (e.g. "Start my estimate", "Continue", "Create account"). | Two competing lime buttons side by side.           |
| 2   | **Plain words over jargon**     | "How far does one vehicle drive on a normal day?"                                    | "Average Daily Distance (km)".                     |
| 3   | **Big, forgiving targets**      | Choice cards and 44 px+ controls.                                                    | Small radio buttons, tiny selects.                 |
| 4   | **Show progress and position**  | Step indicator, "Step 2 of 4", accuracy bar.                                         | A long form with no sense of how much is left.     |
| 5   | **Calm surface, one accent**    | Warm paper background, forest ink, lime only as a fill.                              | Gradients, glassmorphism, multiple accent colours. |
| 6   | **Progressive disclosure**      | `<details>` for "How we calculated this", "I know the exact numbers".                | Provenance tables shown open by default.           |

---

## 4. Foundations

### 4.1 Colour tokens

All colours are CSS custom properties on `:root`, overridden under `:root[data-theme="dark"]`, and exposed to Tailwind through `@theme inline` (section 11.2). Components MUST use token utilities (`bg-surface`, `text-ink`), never raw hex.

| Token           | Light     | Dark      | Use                                                          |
| --------------- | --------- | --------- | ------------------------------------------------------------ |
| `ground`        | `#F6F4EE` | `#0F1712` | Page background                                              |
| `side`          | `#F1EEE6` | `#121C16` | Workspace sidebar / icon rail                                |
| `surface`       | `#FFFFFF` | `#17231B` | Cards, inputs, tables                                        |
| `soft`          | `#EEF1EA` | `#1F2E24` | Quiet panels (answers panel, icon tiles, badges)             |
| `ink`           | `#16231B` | `#EEF1EA` | Headings, body text, dark buttons                            |
| `muted`         | `#4F5F55` | `#A9B6AD` | Secondary text, labels                                       |
| `line`          | `#DEE3DA` | `#2A3A2F` | Card borders, dividers                                       |
| `line-strong`   | `#C9D2C6` | `#3A4C40` | Input and secondary-button borders                           |
| `track`         | `#E3E7DF` | `#26352B` | Progress-bar tracks, inactive step bars                      |
| `lime`          | `#B6F065` | `#B6F065` | Primary button fill, highlights, avatar, selected tab (dark) |
| `on-lime`       | `#16231B` | `#16231B` | Text on lime — always dark                                   |
| `lime-soft`     | `#E9F5D6` | `#24361F` | Success pills, selection halo, "Free" badge                  |
| `lime-soft-ink` | `#2F5A1E` | `#CFEFA0` | Text on `lime-soft`, positive links                          |
| `forest`        | `#1F3A2B` | `#1F3A2B` | Hero panels, login side panel                                |
| `hero`          | `#16231B` | `#1F3A2B` | Highlighted KPI tile background                              |
| `hero-muted`    | `#C9D4CC` | `#C9D4CC` | Secondary text on `hero` / `forest`                          |
| `chart-profit`  | `#7FB33A` | `#7FB33A` | Chart "pure profit" bars, filled progress                    |
| `chart-payoff`  | `#D5DCCF` | `#3A4C40` | Chart "paying off" bars                                      |
| `sun`           | `#F2B544` | `#F2B544` | Sun illustration, sun-exposure dots only                     |
| `warn-soft`     | `#FBEFD6` | `#3A3020` | "Needs calculation" pill background                          |
| `warn-ink`      | `#7A4F0B` | `#F4CF86` | Text on `warn-soft`                                          |
| `danger`        | `#B42318` | `#F97066` | Form errors, destructive actions                             |

**Colour rules (MUST):**

- Lime is **never** used as text or icon colour on light backgrounds (contrast ≈1.5:1 — the current `StatTile` bug). On dark backgrounds lime text is allowed (≥9:1).
- Text on lime is always `on-lime`.
- `sun` (gold) is decorative only; it never carries meaning alone.
- Status is never colour-only: pills always include a text label; charts always include a legend.
- Distinguish chart series by lightness, not hue alone (`chart-payoff` is light, `chart-profit` is mid).

**Verified contrast (WCAG 2.2):**

| Pair                           | Ratio  | Passes |
| ------------------------------ | ------ | ------ |
| `ink` on `ground`              | ≈15:1  | AAA    |
| `muted` on `ground`            | ≈6.1:1 | AA     |
| `muted` on `surface`           | ≈6.8:1 | AA     |
| `on-lime` on `lime`            | ≈12:1  | AAA    |
| `lime-soft-ink` on `lime-soft` | ≈7:1   | AAA    |
| `warn-ink` on `warn-soft`      | ≈6.1:1 | AA     |
| dark `muted` on dark `surface` | ≈7.5:1 | AAA    |
| `hero-muted` on `hero`         | ≈10:1  | AAA    |

Any new pair MUST be checked to ≥4.5:1 (≥3:1 for text ≥24 px or bold ≥18.66 px, and for UI boundaries).

### 4.2 Typography

**Families** (load via `next/font/google` in `app/[locale]/layout.tsx`, replacing Lexend and Inter):

| Role                                             | Family              | Weights       | CSS variable     |
| ------------------------------------------------ | ------------------- | ------------- | ---------------- |
| Display (headings, big numbers)                  | Bricolage Grotesque | 500, 700, 800 | `--font-display` |
| Body (everything else, incl. buttons and inputs) | Instrument Sans     | 400, 500, 600 | `--font-body`    |

Both need `latin-ext` in `subsets` (German umlauts, Spanish accents, `₂`). Fallback stack: `system-ui, -apple-system, "Segoe UI", sans-serif`.

**Type scale** (px; line-height; letter-spacing). Use Tailwind arbitrary values only through tokens defined in `@theme` (section 11.2).

| Token        | Desktop             | Tablet    | Mobile    | Weight  | Family  | Use                                                    |
| ------------ | ------------------- | --------- | --------- | ------- | ------- | ------------------------------------------------------ |
| `display-xl` | 72 / 1.02 / -0.03em | 58 / 1.03 | 40 / 1.05 | 800     | Display | Home hero h1                                           |
| `display-l`  | 64 / 1.05 / -0.03em | 50 / 1.08 | 36 / 1.1  | 800     | Display | Results headline                                       |
| `display-m`  | 44 / 1.1 / -0.02em  | 40 / 1.1  | 32 / 1.1  | 800     | Display | Calculator question, login h1                          |
| `display-s`  | 40 / 1.15 / -0.02em | 34        | 30        | 800     | Display | Workspace page titles, section titles ("How it works") |
| `number-l`   | 44 / 1 / -0.02em    | 40        | 30        | 800     | Display | Stat tile values                                       |
| `number-m`   | 36 / 1              | 34        | 26        | 800     | Display | Dashboard KPI values                                   |
| `title`      | 28 / 1.25           | 26        | 22        | 700     | Display | Card titles ("When do you get your money back?")       |
| `heading`    | 22 / 1.3            | 20        | 18        | 600     | Body    | Card headings, choice-card labels                      |
| `body-l`     | 20 / 1.55           | 19        | 17        | 400     | Body    | Lead paragraphs                                        |
| `body`       | 16 / 1.55           | 16        | 15        | 400     | Body    | Default text                                           |
| `label`      | 15 / 1.4            | 15        | 15        | 600     | Body    | Form labels, KPI labels                                |
| `small`      | 14 / 1.5            | 14        | 14        | 400–600 | Body    | Meta, hints                                            |
| `caption`    | 13 / 1.4            | 13        | 13        | 400–600 | Body    | Timestamps, legends, overlines                         |
| `micro`      | 12 / 1.3            | 12        | 12        | 600     | Body    | Badges, tab-bar labels                                 |

**Rules:**

- Minimum body size on mobile: 15 px. Inputs MUST be ≥16 px text to prevent iOS zoom.
- Numbers in tables and KPIs use `font-variant-numeric: tabular-nums` (Tailwind `tabular-nums`).
- Headings never wrap to more than 4 lines on mobile; if copy is longer, shorten the copy.
- Overline labels ("4 QUICK STEPS", "YOUR ANSWERS"): `caption`, 600, uppercase, `tracking-[0.06em]`, `text-muted`.

### 4.3 Spacing

Base unit 4 px. Use Tailwind's default spacing scale (`1` = 4 px). Allowed steps: 4, 8, 10, 12, 14, 16, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80.

| Context              | Desktop                           | Tablet  | Mobile |
| -------------------- | --------------------------------- | ------- | ------ |
| Page side gutter     | 80 (public) / 48 (workspace main) | 40 / 32 | 16     |
| Section vertical gap | 64–72                             | 48–56   | 32–40  |
| Card padding         | 24–32                             | 20–24   | 16–20  |
| Gap between cards    | 20–24                             | 14–16   | 10–12  |
| Label → input        | 8                                 | 8       | 8      |
| Field → field        | 20                                | 20      | 16     |

### 4.4 Radii

| Token         | Value    | Use                                                        |
| ------------- | -------- | ---------------------------------------------------------- |
| `radius-sm`   | 10 px    | Icon tiles in lists, small squares                         |
| `radius-md`   | 14–16 px | Inputs, stepper buttons, small cards, list items on mobile |
| `radius-lg`   | 20 px    | Choice cards, stat tiles, panels                           |
| `radius-xl`   | 24 px    | Section cards (tables, chart card)                         |
| `radius-2xl`  | 28–32 px | Hero panels, dark "Built for" band                         |
| `radius-full` | 999 px   | Buttons, pills, chips, avatars, progress bars              |

Buttons are always fully rounded (pill). Cards are never fully rounded.

### 4.5 Elevation

Flat by default: borders (`line`) do the separation. Shadows only for:

| Token           | Value                              | Use                                                |
| --------------- | ---------------------------------- | -------------------------------------------------- |
| `shadow-hover`  | `0 12px 28px rgb(22 35 27 / 0.10)` | Card hover lift (desktop pointer only)             |
| `shadow-float`  | `0 20px 40px rgb(0 0 0 / 0.25)`    | White card floating on the forest hero panel       |
| `shadow-tab`    | `0 1px 3px rgb(22 35 27 / 0.12)`   | Active segment in segmented controls               |
| `ring-selected` | `0 0 0 4px var(--lime-soft)`       | Selected choice card halo + focus-within on inputs |

### 4.6 Iconography

- **Library:** `react-icons` is already installed; use the **Lucide** set (`react-icons/lu`) for a consistent 2 px rounded stroke. Custom vehicle icons (van, truck, bus, trailer) MAY be inline SVG components in `components/icons/` if Lucide lacks a good match.
- **Style:** stroke only, 1.5 px (large, ≥32 px) or 2 px (≤24 px), round caps and joins, `currentColor`.
- **Sizes:** 16 (inline meta), 18–20 (buttons, nav), 22 (tab bar), 36–44 (choice cards).
- **Never** use emoji as icons. Icon-only buttons MUST have `aria-label`.
- **Logo (placeholder):** a plain circle mark — a `forest` circle with a smaller centred `sun` (gold) circle, no rays — plus "Solar Calculator" in Display 700. On dark panels the outer circle uses `ground` at low opacity so it stays visible. **The owner will replace this mark with a custom image later**, so it lives only in the one `Logo` component (`components/common/Logo.tsx`) and is never redrawn elsewhere. The sun-with-rays mark on the canvas is retired.

### 4.7 Illustration

Only one illustration, a **placeholder**: a plain gold circle (`sun`, no rays, no rotation), partly cropped off the corner of forest-green panels (home hero, login side panel). **The owner will replace it with a custom image later**, so it lives only in `components/common/BrandIllustration.tsx` and every panel uses that component. The rotating sun with rays on the canvas is retired. No stock photos, no 3D renders. The current `forestlight.webp` / `forestdark.webp` / `bus.webp` hero images are retired.

---

## 5. Layout and breakpoints

Use Tailwind v4 default breakpoints (mobile-first):

| Name    | Tailwind prefix | Range       | Canvas reference width    |
| ------- | --------------- | ----------- | ------------------------- |
| Mobile  | (none)          | 0–767 px    | 390                       |
| Tablet  | `md:`           | 768–1023 px | 834                       |
| Desktop | `lg:`           | ≥1024 px    | 1440                      |
| Wide    | `xl:` / `2xl:`  | ≥1280 px    | — (content stops growing) |

**Max content widths:** public pages `max-w-[1280px]` centred inside the 80 px gutter; results headline `max-w-[1000px]`, lead paragraph `max-w-[760px]`; workspace main area is fluid.

**Page shells:**

| Shell      | Desktop                                                   | Tablet                                                                                 | Mobile                                                                     |
| ---------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Public     | Top header (72–80 px) with inline nav + Log in + language | Header with Log in + hamburger                                                         | Header with logo + hamburger (Log in inside menu)                          |
| Calculator | 3 columns: steps rail 280 · question · answers panel 380  | Single column, horizontal step bars on top, answers collapsed, fixed bottom action bar | Single column, "Step n of 4" + bar, fixed bottom Continue                  |
| Workspace  | Sidebar 260 px + main                                     | Icon rail 88 px (icon + 12 px label) + main                                            | Top bar (fleet switcher + avatar) + content + fixed bottom tab bar (76 px) |

Fixed bottom bars MUST add `padding-bottom: env(safe-area-inset-bottom)` and the page content MUST reserve the same height so nothing hides behind them.

---

## 6. Motion

**Philosophy:** motion explains change (a new step, a filling bar) or confirms interaction (hover lift). It never delays reading. Total entry animation per screen ≤ 800 ms.

**Easing tokens:**

- `ease-out-soft`: `cubic-bezier(0.2, 0.7, 0.2, 1)` — all entrances and fills.
- `ease-standard`: `ease` — hovers and colour changes.

**Catalogue (the only animations allowed):**

| Name               | What                                   | Duration                                           | Where                                                                                                                             |
| ------------------ | -------------------------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `rise`             | opacity 0→1, translateY 14→0           | 600–700 ms, stagger 120 ms, max 3 steps            | Hero content, result headline, stat tiles, KPI tiles                                                                              |
| `step-in`          | opacity 0→1, translateX 18→0           | 450 ms                                             | Calculator step content on step change                                                                                            |
| `swap`             | opacity 0→1, translateY 8→0            | 300–350 ms                                         | Tab/segment content change (login tabs, team/activity)                                                                            |
| `fill`             | width 0→value                          | 500 ms (step progress) / 1200 ms (report progress) | Progress bars                                                                                                                     |
| `grow`             | scaleY 0→1, origin bottom              | 800 ms, stagger 50 ms per bar                      | Bar charts (none currently)                                                                                                         |
| `lift`             | translateY 0→-2/-3 px + `shadow-hover` | 150–200 ms                                         | Choice cards, "How it works" cards, stat tiles (pointer devices only: wrap in `@media (hover: hover)` nested inside the selector) |
| `pulse`            | opacity 1→0.35→1                       | 1600 ms loop                                       | Status dot of an in-progress job only                                                                                             |
| `spin`             | rotate 360°                            | 60–80 s loop                                       | Not used while the illustration is a placeholder circle; revisit when the final image arrives                                     |
| Colour transitions | background/border/colour               | 150–300 ms                                         | Buttons, chips, step dots, theme switch                                                                                           |

**Reduced motion (MUST):** every keyframe animation is disabled under `prefers-reduced-motion: reduce`; bars render at their final size; transitions shorten to 0 ms except colour. Write the media query nested inside each selector per `CLAUDE.md`:

```css
.animate-rise {
  animation: rise 0.7s var(--ease-out-soft) both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
}
```

**Not allowed:** parallax, scroll-jacking, count-up number tickers, confetti, looping animations other than `pulse` (and `spin`, currently unused), page-transition animations, animating layout properties other than progress-bar width.

**Implementation:** CSS keyframes in `globals.css` exposed as Tailwind `--animate-*` theme tokens (section 11.2). No animation library (no Framer Motion) is needed.

---

## 7. Components

Each component lists anatomy, variants, sizes, states and the existing file it replaces or extends. All interactive components MUST show a visible focus ring: `outline: 2px solid var(--ink); outline-offset: 2px` (on dark: `var(--lime)`), via `focus-visible:`.

### 7.1 Button

File: `components/form/Button.tsx` (rewrite; add `variant`, `size`, optional `icon`, `href` support via a sibling `ButtonLink` for navigation).

| Variant     | Background              | Text      | Border             | Use                                                                       |
| ----------- | ----------------------- | --------- | ------------------ | ------------------------------------------------------------------------- |
| `primary`   | `lime`                  | `on-lime` | none               | The one main action per view                                              |
| `dark`      | `ink`                   | `ground`  | none               | Strong secondary (Log in, Download PDF, See my results, Save to my fleet) |
| `secondary` | transparent / `surface` | `ink`     | 1 px `line-strong` | Back, Change answers, Share link                                          |
| `ghost`     | transparent             | `ink`     | none               | Tertiary inline actions                                                   |
| `danger`    | `danger`                | white     | none               | Destructive, confirm dialogs only                                         |

| Size | Height   | Padding-x | Font           |
| ---- | -------- | --------- | -------------- |
| `lg` | 56–60 px | 32 px     | 17–18 px / 600 |
| `md` | 48–52 px | 22–24 px  | 15–16 px / 600 |
| `sm` | 40–44 px | 16–20 px  | 14–15 px / 600 |

- Shape: `rounded-full`. Icon gap 8–10 px, icon 18–20 px, trailing arrow on forward actions ("Start my estimate →").
- States: hover (primary: `brightness-95` + translateY -1 px; others: border → `ink`), active (translateY 0), disabled (opacity 0.5, `cursor-not-allowed`, no hover), loading (spinner replaces icon, label stays, `aria-busy="true"`).
- Mobile bottom-bar buttons are full width.
- Links that navigate MUST be `<a>`/`<Link>`, actions MUST be `<button>`.

### 7.2 Choice card (single select)

New: `components/form/ChoiceCard.tsx` + `ChoiceCardGroup.tsx`. Replaces `<select>`/radios for vehicle type, distance band, panel placement.

- Anatomy: optional icon tile (64–72 px square, `radius-lg`, `ground` fill, 40–44 px vehicle icon), label (`heading`), hint (`small`, `muted`), optional trailing indicator (sun dots).
- Layouts: vertical card (vehicle type desktop, 4 across), horizontal row (placement, tablet vehicle type, 2 across), compact (mobile, 2 across).
- States: idle (2 px `line` border, `surface`), hover (lift, pointer only), selected (2 px `ink` border + `ring-selected`), focus-visible (focus ring), disabled (opacity 0.5).
- Semantics: a `role="radiogroup"` with `aria-labelledby` pointing at the question; each card is a native `<input type="radio">` visually hidden inside a `<label>` (preferred) — arrow keys move selection. If implemented as buttons, use `aria-pressed` and handle arrow keys.
- Wire to react-hook-form with `Controller`.

### 7.3 Chip group (single select, short options)

New: `components/form/ChipGroup.tsx`. For parking type ("At our depot", "On the street", "At customer sites", "It varies") and audit filters.

- Height 40–48 px, padding-x 14–20 px, `rounded-full`, 15–16 px / 500–600.
- Idle: 1–2 px `line-strong` border, `surface`. Selected: `ink` fill, `ground` text.
- Same radiogroup semantics as 7.2. Wraps on narrow screens; on mobile the audit-filter row MAY scroll horizontally (`overflow-x-auto`, no visible scrollbar, snap to chips).

### 7.4 Segmented control / tabs

New: `components/common/SegmentedControl.tsx`. For Log in / Create account and mobile Activity / Team.

- Track: `rounded-full`, 4 px padding, background `#E9ECE4` (add token `segment-track`; dark `#1F2E24`).
- Segment: 44–46 px, `rounded-full`, 15 px / 600. Active: `surface` + `shadow-tab`, `ink`. Inactive: transparent, `muted`.
- Log in / Create account: segments are **links** to `/login` and `/register` (keeps URLs shareable); mark the current one `aria-current="page"`.
- Activity / Team: real tabs (`role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`, arrow-key navigation). Content change uses `swap`.

### 7.5 Number stepper

New: `components/form/NumberStepper.tsx`. For "How many?".

- `−` button (52–56 px square, `radius-md`, `line-strong` border), text input (96–120 px desktop / flex-grow mobile, centred 22 px / 600, `inputmode="numeric"`), `+` button.
- Min 1, max 999; buttons disable at the limits. Typing is allowed; invalid input shows the error pattern (7.7).
- Buttons have `aria-label` ("Fewer vehicles" / "More vehicles"); the input has a visible `<label>`.

### 7.6 Text input

File: `components/form/Input.tsx` (restyle).

- Height 54–56 px, padding-x 16–18 px, `radius-md`, 1 px `line-strong`, `surface`, 16–18 px text.
- Label above (15–16 px / 600), hint below (13 px, `muted`) linked with `aria-describedby`.
- Focus: border `ink` + `ring-selected`. Error: border `danger`, message below in `danger` with an icon, `aria-invalid="true"`.
- Password: optional show/hide icon button inside the right edge (44 px target).

### 7.7 Form errors

- Validate on blur and on Continue; never on every keystroke before first blur.
- Message: plain language ("Please enter a city"), placed directly under the field, announced via `aria-live="polite"` region for the step.
- On Continue with errors: focus moves to the first invalid field.

### 7.8 Step indicator

New: `components/calculator/StepIndicator.tsx` with three renderings driven by breakpoint:

- **Desktop rail:** vertical list; each item is a `<button>` (min-height 52 px) with a 32 px circle (current: `ink` fill + `ground` number; done: `lime` fill + `ink` number; upcoming: `track` fill) and label (16 px, 600 when current) + hint (13 px, `muted`). Completed steps are clickable to go back; upcoming steps are not.
- **Tablet:** 4 equal bars (6 px, `ink` for done/current, `track` for upcoming) with "1 · Vehicles" labels underneath.
- **Mobile:** "Step n of 4" (14 px / 600, `lime-soft-ink`) + a single 6 px bar at n × 25%.
- Always include `aria-current="step"` on the current item and a text alternative ("Step 2 of 4: Daily driving").

### 7.9 Answers panel + accuracy meter

New: `components/calculator/AnswersPanel.tsx`.

- Desktop: right column on `soft` background; white card with key/value rows (Vehicles, Daily distance, Location, Panels; unanswered = "—"); second white card with "Estimate accuracy" label, value (Rough <50%, Good 50–89%, Precise ≥90%), 8 px bar in `chart-profit`, helper text.
- Tablet: collapsed `<details>` bar above the action bar showing "Your answers · 10 × Van" and the mini accuracy bar.
- Mobile: hidden (see open question 12.4).
- Accuracy is derived from how many inputs the user answered (including optional exact fields), not from the engine. Keep the mapping in one constant.

### 7.10 Stat tile

File: `components/calculation/StatTile.tsx` (rewrite; fixes the lime-text contrast bug).

- Props: `label`, `value`, `explanation`, `tooltip?`, `emphasis?: boolean`.
- Default: `surface`, 1 px `line`, `radius-lg`–`radius-xl`, padding 24–28; label (`label`, `muted`), value (`number-l`, `ink`), explanation (`small`, `muted`).
- `emphasis`: `hero` background, label/explanation `hero-muted`, value `lime`. Use for exactly one tile per group (the "total gain" tile).
- Mobile layout: horizontal — label + explanation left, value right, `whitespace-nowrap`.
- Keep `InfoTooltip` support, but the explanation line should make the tooltip unnecessary in most cases.

### 7.11 Status pill

New: `components/common/StatusPill.tsx`.

- 30 px height, `rounded-full`, 13 px / 600, 8 px dot + label.
- Variants: `success` ("Calculated") `lime-soft`/`lime-soft-ink`; `progress` ("Making PDF…") same colours + `pulse` dot; `warning` ("Needs calculation") `warn-soft`/`warn-ink`; `error` ("Failed — try again") `danger` tint.
- Map `ReportJobStatus` enum values to variants and plain labels in one constant (see 9.3).

### 7.12 Badges

- **Sample badge** ("Sample", "Sample figures", "Sample data"): 12 px / 600, `soft` background, `muted` text, `rounded-full`, 4×10 px padding. MUST appear wherever figures are not real engine output (marketing examples on Home).
- **Info badge** ("Free · no sign-up needed for an estimate"): `lime-soft`/`lime-soft-ink`, 13–14 px / 600, 8×14 px padding.
- **Role pill** (Owner / Manager / Viewer): 26–28 px, 12–13 px / 600. Owner `ink`/`ground`; Manager `lime-soft`/`lime-soft-ink`; Viewer `soft`/`muted`. Derive the list from the Prisma `Role` enum (`Object.values(Role)`), never hand-type it.

### 7.13 Card

New: `components/common/Card.tsx` with `as` prop and `tone: "default" | "soft" | "hero" | "forest" | "lime-soft"`. Default: `surface`, 1 px `line`, `radius-xl`, padding per section 4.3. Optional header row (title left, action right, bottom border `line`).

### 7.14 Disclosure

Use native `<details>`/`<summary>` styled as a card: padding 18–22 × 22–26, `radius-lg`, summary 16–17 px / 600 with a chevron that rotates 180° when open (150 ms). Used for "How we calculated this", "I know the exact numbers", tablet answers bar.

### 7.15 Data list / table

File: `components/audit/AuditLogView.tsx` and a new `components/fleet/VehicleGroupList.tsx`.

- Desktop: CSS grid table inside a `Card`; header row 13 px / 600 `muted`; rows 15 px, padding 16×24, divider `line`; whole row is a link to the result (hover background `soft`).
- Tablet: two-line rows (name 16/600 + "Van · 10 · Berlin" 14 `muted`), right-aligned "Pays off in" block, status pill.
- Mobile: stacked cards (`radius-lg`), chevron top-right, status pill + payback on the bottom row.
- Must use semantic table markup (`<table>`) on desktop OR a list (`<ul>`) with clear headings — pick one per component and keep it consistent.

### 7.16 Navigation

- **Public header** (`components/layout/Header.tsx`): logo left; desktop nav "How it works", "Calculator", "My fleet" (only when logged in), language switcher (pill button, `EN`), Log in (`dark`, `sm`) or avatar menu. Tablet/mobile: hamburger opens a full-height sheet from the right with the same links, focus-trapped, closes on Escape and on link click.
- **Workspace sidebar** (desktop, new `components/layout/WorkspaceSidebar.tsx`): logo, fleet switcher, nav (Overview, Vehicles, Calculations, Team & activity), user card at the bottom. Active item: `ink` fill + `ground` text (dark mode: `lime` fill + `on-lime`). Items 44 px high, `radius-md`, 18 px icon + 15 px label.
- **Icon rail** (tablet): 88 px, same items as icon + 12 px label, 56 px min height each.
- **Bottom tab bar** (mobile): 4 items (Overview, Vehicles, Results, Team), 22 px icon + 12 px label, active item `lime-soft` background + `ink`, inactive `#5A6A60`. `aria-label="Main"`, `aria-current="page"` on active.
- All three workspace navs render from one `WORKSPACE_NAV_ITEMS` constant (label key, icon, route).

### 7.17 Fleet switcher

Button showing "Fleet" overline + fleet name + up/down chevron (desktop sidebar), or fleet name + down chevron pill (tablet/mobile headers). Opens a menu listing the user's fleets; selecting navigates to `/{locale}/{fleetSlug}`. Hide the chevron and make it static when the user has exactly one fleet.

### 7.18 Avatar

36–40 px circle, `lime` fill, `on-lime` initials (13–14 px / 600). Neutral variant for team lists: `soft` fill + 1 px `line`. Use the user's image when available (Google OAuth).

### 7.19 Progress bar

8–10 px, `rounded-full`, `track` background, `chart-profit` fill (report progress) or `ink` fill (calculator step progress). Animated with `fill`. Must have `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and a visible text label ("Drawing charts… step 4 of 6", "About 30 seconds left").

### 7.20 Payback chart

New: `components/calculation/PaybackChart.tsx` using **Recharts** (already a dependency).

- Cumulative savings per year for 10 years as **three lines**: Pessimistic, Realistic, Optimistic (one per `ScenarioKind`); a horizontal dashed reference line at the realistic one-time cost labelled "Cost €18k" (value formatted per locale).
- Realistic: solid 3 px `ink` line. Pessimistic and optimistic: 2 px `chart-profit` lines, distinguished by line style (pessimistic dotted, optimistic solid) and a light `chart-payoff` band between them, so the series never rely on colour alone. Break-even points are marked with a 6 px dot on each line. No gridlines; x-axis labels "Yr 1, 2 … 10" (mobile: only Year 1 / 5 / 10); no y-axis on mobile.
- Legend above the chart ("Pessimistic", "Realistic", "Optimistic"), not inside it. The canvas still shows the earlier bar version; this section wins.
- Heights: 280 desktop / 240 tablet / 200 mobile.
- Accessibility: wrap in `<figure>` with a `<figcaption>` that states the conclusion in words ("Savings most likely pass the €18,000 cost during year 5 — between year 4 and year 7"); provide all three series as a visually hidden table.
- Animation: Recharts line draw with `isAnimationActive` true and 800 ms, disabled under reduced motion (read `matchMedia` once).

### 7.21 Activity item

New: `components/audit/ActivityItem.tsx`. 34 px icon tile (`soft`, `radius-sm`) + sentence ("**Mira Hoffmann** changed daily distance for Scania R450 from 180 km to 220 km") + timestamp (13 px `muted`, relative for <48 h: "Today, 09:42", "Yesterday, 16:10"; otherwise "27 Sep, 14:55" in the user's locale). Icons per entity type: vehicle, calculation, team.

### 7.22 Empty, loading and error states

Every data view MUST implement all three.

| State   | Pattern                                                                                                                                                                      |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Loading | Skeleton blocks matching the final layout (`soft` background, `animate-pulse` disabled under reduced motion). No spinners for whole pages.                                   |
| Empty   | Short sentence + one action. Dashboard: "No vehicles yet. Add your first group to see what solar could save." + primary "Add vehicles". Activity: "Nothing has changed yet." |
| Error   | Plain sentence + retry: "We couldn't load your activity. Try again." Never show raw error codes.                                                                             |

### 7.23 Theme and language switchers

- Theme toggle (`components/theme/ThemeToggle.tsx`): icon button (sun/moon, Lucide), 44 px, `aria-label` from `theme.toggleAriaLabel`. Lives in the user menu on mobile and in the header/sidebar footer on desktop.
- Language switcher: pill button showing the current locale code; menu lists full language names from `language.*` messages.

---

## 8. Screens

Each screen lists route, purpose, content order per breakpoint, states and interaction. Canvas artboard names are in brackets.

### 8.1 Home — `/[locale]` [Home, Home · tablet, Home · mobile]

**Purpose:** explain the value in one sentence and start the calculator.

**Content order (all breakpoints):**

1. Header.
2. Hero: info badge → h1 "Find out if solar panels pay off for your vans and trucks." (`display-xl`) → lead paragraph (`body-l`, `muted`) → primary `lg` button "Start my estimate →" + "Takes about 2 minutes" (`small`, `muted`).
3. Example panel: forest panel with the brand illustration (gold circle placeholder, 4.7); white floating card: "Example · 10 delivery vans · Berlin" + Sample badge, "Pays off in [X] years" (`display` 800), 3 mini stats (Saved per year, CO₂ avoided, Fuel saved) on `ground` tiles. Values MUST come from a real pre-computed example calculation or remain placeholders; never invent them.
4. "How it works": 3 numbered cards (1 Tell us about your vehicles, 2 Say where they operate, 3 Get a clear answer).
5. "Built for" dark band: Delivery & logistics, Public transport, Refrigerated transport (lime line icons).
6. Footer: "© {year} Solar Calculator" + "Independent · Estimates, not quotes".

|              | Desktop                                                 | Tablet                                           | Mobile                                                                      |
| ------------ | ------------------------------------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------- |
| Hero         | 2 columns: text left, example panel right (520 px tall) | Stacked; example panel 400 px under the text     | Stacked; button full width; panel with 120 px illustration area on top; 2 mini stats |
| How it works | 3 columns                                               | 3 horizontal rows (number tile left, text right) | 3 rows, smaller                                                             |
| Built for    | 4-column band (title + 3 items)                         | Title + 3 columns                                | Title + 3 stacked rows                                                      |

**Motion:** `rise` on badge, h1, paragraph + CTA (stagger 0/120/240 ms), example panel `rise` 120 ms; card `lift` on hover.

**Remove:** the four glass feature cards (they promise "AI-powered suggestions" and "real-time insights" which don't exist), `CardCarousel`, hero background images.

### 8.2 Calculator — `/[locale]/calculator` [Calculator (clickable), Calculator · tablet, Calculator · mobile]

**Purpose:** collect inputs with the least effort. Four steps; each step is one question screen.

| Step | Rail label / hint               | Question (h1)                                   | Helper                                                           | Controls                                                                                                                                                                                                                                                                                                                 |
| ---- | ------------------------------- | ----------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1    | Vehicles / Type and number      | What kind of vehicles do you have?              | Pick the one that fits most of your fleet.                       | Choice cards: Van (Sprinter, Transit), Truck (Actros, FH16), Bus (Citaro, Urbino), Trailer (Box, reefer) · Number stepper "How many?" (default 10? — see 12.3; current default 1) + hint "You can add different vehicle types later."                                                                                    |
| 2    | Daily driving / How far they go | How far does one vehicle drive on a normal day? | A rough guess is fine.                                           | Choice cards: Short trips (Under 50 km, City deliveries), Regional (50–150 km, Around one region), Long distance (Over 150 km, Between cities) · `<details>` "I know the exact numbers" containing: exact km/day, engine type, energy consumption (kWh/100 km), manufacturer, model, operating months, winter usage      |
| 3    | Location / Where they operate   | Where do your vehicles operate?                 | This tells us how much sun they get through the year.            | City input (autocomplete, city + country in one field, e.g. "Berlin, Germany") · Chip group "Where do they park overnight?" (At our depot / On the street / At customer sites / It varies)                                                                                                                               |
| 4    | Panels / Where they go          | Where would the panels go?                      | More sun means more savings. Not sure? Roof is the usual choice. | Horizontal choice cards with 3-dot sun rating: Roof only (Most common, best value, 3), Roof, sides and back (Most energy, higher cost, 3), Sides (Partial sun during the day, 2), Back (Limited sun, 1) · `<details>` "I know the exact numbers": panel capacity kW, max roof load kg, payload reserve kg, budget, notes |

**Additions not on the canvas (decided after the design):**

- Step 1, below "How many?": chip group "What do they carry?" — Regular goods / Chilled or frozen / Passengers. Choosing "Chilled or frozen" adds "Cooling unit type" (Diesel / Driven by the truck engine / Electric / Not sure) inside step 2's "I know the exact numbers"; "Not sure" uses the typical EU setup for that vehicle type.
- Step 2, below the distance cards: chip group "Do engines run while parked?" with hint "For example for air conditioning or heating during breaks." — Rarely / Sometimes / Often.
- The Answers panel adds "Cargo" and "Parked idling" rows.
- Results: under the stat tiles (desktop) or inside "How we calculated this" (mobile), a "Where the savings come from" list shows each savings type with its yearly amount, e.g. "Cooling unit fuel €2,900 · Fewer battery breakdowns €600 · Less idling €450". Battery breakdowns are always their own line.

**Frame:**

- Top: logo (links home) + "Your answers are saved automatically" (`small`, `muted`). Persist form state to `sessionStorage` so a refresh does not lose answers (wrap in try/catch).
- Progress: "Step n of 4" + bar (desktop and mobile), bars (tablet).
- Actions: Back (`secondary`) left, Continue (`primary`) right; on step 4 Continue becomes "See my results" (`dark`). Step 1 Back returns to Home.
- Desktop right column: Answers panel (7.9) + "We never share your fleet data." with a lock icon.

**Behaviour:**

- Defaults are pre-selected (Van, Regular goods, Regional, Rarely, Depot, Roof) so a user can click Continue four times and still get a result. Each pre-selected default is visibly selected, not hidden.
- Step change: `step-in` on the question block; focus moves to the new h1 (`tabIndex={-1}`); the step change is announced.
- Keyboard: Enter on the last field of a step = Continue.
- The existing multi-step `Form.tsx` + zod schema stay; the schema MUST make the technical fields optional and fill them from presets (section 12.1) before submission.

### 8.3 Results — public result route (new) and `/[locale]/[fleetSlug]/calculations/[calculationId]` [Results, Results · tablet, Results · mobile]

**Purpose:** a yes/no verdict, the four key numbers, when the money comes back, and trust.

**Content order:**

1. Header actions: Change answers (`secondary`, back to calculator with answers kept), Share link (`secondary`), Download PDF (`dark` with download icon; **saved fleet results only** — the public results page has no PDF button). Mobile: back icon button + "Your result" + share icon button in the top bar; Save (public) or PDF (fleet) in a fixed bottom bar.
2. Context line: "10 vans · Regional driving · Berlin · Roof panels" (+ Sample badge only on demo data).
3. Verdict headline (`display-l`). Templates (keys in `calculation.*`):
   - Pays off within 10 years: "Yes — solar pays for itself in about **{duration}**." with the duration on a lime highlight (`bg-lime`, `rounded-[14px]`, `px-3`).
   - Pays off after 10 years: "Solar pays off slowly — about **{duration}**."
   - Never pays off within panel lifetime: "Solar is unlikely to pay off for this setup." + suggestion line ("Try roof-only panels or check the exact numbers.").
     Duration is humanised from the realistic scenario's `paybackPeriodMonths`: "4 years 4 months", mobile short form "4 yrs 4 mo". A range line follows the headline: "Between {pessimisticDuration} and {optimisticDuration}, depending on sun and prices." The verdict template is chosen from the realistic scenario.
4. Lead: "After that, your fleet keeps around {annualSavings} a year that would otherwise go on fuel."
5. Stat tiles (4), realistic value with the range in the explanation line ("€3,100–5,000 depending on prices"): Money saved each year · One-time cost after subsidies · CO₂ avoided each year (+ equivalent, e.g. trees, only if the engine/assumption set provides the factor) · Total gain over 10 years (`emphasis`).
6. Payback chart card (7.20) titled "When do you get your money back?" with subtitle "Your savings add up each year. Once they pass the dashed line, the panels are paid off."
7. Bottom row: `<details>` "How we calculated this" (plain sentence summary + the existing `ProvenancePanel` fields inside) · lime-soft card "Want to keep this result?" / "Save to my fleet" (`dark`) — logged-out users go to Create account and the result is attached after sign-up.

|            | Desktop   | Tablet  | Mobile                                 |
| ---------- | --------- | ------- | -------------------------------------- |
| Stat tiles | 4 columns | 2 × 2   | 1 column, horizontal tiles             |
| Bottom row | 2 columns | Stacked | Disclosure only; actions in bottom bar |

**Motion:** `rise` on headline and tiles, line draw on the payback chart (7.20), `lift` on tile hover.

**Data note:** the stored `CalculationResult` has `paybackPeriodMonths`, `totalSolarYieldKwh`, `co2SavedKg`, `netSavingsAmount`, `currency`. "Money saved each year", "One-time cost" and the per-year chart series are NOT stored today — see 12.2.

### 8.4 Log in / Create account — `/[locale]/login`, `/[locale]/register` [Log in / Create account, Log in · tablet, Log in · mobile]

**Layout:**

- Desktop: 2 equal columns. Left: forest panel, logo, h2 "Keep all your fleet's numbers in one place." (48 px Display 800, `ground`), 3 check-marked benefits (Save and compare calculations · Download PDF reports for your bank · Invite your team), footer "Free · Independent · No sales calls", brand illustration (gold circle placeholder) bottom-right. Right: 440 px form column, vertically centred.
- Tablet: forest band on top (340 px) with logo, shorter headline and inline benefits; form (480 px) centred below.
- Mobile: no forest panel; logo + close (×) button top; form fills the screen; primary action at the bottom.

**Form column:** segmented control (Log in | Create account, as links) → h1 ("Welcome back" / "Create your free account") → Google button (`secondary` style, 54–56 px, Google "G" mark per Google branding rules) → divider "or with email" → fields → primary action.

- **Passwordless (decided after the design; the canvas still shows password fields):** both tabs have one field, Work email, and one action, "Email me a sign-in link" (`primary`, full width). There is no password, no "Forgot it?" link and no "Remember me".
- After sending: a "Check your email" screen in the same shell: "We sent a link to {email}. It works for 15 minutes.", "Send it again" (enabled after 60 seconds) and "Use a different email".
- Your name and Company are asked once, on the onboarding screen after the first sign-in (2 columns desktop/tablet, stacked mobile), which creates the fleet.
- Errors: inline under the email field; an expired or used link shows a form-level message above the button ("This link has expired or was already used. Send a new one."). The message never reveals whether an account exists.

**Decided:** no passwords (Google or an email link sent from Gmail; step 1.3).

### 8.5 Fleet dashboard — `/[locale]/[fleetSlug]` (new route) [Fleet dashboard, · dark, · tablet, · mobile]

**Purpose:** "What does solar mean for my whole fleet, and what needs my attention?"

**Content order:**

1. Page header: context line "{fleet} · {n} vehicles" → h1 "Your fleet at a glance" → primary "Add vehicles" (+ icon) right.
2. KPI row (4): Could save per year (`hero` tile, lime value, note "if all calculated groups get panels") · Average payback · CO₂ avoided per year · Not calculated yet (count + "Run it now →" link).
3. Vehicle groups card: title + search (desktop inline input 260 px; tablet icon button that expands; mobile omitted) → list (7.15) with Vehicle, Type, Count, Location, Pays off in, Status. Rows link to the latest result for that group.
4. Bottom row (desktop 2 columns, tablet/mobile stacked): Report in progress card (7.19; hidden when no job is running) · Recent activity (2 latest items + "See all activity →").

|                 | Desktop    | Tablet        | Mobile                                        |
| --------------- | ---------- | ------------- | --------------------------------------------- |
| Nav             | Sidebar    | Icon rail     | Top bar + bottom tab bar                      |
| KPIs            | 4 across   | 2 × 2         | Hero tile full width + 2 small tiles          |
| Groups          | Grid table | Two-line rows | Cards; "Add" button next to the section title |
| Report progress | Bottom row | Bottom        | Directly under KPIs (compact)                 |

**Rules:** aggregates only include groups with a current result; show "based on {n} calculated groups" under averages. Report job status and live telemetry arrive through the fleet Server-Sent Events stream (`detailed-plan.md` step 4.6) and are written into the TanStack Query cache — no polling, no WebSockets.

### 8.6 Team & activity — `/[locale]/[fleetSlug]/audit` (keep the URL, rename the page) [Team & activity, · dark, · tablet, · mobile]

**Purpose:** "Who is on my team, what can they do, and what changed?"

**Content:**

- Page header: "{fleet}" context line + h1 "Team & activity".
- **Team card:** "Team · {n} people" + "Invite" (`primary`, `sm`; only Owners see it) → member rows (avatar, name, email, role pill) → role explainer: "**Owner** — everything, including billing and team. **Manager** — add vehicles and run calculations. **Viewer** — can look, not change." Owners get a role menu per member (change role, remove) guarded by the existing `FLEET_OWNER_ONLY` rule.
- **Activity card:** "What changed" + filter chips (Everything / Vehicles / Calculations / Team) → activity items (7.21) → pagination: "Page {page} of {totalPages}" + Newer / Older (desktop), "Show older" (tablet/mobile). Page size stays `DEFAULT_AUDIT_EVENT_PAGE_SIZE`.
- The current user/entity-type/date filters in `AuditLogView` MAY remain under a "More filters" disclosure for power users; the default view is the chip filter.

|        | Desktop                           | Tablet                                     | Mobile                                             |
| ------ | --------------------------------- | ------------------------------------------ | -------------------------------------------------- |
| Layout | Team 400 px left + Activity right | Team (2-column member grid) above Activity | Segmented control Activity / Team (Activity first) |

**Sentence generation:** map each audit action to a message key with placeholders (`audit.events.vehicleUpdatedField`: "{actor} changed {field} for {vehicle} from {from} to {to}"). Fallback when old/new values are not stored: "{actor} edited {vehicle}". Never render raw enum names like `VEHICLE_UPDATED`.

### 8.7 Dark mode (all screens)

- Toggled by the existing `next-themes` provider (`attribute="data-theme"`, system default respected). Only token values change; components contain no `dark:` colour overrides beyond what tokens cannot express.
- Differences beyond token swaps: workspace active nav uses `lime` fill + `on-lime`; links use `lime`; the "Could save" hero tile uses `forest`; role Owner pill becomes `lime`/`on-lime`.
- The canvas shows dark dashboard and dark team pages; public screens follow the same token map.

---

## 9. Content and voice

### 9.1 Voice

- Speak like a helpful mechanic, not an engineer: short sentences, second person ("your vans"), active voice.
- Lead with the answer, then the reason.
- Numbers are rounded to what matters: "€4,200", "6.1 t", "4 years 4 months" — never "€4,213.87" or "52.3 mo".
- Labels are nouns ("Money saved each year"); buttons are verbs ("Start my estimate", "Download PDF").
- Honesty phrases: "about", "around", "estimate" for engine output; "Sample" for demo data.

### 9.2 Plain-language replacements (apply to all copy and translations)

| Current / technical                                                                      | Use instead                                                                                                 |
| ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Average Daily Distance (km)                                                              | How far does one vehicle drive on a normal day?                                                             |
| Energy Consumption (kWh/100km)                                                           | Energy use (kWh per 100 km) — optional, inside "exact numbers"                                              |
| Solar Panel Capacity (kW per vehicle)                                                    | Panel power per vehicle (kW) — optional                                                                     |
| Payload Reserve (kg) / Max Roof Load (kg)                                                | Weight you need to keep free (kg) / Max weight on the roof (kg) — optional                                  |
| Parking Type: Depot / Street / Customer Site / Mixed                                     | At our depot / On the street / At customer sites / It varies                                                |
| Solar yield                                                                              | Electricity the panels make                                                                                 |
| Net savings                                                                              | Total gain over 10 years                                                                                    |
| Payback period · 52.3 mo                                                                 | Pays for itself in about 4 years 4 months                                                                   |
| CO2 saved                                                                                | CO₂ avoided each year (always subscript ₂)                                                                  |
| Formula version / Assumption set                                                         | Method version / Assumptions used — inside "How we calculated this"                                         |
| Audit Log                                                                                | Team & activity / What changed                                                                              |
| VALIDATING, CALCULATING, RENDERING_CHARTS, GENERATING_REPORT, GENERATING_RECOMMENDATIONS | Checking your data… / Calculating… / Drawing charts… / Building your PDF… / Writing tips… (+ "step n of 6") |
| COMPLETED / FAILED                                                                       | Ready / Something went wrong — try again                                                                    |

### 9.3 i18n

- All copy lives in `messages/{en,de,es}.json` via `next-intl`; no literal strings in components.
- New keys are grouped by screen: `home.*`, `calculator.steps.*`, `calculator.options.*`, `results.*`, `auth.*`, `dashboard.*`, `team.*`, `audit.events.*`, `status.*`.
- Enum → label/variant maps live in one constants file per domain (e.g. `lib/report-status-display.ts`), derived from the Prisma enums.
- German runs ~30% longer: every button, pill and tab MUST tolerate it (no fixed widths on text containers; allow wrapping in cards; truncate only table cells with a `title` tooltip).
- Format numbers, currency, units and dates with `Intl` through `next-intl`'s `useFormatter` (`format.number(value, { style: "currency", currency })`, `format.relativeTime`). Never concatenate "€" manually.
- Fix existing typos while touching copy (e.g. "independant" → "independent").

---

## 10. Accessibility

Target: **WCAG 2.2 AA**. Checklist every screen MUST pass:

- [ ] Colour contrast per 4.1; no information by colour alone.
- [ ] Every interactive element reachable and operable by keyboard in a logical order; visible `focus-visible` ring.
- [ ] Touch targets ≥44 × 44 px (inputs 54 px+).
- [ ] Real semantics: `<button>` for actions, `<a>` for navigation, `<label>` for every input, radiogroups for choice cards/chips, `<nav>` with `aria-label`, one `<h1>` per page, headings in order.
- [ ] Icon-only buttons have `aria-label`; decorative SVGs have `aria-hidden="true"`.
- [ ] Step changes, form errors and async status (report progress) announced via `aria-live="polite"`.
- [ ] Focus management: step change → new h1; menu/sheet open → first item, trapped, Escape closes and returns focus.
- [ ] Charts have a text conclusion and a hidden data table.
- [ ] `prefers-reduced-motion` respected (section 6).
- [ ] Page zoom to 200% and text-spacing overrides do not break layouts; no horizontal scroll at 320 px width.
- [ ] `lang` attribute follows the locale (already done in layout).

---

## 11. Implementation guide

### 11.1 Stack mapping

| Concern                | Use                                                              |
| ---------------------- | ---------------------------------------------------------------- |
| Styling                | Tailwind CSS v4 utilities backed by tokens in `app/globals.css`  |
| Fonts                  | `next/font/google`: `Bricolage_Grotesque`, `Instrument_Sans`     |
| Icons                  | `react-icons/lu` + local vehicle icons                           |
| Forms                  | react-hook-form + zod (existing), `Controller` for custom inputs |
| Charts                 | Recharts                                                         |
| Server state / polling | TanStack Query                                                   |
| Theme                  | next-themes (existing, `data-theme`)                             |
| i18n                   | next-intl (existing)                                             |
| Animation              | CSS keyframes only                                               |

### 11.2 Token setup in `app/globals.css`

Replace the current `:root` variables. Shape (extend with every token from 4.1; keep media queries nested per `CLAUDE.md`):

```css
@import "tailwindcss";

@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));

:root {
  --ground: #f6f4ee;
  --surface: #ffffff;
  --ink: #16231b;
  --muted: #4f5f55;
  --line: #dee3da;
  --lime: #b6f065;
  --on-lime: #16231b;
  --lime-soft: #e9f5d6;
  --lime-soft-ink: #2f5a1e;
  --ease-out-soft: cubic-bezier(0.2, 0.7, 0.2, 1);
}

:root[data-theme="dark"] {
  --ground: #0f1712;
  --surface: #17231b;
  --ink: #eef1ea;
  --muted: #a9b6ad;
  --line: #2a3a2f;
  --lime-soft: #24361f;
  --lime-soft-ink: #cfefa0;
}

@theme inline {
  --color-ground: var(--ground);
  --color-surface: var(--surface);
  --color-ink: var(--ink);
  --color-muted: var(--muted);
  --color-line: var(--line);
  --color-lime: var(--lime);
  --color-on-lime: var(--on-lime);
  --color-lime-soft: var(--lime-soft);
  --color-lime-soft-ink: var(--lime-soft-ink);
  --font-display: var(--font-bricolage);
  --font-body: var(--font-instrument);
  --animate-rise: rise 0.7s var(--ease-out-soft) both;
  --animate-step-in: step-in 0.45s var(--ease-out-soft) both;
  --animate-grow: grow 0.8s var(--ease-out-soft) both;
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
```

The snippet is abbreviated; the table in 4.1 is the complete, authoritative list. Then components write `bg-surface text-ink border-line`, `font-display`, `animate-rise motion-reduce:animate-none`. Delete the old variables (`--accent`, `--card`, `--form-bg`, `--invert-*`, etc.) only after every usage is migrated (grep first).

Remove the global element styles that fight Tailwind (`button { font-weight: 600 … }`, `li { margin-bottom }`, `h1–h6 { font-weight: 900 }`) once components set their own classes; keep only `body` background/colour/font and `box-sizing`.

### 11.3 File mapping

| Area                | Existing file                                                                                                                         | Action                                                                               |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Tokens, keyframes   | `app/globals.css`                                                                                                                     | Rewrite (11.2)                                                                       |
| Fonts               | `app/[locale]/layout.tsx`                                                                                                             | Swap Lexend/Inter for Bricolage Grotesque/Instrument Sans (`latin`, `latin-ext`)     |
| Header              | `components/layout/Header.tsx`, `ClientMenu.tsx`, `NavLink.tsx`                                                                       | Restyle; add mobile sheet                                                            |
| Footer              | `components/layout/Footer.tsx`                                                                                                        | Simplify to one line (8.1)                                                           |
| Page title          | `components/common/PageTitle.tsx`                                                                                                     | Support `size` = `display-xl`/`l`/`m`/`s`                                            |
| Section / Container | `components/layout/Section.tsx`, `Container.tsx`                                                                                      | Remove background-image hero; use gutters from 4.3                                   |
| Home                | `app/[locale]/page.tsx`, `components/home/CardCarousel.tsx`                                                                           | Rebuild; delete carousel                                                             |
| Calculator          | `components/calculator/MultiStepForm.tsx`, `steps/*`, `components/form/*`                                                             | Rebuild steps with ChoiceCard, ChipGroup, NumberStepper, StepIndicator, AnswersPanel |
| Results             | `app/[locale]/[fleetSlug]/calculations/[calculationId]/page.tsx`, `StatTile.tsx`, `ProvenancePanel.tsx`                               | Rebuild; provenance moves into disclosure                                            |
| Auth                | `app/[locale]/login`, `register`, `forgot-password`, `reset-password`, `components/login`, `components/register`, `components/auth/*` | Shared `AuthShell` + segmented links                                                 |
| Dashboard           | —                                                                                                                                     | New route `app/[locale]/[fleetSlug]/page.tsx` + `components/fleet/*`                 |
| Team & activity     | `app/[locale]/[fleetSlug]/audit/page.tsx`, `components/audit/AuditLogView.tsx`                                                        | Add team card, activity sentences, chips                                             |
| Workspace shell     | —                                                                                                                                     | New `app/[locale]/[fleetSlug]/layout.tsx` with sidebar / rail / tab bar              |

### 11.4 Coding rules recap (from `CLAUDE.md`)

- No code comments.
- Tailwind utilities; inline `style` only for truly dynamic values (chart bar heights, progress widths).
- Shared literals (nav items, role lists, status maps, distance presets, accuracy thresholds) in named constants, derived from Prisma enums where possible; grep before adding.
- Media queries nested inside selectors in CSS.
- Descriptive names, PascalCase components, UPPER_SNAKE_CASE constants.

### 11.5 Phased delivery (each phase shippable)

| Phase            | Scope                                                                                                  | Done when                                                                            |
| ---------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| 1. Foundations   | Tokens, fonts, keyframes, Button, Card, Input, Logo, header/footer restyle, dark mode tokens           | Existing pages render in the new look without layout breaks; lint, tests, build pass |
| 2. Public funnel | Home, Calculator (4 steps, presets, persistence), public Results with chart                            | A user can go Home → Results on mobile, tablet, desktop using only defaults          |
| 3. Auth          | AuthShell, login/register/forgot/reset                                                                 | All auth flows work; password rule aligned                                           |
| 4. Workspace     | Workspace shell (sidebar/rail/tab bar), Dashboard, Team & activity                                     | Owner, Manager, Viewer see correct actions; empty/loading/error states present       |
| 5. Polish        | Accessibility audit (section 10), reduced motion, German/Spanish copy review, visual QA against canvas | Checklist in section 10 fully ticked                                                 |

**Testing per phase:** update/extend Jest + Testing Library tests for changed components (role queries: `getByRole("radio", { name: "Van" })`), keep `npm run lint`, `npm test`, `npm run build` green; manually check 390, 834, 1440 widths and dark mode.

---

## 12. Data dependencies and open questions

These are gaps between the design and the current backend. Resolve before or during the relevant phase; do not paper over them with invented numbers. Decisions taken are marked **Decided** and are implemented through the steps named in [`detailed-plan.md`](./detailed-plan.md).

1. **Presets for "simple" inputs (blocks phase 2).** The engine needs numeric inputs the simple flow no longer asks for. A single versioned assumption set (`lib/assumptions/v1.ts`) must map: distance band → km/day (suggested midpoints 30 / 100 / 250 — **confirm with the product owner**); vehicle type → typical energy use, panel capacity, roof load, payload reserve; defaults operating months 12, winter usage true. Values must be sourced and versioned alongside the assumption set, since they affect results. **Decided:** researched and cited in `docs/assumptions-v1.md`, reviewed by the owner before use (step 2.1).
2. **Result fields not stored (blocks full Results screen).** Design needs annual savings, one-time cost and a 10-year cumulative series. `CalculationResult` stores only payback months, total yield, CO₂ and net savings. Either extend the schema/engine or derive the series from stored values, and document the formula. **Decided:** a pure TypeScript engine produces them and `CalculationResult` stores them (steps 2.2, 2.3).
3. **Default vehicle count.** Canvas shows 10; current form defaults to 1. Recommend 1 (never assume fleet size) with the stepper making changes easy. **Decided:** 1.
4. **Mobile answers review.** Mobile hides the answers panel. If testing shows users lose track, add a "Review answers" link opening a bottom sheet.
5. **Public results route.** Results currently exist only per fleet (auth required). The public flow needs an unauthenticated result view (client-side calculation or a short-lived anonymous calculation) and a "save to fleet" handoff after sign-up. **Decided:** the engine runs in the browser from sessionStorage answers; after sign-up the answers are saved and the server recalculates (steps 2.6, 3.8). Sign-up creates the user's fleet from the Company field (step 2.5).
6. **Activity sentences with before/after values.** Requires audit events to store changed fields with old and new values. If not available, use the fallback sentence (8.6). **Decided:** `VEHICLE_UPDATED` stores `{ field, from, to }` going forward; older events use the fallback (step 3.12).
7. **CO₂ equivalents ("≈ 300 trees").** Only show if the assumption set provides a sourced conversion factor.
8. **Dashboard aggregates.** Define whether "Could save per year" sums latest results per vehicle group and how groups with outdated assumption versions are treated.
9. **Password minimum.** **Decided:** no passwords at all; sign-in is Google or an email link (steps 1.3, 3.10).
10. **Savings model.** **Decided:** the engine sums every savings type that applies (cooling-unit fuel, less idling, fewer battery breakdowns, alternator fuel, direct charging) and shows the breakdown; no vehicle type is ruled out in advance (steps 2.1, 2.2).
11. **Screens not on the canvas.** Vehicles, Calculations, vehicle group detail (estimated vs. measured), CSV import and the live state are built from these guidelines; their layout specs are added to section 8 in steps 3.14 and 5.10.

---

## 13. Anti-patterns

Do not:

- Use lime as text on light backgrounds, or add a second accent colour.
- Add gradients, glassmorphism, blurred backgrounds, stock photos or emoji.
- Show more than one primary (lime) button in a view.
- Ask technical questions up front, or use `<select>` for choices with ≤4 options.
- Show unlabelled sample numbers, or numbers with false precision.
- Add animations outside the catalogue in section 6, or animations that ignore reduced motion.
- Hide primary navigation behind a hamburger inside the workspace on mobile (use the tab bar).
- Render raw enum names, error codes or ISO timestamps to users.
- Hard-code strings, colours, role lists or nav items inside components.
- Introduce new UI or animation libraries — the existing stack covers everything here.
