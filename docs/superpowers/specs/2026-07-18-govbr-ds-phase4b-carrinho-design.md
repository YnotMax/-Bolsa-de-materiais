# DS-gov Migration — Phase 4b: Carrinho Page — Design Spec

Date: 2026-07-18
Branch: `feature/gov-ds-migration`
Parent spec: `docs/superpowers/specs/2026-07-17-govbr-ds-migration-design.md` (Phase 4 — Page components, item 2)

## Goal

Migrate `src/components/Carrinho.tsx` onto real DS-gov markup/primitives, extract the
conservation-state color/label logic (currently duplicated between `Vitrine.tsx` and
`Carrinho.tsx`) into one shared place, and add two new primitives (`Checkbox`, `Textarea`) that
DS-gov's own markup supports simply enough to justify building now rather than deferring.

## Research Basis

- `br-checkbox` (verified: `components/checkbox/examples/checkbox-default.html`) is a plain
  `<div class="br-checkbox"><input type="checkbox".../><label>...</label></div>` — pure CSS.
  `checkbox.js`'s only behavior (`BRCheckbox`) wires up parent/child "checkgroup" relationships via
  `data-parent` attributes — irrelevant to Carrinho's single standalone termos checkbox, so no JS
  instantiation is needed for this primitive.
- `br-textarea` (verified: `components/textarea/examples/textarea-counter.html`) is
  `<div class="br-textarea"><label>...</label><textarea maxlength="...">...</textarea><div
  class="text-base mt-1"><span class="limit">...</span><span class="current">...</span></div></div>`.
  `textarea.js`'s `BRTextArea` class drives the counter text via keyup/focus listeners — but
  Carrinho already computes its own counter text in React (`Math.max(0, 10 -
  item.justificativa.length)`), so `Textarea` stays pure markup too: the counter slot's text is
  passed in as a prop by the consumer instead of wiring up DS-gov's imperative JS for it.

## Changes

1. **Shared conservation-state utility**: add a function to `src/data.ts` (alongside the existing
   `MOCK_*` constants and `fuzzySearch`) that returns `{ tone: string; label: string }` for a given
   `EstadoConservacao`, using the same verified DS-gov utility classes Phase 4a's `Vitrine.tsx`
   already established (`bg-success`/`bg-warning`/`bg-danger`/`bg-gray-40`). Both `Vitrine.tsx`'s
   local `getEstadoBadge` and `Carrinho.tsx`'s local `getEstadoTagClass`/`getEstadoLabel` are
   replaced with calls to this one shared function — the exact same values, just one source of
   truth instead of two independently-maintained copies.
2. **New `Checkbox` primitive** (`src/components/Checkbox.tsx`): wraps `br-checkbox`, mirrors
   `Input`'s API shape (`label`, `id`, plus native checkbox props via spread). No JS instantiation.
3. **New `Textarea` primitive** (`src/components/Textarea.tsx`): wraps `br-textarea`, mirrors
   `Input`'s API shape (`label`, `id`, plus native textarea props via spread), with an additional
   `counterText?: string` prop rendered into the DS-gov counter slot — supplied by the consumer
   (Carrinho computes and passes its own "Restam N caracteres" string), not driven by DS-gov's own
   JS.
4. **Carrinho migration**:
   - Cart item cards: `br-card` wrapper (matching Vitrine's Task 1 pattern); conservation tag now
     driven by the shared utility from item 1.
   - Quantity stepper (−/+), remove button, submit/cancel buttons, empty-cart "Navegar no
     Catálogo" button → `Button` primitive.
   - Nome Completo, Matrícula Funcional, E-mail Institucional fields → `Input` primitive (email
     field's existing red-border-on-error styling becomes conditional `className`/props passed
     through `Input`'s native prop spread).
   - Secretaria/Setor dropdown → stays native `<select>` (re-tokened, matching the Phase 4a
     decision — DS-gov's own `br-select` widget remains out of proportion for a short,
     non-searchable option list).
   - Termos checkbox → `Checkbox` primitive.
   - Justificativa field (per cart item) → `Textarea` primitive, with the counter slot fed the
     existing `Restam N caracteres` computation (replacing the current custom label-corner text).
   - Validation-incomplete warning banner → `Message` primitive (`variant="warning"`) — its first
     production consumer (built in Phase 3, unconsumed until now).

## Out of Scope

- Form validation logic: `isFormValid`, the `@pmf.sc.gov.br` email domain check, the 10-character
  justificativa minimum, `handleSubmit` — all unchanged.
- Cart state handlers: `onUpdateQuantity`, `onUpdateJustificativa`, `onRemoveItem`,
  `onSubmitRequisition`, `onGoToVitrine` — all unchanged (props, not touched here).
- WorkflowManager/AvisosCompras/Relatorios — separate Phase 4 sub-phases.

## Verification

- `npm run lint` / `npm run build` (no test runner, established in Phase 1).
- Real interaction check via `npm run dev`: quantity stepper still respects min/max bounds, remove
  button still removes the correct item, justificativa counter still reflects live typing and its
  amber warning styling still triggers below 10 characters, email validation still shows/clears
  its error message, checkbox still gates form validity, secretaria dropdown still populates from
  `MOCK_SECRETARIAS`, submit button stays disabled until `isFormValid`, and the empty-cart state
  still renders when `cartItems.length === 0`.
- Isolated verification (disposable Playwright harness, same pattern as Phase 3) for the two new
  primitives: `Checkbox` (checked/unchecked toggling, label association) and `Textarea` (value
  typing, counter text rendering, `maxlength` respected if set).
