# DS-gov Migration — Phase 3: Shared Primitives — Design Spec

Date: 2026-07-18
Branch: `feature/gov-ds-migration`
Parent spec: `docs/superpowers/specs/2026-07-17-govbr-ds-migration-design.md` (Phase 3 — Shared primitives)

## Goal

Build five shared, typed components on real gov.br Design System (`@govbr-ds/core@3.7.0`) markup —
Button, Tag, Input, Message, Modal — available once to all 5 page components
(Vitrine/Carrinho/AvisosCompras/Relatorios/WorkflowManager), instead of each page re-implementing
Tailwind button/badge/alert classes independently. Only the cart badge gets wired into production
this phase (via the new `Tag`); full page-by-page migration of the rest is Phase 4.

## Research Basis

Real markup and module structure read directly from the installed package
(`node_modules/@govbr-ds/core@3.7.0/dist/components/{button,tag,input,message,modal,scrim}/`), not
guessed:

- `br-button {primary|secondary|""} {small?} {circle?}` — pure CSS, no JS instantiation (verified:
  `components/button/examples/button-emphasys.html`).
- `br-tag count bg-{tone}` (numeric badges, e.g. cart count) and `br-tag status bg-{tone}`
  (colored-dot state indicators) — both pure CSS (verified:
  `components/tag/examples/{tag-count,tag-status}.html`).
- `br-input` (label + input + optional helper `<p>`, `has-icon` modifier) — pure CSS (verified:
  `components/input/examples/input-default.html`).
- `br-message {danger|success|info|warning}` with `role="alert"` already in the reference markup —
  pure CSS, optional dismiss button (verified: `components/message/examples/message-padrao.html`).
- `br-modal` with `role="dialog"` / `aria-modal="true"` / `aria-labelledby` **already present
  statically in the reference markup** (verified: `components/modal/examples/modal-alert.html`) —
  this part is a real, free win.

**Correction made during brainstorming, before this spec was written:** an earlier claim that
`BRModal`'s scrim behavior includes a built-in focus-trap and Escape-to-close was wrong — that
functionality exists in a differently-named, unrelated class (`partial/js/behavior/scrim.js`'s
`Scrim`), not in what `modal.js` actually imports and uses
(`components/scrim/scrim.js`'s `BRScrim`, which only toggles an `active` class on click and carries
a small demo-wiring side effect on module import, similar to what Phase 1 found and removed from
`core.min.js`). **Modal's focus-trap and Escape-to-close must be hand-built** — using the same
pattern already proven in Phase 2 Task 3 for the off-canvas menu (a `keydown`-scoped effect
constraining Tab within the open modal, plus an Escape handler) — not assumed to come free from
the library. The static ARIA markup (`role="dialog"` etc.) is still a real, verified win.

## Component APIs

### `Button` (`src/components/Button.tsx`)

```tsx
type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'tertiary'; // 'tertiary' = no modifier class
  size?: 'medium' | 'small';
  circle?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
} & ComponentPropsWithoutRef<'button'>;
```

Renders `<button className={\`br-button ${variant-class} ${size-class} ${circle ? 'circle' : ''}\`}>`.
No JS instantiation — `br-button` is pure CSS. Forwards all native button props (`onClick`,
`type`, `aria-*`, `disabled`, etc.) via spread, so it's a drop-in replacement for the ad hoc
`<button className="...">` patterns currently in every page component.

### `Tag` (`src/components/Tag.tsx`)

```tsx
type TagProps =
  | { variant: 'count'; tone: 'danger' | 'success' | 'warning'; count: number; label: string }
  | { variant: 'status'; tone: 'danger' | 'success' | 'warning'; label: string };
```

`count` variant renders `<span className="br-tag count bg-{tone}" title={label}><span aria-hidden="true">{count}</span></span>`
(matches DS-gov's reference exactly — the visible number is `aria-hidden`, the accessible name
comes from `title`). `status` variant renders `<span className="br-tag status bg-{tone}" title={label} />`
(a colored dot with no visible text, accessible name from `title`) — built now for Phase 4's
conservation-state badges (the app's existing `--color-state-*` tokens map onto this), not wired to
any page in this phase.

### `Input` (`src/components/Input.tsx`)

```tsx
type InputProps = {
  label: string;
  id: string;
  helperText?: string;
  icon?: ReactNode;
} & ComponentPropsWithoutRef<'input'>;
```

Renders `<div className="br-input {icon ? 'has-icon' : ''}"><label htmlFor={id}>{label}</label><input id={id} {...rest} />{icon}{helperText && <p>{helperText}</p>}</div>`.
Built for Phase 4's form fields (Carrinho quantity/justification, AvisosCompras/WorkflowManager
forms) — not wired to any page in this phase.

### `Message` (`src/components/Message.tsx`)

```tsx
type MessageProps = {
  variant: 'danger' | 'success' | 'info' | 'warning';
  title: string;
  body: string;
  onDismiss?: () => void;
};
```

Renders DS-gov's `br-message {variant}` structure exactly (icon + `content` with `role="alert"` +
optional `close` button when `onDismiss` is provided) per the verified reference markup. Built for
AvisosCompras's alert banner — not wired to any page in this phase.

### `Modal` (`src/components/Modal.tsx`)

```tsx
type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
};
```

Renders `br-modal` markup with real `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
(pointing at a generated title id) — matching the verified reference structure
(`br-modal-header`/`br-modal-body`/`br-modal-footer`). Hand-built behavior (own `useEffect`s, not
from the DS-gov library, per the correction above):
- Focus-trap: Tab-cycling confined to the modal while `open`, reusing the exact pattern from
  Phase 2 Task 3's off-canvas-menu focus trap (a `document`-level `keydown` listener checking
  `Tab`, querying focusable descendants of the modal root).
- Escape-to-close: a `keydown` handler calling `onClose()` on `Escape`.
- Focus management: store `document.activeElement` on open, focus the modal's first focusable
  element on open, restore focus to the stored element on close — the same restore-on-close
  discipline already applied to the off-canvas menu in Phase 2 Task 5.
- A `br-scrim`-equivalent backdrop (a plain `<div>` with a click handler calling `onClose()`) —
  not `@govbr-ds/core`'s own `BRScrim`/`components/scrim/scrim.js`, since that class carries the
  demo-wiring side effect noted above and doesn't provide anything this hand-built version needs.

## What Gets Wired This Phase

Only `Tag`. In `src/components/Header.tsx`, both existing cart-badge `<span>` elements (desktop nav
row and mobile menu item) are replaced with `<Tag variant="count" tone="danger" count={cartCount} label={cartLabel} />`.
This is real, low-risk production usage of one primitive, verified the same way every Phase 1/2
task was (real interaction check via the dev server), without touching any of the 5 unmigrated
page components.

`Button`, `Input`, `Message`, and `Modal` are built and verified in isolation (a disposable
Playwright harness rendering each component directly, the same throwaway-script pattern every
implementer this session has used when no project run-skill exists) — not wired into any page,
since that's Phase 4's job.

## Out of Scope

- Any page component's actual markup migration (Vitrine's product cards, Carrinho's cart items,
  AvisosCompras's alert banner content, WorkflowManager's modals, Relatorios's tables) — Phase 4.
- Business logic changes.
- A permanent demo/Storybook route in the app — verification is via disposable scripts, not a
  shipped demo page.

## Verification

- `npm run lint` / `npm run build` (no test runner in this repo, established in Phase 1).
- `Tag`'s cart-badge wiring: real interaction check via `npm run dev` (both desktop and mobile
  badge render correctly, count updates on add-to-cart).
- `Button`/`Input`/`Message`/`Modal`: disposable Playwright harness per component, verifying
  correct markup/classes render, and for `Modal` specifically — the focus-trap actually traps Tab,
  Escape actually closes, and focus is restored to the triggering element on close.
