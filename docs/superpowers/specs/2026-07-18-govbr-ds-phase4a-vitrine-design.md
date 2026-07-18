# DS-gov Migration — Phase 4a: Vitrine Page — Design Spec

Date: 2026-07-18
Branch: `feature/gov-ds-migration`
Parent spec: `docs/superpowers/specs/2026-07-17-govbr-ds-migration-design.md` (Phase 4 — Page components, item 1)

## Goal

Migrate `src/components/Vitrine.tsx` onto the Phase 3 primitives (`Button`, `Tag`, `Input`, `Modal`)
and real DS-gov markup/tokens, and fix the anti-patterns every audit this session has flagged in
it (hand-rolled modal with zero ARIA, emoji-as-icons, `animate-bounce`). Search/filter logic,
`fuzzySearch`, cart-add business logic, and pagination (`displayLimit`) are unchanged.

## Research Basis

- `br-card` (verified from `components/card/examples/card-hover.html`) is minimal —
  `br-card {hover?}` wrapping a `card-content` div, no prescribed internal structure. Used as the
  outer wrapper only; the existing rich internal layout (image, price, badges, actions) is kept.
- DS-gov's own `select` component (`components/select/examples/select-simples.html`) is a
  searchable custom widget (text input + dropdown `br-list` of radio buttons, its own JS) — decided
  against for Vitrine's 3 short, non-searchable filter lists (category/secretaria/estado); native
  `<select>` stays, re-tokened only.
- DS-gov's `notification` component (`components/notification/examples/notification-full.html`) is
  a persistent bell-icon dropdown panel (tabs, message list) — not a toast/snackbar pattern. No
  DS-gov component fits Vitrine's transient auto-dismiss toast; it stays custom.

## Changes

1. **Product cards**: outer `<article>` gets `br-card hover` added to its existing classes (keeping
   Tailwind layout utilities per the Phase 1 cascade-layer rule — DS-gov owns element defaults,
   Tailwind owns layout).

   **Correction found while writing the implementation plan**: the spec originally called for
   routing the conservation-state badge through `<Tag variant="status">`. Checked against the
   verified reference markup (`components/tag/examples/tag-status.html`) again at this point:
   DS-gov's `status` tag is a small, unlabeled colored *dot* meant to sit next to separate text
   (`<span class="br-tag status bg-success"></span><span>Online</span>`) — it does not render a
   labeled pill. Vitrine's badge is a labeled pill overlaid on the product photo ("Bom", "Novo (Sem
   uso)", etc. — real information, not decorative), a different UI shape `Tag`'s `status` variant
   wasn't built for. Forcing it in would mean bolting a separate text label next to the dot and
   restructuring the corner-badge visual entirely — out of proportion to what this task needs.
   **Resolution**: keep the existing labeled-pill structure, but drive its background with
   DS-gov's own verified utility classes (`bg-danger`/`bg-success`/`bg-warning`, confirmed present
   in `core.min.css`, plus `bg-gray-40` for `SUCATA` — same verified classes Tag's `status` variant
   itself would have used internally) instead of the app's ad hoc `--color-state-*` Tailwind
   classes. `Tag`'s `status` variant stays built and available (Phase 3 delivered it with no
   guaranteed consumer), unconsumed by this task — a future compact list/dot-indicator view is a
   more natural fit for it than this card badge.
2. **Buttons**: "Ver Detalhes", "Reservar Item"/"Adicionado", category shortcut pills, "Carregar
   Mais Itens Ociosos", "Resetar Busca", "Limpar" (filter sidebar), "Limpar Todos os Filtros"
   (empty state), and the modal's "Voltar ao Catálogo"/"Reservar Item" footer buttons all become
   `<Button>`, replacing hand-rolled `<button className="...">` variants. Icons stay as
   already-imported `lucide-react` icons, passed via `Button`'s `icon` prop.
3. **Search input**: the main catalog search box becomes `<Input>` with `icon={<Search .../>}`.
4. **Filter dropdowns**: stay native `<select>` (per design decision). Re-token their classes from
   raw Tailwind (`bg-gray-50 border-gray-200 focus:ring-primary`) to reuse the same
   `--color-on-surface-variant`/border tokens the rest of the migration uses, instead of
   introducing new raw grays.
5. **Detail modal**: replace the hand-rolled `fixed inset-0 z-50 ... bg-black/60` div (currently
   zero `role`/`aria-modal`/focus-trap) with `<Modal open={!!detailProduct}
   onClose={() => setDetailProduct(null)} title={detailProduct.nome} footer={...}>`. This is the
   direct fix for the "hand-rolled modal lacks ARIA" finding present in every audit this session
   (Phase 1's checkpoint, Phase 2's checkpoint, and implicitly Phase 3's `Modal` build itself).
6. **Toast**: stays a custom component (no DS-gov equivalent), but:
   - `animate-bounce` → replaced with a calmer enter/exit transition.
   - Add a `prefers-reduced-motion` media-query fallback (crossfade or instant, per the project's
     own `impeccable` motion guidance already referenced elsewhere in this migration).
   - Re-token colors: `bg-emerald-700`/`text-emerald-300`/`bg-emerald-900` → the existing
     `--color-secondary`/`--color-on-secondary` tokens (Florianópolis's municipal green, already
     established as the local-identity accent in Phase 1's Local Branding section) instead of ad
     hoc Tailwind emerald shades.
7. **Anti-pattern cleanup**: the modal's 💚/🌿 emoji (audit-flagged) replaced with `lucide-react`
   icons already available in the codebase's icon set (e.g. `Leaf`/`Recycle` or similar — exact
   choice made during implementation, matching icons already used elsewhere for cost/environmental
   framing). The modal's two `grid-cols-2 gray-50` info boxes (Secretaria Cedente / Impacto do
   Reuso) are a mild nested-card pattern already inside the new `Modal`'s body — simplified to a
   single flat list if that's a clean, low-effort change while the modal markup is already being
   touched; not a blocking requirement if it adds real complexity.

## Out of Scope

- `fuzzySearch`, `filteredProducts` memoization, `displayLimit` pagination logic, `showToast`
  timing, cart-add (`onAddToCart`, `handleAddToCart`) — all business logic unchanged.
- Any change to `MOCK_PRODUTOS`/`MOCK_CATEGORIAS`/`MOCK_SECRETARIAS`/`types.ts`.
- Carrinho/WorkflowManager/AvisosCompras/Relatorios — separate Phase 4 sub-phases.

## Conservation-State Color Mapping

Vitrine's `getEstadoBadge` currently returns a `--color-state-*`-backed Tailwind class per state.
Per the correction above, this becomes a mapping to DS-gov's own verified utility classes instead
(`Tag` is not used here — see correction above):

| Estado | Current color | DS-gov utility class |
|---|---|---|
| NOVO | `--color-state-novo` (#008844) | `bg-success` |
| BOM | `--color-state-bom` (#168821) | `bg-success` |
| REGULAR | `--color-state-regular` (#FFCC00) | `bg-warning` |
| PESSIMO | `--color-state-pessimo` (#D93B3B) | `bg-danger` |
| SUCATA | `--color-state-sucata` (#737373) | `bg-gray-40` |

`bg-danger`/`bg-success`/`bg-warning` and the full `bg-gray-{1,2,3,4,5,10,20,...,90}` grayscale
ramp are all confirmed present in `@govbr-ds/core`'s compiled `core.min.css` — real classes, not
guessed.

## Verification

- `npm run lint` / `npm run build` (no test runner, established in Phase 1).
- Real interaction check via `npm run dev`: search/filter/category-shortcut behavior unchanged,
  card rendering with correct `Tag` per conservation state, modal opens/closes with real focus-trap
  (inherited from `Modal`), toast still appears/auto-dismisses with the new transition, reduced-motion
  media query respected (checked via browser dev tools' emulation, not just code review).
