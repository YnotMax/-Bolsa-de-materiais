# DS-gov Migration — Phase 4c: WorkflowManager Page — Design Spec

Date: 2026-07-18
Branch: `feature/gov-ds-migration`
Parent spec: `docs/superpowers/specs/2026-07-17-govbr-ds-migration-design.md` (Phase 4 — Page components, item 3)

## Goal

Migrate `src/components/WorkflowManager.tsx` onto DS-gov markup/primitives, fixing three
already-flagged issues in the process: raw-Tailwind workflow-status badges (noted in Phase 1's
audit checkpoint), a hand-rolled rejection modal with zero ARIA (noted in every audit this
session), and an `animate-pulse`/broken `animate-in fade-in zoom-in` pair (the latter is the exact
same non-functional Tailwind-class bug Phase 4a found and fixed in Vitrine's toast — migrating this
modal to the `Modal` primitive removes it as a side effect, since `Modal` never used that pattern).

## Research Basis

- `bg-info` (verified present in `@govbr-ds/core@3.7.0`'s compiled `core.min.css`, alongside the
  already-used `bg-danger`/`bg-success`/`bg-warning`) rounds out the 4-tone semantic palette this
  migration has used since Phase 4a.
- No DS-gov component fits a 5-state colored status pill any more precisely than the existing
  `getEstadoInfo` pattern already established for conservation states — same approach reused here
  (a plain function returning DS-gov utility classes, not a component).

## Changes

1. **`getStatusBadge` → DS-gov utility classes.** Currently returns full JSX with raw Tailwind
   color triples (`bg-blue-100 text-blue-800 border-blue-200`, etc.) per status. Replaced with a
   `getStatusTone(status): string` function (co-located in `WorkflowManager.tsx` itself, not
   `src/data.ts` — unlike `getEstadoInfo`, this status enum and its badge are specific to workflow
   state, not shared with any other page component, so YAGNI applies against a premature shared
   extraction) returning one of the verified DS-gov tone classes:
   - `SUBMETIDA` → `bg-info text-white`
   - `EM_ANALISE` → `bg-warning text-black font-semibold`
   - `APROVADA` → `bg-success text-white`
   - `TRANSFERIDA` → `bg-success text-white` (a completed transfer is at least as positive as a
     pending approval — reusing `success` here mirrors how Vitrine's `getEstadoInfo` already
     unifies NOVO+BOM under one tone rather than inventing a token DS-gov doesn't define)
   - `REJEITADA` → `bg-danger text-white`
   - default → `bg-gray-40 text-white` (matching the neutral fallback already used for
     conservation state's `SUCATA`)

   The badge markup itself (a rounded pill `<span>`) stays as existing Tailwind layout classes
   (`text-xs px-2.5 py-1 rounded-full font-bold`) with only the color portion driven by the new
   function — consistent with how `getEstadoInfo`'s `.tone` is consumed in Vitrine/Carrinho.

2. **Buttons**: role-mode toggle (Aprovação/Acompanhamento), "Recusar Pedido", "Homologar &
   Aprovar", "Confirmar Entrega Física", "Termo de Cessão PDF", "Baixar Termo Digital"
   (requisitante view), and the rejection modal's "Cancelar"/"Registrar Rejeição Oficial" — all
   become `Button`.
3. **Three info banners → `Message`**:
   - "Reserva Otimista Ativa" (currently `animate-pulse` on its icon, no `prefers-reduced-motion`
     guard — an audit-flagged anti-pattern) → `Message variant="warning"`, dropping the pulse
     animation entirely (a status banner doesn't need continuous motion to communicate its state).
   - "Motivo da Recusa / Rejeição" → `Message variant="danger"`.
   - Requisitante's "homologada com sucesso" banner → `Message variant="success"`, with its
     "Baixar Termo Digital" button passed via composition (rendered alongside the `Message`, since
     `Message`'s own layout is title+body+optional-dismiss, not built for an embedded action
     button — the button stays a sibling element, not squeezed into `Message`'s slots it wasn't
     designed for).
4. **Rejection modal → `Modal` primitive.** Replaces the hand-rolled `fixed inset-0 ... bg-black/60`
   div (zero `role`/`aria-modal`/focus-trap, confirmed by every audit) with `Modal`'s real
   `role="dialog"`/`aria-modal`/focus-trap/Escape/backdrop-click/focus-restore behavior (built in
   Phase 3, already proven working in Vitrine's Phase 4a modal migration). The modal's custom red
   header band (`bg-red-600` title bar) is dropped in favor of `Modal`'s standard header — the
   destructive nature of the action is still communicated via the "Registrar Rejeição Oficial"
   button's styling and the modal's own content, not by recoloring the whole header chrome.
5. **Requisition list cards** → `br-card` wrapper (matching the pattern already used for product
   and cart-item cards in Vitrine/Carrinho).
6. **Rejection modal's form fields**: motivo `<select>` stays native, re-tokened (`bg-gray-50` →
   `bg-background`, matching the Phase 4a/4b pattern); detalhes `<textarea>` → `Textarea` primitive
   (no `state` prop needed — this field is optional/complementary, not validated).

## Out of Scope

- Role-mode filtering logic (`filteredRequisitions`), status-transition handlers (`onUpdateStatus`,
  `handleOpenRejectionModal`, `submitRejection`), and the simulated PDF-download `alert()`
  (`handleSimulatedDownloadTerm`) — all unchanged.
- AvisosCompras/Relatorios — separate Phase 4 sub-phases.

## Verification

- `npm run lint` / `npm run build` (no test runner, established in Phase 1).
- Real interaction check via `npm run dev`: role-mode toggle still filters/switches views;
  requisition selection still shows correct details; status badges show correct colors for all 5
  states (may need to check `src/data.ts`'s mock requisições for state coverage, similar to
  Vitrine's SUCATA gap in Phase 4a); rejection modal opens/closes with real focus-trap/Escape/
  backdrop-click (inherited from `Modal`, re-verify in this new context per the Phase 4a
  precedent); rejecting a requisition still calls `onUpdateStatus` with the composed motivo string;
  approval/transfer/download button flows still work; the "Reserva Otimista"/"Motivo da
  Recusa"/success banners render correctly with no residual pulse animation.
