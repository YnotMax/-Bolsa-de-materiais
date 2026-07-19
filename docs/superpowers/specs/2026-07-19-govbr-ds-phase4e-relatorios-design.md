# DS-gov Migration — Phase 4e: Relatorios Page — Design Spec

Date: 2026-07-19
Branch: `feature/gov-ds-migration`
Parent spec: `docs/superpowers/specs/2026-07-17-govbr-ds-migration-design.md` (Phase 4 — Page components, item 5, final page)

## Goal

Migrate `src/components/Relatorios.tsx` onto DS-gov markup/primitives. Unlike every prior Phase 4
sub-phase, this page has no forms, buttons, or modals — it is a read-only stats dashboard (4
metric cards, a gamified secretariat ranking table, one explanatory panel). The migration surface
is correspondingly smaller: card-wrapper tokens, one banner onto `Message`, and a decorative-emoji
swap for consistency with Vitrine's Phase 4a precedent.

## Research Basis

- `br-card` is the same wrapper class already applied to product/cart/requisition/log cards in
  every prior phase (Vitrine, Carrinho, WorkflowManager, AvisosCompras) — reused identically here
  for the 4 bento metric cards and the two lower panels.
- `Message`'s shape (title+body) fits the "Selo Verde Florianópolis" callout exactly — no
  composition workaround needed here, unlike AvisosCompras' list-shaped banner in Phase 4d.
- No `Table` primitive exists in this codebase — the ranking table stays native HTML, consistent
  with `Select` staying native in every prior phase for the identical reason (YAGNI against
  building a primitive for a single consumer).

## Changes

1. **Card wrappers → `br-card`.** Added to the existing Tailwind card divs (no other markup
   changes) for:
   - The 4 bento metric cards (Erário Economizado, Carbono Evitado, Itens Remanejados, Licitações
     Bloqueadas).
   - The ranking table's container panel.
   - The explanatory sidebar panel.

2. **Decorative emoji → lucide icons** (per approved decision, matching Vitrine's Phase 4a
   Coins/Leaf precedent):
   - 🌿 in the CO₂ card's "Equivalente a X árvores plantadas" subtext → `Leaf` icon (already
     imported in this file, used elsewhere for the sustainability theme).
   - 🔒 in the "Licitações Bloqueadas" card's "Impedidos pela trava sistêmica" subtext → `Lock`
     icon (new import).
   - 🌿 in the "Selo Verde Florianópolis" callout's heading is dropped entirely as part of Change
     3 below — `Message`'s own icon slot carries that role, matching the convention already
     established for every other `Message` migration this session (the source text's emoji/icon
     is never duplicated alongside `Message`'s icon).

3. **"Selo Verde Florianópolis" callout → `Message` primitive.** This is a clean title+body fit
   (unlike AvisosCompras' list-shaped banner in Phase 4d, which needed a sibling-list
   composition) — becomes `Message variant="success"` with the title text keeping its wording but
   dropping the inline emoji.

## Out of Scope

- The `stats` and `rankingSecretarias` `useMemo` calculation logic — purely presentational
  changes, no data/business-logic touched.
- The ranking table's markup and its position-badge/selo-badge coloring (raw Tailwind
  amber/slate/emerald classes for 1st/2nd/3rd place and selo tiers) — no `Table` primitive exists
  to migrate onto, and re-coloring gamification badges is a distinct visual-design decision outside
  this migration's scope of "adopt DS-gov component markup," matching how AvisosCompras' matched-
  item cards' inline `estadoConservacao` badge was left alone in Phase 4d for the same reason
  (it's small in-context styling, not a DS-gov component swap).
- Vitrine/Carrinho/WorkflowManager/AvisosCompras — already migrated (Phases 4a-4d).

## Verification

- `npm run lint` / `npm run build` (no test runner, established since Phase 1).
- Real interaction check via `npm run dev`: navigate to the Relatorios tab, confirm all 4 metric
  cards render with `br-card` styling and correct computed values (economia/CO2/itens/projetos
  derived from `requisicoes` prop plus base mock values); confirm the CO₂ card and Licitações card
  show `Leaf`/`Lock` icons in place of the emoji, sized/positioned consistently with the rest of
  their subtext; confirm the ranking table still renders all 5 secretariats with correct position
  badges, RDE/CO₂ values, and selo badges; confirm the "Selo Verde Florianópolis" panel renders as
  a `Message variant="success"` with the same body copy.
