# DS-gov Migration — Phase 4d: AvisosCompras Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate `src/components/AvisosCompras.tsx` onto DS-gov markup/primitives, fixing the
raw-Tailwind status badges, hand-rolled zero-ARIA alert modal, and unguarded `animate-pulse`/
broken `animate-in` pair — without touching simulation/persistence business logic.

**Architecture:** Five sequential changes to the same file (plus one small, purely-additive
extension to the shared `Input` primitive): status-badge extraction, simulator form fields onto
`Input`, buttons onto `Button`, two info banners onto `Message`, and the alert modal onto `Modal`
(dropping its custom gradient header and broken animation classes as a side effect, mirroring
Phase 4c's exact pattern for WorkflowManager's rejection modal).

**Tech Stack:** React 19, Vite 6, Tailwind CSS 4, `@govbr-ds/core@3.7.0`, `lucide-react`, the
existing primitives (`Input`, `Button`, `Message`, `Textarea`, `Modal`).

## Global Constraints

- No test runner. Verification is `npm run lint` (`tsc --noEmit`), `npm run build`, real
  interaction checks via `npm run dev` — established pattern since Phase 1.
- Simulation/persistence logic (`handleSimulateSubmit`, `handleRedeemIdle`,
  `handleBypassSubmit`, `saveCompras`, the `localStorage` read/write), the fuzzy CATMAT/
  description matching, and both `alert()` calls are unchanged. [spec: Out of Scope]
- `getStatusInfo` lives in `AvisosCompras.tsx` itself, not `src/data.ts` — this status enum has
  no other page consumer, so a shared-module extraction would be premature (YAGNI), matching the
  identical reasoning already applied to WorkflowManager's `getStatusInfo` in Phase 4c.
- Tasks 1-4 touch only `src/components/AvisosCompras.tsx`. Task 2 additionally touches
  `src/components/Input.tsx` (a small, purely-additive contract extension — see Task 2).
- `bg-warning`/`bg-success`/`bg-gray-40`/`bg-danger` are already-verified DS-gov utility classes
  (used identically in WorkflowManager's `getStatusInfo`, Phase 4c).
- Per the approved design spec: the alert modal's custom gradient header and "ALERTA SISTÊMICO"
  eyebrow badge are dropped entirely in favor of `Modal`'s standard header — severity is
  communicated via a `Message variant="danger"` in the body and button styling, not header chrome
  (same precedent Phase 4c set for WorkflowManager's rejection modal).
- "Burlar Bloqueio (Justificar)" maps to `Button variant="primary" className="bg-warning
  text-black"` — mirrors WorkflowManager's `variant="primary" className="bg-danger"` pattern for
  its "Registrar Rejeição Oficial" button (same mechanism, warning tone since this is a
  compliance-bypass/caution action, not a destructive one).

---

### Task 1: `getStatusInfo` (status badge colors/labels)

**Files:**
- Modify: `src/components/AvisosCompras.tsx` (the `getStatusBadge` function and its one usage
  site)

**Interfaces:**
- Produces: `getStatusInfo(status: string): { tone: string; label: string }`, a local function
  (not exported, not shared) consumed by this file's own log-history badge render site.

- [ ] **Step 1: Replace `getStatusBadge` with `getStatusInfo`**

Find the current function (lines 148-157):

```tsx
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'FORCADO_COM_JUSTIFICATIVA':
        return <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[10px] px-2 py-0.5 rounded-full font-bold">Compra Forçada (Justificada)</span>;
      case 'REQUISITADO_REMANEJAMENTO':
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] px-2 py-0.5 rounded-full font-bold">Redirecionado ao Reuso</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 border border-gray-200 text-[10px] px-2 py-0.5 rounded-full font-bold">{status}</span>;
    }
  };
```

Replace with:

```tsx
  const getStatusInfo = (status: string): { tone: string; label: string } => {
    switch (status) {
      case 'FORCADO_COM_JUSTIFICATIVA':
        return { tone: 'bg-warning text-black font-semibold', label: 'Compra Forçada (Justificada)' };
      case 'REQUISITADO_REMANEJAMENTO':
        return { tone: 'bg-success text-white', label: 'Redirecionado ao Reuso' };
      default:
        return { tone: 'bg-gray-40 text-white', label: status };
    }
  };
```

- [ ] **Step 2: Update the usage site**

Find (line 283, inside the log-history list):

```tsx
                      {getStatusBadge(comp.status)}
```

Replace with:

```tsx
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getStatusInfo(comp.status).tone}`}>
                        {getStatusInfo(comp.status).label}
                      </span>
```

- [ ] **Step 3: Type-check, build, visual check**

Run: `npm run lint` — expected: no errors.
Run: `npm run build` — expected: succeeds.
Run: `npm run dev`. Enter CATMAT `349281` (or description "Monitor") and submit — this triggers
the block alert; use "Burlar Bloqueio" to log a `FORCADO_COM_JUSTIFICATIVA` entry, confirm its
badge renders `bg-warning`/black text. Use "Resgatar Item" on a different simulated entry to log
a `REQUISITADO_REMANEJAMENTO` entry, confirm its badge renders `bg-success`/white text. Both
states are reachable via the two documented flows — no unreachable-state gap here, unlike some
earlier phases.

- [ ] **Step 4: Commit**

```bash
git add src/components/AvisosCompras.tsx
git commit -m "style: map AvisosCompras' status badges to DS-gov utility classes"
```

---

### Task 2: Simulator form fields onto `Input` (+ small `Input` contract extension)

**Files:**
- Modify: `src/components/Input.tsx` (add an `inputClassName` prop — see rationale below)
- Modify: `src/components/AvisosCompras.tsx` (imports; CATMAT/Descrição/Quantidade fields; Órgão
  Comprador `<select>` re-tokening)

**Interfaces:**
- Consumes: `Input` (`src/components/Input.tsx`, already built, Phase 3 — used previously by
  Vitrine's search box and Carrinho's Nome/Matrícula/Email fields, none of which needed
  element-level sizing classes).
- Produces: `Input`'s new `inputClassName?: string` prop — applies classes directly to the inner
  `<input>` element, instead of `className`, which targets the wrapper `<div>` (containing the
  `<label>` and optional `helperText` paragraph alongside the input). This mirrors the exact
  `textareaClassName` contract `Textarea` already has (added in Phase 4b for the same reason:
  sizing/font classes need to hit the actual form element, not a wrapper that also holds other
  content). Without this, `w-24` (needed on the Quantidade field, whose current markup is
  deliberately narrower than the other fields) would shrink the *entire* wrapper — including its
  `<label>` ("Quantidade Necessária"), causing the label text to wrap awkwardly. This gap was not
  caught during design (the spec assumed `className` would suffice) and is caught here before
  writing the consuming code, the same way Phase 4b's plan review caught the identical gap for
  `Textarea`.

- [ ] **Step 1: Add `inputClassName` to `Input`**

Find `src/components/Input.tsx` in full:

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

Replace with:

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
  state?: 'success' | 'danger' | 'warning' | 'info';
  /**
   * Classes applied directly to the inner <input> element (e.g. sizing/font
   * utilities like `w-24 font-mono`). Kept separate from `className`, which
   * targets the wrapper div and would otherwise also resize the <label>/
   * helperText alongside it - mirrors Textarea's `textareaClassName` contract.
   */
  inputClassName?: string;
}

export default function Input({ label, id, helperText, icon, state, className, inputClassName, ...rest }: InputProps) {
  const classes = ['br-input', icon ? 'has-icon' : '', state ?? '', className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <label htmlFor={id}>{label}</label>
      <input id={id} className={inputClassName} {...rest} />
      {icon}
      {helperText && <p>{helperText}</p>}
    </div>
  );
}
```

This is purely additive — `inputClassName` defaults to `undefined`, so every existing `Input`
consumer (Vitrine's search box, Carrinho's Nome/Matrícula/Email fields) is unaffected.

- [ ] **Step 2: Add import**

Add below the existing imports in `AvisosCompras.tsx`:

```tsx
import Input from './Input';
```

- [ ] **Step 3: CATMAT field**

Find (lines 199-209):

```tsx
                <div className="flex flex-col gap-1">
                  <label htmlFor="compra-catmat" className="text-xs font-bold text-gray-700">Código CATMAT (6 dígitos)</label>
                  <input
                    type="text"
                    id="compra-catmat"
                    placeholder="Ex: 349281"
                    value={catmat}
                    onChange={(e) => setCatmat(e.target.value)}
                    className="w-full text-xs p-3 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                  />
                </div>
```

Replace with:

```tsx
                <Input
                  label="Código CATMAT (6 dígitos)"
                  id="compra-catmat"
                  type="text"
                  placeholder="Ex: 349281"
                  value={catmat}
                  onChange={(e) => setCatmat(e.target.value)}
                  inputClassName="font-mono"
                />
```

- [ ] **Step 4: Órgão Comprador select (re-token only, stays native)**

Find (lines 214-224):

```tsx
                  <select
                    id="compra-sec"
                    value={sec}
                    onChange={(e) => setSec(e.target.value)}
                    className="w-full text-xs p-3 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                  >
```

Replace with:

```tsx
                  <select
                    id="compra-sec"
                    value={sec}
                    onChange={(e) => setSec(e.target.value)}
                    className="w-full text-xs p-3 border border-gray-200 rounded-lg bg-background focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                  >
```

(No primitive migration here — no `Select` primitive exists yet, matching the precedent already
established for WorkflowManager's motivo dropdown and Carrinho's secretaria dropdown. Only the
`bg-gray-50` → `bg-background` re-tokening, matching the pattern applied to every other native
`<select>` in this migration.)

- [ ] **Step 5: Descrição field**

Find (lines 229-240):

```tsx
              <div className="flex flex-col gap-1">
                <label htmlFor="compra-desc" className="text-xs font-bold text-gray-700">Descrição / Objeto da Compra <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  id="compra-desc"
                  placeholder="Ex: Aquisição de monitores LED para novos servidores do setor"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full text-xs p-3 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
```

Replace with:

```tsx
              <Input
                label="Descrição / Objeto da Compra *"
                id="compra-desc"
                type="text"
                placeholder="Ex: Aquisição de monitores LED para novos servidores do setor"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                required
              />
```

(Trailing `*` folded into the plain-string `label`, matching the exact convention already used by
every required `Input` field in Carrinho — e.g. `label="Nome Completo *"` — rather than a colored
`<span>`, since `Input`'s `label` prop is `string`, not `ReactNode`.)

- [ ] **Step 6: Quantidade field**

Find (lines 243-254):

```tsx
              <div className="flex flex-col gap-1">
                <label htmlFor="compra-quant" className="text-xs font-bold text-gray-700">Quantidade Necessária</label>
                <input
                  type="number"
                  id="compra-quant"
                  min="1"
                  value={quant}
                  onChange={(e) => setQuant(parseInt(e.target.value) || 1)}
                  className="w-24 text-xs p-3 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                  required
                />
              </div>
```

Replace with:

```tsx
              <Input
                label="Quantidade Necessária"
                id="compra-quant"
                type="number"
                min="1"
                value={quant}
                onChange={(e) => setQuant(parseInt(e.target.value) || 1)}
                inputClassName="w-24 font-mono"
                required
              />
```

(`w-24` goes through `inputClassName`, not `className` — see Task 2's Interfaces note. Verify
during Step 7 that the label above it is NOT narrowed to 24 units.)

- [ ] **Step 7: Type-check, build, real interaction check**

Run: `npm run lint` — expected: no errors.
Run: `npm run build` — expected: succeeds.
Run: `npm run dev`. Confirm: CATMAT/Descrição/Quantidade fields render with DS-gov `br-input`
styling and accept typed input; the Quantidade field's `<input>` itself is narrow (~24 units) but
its label above it spans the full width, not narrowed; the Órgão Comprador select still switches
between all 4 options and visibly uses the `bg-background` token; submitting the form with a test
CATMAT/description still triggers the block alert as before.

- [ ] **Step 8: Commit**

```bash
git add src/components/Input.tsx src/components/AvisosCompras.tsx
git commit -m "feat: migrate AvisosCompras' simulator form fields to the Input primitive"
```

---

### Task 3: Migrate all buttons to the `Button` primitive

**Files:**
- Modify: `src/components/AvisosCompras.tsx` (imports; "Simular Abertura de Licitação / Compra";
  "Limpar Logs"; "Resgatar Item"; "Cancelar Simulação"; "Burlar Bloqueio (Justificar)"; "Ir para
  Vitrine de Reuso")

**Interfaces:**
- Consumes: `Button` (`src/components/Button.tsx`, already built: `{variant?: 'primary' |
  'secondary' | 'tertiary', size?: 'medium' | 'small', circle?, icon?, children} &
  ComponentPropsWithoutRef<'button'>`; `icon` always renders *before* `children`, and `className`
  is additive to `br-button`/variant/size classes, not a replacement).

Note: the "Resgatar Item", "Cancelar Simulação", "Burlar Bloqueio", and "Ir para Vitrine" buttons
currently live inside the still-hand-rolled alert-modal `<div>` wrapper. This task only swaps
those four `<button>` elements for `Button` — it does not touch the surrounding wrapper markup.
Task 5 replaces the whole wrapper with the `Modal` primitive, and reads more cleanly against
already-migrated buttons than against raw ones (same ordering WorkflowManager's Phase 4c plan
used for its rejection modal).

- [ ] **Step 1: Add import**

Add below the existing imports:

```tsx
import Button from './Button';
```

- [ ] **Step 2: "Simular Abertura de Licitação / Compra" button**

Find (lines 256-262):

```tsx
              <button
                type="submit"
                className="mt-2 py-3 px-6 bg-primary hover:bg-primary-dark text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
                id="btn-simulate-procurement"
              >
                Simular Abertura de Licitação / Compra
              </button>
```

Replace with:

```tsx
              <Button
                type="submit"
                variant="primary"
                className="mt-2"
                id="btn-simulate-procurement"
              >
                Simular Abertura de Licitação / Compra
              </Button>
```

- [ ] **Step 3: "Limpar Logs" button**

Find (lines 303-311):

```tsx
            <button 
              onClick={() => {
                localStorage.removeItem('compras_simuladas');
                setCompras([]);
              }}
              className="text-[10px] text-red-500 hover:underline text-center w-full mt-2"
            >
              Limpar Logs
            </button>
```

Replace with:

```tsx
            <Button
              variant="tertiary"
              className="text-danger w-full mt-2"
              onClick={() => {
                localStorage.removeItem('compras_simuladas');
                setCompras([]);
              }}
            >
              Limpar Logs
            </Button>
```

- [ ] **Step 4: "Resgatar Item" button**

Find (lines 365-371):

```tsx
                    <button
                      onClick={() => handleRedeemIdle(item)}
                      className="px-3 py-1.5 bg-secondary hover:bg-secondary/90 text-white font-bold text-[11px] rounded transition-colors flex items-center gap-1"
                    >
                      Resgatar Item
                      <ArrowRight className="h-3 w-3" />
                    </button>
```

Replace with:

```tsx
                    <Button
                      variant="secondary"
                      size="small"
                      icon={<ArrowRight className="h-3 w-3" aria-hidden="true" />}
                      onClick={() => handleRedeemIdle(item)}
                    >
                      Resgatar Item
                    </Button>
```

(`Button` always renders `icon` before `children`, so the arrow now appears before the label
instead of after — matching the icon-then-label order every other icon+`Button` pairing in this
migration already uses. Not a functional change.)

- [ ] **Step 5: "Cancelar Simulação" button**

Find (lines 407-415):

```tsx
                <button
                  onClick={() => {
                    setActiveAlert(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancelar Simulação
                </button>
```

Replace with:

```tsx
                <Button
                  variant="tertiary"
                  onClick={() => {
                    setActiveAlert(null);
                    resetForm();
                  }}
                >
                  Cancelar Simulação
                </Button>
```

- [ ] **Step 6: "Burlar Bloqueio (Justificar)" button**

Find (lines 418-423):

```tsx
                  <button
                    onClick={handleBypassSubmit}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition-colors"
                  >
                    Burlar Bloqueio (Justificar)
                  </button>
```

Replace with:

```tsx
                  <Button
                    variant="primary"
                    className="bg-warning text-black"
                    onClick={handleBypassSubmit}
                  >
                    Burlar Bloqueio (Justificar)
                  </Button>
```

- [ ] **Step 7: "Ir para Vitrine de Reuso" button**

Find (lines 425-436):

```tsx
                  <button
                    onClick={() => {
                      // Let's take them back to the Vitrine Virtual to see everything
                      setActiveAlert(null);
                      onSetTab('vitrine');
                    }}
                    className="px-4 py-2 bg-secondary hover:bg-secondary/90 text-white font-bold text-xs rounded-lg shadow transition-colors flex items-center gap-1"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Ir para Vitrine de Reuso
                  </button>
```

Replace with:

```tsx
                  <Button
                    variant="secondary"
                    icon={<ShieldCheck className="h-4 w-4" aria-hidden="true" />}
                    onClick={() => {
                      setActiveAlert(null);
                      onSetTab('vitrine');
                    }}
                  >
                    Ir para Vitrine de Reuso
                  </Button>
```

- [ ] **Step 8: Type-check, build, real interaction check**

Run: `npm run lint` — expected: no errors.
Run: `npm run build` — expected: succeeds.
Run: `npm run dev`. Confirm: "Simular Abertura..." still submits the form; a non-matching
submission still shows the auto-complete `alert()`; "Limpar Logs" still clears history; entering
a matching CATMAT/description still opens the alert popup; inside it, "Resgatar Item" still adds
to cart and closes the popup, "Cancelar Simulação" still closes without saving, "Burlar Bloqueio"
still validates/submits the justification, "Ir para Vitrine de Reuso" still switches tabs.

- [ ] **Step 9: Commit**

```bash
git add src/components/AvisosCompras.tsx
git commit -m "feat: migrate AvisosCompras' buttons to the Button primitive"
```

---

### Task 4: Migrate two info banners to `Message`

**Files:**
- Modify: `src/components/AvisosCompras.tsx` (imports; "Códigos de teste..." box; "Deseja
  desviar deste bloqueio legal?" box)

**Interfaces:**
- Consumes: `Message` (`src/components/Message.tsx`, already built: `{variant, title, body:
  string, onDismiss?}` — note `body` is a plain string, it cannot hold rich JSX like a bulleted
  list with inline `<strong>`/`<code>`-style highlights).

The "Deseja desviar deste bloqueio legal?" box is a clean title+paragraph fit for `Message` as-is.
The "Códigos de teste" box is not: its content is a title plus a 4-item bulleted list with
mixed-styling inline highlights, which `Message`'s string-only `body` cannot carry without losing
the list structure and highlight formatting. Rather than flatten the list into an unreadable
`body` string, this task composes `Message` (for the alert framing/icon/color) with the list kept
as a plain sibling `<ul>` below it — the same composition technique Phase 4c used to keep
WorkflowManager's "Baixar Termo Digital" button as a `Message` sibling rather than forcing it into
a prop slot it wasn't designed for.

Both of these boxes currently live inside the still-hand-rolled alert-modal wrapper or its
sibling form panel (the "Códigos de teste" box is in the form panel, outside the modal; "Deseja
desviar" is inside the modal wrapper). Task 5 replaces the modal wrapper itself — this task only
swaps the two banners' contents, consistent with Task 3's approach to the buttons inside that same
wrapper.

- [ ] **Step 1: Add import**

Add below the existing imports:

```tsx
import Message from './Message';
```

- [ ] **Step 2: "Códigos de teste" box**

Find (lines 183-193):

```tsx
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-lg p-3.5 text-xs">
              <p className="font-bold mb-1 flex items-center gap-1.5 text-emerald-900">
                <Info className="h-4 w-4" /> Códigos de teste para disparar a trava sistêmica:
              </p>
              <ul className="list-disc list-inside space-y-1 text-emerald-700 font-medium">
                <li>Digite o CATMAT <strong className="font-mono text-emerald-900 bg-emerald-150 px-1 rounded">349281</strong> ou escreva <strong className="text-emerald-900">Monitor</strong> no campo de descrição</li>
                <li>Digite o CATMAT <strong className="font-mono text-emerald-900 bg-emerald-150 px-1 rounded">442910</strong> ou escreva <strong className="text-emerald-900">Cadeira</strong> no campo de descrição</li>
                <li>Digite o CATMAT <strong className="font-mono text-emerald-900 bg-emerald-150 px-1 rounded">150921</strong> ou escreva <strong className="text-emerald-900">Papel</strong> no campo de descrição</li>
                <li>Digite o CATMAT <strong className="font-mono text-emerald-900 bg-emerald-150 px-1 rounded">392810</strong> ou escreva <strong className="text-emerald-900">Notebook</strong> no campo de descrição</li>
              </ul>
            </div>
```

Replace with:

```tsx
            <div className="flex flex-col gap-2">
              <Message
                variant="info"
                title="Códigos de teste para disparar a trava sistêmica."
                body="Use um dos códigos CATMAT ou termos de descrição abaixo na simulação para forçar o bloqueio."
              />
              <ul className="list-disc list-inside space-y-1 text-xs text-gray-700 font-medium pl-1">
                <li>Digite o CATMAT <strong className="font-mono text-primary bg-gray-100 px-1 rounded">349281</strong> ou escreva <strong>Monitor</strong> no campo de descrição</li>
                <li>Digite o CATMAT <strong className="font-mono text-primary bg-gray-100 px-1 rounded">442910</strong> ou escreva <strong>Cadeira</strong> no campo de descrição</li>
                <li>Digite o CATMAT <strong className="font-mono text-primary bg-gray-100 px-1 rounded">150921</strong> ou escreva <strong>Papel</strong> no campo de descrição</li>
                <li>Digite o CATMAT <strong className="font-mono text-primary bg-gray-100 px-1 rounded">392810</strong> ou escreva <strong>Notebook</strong> no campo de descrição</li>
              </ul>
            </div>
```

- [ ] **Step 3: "Deseja desviar deste bloqueio legal?" box**

Find (lines 378-383):

```tsx
                <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-3 text-xs">
                  <p className="font-bold">Deseja desviar deste bloqueio legal?</p>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Para prosseguir com o processo licitatório comercial de mercado, o gestor de compras é legalmente obrigado a preencher uma justificativa detalhada e formal (mínimo 15 caracteres) explicando por que os itens ociosos listados não atendem à dotação necessária.
                  </p>
                </div>
```

Replace with:

```tsx
                <Message
                  variant="warning"
                  title="Deseja desviar deste bloqueio legal?"
                  body="Para prosseguir com o processo licitatório comercial de mercado, o gestor de compras é legalmente obrigado a preencher uma justificativa detalhada e formal (mínimo 15 caracteres) explicando por que os itens ociosos listados não atendem à dotação necessária."
                />
```

- [ ] **Step 4: Type-check, build, real interaction check**

Run: `npm run lint` — expected: no errors.
Run: `npm run build` — expected: succeeds.
Run: `npm run dev`. Confirm the "Códigos de teste" box renders as an info `Message` followed by
the 4-item list (list content/highlighting unchanged in substance, re-toned to neutral gray/
primary instead of emerald). Trigger the block alert and confirm "Deseja desviar..." renders as a
warning `Message` inside the popup.

- [ ] **Step 5: Commit**

```bash
git add src/components/AvisosCompras.tsx
git commit -m "feat: migrate AvisosCompras' info banners to the Message primitive"
```

---

### Task 5: Migrate the alert modal to the `Modal` primitive

**Files:**
- Modify: `src/components/AvisosCompras.tsx` (imports; the entire alert-modal block)

**Interfaces:**
- Consumes: `Modal` (`src/components/Modal.tsx`, Phase 3, proven in production by Vitrine's
  Phase 4a detail modal and WorkflowManager's Phase 4c rejection modal) and `Textarea`
  (`src/components/Textarea.tsx`, Phase 4b, has the `state`/`textareaClassName` contract from its
  Phase 4b final-review hardening).

- [ ] **Step 1: Add imports**

Add below the existing imports:

```tsx
import Modal from './Modal';
import Textarea from './Textarea';
```

- [ ] **Step 2: Replace the entire hand-rolled modal block**

Find the full block (from `{/* POP-UP TRAVA SISTÊMICA (ALERTA PROATIVO) */}` through its closing
`)}`, the last section of the file before the final closing `</div>` — at this point in the plan,
Tasks 3 and 4 have already replaced its buttons and its "Deseja desviar" banner in place, so the
block you find should look like this):

```tsx
      {/* POP-UP TRAVA SISTÊMICA (ALERTA PROATIVO) */}
      {activeAlert && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border-2 border-red-500 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Header Vermelho de Alerta Impeditivo */}
            <div className="bg-gradient-to-r from-red-600 to-amber-600 text-white p-5 flex items-start gap-3.5">
              <AlertOctagon className="h-8 w-8 text-white animate-pulse flex-shrink-0 mt-1" />
              <div>
                <span className="bg-red-800 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-white/20">
                  ALERTA SISTÊMICO - BLOQUEIO DE COMPRA
                </span>
                <h3 className="text-lg md:text-xl font-bold font-display mt-1 leading-snug">
                  Bens Equivalentes Disponíveis sem Custos!
                </h3>
                <p className="text-xs text-white/90 mt-1 leading-relaxed">
                  A Lei Federal nº 14.133/2021 e as boas práticas de responsabilidade fiscal vetam a compra de novos materiais se houver similares ociosos cadastrados.
                </p>
              </div>
            </div>

            {/* Conteúdo: Itens Ociosos Correspondentes */}
            <div className="p-6 flex flex-col gap-5">
              
              <div className="text-xs text-gray-600">
                Sua intenção de compra de <strong className="text-gray-800 font-mono">"{activeAlert.compra.descricao}"</strong> (Qtd: {activeAlert.compra.quantidade}) foi bloqueada porque localizamos os seguintes itens ociosos no Almoxarifado Compartilhado:
              </div>

              {/* Lista de Correspondências */}
              <div className="flex flex-col gap-3 max-h-[180px] overflow-y-auto border border-gray-150 rounded-lg p-2 bg-gray-50">
                {activeAlert.similarItems.map((item) => (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-3 flex justify-between items-center gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.fotoUrl}
                        alt={item.nome}
                        referrerPolicy="no-referrer"
                        className="h-12 w-16 object-cover rounded border border-gray-200 flex-shrink-0"
                      />
                      <div>
                        <h4 className="font-bold text-xs text-primary leading-tight">{item.nome}</h4>
                        <p className="text-[10px] text-gray-500 mt-0.5">Orgão: <strong>{item.secretariaOrigem}</strong></p>
                        <span className="text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 rounded font-semibold mt-1 inline-block">
                          Estado: {item.estadoConservacao} (Disp: {item.quantidade} un.)
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="secondary"
                      size="small"
                      icon={<ArrowRight className="h-3 w-3" aria-hidden="true" />}
                      onClick={() => handleRedeemIdle(item)}
                    >
                      Resgatar Item
                    </Button>
                  </div>
                ))}
              </div>

              {/* Justificativa de Desvio para Prosseguir */}
              <div className="border-t border-gray-150 pt-4 flex flex-col gap-3">
                <Message
                  variant="warning"
                  title="Deseja desviar deste bloqueio legal?"
                  body="Para prosseguir com o processo licitatório comercial de mercado, o gestor de compras é legalmente obrigado a preencher uma justificativa detalhada e formal (mínimo 15 caracteres) explicando por que os itens ociosos listados não atendem à dotação necessária."
                />

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="bypass-justification" className="text-xs font-bold text-gray-800">
                    Justificativa Formal de Recusa dos Itens Ociosos <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="bypass-justification"
                    placeholder="Ex: O material ocioso listado não possui as dimensões de segurança necessárias para o laboratório de biologia..."
                    value={justificativaForcadaText}
                    onChange={(e) => {
                      setJustificativaForcadaText(e.target.value);
                      setJustificativaError('');
                    }}
                    className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-red-500 resize-none h-16 font-sans"
                  />
                  {justificativaError && (
                    <p className="text-[10px] text-red-600 font-bold mt-0.5">{justificativaError}</p>
                  )}
                </div>
              </div>

              {/* Botões do Popup */}
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <Button variant="tertiary" onClick={() => { setActiveAlert(null); resetForm(); }}>
                  Cancelar Simulação
                </Button>

                <div className="flex gap-2">
                  <Button variant="primary" className="bg-warning text-black" onClick={handleBypassSubmit}>
                    Burlar Bloqueio (Justificar)
                  </Button>
                  
                  <Button variant="secondary" icon={<ShieldCheck className="h-4 w-4" aria-hidden="true" />} onClick={() => { setActiveAlert(null); onSetTab('vitrine'); }}>
                    Ir para Vitrine de Reuso
                  </Button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
```

Replace with:

```tsx
      {/* POP-UP TRAVA SISTÊMICA (ALERTA PROATIVO) */}
      <Modal
        open={!!activeAlert}
        onClose={() => { setActiveAlert(null); resetForm(); }}
        title="Bens Equivalentes Disponíveis sem Custos!"
        footer={
          <>
            <Button variant="tertiary" onClick={() => { setActiveAlert(null); resetForm(); }}>
              Cancelar Simulação
            </Button>
            <Button variant="primary" className="bg-warning text-black" onClick={handleBypassSubmit}>
              Burlar Bloqueio (Justificar)
            </Button>
            <Button variant="secondary" icon={<ShieldCheck className="h-4 w-4" aria-hidden="true" />} onClick={() => { setActiveAlert(null); onSetTab('vitrine'); }}>
              Ir para Vitrine de Reuso
            </Button>
          </>
        }
      >
        {activeAlert && (
          <div className="flex flex-col gap-5">
            <Message
              variant="danger"
              title="Bloqueio legal aplicado."
              body="A Lei Federal nº 14.133/2021 e as boas práticas de responsabilidade fiscal vetam a compra de novos materiais se houver similares ociosos cadastrados."
            />

            <div className="text-xs text-gray-600">
              Sua intenção de compra de <strong className="text-gray-800 font-mono">"{activeAlert.compra.descricao}"</strong> (Qtd: {activeAlert.compra.quantidade}) foi bloqueada porque localizamos os seguintes itens ociosos no Almoxarifado Compartilhado:
            </div>

            <div className="flex flex-col gap-3 max-h-[180px] overflow-y-auto border border-gray-150 rounded-lg p-2 bg-gray-50">
              {activeAlert.similarItems.map((item) => (
                <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-3 flex justify-between items-center gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.fotoUrl}
                      alt={item.nome}
                      referrerPolicy="no-referrer"
                      className="h-12 w-16 object-cover rounded border border-gray-200 flex-shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-xs text-primary leading-tight">{item.nome}</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">Orgão: <strong>{item.secretariaOrigem}</strong></p>
                      <span className="text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 rounded font-semibold mt-1 inline-block">
                        Estado: {item.estadoConservacao} (Disp: {item.quantidade} un.)
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="secondary"
                    size="small"
                    icon={<ArrowRight className="h-3 w-3" aria-hidden="true" />}
                    onClick={() => handleRedeemIdle(item)}
                  >
                    Resgatar Item
                  </Button>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-150 pt-4 flex flex-col gap-3">
              <Message
                variant="warning"
                title="Deseja desviar deste bloqueio legal?"
                body="Para prosseguir com o processo licitatório comercial de mercado, o gestor de compras é legalmente obrigado a preencher uma justificativa detalhada e formal (mínimo 15 caracteres) explicando por que os itens ociosos listados não atendem à dotação necessária."
              />

              <Textarea
                label="Justificativa Formal de Recusa dos Itens Ociosos *"
                id="bypass-justification"
                placeholder="Ex: O material ocioso listado não possui as dimensões de segurança necessárias para o laboratório de biologia..."
                value={justificativaForcadaText}
                onChange={(e) => {
                  setJustificativaForcadaText(e.target.value);
                  setJustificativaError('');
                }}
                state={justificativaError ? 'danger' : undefined}
                textareaClassName="resize-none h-16"
              />
              {justificativaError && (
                <p className="text-[10px] text-danger font-bold mt-0.5">{justificativaError}</p>
              )}
            </div>
          </div>
        )}
      </Modal>
```

Notes on this replacement:
- `Modal`'s own header (title + close button, real `role="dialog"`/`aria-modal`/
  `aria-labelledby`) replaces the custom gradient band and eyebrow badge entirely — per the
  approved design spec, severity is now communicated via the new `Message variant="danger"` at
  the top of the body (replacing the legal-citation paragraph) and the footer buttons' own
  styling, not by recoloring the header chrome.
- The `AlertOctagon` icon and its unguarded `animate-pulse` are gone (dropped along with the old
  header, not relocated) — its warning-signal role is now carried by the `Message` banner's own
  color/icon-slot. This also removes the `animate-in fade-in zoom-in duration-200` classes, the
  same non-functional-Tailwind-class bug found and fixed in Vitrine's toast (Phase 4a) and
  WorkflowManager's rejection modal (Phase 4c), as a side effect of adopting `Modal`.
- `{activeAlert && (...)}` guards the children because, unlike WorkflowManager's rejection modal,
  this modal's body directly dereferences a nullable object (`activeAlert.compra.descricao`,
  `activeAlert.similarItems`) — the same pattern already used by Vitrine's detail modal for
  `detailProduct` (`Vitrine.tsx:411`, `{detailProduct && (...)}`). The footer does not need this
  guard: none of its three buttons dereference `activeAlert` directly in JSX (they read it via
  the `handleBypassSubmit`/`handleRedeemIdle`/`onSetTab` closures, which already guard internally
  with `if (!activeAlert) return;`).
- `Textarea` uses `state`/`textareaClassName` per its established Phase 4b contract — `state`
  turns red exactly when `justificativaError` is set (mirrors Carrinho's `justificativa` field),
  `textareaClassName="resize-none h-16"` (not `className`) sizes the actual `<textarea>`.
- The `justificativaError` paragraph's color changed from `text-red-600` to `text-danger` (the
  verified DS-gov token), consistent with the re-tokening pattern applied everywhere else in this
  migration.

- [ ] **Step 3: Type-check, build, real interaction check**

Run: `npm run lint` — expected: no errors.
Run: `npm run build` — expected: succeeds.
Run: `npm run dev`. Enter CATMAT `349281` (or "Monitor") and submit to open the modal. Confirm:
the modal opens with real focus-trap/Escape/backdrop-click/focus-restore (inherited from `Modal`,
re-verify in this context rather than assuming Phase 4a/4c's verification still applies); the
danger `Message` shows the legal-citation text; the matched-items list renders with working
"Resgatar Item" buttons; typing fewer than 15 characters into the justificativa field and clicking
"Burlar Bloqueio" shows the validation error with the `Textarea` turning to its danger state, and
typing 15+ characters clears it; "Cancelar Simulação" closes the modal without saving; a
successful "Burlar Bloqueio" submission closes the modal, saves the log entry, and shows the
`alert()`; "Ir para Vitrine de Reuso" closes the modal and switches tabs.

- [ ] **Step 4: Commit**

```bash
git add src/components/AvisosCompras.tsx
git commit -m "feat: migrate AvisosCompras' alert modal to the Modal primitive"
```
