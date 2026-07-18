# DS-gov Migration — Phase 4b: Carrinho Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract the conservation-state color/label logic duplicated between `Vitrine.tsx` and
`Carrinho.tsx` into one shared function, add `Checkbox`/`Textarea` primitives, and migrate
`Carrinho.tsx` onto DS-gov markup/primitives — without touching form validation or cart-state
business logic.

**Architecture:** One shared utility function in `src/data.ts` (consumed by both page components),
two new pure-CSS primitives (no JS instantiation needed — verified during design that neither
`br-checkbox`'s nor `br-textarea`'s DS-gov JS classes apply to this app's usage), then Carrinho's
markup migrated in two themed passes (buttons, then form fields).

**Tech Stack:** React 19, Vite 6, Tailwind CSS 4, `@govbr-ds/core@3.7.0`, `lucide-react`, the Phase
3/4a primitives (`Button`, `Input`, `Message`) plus this phase's new `Checkbox`/`Textarea`.

## Global Constraints

- No test runner. Verification is `npm run lint` (`tsc --noEmit`), `npm run build`, real
  interaction checks via `npm run dev`, and disposable Playwright harnesses for the two new
  standalone primitives — established pattern since Phase 1.
- Form validation logic (`isFormValid`, email domain check, 10-character justificativa minimum,
  `handleSubmit`) and cart-state handlers (`onUpdateQuantity`, `onUpdateJustificativa`,
  `onRemoveItem`, `onSubmitRequisition`, `onGoToVitrine`) are unchanged. [spec: Out of Scope]
- Secretaria/Setor dropdown stays native `<select>`, re-tokened only — matches the Phase 4a
  decision against adopting DS-gov's heavier `br-select` widget for short, non-searchable lists.
- **Correction found while writing this plan**: `Vitrine.tsx`'s conservation-state labels are the
  long form ("Novo (Sem uso)", "Sucata (Inservível)") while `Carrinho.tsx`'s are the short form
  ("Novo", "Sucata") — genuinely different label sets for the same states, not just duplicated
  code. The shared utility unifies on the **short form** (Carrinho's style) as canonical, since a
  single source of truth requires picking one, and short labels fit both a catalog badge and a
  compact cart-item tag; `Vitrine.tsx`'s catalog card labels become shorter as a result (a small,
  intentional visual change in service of actual consistency, not an accident).
- `Vitrine.tsx`'s `desc` field (already confirmed dead/unused in Phase 4a's Task 1 review) is
  dropped entirely in the shared utility — nothing consumes it.

---

### Task 1: Shared `getEstadoInfo` utility, consumed by both Vitrine and Carrinho

**Files:**
- Modify: `src/data.ts` (add the new function)
- Modify: `src/components/Vitrine.tsx` (remove local `getEstadoBadge`, use the shared function)
- Modify: `src/components/Carrinho.tsx` (remove local `getEstadoTagClass`/`getEstadoLabel`, use
  the shared function)

**Interfaces:**
- Produces: `getEstadoInfo(estado: EstadoConservacao): { tone: string; label: string }`, exported
  from `src/data.ts`. Consumed by both page components from here on.

- [ ] **Step 1: Add `getEstadoInfo` to `src/data.ts`**

Add the `EstadoConservacao` import (alongside the existing `Produto` import) and the new function
at the end of the file, after the existing `fuzzySearch` function:

```ts
import { Produto, EstadoConservacao } from './types';
```

```ts
// State of conservation colors (DS-gov utility classes) and short labels, based on
// Decreto nº 45.242/2009 — the single source of truth consumed by every page that
// renders a conservation-state badge (Vitrine, Carrinho, and future Phase 4 pages).
export function getEstadoInfo(estado: EstadoConservacao): { tone: string; label: string } {
  switch (estado) {
    case 'NOVO':
      return { tone: 'bg-success text-white', label: 'Novo' };
    case 'BOM':
      return { tone: 'bg-success text-white', label: 'Bom Estado' };
    case 'REGULAR':
      return { tone: 'bg-warning text-black font-semibold', label: 'Regular' };
    case 'PESSIMO':
      return { tone: 'bg-danger text-white', label: 'Péssimo' };
    case 'SUCATA':
      return { tone: 'bg-gray-40 text-white', label: 'Sucata' };
    default:
      return { tone: 'bg-gray-40 text-white', label: estado };
  }
}
```

- [ ] **Step 2: Update `Vitrine.tsx` to use the shared function**

Add the import (alongside the existing `data` import):

```tsx
import { MOCK_PRODUTOS, MOCK_CATEGORIAS, MOCK_SECRETARIAS, fuzzySearch, getEstadoInfo } from '../data';
```

Remove the entire local `getEstadoBadge` function (currently lines 42-78, the `// State of
conservation colors...` comment through its closing `};`).

Find the card's usage:

```tsx
                const badge = getEstadoBadge(produto.estadoConservacao);
```

Replace with:

```tsx
                const badge = getEstadoInfo(produto.estadoConservacao);
```

Find the modal's two usages:

```tsx
              <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold shadow-md ${getEstadoBadge(detailProduct.estadoConservacao).tone}`}>
                {getEstadoBadge(detailProduct.estadoConservacao).label}
              </span>
```

Replace with:

```tsx
              <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold shadow-md ${getEstadoInfo(detailProduct.estadoConservacao).tone}`}>
                {getEstadoInfo(detailProduct.estadoConservacao).label}
              </span>
```

(`badge.tone`/`badge.label` field names are unchanged, since the shared function returns the same
shape `Vitrine.tsx` already used post-Phase-4a — only the function name and import location
change, plus the labels get shorter per the correction above.)

- [ ] **Step 3: Update `Carrinho.tsx` to use the shared function**

Add the import (alongside the existing `data` import):

```tsx
import { MOCK_SECRETARIAS, getEstadoInfo } from '../data';
```

Remove both local functions entirely (currently lines 78-99, the `// State of conservation tags...`
comment through `getEstadoLabel`'s closing `};`):

```tsx
  // State of conservation tags with gov.br colors
  const getEstadoTagClass = (estado: string) => {
    switch (estado) {
      case 'NOVO': return 'bg-state-novo text-white';
      case 'BOM': return 'bg-state-bom text-white';
      case 'REGULAR': return 'bg-state-regular text-black font-semibold';
      case 'PESSIMO': return 'bg-state-pessimo text-white';
      case 'SUCATA': return 'bg-state-sucata text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'NOVO': return 'Novo';
      case 'BOM': return 'Bom Estado';
      case 'REGULAR': return 'Regular';
      case 'PESSIMO': return 'Péssimo';
      case 'SUCATA': return 'Sucata';
      default: return estado;
    }
  };
```

Find the cart item's tag usage:

```tsx
                    <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold shadow ${getEstadoTagClass(item.produto.estadoConservacao)}`}>
                      {getEstadoLabel(item.produto.estadoConservacao)}
                    </span>
```

Replace with:

```tsx
                    <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold shadow ${getEstadoInfo(item.produto.estadoConservacao).tone}`}>
                      {getEstadoInfo(item.produto.estadoConservacao).label}
                    </span>
```

- [ ] **Step 4: Type-check, build, visual check**

Run: `npm run lint` — expected: no errors.
Run: `npm run build` — expected: succeeds.
Run: `npm run dev`. Confirm Vitrine's catalog cards and detail modal now show the shorter
conservation labels ("Novo" instead of "Novo (Sem uso)", etc.) with unchanged colors. Confirm
Carrinho's cart item tags are unaffected in appearance (same short labels/colors as before, since
Carrinho's labels were already short-form).

- [ ] **Step 5: Commit**

```bash
git add src/data.ts src/components/Vitrine.tsx src/components/Carrinho.tsx
git commit -m "refactor: extract shared getEstadoInfo utility, dedupe Vitrine/Carrinho conservation-state logic"
```

---

### Task 2: `Checkbox` primitive

**Files:**
- Create: `src/components/Checkbox.tsx`

**Interfaces:**
- Produces: `Checkbox` — `export default function Checkbox(props: CheckboxProps)`, where
  `CheckboxProps = { label: string; id: string } & ComponentPropsWithoutRef<'input'>`. Consumed by
  Task 5.

- [ ] **Step 1: Create `src/components/Checkbox.tsx`**

```tsx
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ComponentPropsWithoutRef } from 'react';

interface CheckboxProps extends ComponentPropsWithoutRef<'input'> {
  label: string;
  id: string;
}

export default function Checkbox({ label, id, ...rest }: CheckboxProps) {
  return (
    <div className="br-checkbox">
      <input id={id} type="checkbox" {...rest} />
      <label htmlFor={id}>{label}</label>
    </div>
  );
}
```

Matches DS-gov's real reference markup exactly (verified from
`components/checkbox/examples/checkbox-default.html`): `br-checkbox` wrapping a plain
`<input type="checkbox">` and `<label>`, pure CSS. `checkbox.js`'s `BRCheckbox` class only wires up
parent/child "checkgroup" behavior via `data-parent` attributes — not relevant here, so no JS
instantiation for this primitive.

- [ ] **Step 2: Type-check and build**

Run: `npm run lint` — expected: no errors.
Run: `npm run build` — expected: succeeds.

- [ ] **Step 3: Isolated verification**

Disposable Playwright harness (same pattern as Phase 3): render `Checkbox` with `checked`/
`onChange` props, confirm clicking the checkbox or its label toggles the checked state, confirm
`label`/`id` are correctly associated (`<label for>` matches `<input id>`). Delete the harness
afterward.

- [ ] **Step 4: Commit**

```bash
git add src/components/Checkbox.tsx
git commit -m "feat: add Checkbox primitive on br-checkbox markup"
```

---

### Task 3: `Textarea` primitive

**Files:**
- Create: `src/components/Textarea.tsx`

**Interfaces:**
- Produces: `Textarea` — `export default function Textarea(props: TextareaProps)`, where
  `TextareaProps = { label: string; id: string; counterText?: string } &
  ComponentPropsWithoutRef<'textarea'>`. Consumed by Task 5.

- [ ] **Step 1: Create `src/components/Textarea.tsx`**

```tsx
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ComponentPropsWithoutRef } from 'react';

interface TextareaProps extends ComponentPropsWithoutRef<'textarea'> {
  label: string;
  id: string;
  counterText?: string;
}

export default function Textarea({ label, id, counterText, ...rest }: TextareaProps) {
  return (
    <div className="br-textarea">
      <label htmlFor={id}>{label}</label>
      <textarea id={id} {...rest} />
      {counterText && (
        <div className="text-base mt-1">
          <span className="current" aria-live="polite" role="status">{counterText}</span>
        </div>
      )}
    </div>
  );
}
```

Matches DS-gov's real reference markup (verified from
`components/textarea/examples/textarea-counter.html`): `br-textarea` wrapping a `<label>` and
`<textarea>`, with an optional counter row. `textarea.js`'s `BRTextArea` class drives its own
counter text via keyup/focus listeners — not used here, since the consumer (Carrinho, Task 5)
already computes its own counter text in React and passes it via `counterText`, matching the
reference markup's `<span class="current" aria-live="polite" role="status">` structure without
needing DS-gov's imperative JS.

- [ ] **Step 2: Type-check and build**

Run: `npm run lint` — expected: no errors.
Run: `npm run build` — expected: succeeds.

- [ ] **Step 3: Isolated verification**

Disposable Playwright harness: render `Textarea` with `value`/`onChange`/`counterText` props,
confirm typing fires `onChange`, confirm `counterText` renders in the counter slot and updates
when the prop changes, confirm the counter slot doesn't render at all when `counterText` is
omitted. Delete the harness afterward.

- [ ] **Step 4: Commit**

```bash
git add src/components/Textarea.tsx
git commit -m "feat: add Textarea primitive on br-textarea markup"
```

---

### Task 4: Migrate Carrinho's buttons to the `Button` primitive

**Files:**
- Modify: `src/components/Carrinho.tsx` (imports; empty-state button, quantity stepper, remove
  button, submit button, "Continuar Procurando" button)

**Interfaces:**
- Consumes: `Button` (`src/components/Button.tsx`, already built).

- [ ] **Step 1: Add imports**

Add below the existing imports:

```tsx
import Button from './Button';
```

Add `Minus`, `Plus` to the existing `lucide-react` import line (replacing the quantity stepper's
literal `-`/`+` text glyphs with real icons, matching the icon-button convention already
established for circle buttons elsewhere in this migration):

```tsx
import { ShoppingCart, Trash2, ShieldAlert, ArrowLeft, Send, CheckCircle2, UserCheck, AlertTriangle, Minus, Plus } from 'lucide-react';
```

- [ ] **Step 2: Empty-cart "Navegar no Catálogo" button**

Find:

```tsx
          <button
            onClick={onGoToVitrine}
            className="px-6 py-3 bg-primary text-white font-bold text-sm rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2 shadow"
          >
            <ArrowLeft className="h-4 w-4" />
            Navegar no Catálogo
          </button>
```

Replace with:

```tsx
          <Button variant="primary" onClick={onGoToVitrine} icon={<ArrowLeft className="h-4 w-4" aria-hidden="true" />}>
            Navegar no Catálogo
          </Button>
```

- [ ] **Step 3: Remove-item button**

Find:

```tsx
                      <button
                        onClick={() => onRemoveItem(item.produto.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors flex-shrink-0"
                        title="Remover item"
                        id={`btn-remove-${item.produto.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
```

Replace with:

```tsx
                      <Button
                        variant="tertiary"
                        circle
                        onClick={() => onRemoveItem(item.produto.id)}
                        aria-label="Remover item"
                        id={`btn-remove-${item.produto.id}`}
                        icon={<Trash2 className="h-4 w-4" aria-hidden="true" />}
                      />
```

(The visible `title="Remover item"` tooltip becomes `aria-label` — a real accessible name,
stronger than a `title`-only tooltip that mouse-only users would see but screen-reader/keyboard
users might not depending on the AT.)

- [ ] **Step 4: Quantity stepper buttons**

Find:

```tsx
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.produto.id, -1)}
                          className="px-2.5 py-1 text-gray-600 hover:bg-gray-100 transition-colors font-bold"
                          disabled={item.quantidadeSolicitada <= 1}
                        >
                          -
                        </button>
                        <span className="w-10 text-center text-sm font-bold text-primary font-mono">
                          {item.quantidadeSolicitada}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.produto.id, 1)}
                          className="px-2.5 py-1 text-gray-600 hover:bg-gray-100 transition-colors font-bold"
                          disabled={item.quantidadeSolicitada >= item.produto.quantidade}
                        >
                          +
                        </button>
```

Replace with:

```tsx
                        <Button
                          variant="tertiary"
                          size="small"
                          circle
                          type="button"
                          onClick={() => onUpdateQuantity(item.produto.id, -1)}
                          disabled={item.quantidadeSolicitada <= 1}
                          aria-label="Diminuir quantidade"
                          icon={<Minus className="h-3.5 w-3.5" aria-hidden="true" />}
                        />
                        <span className="w-10 text-center text-sm font-bold text-primary font-mono">
                          {item.quantidadeSolicitada}
                        </span>
                        <Button
                          variant="tertiary"
                          size="small"
                          circle
                          type="button"
                          onClick={() => onUpdateQuantity(item.produto.id, 1)}
                          disabled={item.quantidadeSolicitada >= item.produto.quantidade}
                          aria-label="Aumentar quantidade"
                          icon={<Plus className="h-3.5 w-3.5" aria-hidden="true" />}
                        />
```

- [ ] **Step 5: Submit and "Continuar Procurando" buttons**

Find:

```tsx
                <button
                  type="submit"
                  disabled={!isFormValid}
                  className={`w-full py-4 px-6 rounded-lg font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
                    isFormValid
                      ? 'bg-secondary hover:bg-secondary/90 text-white hover:shadow-lg'
                      : 'bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed'
                  }`}
                  id="btn-submit-requisition"
                >
                  <Send className="h-4 w-4" />
                  Submeter Requisição de Remanejamento
                </button>

                <button
                  type="button"
                  onClick={onGoToVitrine}
                  className="w-full py-3 px-6 bg-white border border-gray-200 text-primary hover:bg-gray-50 font-bold text-xs rounded-lg transition-colors"
                >
                  Continuar Procurando Bens
                </button>
```

Replace with:

```tsx
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!isFormValid}
                  id="btn-submit-requisition"
                  className="w-full justify-center"
                  icon={<Send className="h-4 w-4" aria-hidden="true" />}
                >
                  Submeter Requisição de Remanejamento
                </Button>

                <Button
                  type="button"
                  variant="tertiary"
                  onClick={onGoToVitrine}
                  className="w-full justify-center"
                >
                  Continuar Procurando Bens
                </Button>
```

(`Button`'s disabled-state appearance now comes from DS-gov's own `br-button:disabled` CSS instead
of the previous hand-rolled gray palette — adopting the design system's actual disabled treatment
rather than replicating a custom one.)

- [ ] **Step 6: Type-check, build, real interaction check**

Run: `npm run lint` — expected: no errors.
Run: `npm run build` — expected: succeeds.
Run: `npm run dev`. Confirm: with an empty cart, "Navegar no Catálogo" still navigates to Vitrine;
add items via Vitrine, confirm the remove button still removes the correct item; quantity
steppers still respect min (1) and max (`produto.quantidade`) bounds and disable correctly at
those limits; submit button stays disabled until the form is valid and enables once all
requirements are met; "Continuar Procurando Bens" still navigates to Vitrine.

- [ ] **Step 7: Commit**

```bash
git add src/components/Carrinho.tsx
git commit -m "feat: migrate Carrinho's buttons to the Button primitive"
```

---

### Task 5: Migrate Carrinho's form fields to `Input`/`Checkbox`/`Textarea`/`Message`

**Files:**
- Modify: `src/components/Carrinho.tsx` (imports; the card's `br-card` wrapper; Nome/Matrícula/
  Email inputs; the secretaria select's re-tokening; the termos checkbox; the justificativa
  textarea; the validation warning banner)

**Interfaces:**
- Consumes: `Input` (already built), `Checkbox` (Task 2), `Textarea` (Task 3), `Message` (already
  built, Phase 3 — first production consumer here).
- Modifies: `Input`'s props, adding `state?: 'success' | 'danger' | 'warning' | 'info'` (see Step 0
  below) — this is an additive change; `Vitrine.tsx`'s existing `Input` usage (the search box)
  passes no `state` prop and is unaffected.

- [ ] **Step 0: Extend `Input` with a `state` prop for real DS-gov error styling**

**Correction found while writing this plan**: the original idea of passing a raw Tailwind
`className` (e.g. `border-red-300`) to `Input` for the email field's error state does not work —
verified by reading `Input.tsx`'s actual implementation: `className` is applied to the *wrapper*
`<div>`, not the inner `<input>` element, so a border color passed that way would never visually
appear on the visible input box. Separately, verified against
`node_modules/@govbr-ds/core/dist/components/input/input.css`, DS-gov already has a real,
purpose-built mechanism for exactly this: `.br-input.danger input { border-color: var(--danger);
border-width: 2px; }` (and matching `.success`/`.warning`/`.info` variants) — a state modifier
class on the wrapper that DS-gov's own CSS correctly threads down to the inner `<input>`. Use that
instead of inventing a workaround.

In `src/components/Input.tsx`, find:

```tsx
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

Replace with:

```tsx
interface InputProps extends ComponentPropsWithoutRef<'input'> {
  label: string;
  id: string;
  helperText?: string;
  icon?: ReactNode;
  state?: 'success' | 'danger' | 'warning' | 'info';
}

export default function Input({ label, id, helperText, icon, state, className, ...rest }: InputProps) {
  const classes = ['br-input', icon ? 'has-icon' : '', state ?? '', className].filter(Boolean).join(' ');

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

Run `npm run lint` and `npm run build` after this step specifically — expected: no errors, and
confirm (via `npm run dev` on the Vitrine catalog page, which already consumes `Input` for its
search box) that the search box is completely unaffected, since it passes no `state` prop.

- [ ] **Step 1: Add imports**

Add below the imports from Task 4:

```tsx
import Input from './Input';
import Checkbox from './Checkbox';
import Textarea from './Textarea';
import Message from './Message';
```

- [ ] **Step 2: Add `br-card` to the cart item's outer `<article>`**

Find:

```tsx
                <article
                  key={item.produto.id}
                  id={`cart-item-${item.produto.id}`}
                  className="bg-white border border-gray-200 rounded-xl p-4 md:p-5 shadow-sm hover:border-emerald-500 transition-all flex flex-col sm:flex-row gap-5"
                >
```

Replace with:

```tsx
                <article
                  key={item.produto.id}
                  id={`cart-item-${item.produto.id}`}
                  className="br-card hover bg-white border border-gray-200 rounded-xl p-4 md:p-5 shadow-sm hover:border-emerald-500 transition-all flex flex-col sm:flex-row gap-5"
                >
```

- [ ] **Step 3: Justificativa textarea**

Find:

```tsx
                    <div className="flex flex-col gap-1.5 mt-1">
                      <label 
                        htmlFor={`justificativa-${item.produto.id}`}
                        className="text-xs font-bold text-gray-700 flex items-center justify-between"
                      >
                        <span>Justificativa de Uso Individual <span className="text-red-500">*</span></span>
                        <span className="text-[10px] text-gray-400 font-normal">
                          Mínimo 10 caracteres (restam: {Math.max(0, 10 - item.justificativa.length)})
                        </span>
                      </label>
                      <textarea
                        id={`justificativa-${item.produto.id}`}
                        placeholder="Descreva a finalidade pública desse material. Ex: Substituição de cadeiras quebradas no setor de atendimento ao cidadão."
                        value={item.justificativa}
                        onChange={(e) => onUpdateJustificativa(item.produto.id, e.target.value)}
                        className={`w-full text-xs p-3 bg-gray-50/50 border rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-primary transition-all resize-none h-16 ${
                          item.justificativa.trim().length >= 10 ? 'border-gray-200' : 'border-amber-300 focus:ring-amber-500'
                        }`}
                        required
                      />
                    </div>
```

Replace with:

```tsx
                    <div className="mt-1">
                      <Textarea
                        label="Justificativa de Uso Individual *"
                        id={`justificativa-${item.produto.id}`}
                        placeholder="Descreva a finalidade pública desse material. Ex: Substituição de cadeiras quebradas no setor de atendimento ao cidadão."
                        value={item.justificativa}
                        onChange={(e) => onUpdateJustificativa(item.produto.id, e.target.value)}
                        counterText={`Mínimo 10 caracteres (restam: ${Math.max(0, 10 - item.justificativa.length)})`}
                        className={`resize-none h-16 ${
                          item.justificativa.trim().length >= 10 ? '' : 'border-amber-300 focus:ring-amber-500'
                        }`}
                        required
                      />
                    </div>
```

(The visible required-asterisk moves from a separate `<span>` into the label string itself, since
`Textarea`'s `label` prop is a single string, not JSX — a small, deliberate simplification, not a
content loss: the `*` is still visibly present in the label text.)

- [ ] **Step 4: Nome Completo, Matrícula Funcional, E-mail Institucional fields**

Find:

```tsx
              {/* Campo: Nome Completo */}
              <div className="flex flex-col gap-1">
                <label htmlFor="nome-completo" className="text-xs font-bold text-gray-700">
                  Nome Completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="nome-completo"
                  placeholder="Nome do Servidor Requisitante"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full text-sm p-3 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              {/* Campo: Matrícula Funcional */}
              <div className="flex flex-col gap-1">
                <label htmlFor="matricula-funcional" className="text-xs font-bold text-gray-700">
                  Matrícula Funcional <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="matricula-funcional"
                  placeholder="Ex: 129481-2"
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                  className="w-full text-sm p-3 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
```

Replace with:

```tsx
              {/* Campo: Nome Completo */}
              <Input
                label="Nome Completo *"
                id="nome-completo"
                type="text"
                placeholder="Nome do Servidor Requisitante"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />

              {/* Campo: Matrícula Funcional */}
              <Input
                label="Matrícula Funcional *"
                id="matricula-funcional"
                type="text"
                placeholder="Ex: 129481-2"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                required
              />
```

Find:

```tsx
              {/* Campo: Email Institucional */}
              <div className="flex flex-col gap-1">
                <label htmlFor="email-institucional" className="text-xs font-bold text-gray-700">
                  E-mail Institucional <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email-institucional"
                  placeholder="exemplo@pmf.sc.gov.br"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className={`w-full text-sm p-3 border rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary ${
                    emailError ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'
                  }`}
                  required
                />
                {emailError ? (
                  <p className="text-[10px] text-red-600 font-medium mt-0.5">{emailError}</p>
                ) : (
                  <p className="text-[10px] text-gray-500 mt-0.5">Apenas domínios @pmf.sc.gov.br são aceitos.</p>
                )}
              </div>
```

Replace with:

```tsx
              {/* Campo: Email Institucional */}
              <Input
                label="E-mail Institucional *"
                id="email-institucional"
                type="email"
                placeholder="exemplo@pmf.sc.gov.br"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                state={emailError ? 'danger' : undefined}
                helperText={emailError || 'Apenas domínios @pmf.sc.gov.br são aceitos.'}
                required
              />
```

(`Input`'s built-in `helperText` slot replaces the two separately-conditional `<p>` tags — one
slot, one string, switching between the error and the neutral hint. The red border comes from the
real `state="danger"` prop added in Step 0 — DS-gov's own `.br-input.danger input` CSS rule, not a
Tailwind workaround — so the visual error feedback is preserved, just through the correct
mechanism. `helperText`'s text color itself stays the same neutral gray in both states, same as
`Input`'s existing behavior for the Vitrine search box — only the border changes with `state`.)

- [ ] **Step 5: Re-token the secretaria select**

Find:

```tsx
                <select
                  id="secretaria-requisitante"
                  value={secretaria}
                  onChange={(e) => setSecretaria(e.target.value)}
                  className="w-full text-sm p-3 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                >
```

Replace with:

```tsx
                <select
                  id="secretaria-requisitante"
                  value={secretaria}
                  onChange={(e) => setSecretaria(e.target.value)}
                  className="w-full text-sm p-3 border border-gray-200 rounded-lg bg-background focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                >
```

(Matches the Phase 4a Task 1 pattern: `bg-gray-50` → `bg-background`, using the existing
`--color-background` token.)

- [ ] **Step 6: Termos checkbox**

Find:

```tsx
              {/* Checkbox Termo de Compromisso */}
              <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="checkbox-termos"
                  checked={declara}
                  onChange={(e) => setDeclara(e.target.checked)}
                  className="mt-0.5 h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  required
                />
                <label htmlFor="checkbox-termos" className="text-xs text-gray-600 cursor-pointer select-none leading-relaxed">
                  Declaro que os bens ociosos ora requisitados destinam-se exclusivamente para uso no serviço público e que há dotação física para os acomodar.
                </label>
              </div>
```

Replace with:

```tsx
              {/* Checkbox Termo de Compromisso */}
              <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Checkbox
                  id="checkbox-termos"
                  checked={declara}
                  onChange={(e) => setDeclara(e.target.checked)}
                  required
                  label="Declaro que os bens ociosos ora requisitados destinam-se exclusivamente para uso no serviço público e que há dotação física para os acomodar."
                />
              </div>
```

- [ ] **Step 7: Validation warning banner → `Message`**

Find:

```tsx
              {/* Warning if validation incomplete */}
              {showValidationWarning && !isFormValid && (
                <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-3 text-xs flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Solicitação Incompleta</p>
                    <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                      Por favor, verifique se preencheu todos os dados do requisitante, se o e-mail possui o final oficial e se cada justificativa de uso possui no mínimo 10 caracteres.
                    </p>
                  </div>
                </div>
              )}
```

Replace with:

```tsx
              {/* Warning if validation incomplete */}
              {showValidationWarning && !isFormValid && (
                <Message
                  variant="warning"
                  title="Solicitação Incompleta."
                  body="Por favor, verifique se preencheu todos os dados do requisitante, se o e-mail possui o final oficial e se cada justificativa de uso possui no mínimo 10 caracteres."
                />
              )}
```

(No `onDismiss` passed — this warning should reappear on the next failed submit attempt, matching
the existing behavior where `showValidationWarning` is only ever set to `true`, never explicitly
dismissed by the user in the current code — unchanged here.)

- [ ] **Step 8: Type-check, build, real interaction check**

Run: `npm run lint` — expected: no errors.
Run: `npm run build` — expected: succeeds.
Run: `npm run dev`. Confirm: typing in Nome/Matrícula/E-mail fields still updates state correctly;
the e-mail helper text still switches between the error message and the neutral hint as you type
a valid/invalid domain; the secretaria dropdown still populates and selects correctly; the termos
checkbox still toggles and gates form validity; the justificativa textarea's counter text still
reflects live typing and the amber border still appears below 10 characters; submitting an
incomplete form still shows the warning `Message`; submitting a complete form still calls
`onSubmitRequisition`.

- [ ] **Step 9: Commit**

```bash
git add src/components/Carrinho.tsx
git commit -m "feat: migrate Carrinho's form fields to Input/Checkbox/Textarea/Message primitives"
```
