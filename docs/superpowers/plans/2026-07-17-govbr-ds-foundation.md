# DS-gov Migration — Phase 1: Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Install the official gov.br Design System package (`@govbr-ds/core`), make its CSS/JS
load correctly alongside Tailwind 4 without either fighting the other, and replace the app's
ad-hoc "gov-blue" color tokens with verified official DS-gov values — with nothing else changed
yet (no component markup migration; that's Phase 2+).

**Architecture:** `@govbr-ds/core`'s CSS is loaded in its own lowest-priority CSS cascade layer so
it can style raw HTML elements (buttons, inputs, headings) by default, while Tailwind's
`utilities` layer stays highest-priority so utility classes always win when a component needs to
override a DS-gov default. Tailwind's Preflight reset is dropped since DS-gov's own reset takes
that role. DS-gov's JS bundle (UMD, exposes `window.core`) is loaded as a side-effect import.

**Tech Stack:** Vite 6, Tailwind CSS 4 (`@tailwindcss/vite`), React 19, `@govbr-ds/core@3.7.0`.

## Global Constraints

- Target `@govbr-ds/core@3.7.0` (current published v3.x stable) — not the "V4" next-gen beta.
  [spec: Non-Goals]
- This repo has **no test runner** (no vitest/jest/testing-library in `package.json`, confirmed by
  grep). Introducing one is out of scope for this phase (YAGNI). Verification steps in this plan
  use `npm run lint` (`tsc --noEmit`), `npm run build` (`vite build`), and manual visual
  confirmation via `npm run dev` instead of automated test assertions.
- Component markup migration (Header, Vitrine, Carrinho, etc.) is **out of scope** for this plan —
  those are Phase 2 (Shell) and Phase 4 (Pages), written as separate plans once this one ships.
  [spec: Phases]
- Florianópolis's municipal green accent tokens (`--color-secondary*`, `--color-state-*`) are
  **not touched** in this phase — only the primary blue and body font change. [spec: Local Branding]
- Exact DS-gov token values used below (`--blue-warm-vivid-70: #1351b4`, `-80: #0c326f`,
  `--font-family-base: Rawline, Raleway, sans-serif`) were verified directly from
  `@govbr-ds/core@3.7.0`'s published `dist/core-tokens.css` on unpkg during design — not guessed.

---

### Task 1: Install `@govbr-ds/core` and load its CSS/JS without breaking Tailwind's cascade

**Files:**
- Modify: `package.json` (add dependency)
- Modify: `src/index.css:1-2` (replace single `@import "tailwindcss";` with layered imports)
- Modify: `src/main.tsx` (side-effect import of DS-gov's JS bundle)

**Interfaces:**
- Produces: a `govbr` CSS layer (lowest priority) containing all of DS-gov's base/component
  styles, loaded before Tailwind's `theme`/`utilities` layers so Tailwind utilities always win on
  conflicts. Produces `window.core` (DS-gov's UMD global, exposing `core.BRHeader`,
  `core.BRAccordion`, etc.) for later phases to consume.

- [ ] **Step 1: Install the package**

Run: `npm install @govbr-ds/core@3.7.0`

Expected: `package.json` gains `"@govbr-ds/core": "^3.7.0"` under `dependencies`, and
`package-lock.json` updates. No errors.

- [ ] **Step 2: Confirm the expected files exist locally**

Run (Windows PowerShell): `Get-ChildItem node_modules/@govbr-ds/core/dist | Select-Object Name`

Expected output includes at least: `core.min.css`, `core.min.js`, `core-tokens.css`. If any of
these three are missing or named differently, stop and re-check the installed version — the rest
of this task assumes these exact filenames (verified against the published 3.7.0 package).

- [ ] **Step 3: Replace the CSS entry point's imports**

Replace the top of `src/index.css` (currently):

```css
@import url('https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@400;500;600;700;800&family=Noto+Sans:wght@400;500;600;700&display=swap');
@import "tailwindcss";
```

With:

```css
@import url('https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@400;500;600;700;800&family=Raleway:wght@400;500;600;700&display=swap');

@layer govbr, theme, base, components, utilities;

@import "@govbr-ds/core/dist/core.min.css" layer(govbr);
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/utilities.css" layer(utilities);
```

This drops Tailwind's Preflight (by importing `theme.css` and `utilities.css` individually
instead of the bundled `"tailwindcss"` entry, which also injects `preflight.css`) and puts DS-gov's
CSS in the `govbr` layer, declared first (lowest priority) in the `@layer` statement — so any
Tailwind utility class always beats a DS-gov default on the same element. The Google Fonts import
switches from Noto Sans to Raleway (see Task 3 for why).

- [ ] **Step 4: Load DS-gov's JS bundle**

In `src/main.tsx`, add the import below the existing `./index.css` import:

```ts
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import '@govbr-ds/core/dist/core.min.js';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

This is a side-effect import: `core.min.js` is a UMD bundle (verified from its source header —
`root["core"] = factory()` when no `module`/`exports`/AMD is detected) that Vite will execute and
which will attach itself to `window.core` in the browser. Nothing consumes `window.core` yet —
that starts in Phase 2 when the Header gets its `BRHeader` JS wrapper.

- [ ] **Step 5: Type-check and build**

Run: `npm run lint`
Expected: no TypeScript errors (this task touches no `.tsx` logic, only CSS imports and one
side-effect import).

Run: `npm run build`
Expected: build succeeds. Vite/PostCSS resolves the bare `@govbr-ds/core/...` specifiers in CSS
the same way it already resolves the Tailwind ones.

- [ ] **Step 6: Visual smoke test**

Run: `npm run dev`, open the app in a browser.

Expected (and OK for this phase): native elements (plain `<button>`, `<input>`, headings) across
the still-unmigrated pages will visibly change — DS-gov's base reset now applies globally. This is
expected churn, not a regression to fix now; Phases 2-4 replace this markup with DS-gov component
classes on purpose. Confirm the app still renders and is navigable (nothing crashes, layout
containers/flex/grid via Tailwind utilities still work).

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json src/index.css src/main.tsx
git commit -m "build: install @govbr-ds/core and layer its CSS under Tailwind utilities"
```

---

### Task 2: Align primary color tokens to verified DS-gov values

**Files:**
- Modify: `src/index.css` (the `@theme` block)

**Interfaces:**
- Consumes: nothing new.
- Produces: `--color-primary` / `--color-primary-dark` now hold DS-gov's real
  `blue-warm-vivid-70`/`-80` values, consumed by every existing `bg-primary`, `bg-primary-dark`,
  `text-primary` etc. Tailwind utility class already used across `Header.tsx`, `App.tsx`, and the
  other components (grep-confirmed) — no call sites change, only the resulting color.

- [ ] **Step 1: Update and de-duplicate the theme block**

In `src/index.css`, the `@theme` block currently has:

```css
  --color-primary: #002f5a;
  --color-primary-dark: #001c3a;
  --color-gov-blue: #002f5a;
  --color-gov-blue-dark: #003366;
  --color-gov-blue-vivid: #1351B4;
```

`--color-gov-blue*` is dead code — confirmed via `grep -r "gov-blue" src` that nothing outside
`index.css` itself references these tokens (no `bg-gov-blue*`/`text-gov-blue*` utility is used
anywhere). Replace the whole block with:

```css
  --color-primary: #1351b4;
  --color-primary-dark: #0c326f;
```

These are DS-gov's own `--blue-warm-vivid-70` and `--blue-warm-vivid-80` tokens (verified from
`@govbr-ds/core@3.7.0`'s `dist/core-tokens.css`) — notably, `#1351b4` already exactly matched the
old `--color-gov-blue-vivid` value the app had, so the "primary" and "vivid" blues become one
color as they should.

- [ ] **Step 2: Type-check and build**

Run: `npm run lint` — expected: no errors (CSS-only change).
Run: `npm run build` — expected: succeeds.

- [ ] **Step 3: Visual smoke test**

Run: `npm run dev`. Confirm the header bar and any other `bg-primary`/`text-primary` elements now
render in the brighter DS-gov blue (`#1351b4`) instead of the old darker `#002f5a`.

- [ ] **Step 4: Commit**

```bash
git add src/index.css
git commit -m "style: align primary blue tokens to verified DS-gov values"
```

---

### Task 3: Swap the body font to DS-gov's font stack

**Files:**
- Modify: `src/index.css` (the `--font-sans` token; the Google Fonts `@import` was already
  changed in Task 1 Step 3)

**Interfaces:**
- Consumes: nothing new.
- Produces: `--font-sans`, consumed by the existing `body { font-family: var(--font-sans); }`
  rule — no other file references `--font-sans` directly (grep-confirmed only `index.css` uses
  it), so this is a single-file, single-line change.

- [ ] **Step 1: Update `--font-sans`**

In the `@theme` block, replace:

```css
  --font-sans: "Noto Sans", ui-sans-serif, system-ui, sans-serif;
```

with:

```css
  --font-sans: "Raleway", ui-sans-serif, system-ui, sans-serif;
```

DS-gov's own token declares `--font-family-base: Rawline, Raleway, sans-serif` (verified from
`core-tokens.css`) — Rawline first, Raleway as its documented fallback. The official Rawline
webfont files are **not bundled** in `@govbr-ds/core` (confirmed: no `@font-face` rule and no
`/fonts` directory in the package's `dist/`), and no reliable official npm/CDN source for the
Rawline font files was found during this session's research. Using Raleway now matches DS-gov's
own fallback chain exactly and is a real, correctly-licensed Google Font (unlike the old Noto
Sans, which had no connection to DS-gov at all). **Deferred, not part of this task:** sourcing the
official Rawline font files from the gov.br/ds site's Downloads section and self-hosting them,
then prepending `"Rawline"` to this stack — track as a follow-up once that source is confirmed.

`--font-display` (Libre Franklin, used for the logo/headings via `.font-display`) is unchanged —
it's a Florianópolis branding choice, not a DS-gov requirement, and out of scope here.

- [ ] **Step 2: Type-check and build**

Run: `npm run lint` — expected: no errors.
Run: `npm run build` — expected: succeeds.

- [ ] **Step 3: Visual smoke test**

Run: `npm run dev`. Confirm body text now renders in Raleway (visibly different letterforms from
Noto Sans — Raleway has a distinctive thin, geometric look) and that the page doesn't flash
unstyled text or 404 on the font request (check the Network tab for the Google Fonts request to
`fonts.googleapis.com/css2?family=...Raleway...`).

- [ ] **Step 4: Commit**

```bash
git add src/index.css
git commit -m "style: swap body font to Raleway, matching DS-gov's Rawline fallback"
```

---

## Post-Implementation (not a coded task)

- [ ] Run `/impeccable audit` — per the design spec's Phase 1 checkpoint, this scores
  accessibility/performance/theming on the app as it stands after Foundation, without fixing
  anything. Use its output to sanity-check before starting the Phase 2 (Shell) plan, not as a
  blocking gate — some scores are expected to be mediocre until Phases 2-4 replace the remaining
  ad-hoc markup.
