# DS-gov Migration — Phase 4d: AvisosCompras Page — Design Spec

Date: 2026-07-19
Branch: `feature/gov-ds-migration`
Parent spec: `docs/superpowers/specs/2026-07-17-govbr-ds-migration-design.md` (Phase 4 — Page components, item 4)

## Goal

Migrate `src/components/AvisosCompras.tsx` onto DS-gov markup/primitives, fixing the same class
of already-flagged issues found in every prior Phase 4 sub-phase: raw-Tailwind status badges, a
hand-rolled alert modal with zero ARIA, and an unguarded `animate-pulse`/broken `animate-in fade-in
zoom-in` pair (the latter is the identical non-functional Tailwind-class bug Phase 4a found in
Vitrine's toast and Phase 4c found in WorkflowManager's rejection modal — migrating to the `Modal`
primitive removes it as a side effect, since `Modal` never used that pattern).

## Research Basis

- `bg-warning`/`bg-success`/`bg-gray-40` are already-verified DS-gov utility classes, used
  identically in WorkflowManager's `getStatusInfo` (Phase 4c).
- No DS-gov component fits a 2-state colored status pill any more precisely than the
  `getStatusInfo`/`getEstadoInfo` pattern already established twice this migration — same approach
  reused here (a plain function returning DS-gov utility classes, not a component).
- `Message`'s layout (title+body+optional-dismiss) has no slot for an embedded action list, so
  content-only banners map cleanly; the legal-citation text in the alert modal is exactly this
  shape (a title + explanatory body), matching `Message`'s existing `variant="danger"` usage.

## Changes

1. **`getStatusBadge` → `getStatusInfo(status): {tone, label}`.** Co-located in
   `AvisosCompras.tsx` itself (not `src/data.ts` — this status enum has no other page consumer,
   YAGNI applies against a premature shared extraction, same reasoning as Phase 4c):
   - `FORCADO_COM_JUSTIFICATIVA` → `bg-warning text-black font-semibold` / "Compra Forçada
     (Justificada)"
   - `REQUISITADO_REMANEJAMENTO` → `bg-success text-white` / "Redirecionado ao Reuso"
   - default → `bg-gray-40 text-white` / `{status}`

2. **Form fields**: CATMAT, Descrição, and Quantidade inputs become `Input` (label/helperText
   props used where the current placeholder/hint text warrants it). Órgão Comprador `<select>`
   stays native (no `Select` primitive exists yet — consistent with WorkflowManager's motivo
   dropdown and Carrinho's precedent), re-tokened `bg-gray-50` → `bg-background`. The bypass
   justification `<textarea>` becomes `Textarea` with `state={justificativaError ? 'danger' :
   undefined}` — mirroring Carrinho's exact `state`-driven validation pattern (Phase 4b) rather
   than a hand-rolled conditional border class.

3. **Buttons → `Button` primitive**:
   - "Simular Abertura de Licitação / Compra" → `variant="primary"`
   - "Resgatar Item" → `variant="secondary"` (matches its current `bg-secondary`)
   - "Cancelar Simulação" → `variant="tertiary"`
   - "Burlar Bloqueio (Justificar)" → `variant="primary" className="bg-warning text-black"` —
     mirrors WorkflowManager's `variant="primary" className="bg-danger"` pattern for its
     "Registrar Rejeição Oficial" button, same mechanism, warning tone since this is a
     compliance-bypass/caution action rather than a destructive one.
   - "Ir para Vitrine de Reuso" → `variant="secondary"`
   - "Limpar Logs" → `variant="tertiary" className="text-danger"` — mirrors WorkflowManager's
     "Recusar Pedido" destructive-tertiary pattern (Phase 4c).

4. **Two info/warning banners → `Message`**:
   - "Códigos de teste para disparar a trava sistêmica" → `Message variant="info"`.
   - "Deseja desviar deste bloqueio legal?" → `Message variant="warning"`.

5. **Trava Sistêmica alert modal → `Modal` primitive.** Replaces the hand-rolled
   `fixed inset-0 ... bg-black/70` div (zero `role`/`aria-modal`/focus-trap) with `Modal`'s real
   `role="dialog"`/`aria-modal`/focus-trap/Escape/backdrop-click/focus-restore behavior (built in
   Phase 3, proven in Vitrine and WorkflowManager). Per explicit decision: the custom
   gradient (`from-red-600 to-amber-600`) header band and "ALERTA SISTÊMICO" eyebrow badge are
   dropped in favor of `Modal`'s standard header (title: "Bens Equivalentes Disponíveis sem
   Custos!") — following the exact precedent Phase 4c set for the rejection modal (severity
   communicated through content/button styling, not header chrome). The legal-citation paragraph
   ("A Lei Federal nº 14.133/2021...") becomes a `Message variant="danger"` inside the modal body,
   placed before the matching-items list. This migration also removes the unguarded
   `animate-pulse` on the `AlertOctagon` icon (the icon itself is dropped along with the custom
   header — its warning role is now carried by the `Message` banner) and the broken `animate-in
   fade-in zoom-in duration-200` classes, both as side effects of adopting `Modal`.
   - The modal's footer (`Cancelar Simulação` / `Burlar Bloqueio` / `Ir para Vitrine`) uses
     `Modal`'s `footer` prop, matching WorkflowManager's Task 4 pattern of relocating
     already-`Button`-ified actions into `footer` without re-touching their internals.
   - The "Resgatar Item" buttons inside the matched-items list stay inline in the modal body
     (not in `footer`, since there's one per list item, not a fixed action row).

## Out of Scope

- Simulation/persistence logic (`handleSimulateSubmit`, `handleRedeemIdle`, `handleBypassSubmit`,
  `saveCompras`, the `localStorage` read/write), the fuzzy CATMAT/description matching, and both
  `alert()` calls — all unchanged.
- Vitrine/Carrinho/WorkflowManager — already migrated (Phases 4a/4b/4c).
- Relatorios — separate Phase 4e.

## Verification

- `npm run lint` / `npm run build` (no test runner, established since Phase 1).
- Real interaction check via `npm run dev`: entering one of the 4 documented test CATMAT
  codes/descriptions still triggers the modal; entering a non-matching description still
  auto-completes the simulation via the existing `alert()` path; "Resgatar Item" still adds the
  item to cart and switches tabs; "Burlar Bloqueio" still validates the 15-character minimum and
  shows/clears `justificativaError` via `Textarea`'s `state`; "Cancelar Simulação" still closes
  without saving; "Ir para Vitrine de Reuso" still navigates; the log history panel still renders
  both status tones correctly (both are reachable via the two documented flows, unlike some
  earlier phases' unreachable-state gaps); modal opens/closes with real focus-trap/Escape/
  backdrop-click/focus-restore (re-verify in this new context per established practice, not
  assumed from prior consumers); "Limpar Logs" still clears `localStorage` and the in-memory list.
