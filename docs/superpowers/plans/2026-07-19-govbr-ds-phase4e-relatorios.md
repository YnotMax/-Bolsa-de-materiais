# DS-gov Migration — Phase 4e: Relatorios Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate `src/components/Relatorios.tsx` onto DS-gov markup/primitives — add `br-card` to
its six card wrappers, replace two decorative emoji with lucide icons, and migrate its one
title+body banner onto the `Message` primitive.

**Architecture:** A single task covering the whole file: this page has no forms, buttons, or
modals (unlike every prior Phase 4 sub-phase), so there is no multi-task dependency chain to
sequence — all three changes (card tokens, icon swap, `Message` migration) are independent,
low-risk, presentational edits to the same file.

**Tech Stack:** React 19, Vite 6, Tailwind CSS 4, `@govbr-ds/core@3.7.0`, `lucide-react`, the
existing `Message` primitive.

## Global Constraints

- No test runner. Verification is `npm run lint` (`tsc --noEmit`), `npm run build`, real
  interaction checks via `npm run dev` — established pattern since Phase 1.
- The `stats` and `rankingSecretarias` `useMemo` calculation logic is unchanged. [spec: Out of
  Scope]
- The ranking table's markup and its position/selo badge coloring are unchanged — no `Table`
  primitive exists to migrate onto, and re-coloring gamification badges is a distinct visual
  decision outside this migration's scope. [spec: Out of Scope]
- This plan only touches `src/components/Relatorios.tsx`.
- `Message` is already built (`src/components/Message.tsx`: `{variant, title, body: string,
  onDismiss?}`, renders `br-message`/`role="alert"`) — proven in production by Carrinho (Phase
  4b), WorkflowManager (Phase 4c), and AvisosCompras (Phase 4d).

---

### Task 1: `br-card` wrappers, icon swap, `Message` migration

**Files:**
- Modify: `src/components/Relatorios.tsx` (imports; the 4 bento metric card wrappers; the
  ranking-table container wrapper; the sidebar panel wrapper; the CO₂ card's and Licitações
  card's emoji subtext; the "Selo Verde Florianópolis" callout)

**Interfaces:**
- Consumes: `Message` (`src/components/Message.tsx`, already built, Phase 3).

- [ ] **Step 1: Add imports**

Find (line 7):

```tsx
import { BarChart3, TrendingUp, Leaf, Award, Landmark, AlertTriangle, ArrowUpRight, HelpCircle, Sparkles } from 'lucide-react';
```

Replace with:

```tsx
import { BarChart3, TrendingUp, Leaf, Award, Landmark, AlertTriangle, ArrowUpRight, HelpCircle, Sparkles, Lock } from 'lucide-react';
import Message from './Message';
```

(Only `Lock` is added to the lucide-react list — `Landmark`/`AlertTriangle`/`ArrowUpRight`/
`HelpCircle` are pre-existing unused imports already in the file before this task, out of scope
here, same as every other page's pre-existing dead imports found in this migration's final
reviews.)

- [ ] **Step 2: `br-card` on Card 1 (Redução de Despesa Estimada)**

Find (lines 107-108):

```tsx
        {/* Card 1: Redução de Despesa Estimada */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-start justify-between">
```

Replace with:

```tsx
        {/* Card 1: Redução de Despesa Estimada */}
        <div className="br-card bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-start justify-between">
```

- [ ] **Step 3: `br-card` + icon swap on Card 2 (Emissões de CO2 Evitadas)**

Find (lines 123-137):

```tsx
        {/* Card 2: Emissões de CO2 Evitadas */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Carbono Evitado (CO₂e)</span>
            <span className="text-xl md:text-2xl font-bold text-emerald-700 font-mono leading-none mt-1">
              {stats.co2.toLocaleString('pt-BR')} kg
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold mt-2 block">
              🌿 Equivalente a {Math.round(stats.co2 / 6)} árvores plantadas
            </span>
          </div>
          <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-lg border border-emerald-100">
            <Leaf className="h-5 w-5" />
          </div>
        </div>
```

Replace with:

```tsx
        {/* Card 2: Emissões de CO2 Evitadas */}
        <div className="br-card bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Carbono Evitado (CO₂e)</span>
            <span className="text-xl md:text-2xl font-bold text-emerald-700 font-mono leading-none mt-1">
              {stats.co2.toLocaleString('pt-BR')} kg
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold mt-2 flex items-center gap-1">
              <Leaf className="h-3 w-3" aria-hidden="true" /> Equivalente a {Math.round(stats.co2 / 6)} árvores plantadas
            </span>
          </div>
          <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-lg border border-emerald-100">
            <Leaf className="h-5 w-5" />
          </div>
        </div>
```

(The subtext `<span>` changes from `block` to `flex items-center gap-1` — it now lays out an
icon next to text instead of a single text run, so it needs the flex layout to align them. The
card's own corner icon, a second separate `<Leaf>` at `h-5 w-5`, is untouched.)

- [ ] **Step 4: `br-card` on Card 3 (Itens Remanejados)**

Find (lines 139-140):

```tsx
        {/* Card 3: Itens Remanejados */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-start justify-between">
```

Replace with:

```tsx
        {/* Card 3: Itens Remanejados */}
        <div className="br-card bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-start justify-between">
```

- [ ] **Step 5: `br-card` + icon swap on Card 4 (Licitações Evitadas)**

Find (lines 155-169):

```tsx
        {/* Card 4: Licitações Evitadas */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Licitações Bloqueadas</span>
            <span className="text-xl md:text-2xl font-bold text-primary font-mono leading-none mt-1">
              {stats.projetos} processos
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold mt-2 block">
              🔒 Impedidos pela trava sistêmica
            </span>
          </div>
          <div className="bg-amber-50 text-amber-600 p-2.5 rounded-lg border border-amber-100">
            <Award className="h-5 w-5" />
          </div>
        </div>
```

Replace with:

```tsx
        {/* Card 4: Licitações Evitadas */}
        <div className="br-card bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Licitações Bloqueadas</span>
            <span className="text-xl md:text-2xl font-bold text-primary font-mono leading-none mt-1">
              {stats.projetos} processos
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold mt-2 flex items-center gap-1">
              <Lock className="h-3 w-3" aria-hidden="true" /> Impedidos pela trava sistêmica
            </span>
          </div>
          <div className="bg-amber-50 text-amber-600 p-2.5 rounded-lg border border-amber-100">
            <Award className="h-5 w-5" />
          </div>
        </div>
```

- [ ] **Step 6: `br-card` on the ranking-table container panel**

Find (line 177):

```tsx
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col gap-4">
```

Replace with:

```tsx
        <div className="lg:col-span-2 br-card bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col gap-4">
```

- [ ] **Step 7: `br-card` on the sidebar panel**

Find (line 227):

```tsx
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-between gap-5">
```

Replace with:

```tsx
        <div className="br-card bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-between gap-5">
```

- [ ] **Step 8: "Selo Verde Florianópolis" callout → `Message`**

Find (lines 250-257):

```tsx
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-900 rounded-lg p-3 text-xs">
            <p className="font-bold flex items-center gap-1 text-emerald-950">
              🌿 Selo Verde Florianópolis
            </p>
            <p className="mt-1 text-[11px] text-emerald-800">
              As secretarias com classificação "Selo Verde Ouro" recebem bônus na cota de aprovação de dotações complementares no orçamento do próximo ano!
            </p>
          </div>
```

Replace with:

```tsx
          <Message
            variant="success"
            title="Selo Verde Florianópolis."
            body={'As secretarias com classificação "Selo Verde Ouro" recebem bônus na cota de aprovação de dotações complementares no orçamento do próximo ano!'}
          />
```

(`body` uses a single-quoted JS string literal in braces, not a double-quoted JSX attribute,
because the text itself contains literal double quotes around "Selo Verde Ouro" — this avoids
HTML-entity escaping. The 🌿 emoji in the old heading is dropped entirely, not relocated —
`Message`'s own icon slot carries that role, matching the convention already established for
every other `Message` migration this session, e.g. WorkflowManager's Task 3 and AvisosCompras'
Task 4.)

- [ ] **Step 9: Type-check, build, real interaction check**

Run: `npm run lint` — expected: no errors.
Run: `npm run build` — expected: succeeds.
Run: `npm run dev`. Navigate to the Relatorios tab. Confirm: all 4 metric cards render with
`br-card` styling and correct computed values (these come from the `requisicoes` prop passed
into this page plus base mock values — no logic changed, so values should match pre-migration
exactly); the CO₂ card shows a small `Leaf` icon before "Equivalente a..." (not the 🌿 emoji);
the Licitações card shows a small `Lock` icon before "Impedidos pela trava sistêmica" (not the
🔒 emoji); both corner icons (the larger `Leaf`/`Award` in the colored icon badges) are
unchanged; the ranking table still renders all 5 secretariats with correct position badges,
RDE/CO₂ values, and selo badges (untouched); the "Selo Verde Florianópolis" panel renders as a
`Message variant="success"` with the exact body text, including the literal quotes around "Selo
Verde Ouro" rendering correctly (not as `&quot;` or double-escaped).

- [ ] **Step 10: Commit**

```bash
git add src/components/Relatorios.tsx
git commit -m "feat: migrate Relatorios' cards, icons, and callout to DS-gov primitives"
```
