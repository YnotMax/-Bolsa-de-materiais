# DS-gov (gov.br Design System) Migration — Design Spec

Date: 2026-07-17
Branch: `feature/gov-ds-migration`

## Goal

Migrate Bolsa de Materiais — a marketplace letting city-hall departments (Requisitante) search
materials already sitting in another department's storage (Cedente) before buying new — from its
hand-rolled "gov-blue" Tailwind theme to the official gov.br Design System
(`@govbr-ds/core`, v3 stable), across all components, with eMAG/WCAG accessibility treated as a
pass/fail gate per phase.

## Non-Goals

- No change to business logic (workflow states, cart logic, Prisma/Mongo data layer)
- No redesign of information architecture beyond what DS-gov components require
- No adoption of DS-gov's own CSS grid in place of Tailwind's layout utilities
- No migration to the "V4" next-gen DS-gov beta — target the current stable v3 line

## Background: What DS-gov Actually Is

Officially "Padrão Digital de Governo," maintained by SERPRO with the GOVBR-DS community.
Confirmed, verifiable facts used in this design (research done 2026-07-17; the site at
`gov.br/ds` is JS-rendered and didn't yield literal token values, so exact hex/spacing values are
intentionally NOT hardcoded here — they get pulled from the installed package at implementation
time, not guessed):

- Distribution: `@govbr-ds/core` npm package (framework-agnostic CSS/JS), installed via
  `npm i @govbr-ds/core`, assets linked from `node_modules/@govbr-ds/core/dist/`
- No production-stable official React component library — components are built from DS-gov's
  documented HTML/class markup (`br-button`, `br-input`, `br-header`, `br-tag`, `br-message`,
  etc.) inside normal React components
- Typography: Rawline typeface, chosen by SERPRO specifically for legibility/accessibility
- A subset of components require JS instantiation: Header, Menu, Message, Select, Collapse,
  Tooltip (e.g. `new core.BRHeader('br-header', brHeader)`)
- Accessibility model: eMAG (Modelo de Acessibilidade em Governo Eletrônico), WCAG-based
- Municipal/local agencies are expected to keep DS-gov's component structure while applying their
  own institutional identity color on top — this is the supported adoption pattern, not a
  deviation

## Integration Architecture

- Install `@govbr-ds/core` (latest published v3.x)
- Disable Tailwind Preflight/base reset in `src/index.css` so DS-gov's own reset owns
  element-level styling (buttons, inputs, headings); Tailwind stays scoped to utility classes for
  layout/spacing on layout containers
- JS-instantiated DS-gov components (Header, Menu, Message, Select, Collapse, Tooltip) get a thin
  React wrapper (`useEffect` init + cleanup) so DS-gov's imperative JS coexists with React's
  render cycle — flagged as a real implementation risk, particularly under React 19 StrictMode's
  double-invoke behavior
- Replace the custom `@theme` block (`--color-primary`, `--color-gov-blue*`,
  `--color-secondary*`, `--color-state-*`) with values read directly off the installed
  `@govbr-ds/core` CSS custom properties

## Local Branding

Florianópolis's municipal identity (emerald-green accents, "PMF Ativa" badge, Landmark logo mark)
is kept as a local identity layer on top of DS-gov's standard blue/components — the same pattern
other gov.br-adopting agencies use. The green accent gets a WCAG AA contrast check since it isn't
part of DS-gov's pre-vetted palette.

## Phases

**Step -1 — Lightweight PM grounding** (new, added per user request 2026-07-17)
Run `define-problem-statement` and `foundation-persona` (Requisitante, Cedente) once, before any
tooling changes. Keep it shallow — one short pass each, not a discovery project. Output feeds the
`PRODUCT.md` produced in Step 0.

**Step 0 — `/impeccable init`**
Crawl the codebase to produce baseline `PRODUCT.md` (who/what/why, informed by Step -1) and
`DESIGN.md` (current visual theme, tokens, components) before anything changes, so later phases
have a "before" reference and a place to record the "after" state.

**Phase 1 — Foundation**
Install `@govbr-ds/core` (v3 stable), swap fonts to Rawline, disable Tailwind Preflight, wire
DS-gov tokens + Florianópolis green accent layer.
→ Checkpoint: `/impeccable audit`

**Phase 2 — Shell**
Rebuild `src/components/Header.tsx` on `br-header` (+ JS init wrapper) and the mobile menu on
DS-gov's menu pattern. Add a footer (`br-footer`) — the app currently has none, and DS-gov expects
one.
→ Checkpoint: `/impeccable audit`

**Phase 3 — Shared primitives**
Buttons, tags/badges (cart count, status pills), form inputs, alerts/messages — built once as
small wrapper components so all pages consume the same primitives instead of each
re-implementing Tailwind button/badge classes.

**Phase 4 — Page components**, in priority order matching the core "search before you buy" flow:
1. `src/components/Vitrine.tsx` (search/showcase — the product's central job)
2. `src/components/Carrinho.tsx`
3. `src/components/WorkflowManager.tsx`
4. `src/components/AvisosCompras.tsx`
5. `src/components/Relatorios.tsx`

**Phase 5 — Final verification**
`/impeccable audit` end-to-end pass, plus the manual eMAG/WCAG checks below.

## Accessibility (eMAG/WCAG) Gate

Each phase only counts as done when it also passes:
- Semantic landmarks (`header`, `nav`, `main`, `footer`) and correct heading order
- Keyboard navigation (tab order, visible focus, mobile menu operable without a mouse)
- Color contrast, including the municipal green accent (not pre-vetted by DS-gov like its own blue)
- ARIA labeling on icon-only buttons (menu toggle, cart icon — some already have `aria-label`,
  others don't)
- Skip-to-content link (doesn't exist today)

## Testing / Verification

- Visual smoke test per phase via the `run` skill in-browser
- `/impeccable audit` at the two checkpoints above and at the end (technical scan: a11y,
  performance, theming — doesn't fix issues, just scores and reports)
- Automated accessibility check (axe or similar) as part of verification, not just visual review

## Risks

- DS-gov's imperative JS components assume DOM ownership of the node they're initialized on;
  needs careful `useEffect` cleanup to avoid fighting React 19's render cycle, especially under
  StrictMode's double-invoke in development
- Disabling Tailwind Preflight may cause visual drift in existing utility-based spacing/layout
  once DS-gov's own reset applies — expect to fix this per component during migration, not as a
  one-time drop-in
- Exact DS-gov token values (colors, spacing scale, radii) were not independently verifiable from
  this session's research (JS-rendered docs site) — they must be pulled from the installed
  `@govbr-ds/core` package / official Figma at implementation time rather than assumed
