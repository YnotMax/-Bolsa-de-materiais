# DS-gov Migration — Phase 3: Shared Primitives Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build five shared, typed components on real `@govbr-ds/core` markup (Button, Tag, Input,
Message, Modal) and wire only `Tag` into production (Header's two cart badges) — the rest are
built and verified in isolation, with page-by-page wiring deferred to Phase 4.

**Architecture:** Each component is a small, self-contained file exporting one default component,
following the existing flat `src/components/*.tsx` convention (no subdirectory nesting —
consistent with `Header.tsx`/`Footer.tsx`). `Button`/`Tag`/`Input`/`Message` are pure-CSS wrappers
(`br-*` classes, no JS instantiation needed — verified from the installed package). `Modal` is the
one component with real behavior, hand-built (focus-trap, Escape-to-close, focus restore) rather
than borrowed from `@govbr-ds/core`'s own `BRModal`/`BRScrim`, since those were verified during
design to not actually provide that behavior.

**Tech Stack:** React 19, Vite 6, Tailwind CSS 4, `@govbr-ds/core@3.7.0` (already installed),
`lucide-react`.

## Global Constraints

- No test runner in this repo. Verification is `npm run lint` (`tsc --noEmit`), `npm run build`,
  and either a real interaction check via `npm run dev` (for the one production-wired piece, Tag)
  or a disposable Playwright harness (for the four isolated components) — the same throwaway-script
  pattern every implementer this session has used when no project run-skill exists.
- Only `Tag` gets wired into production this phase (`src/components/Header.tsx`'s two cart
  badges). `Button`, `Input`, `Message`, `Modal` are built and verified standalone — do not wire
  them into any page component. That's Phase 4. [spec: What Gets Wired This Phase / Out of Scope]
- No permanent demo/Storybook route gets added to the app. [spec: Out of Scope]
- `Modal`'s focus-trap/Escape/focus-restore must be hand-built — `@govbr-ds/core`'s own
  `components/scrim/scrim.js` (`BRScrim`, what `modal.js` actually imports) only toggles an
  `active` class on click and carries a demo-wiring side effect on module import; it does not
  provide focus-trap or Escape handling (a different, unrelated class in
  `partial/js/behavior/scrim.js` does, but nothing in this codebase imports that one). Do not
  import anything from `@govbr-ds/core`'s scrim/modal JS files. [spec: Research Basis]
- All five components live in `src/components/` (flat, matching existing convention) — no new
  subdirectory.

---

### Task 1: `Button` component

**Files:**
- Create: `src/components/Button.tsx`

**Interfaces:**
- Produces: `Button` — `export default function Button(props: ButtonProps)`, where
  `ButtonProps = { variant?: 'primary' | 'secondary' | 'tertiary'; size?: 'medium' | 'small';
  circle?: boolean; icon?: ReactNode; children?: ReactNode } & ComponentPropsWithoutRef<'button'>`.
  Consumed directly (no other task depends on its internals, only on this exported type/component
  existing for Phase 4 to import later).

- [ ] **Step 1: Create `src/components/Button.tsx`**

```tsx
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ComponentPropsWithoutRef, ReactNode } from 'react';

interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'medium' | 'small';
  circle?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
}

export default function Button({
  variant = 'tertiary',
  size = 'medium',
  circle = false,
  icon,
  children,
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  const variantClass = variant === 'tertiary' ? '' : variant;
  const sizeClass = size === 'small' ? 'small' : '';
  const classes = ['br-button', variantClass, sizeClass, circle ? 'circle' : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={classes} {...rest}>
      {icon}
      {children}
    </button>
  );
}
```

This maps directly to DS-gov's real button variant classes (verified from
`components/button/examples/button-emphasys.html`: `br-button primary`, `br-button secondary`,
`br-button` with no modifier for tertiary) and the `circle`/`small` modifiers already proven
working in `Header.tsx`. `br-button` needs no JS instantiation (pure CSS).

- [ ] **Step 2: Type-check and build**

Run: `npm run lint` — expected: no errors.
Run: `npm run build` — expected: succeeds (an unused-export warning is fine — nothing consumes
`Button` yet, that's Phase 4).

- [ ] **Step 3: Isolated verification**

No project run-skill and no `chromium-cli` exist in this environment — write a disposable
Playwright script that mounts `Button` alone (e.g. via a throwaway Vite entry, or by temporarily
rendering it inside `App.tsx` behind a condition you revert before committing, or via
`react-dom/client`'s `createRoot` in a standalone HTML file in your scratch directory — pick
whichever is fastest to set up, since this harness is not committed). Render all three variants
(`primary`/`secondary`/`tertiary`), both sizes, and `circle`, and confirm the resulting DOM has the
exact expected class strings (e.g. `variant="primary" size="small"` → class `"br-button primary
small"`) and that clicking fires `onClick`. Delete the disposable harness afterward — nothing from
this step should remain in the repo.

- [ ] **Step 4: Commit**

```bash
git add src/components/Button.tsx
git commit -m "feat: add Button primitive on br-button markup"
```

---

### Task 2: `Tag` component, wired into Header's cart badges

**Files:**
- Create: `src/components/Tag.tsx`
- Modify: `src/components/Header.tsx` (both cart-badge `<span>` elements)

**Interfaces:**
- Produces: `Tag` — `export default function Tag(props: TagProps)`, where
  `TagProps = { variant: 'count'; tone: 'danger' | 'success' | 'warning'; count: number; label:
  string } | { variant: 'status'; tone: 'danger' | 'success' | 'warning'; label: string }`
  (discriminated union). Only the `count` variant is consumed this task (by `Header.tsx`); `status`
  is built now for Phase 4 but has no consumer yet.
- Consumes: nothing from other tasks.

- [ ] **Step 1: Create `src/components/Tag.tsx`**

```tsx
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

type TagProps =
  | { variant: 'count'; tone: 'danger' | 'success' | 'warning'; count: number; label: string }
  | { variant: 'status'; tone: 'danger' | 'success' | 'warning'; label: string };

export default function Tag(props: TagProps) {
  if (props.variant === 'count') {
    return (
      <span className={`br-tag count bg-${props.tone}`} title={props.label}>
        <span aria-hidden="true">{props.count}</span>
      </span>
    );
  }
  return <span className={`br-tag status bg-${props.tone}`} title={props.label} />;
}
```

This matches DS-gov's real reference markup exactly (verified from
`components/tag/examples/{tag-count,tag-status}.html`): the `count` variant's visible number is
`aria-hidden`, with the accessible name coming from `title` — not an `aria-label` on the outer
span, which is a deliberate deviation from `Header.tsx`'s current `aria-label`-based badges (both
are valid accessible-naming techniques; this task switches to `title` specifically to match
DS-gov's own convention, since `Tag` is meant to be the canonical way this app renders count
badges going forward).

- [ ] **Step 2: Wire `Tag` into `Header.tsx`'s two cart badges**

Add the import near the other component-level imports (below the `lucide-react` import):

```tsx
import Tag from './Tag';
```

Replace the desktop nav row's cart badge (inside the `NAV_ITEMS.map` in the `<nav
aria-label="Navegação principal">` block):

```tsx
                    {item.id === 'carrinho' && cartCount > 0 && (
                      <span
                        className="bg-error text-on-error text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ml-1"
                        aria-label={cartLabel}
                      >
                        {cartCount}
                      </span>
                    )}
```

with:

```tsx
                    {item.id === 'carrinho' && cartCount > 0 && (
                      <span className="ml-1">
                        <Tag variant="count" tone="danger" count={cartCount} label={cartLabel} />
                      </span>
                    )}
```

Replace the mobile menu item's cart badge (inside the `NAV_ITEMS.map` in the `<nav
className="menu-body">` block):

```tsx
                    {item.id === 'carrinho' && cartCount > 0 && (
                      <span
                        className="bg-error text-on-error text-[11px] font-bold px-2 py-0.5 rounded-full ml-2"
                        aria-label={cartLabel}
                      >
                        {cartCount}
                      </span>
                    )}
```

with:

```tsx
                    {item.id === 'carrinho' && cartCount > 0 && (
                      <span className="ml-2">
                        <Tag variant="count" tone="danger" count={cartCount} label={cartLabel} />
                      </span>
                    )}
```

The wrapping `<span className="ml-1">`/`<span className="ml-2">` preserves each badge's existing
spacing relative to its label — `Tag` itself stays an unopinionated primitive with no baked-in
margin, matching `Button`'s design (layout spacing is the consumer's concern, not the primitive's).

- [ ] **Step 3: Type-check and build**

Run: `npm run lint` — expected: no errors.
Run: `npm run build` — expected: succeeds.

- [ ] **Step 4: Real interaction verification**

Run: `npm run dev`. Add an item to the cart via the Vitrine tab. Confirm: both the desktop nav
row's Carrinho button and the mobile off-canvas menu's Carrinho item now show the count via the new
`Tag` markup (inspect the DOM: `<span class="br-tag count bg-danger" title="1 item no
carrinho"><span aria-hidden="true">1</span></span>`, nested inside the `ml-1`/`ml-2` wrapper).
Confirm the count updates correctly when adding more items, and that the badge disappears when the
cart is emptied (both render sites already gate on `cartCount > 0`, unchanged by this task).

- [ ] **Step 5: Commit**

```bash
git add src/components/Tag.tsx src/components/Header.tsx
git commit -m "feat: add Tag primitive on br-tag markup, wire into Header's cart badges"
```

---

### Task 3: `Input` component (built standalone, not wired)

**Files:**
- Create: `src/components/Input.tsx`

**Interfaces:**
- Produces: `Input` — `export default function Input(props: InputProps)`, where
  `InputProps = { label: string; id: string; helperText?: string; icon?: ReactNode } &
  ComponentPropsWithoutRef<'input'>`. No consumer this phase — built for Phase 4.

- [ ] **Step 1: Create `src/components/Input.tsx`**

```tsx
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ComponentPropsWithoutRef, ReactNode } from 'react';

interface InputProps extends ComponentPropsWithoutRef<'input'> {
  label: string;
  id: string;
  helperText?: string;
  icon?: ReactNode;
}

export default function Input({ label, id, helperText, icon, className, ...rest }: InputProps) {
  const classes = ['br-input', icon ? 'has-icon' : '', className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <label htmlFor={id}>{label}</label>
      <input id={id} {...rest} />
      {icon}
      {helperText && <p>{helperText}</p>}
    </div>
  );
}
```

Matches DS-gov's real reference markup (verified from
`components/input/examples/input-default.html`): `br-input` wrapping a `<label>`, `<input>`, and
an optional trailing helper `<p>`. `has-icon` modifier added when an `icon` is passed, matching
the pattern already proven in `Header.tsx`'s search input (`br-input has-icon`).

- [ ] **Step 2: Type-check and build**

Run: `npm run lint` — expected: no errors.
Run: `npm run build` — expected: succeeds.

- [ ] **Step 3: Isolated verification**

Same disposable-harness approach as Task 1 Step 3. Render `Input` with and without `helperText`
and `icon`, confirm the resulting DOM structure matches DS-gov's reference (label correctly
associated via `htmlFor`/`id`, `has-icon` class present only when `icon` is passed), and confirm
typing into the input fires `onChange` when passed as a prop. Delete the disposable harness
afterward.

- [ ] **Step 4: Commit**

```bash
git add src/components/Input.tsx
git commit -m "feat: add Input primitive on br-input markup"
```

---

### Task 4: `Message` component (built standalone, not wired)

**Files:**
- Create: `src/components/Message.tsx`

**Interfaces:**
- Produces: `Message` — `export default function Message(props: MessageProps)`, where
  `MessageProps = { variant: 'danger' | 'success' | 'info' | 'warning'; title: string; body:
  string; onDismiss?: () => void }`. No consumer this phase — built for Phase 4 (AvisosCompras's
  alert banner).

- [ ] **Step 1: Create `src/components/Message.tsx`**

```tsx
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { X } from 'lucide-react';

interface MessageProps {
  variant: 'danger' | 'success' | 'info' | 'warning';
  title: string;
  body: string;
  onDismiss?: () => void;
}

export default function Message({ variant, title, body, onDismiss }: MessageProps) {
  return (
    <div className={`br-message ${variant}`}>
      <div className="icon" aria-hidden="true" />
      <div className="content" aria-label={`${title} ${body}`} role="alert">
        <span className="message-title">{title}</span>
        <span className="message-body"> {body}</span>
      </div>
      {onDismiss && (
        <div className="close">
          <button
            className="br-button circle small"
            type="button"
            aria-label="Fechar a mensagem de alerta"
            onClick={onDismiss}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
```

Matches DS-gov's real reference markup (verified from
`components/message/examples/message-padrao.html`): `br-message {variant}` with an `icon` slot, a
`content` block carrying `role="alert"` and an `aria-label` combining title+body (exactly as the
reference does — the visible `message-title`/`message-body` spans are supplementary, the
accessible name comes from the `aria-label`), and an optional dismiss button. The reference uses
Font Awesome icon classes inside `.icon` per variant (`fa-times-circle`, `fa-check-circle`,
`fa-info-circle`, `fa-exclamation-triangle`) — per this migration's icon decision (Phase 2 Decision
2, `lucide-react` only, no Font Awesome), this task leaves `.icon` empty (`aria-hidden` div, no
icon rendered) rather than picking a `lucide-react` icon per variant now; Phase 4's actual
`AvisosCompras` consumer can pass the right icon via a prop if needed at that point — YAGNI for a
component with no consumer yet.

- [ ] **Step 2: Type-check and build**

Run: `npm run lint` — expected: no errors.
Run: `npm run build` — expected: succeeds.

- [ ] **Step 3: Isolated verification**

Same disposable-harness approach as Task 1 Step 3. Render `Message` for each of the four variants,
with and without `onDismiss`, confirm the resulting DOM matches DS-gov's reference structure
(`br-message {variant}`, `role="alert"` present, dismiss button only rendered when `onDismiss` is
passed, and clicking it fires the callback). Delete the disposable harness afterward.

- [ ] **Step 4: Commit**

```bash
git add src/components/Message.tsx
git commit -m "feat: add Message primitive on br-message markup"
```

---

### Task 5: `Modal` component with hand-built focus-trap/Escape/focus-restore (built standalone, not wired)

**Files:**
- Create: `src/components/Modal.tsx`

**Interfaces:**
- Produces: `Modal` — `export default function Modal(props: ModalProps)`, where
  `ModalProps = { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?:
  ReactNode }`. No consumer this phase — built for Phase 4 (Vitrine's product detail,
  AvisosCompras's block alert, WorkflowManager's rejection form all currently hand-roll a modal).

- [ ] **Step 1: Create `src/components/Modal.tsx`**

```tsx
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Modal({ open, onClose, title, children, footer }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const modalEl = modalRef.current;
    const firstFocusable = modalEl?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)[0];
    firstFocusable?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !modalEl) return;
      const items = modalEl.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div className="br-scrim active" onClick={onClose} />
      <div
        ref={modalRef}
        className="br-modal medium"
        aria-modal="true"
        role="dialog"
        aria-labelledby={titleId}
      >
        <div className="br-modal-header">
          <div className="modal-title" id={titleId}>{title}</div>
          <button
            className="br-button close circle"
            type="button"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="br-modal-body">{children}</div>
        {footer && <div className="br-modal-footer justify-content-end">{footer}</div>}
      </div>
    </>
  );
}
```

This is a hand-built implementation per the design spec's correction — no import from
`@govbr-ds/core`'s `modal.js`/`scrim.js`. The static markup structure (`br-modal`, `role="dialog"`,
`aria-modal="true"`, `aria-labelledby`, `br-modal-header`/`br-modal-body`/`br-modal-footer`)
matches the verified reference exactly (`components/modal/examples/modal-alert.html`). The
backdrop is a plain `<div className="br-scrim active">` (CSS-styled by DS-gov, but with our own
`onClick`, not the library's `BRScrim` class). Focus-trap and Escape-to-close reuse the exact
pattern already proven in `Header.tsx`'s off-canvas-menu focus trap (Phase 2 Task 3), plus adds
focus-restore-on-close (store `document.activeElement` on open, restore it in the effect's cleanup
— the same discipline Phase 2 Task 5 applied to the off-canvas menu). `useId()` (not a module-level
counter) generates the `aria-labelledby` target, avoiding the common React pitfall where a
`useRef(expression)` initializer argument re-evaluates on every render even though only its first
value is kept.

- [ ] **Step 2: Type-check and build**

Run: `npm run lint` — expected: no errors.
Run: `npm run build` — expected: succeeds.

- [ ] **Step 3: Isolated verification**

Same disposable-harness approach as Task 1 Step 3, but this component needs real interaction
verification (not just DOM-shape checks), since its whole value is the hand-built behavior:
- Render `Modal` with `open={true}`, some `children`, and a `footer` with a button. Confirm the
  DOM has `role="dialog"` / `aria-modal="true"` / `aria-labelledby` pointing at a real element ID
  containing the title text.
- Confirm focus moves to the first focusable element inside the modal when it opens.
- Confirm Tab from the last focusable element wraps to the first, and Shift+Tab from the first
  wraps to the last (the focus-trap).
- Confirm pressing Escape calls `onClose`.
- Confirm clicking the backdrop (`.br-scrim`) calls `onClose`.
- Focus a button outside the modal before opening it, open the modal, close it (via Escape or the
  close button), and confirm focus returns to that exact original button (the focus-restore).
- Delete the disposable harness afterward.

- [ ] **Step 4: Commit**

```bash
git add src/components/Modal.tsx
git commit -m "feat: add Modal primitive with hand-built focus-trap, Escape, and focus-restore"
```
