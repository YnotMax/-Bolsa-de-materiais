# DS-gov Migration — Phase 4a: Vitrine Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate `src/components/Vitrine.tsx` onto the Phase 3 primitives (`Button`, `Input`,
`Modal`) and real DS-gov utility classes, and fix its audit-flagged anti-patterns (hand-rolled
modal with zero ARIA, emoji-as-icons, `animate-bounce`), without touching search/filter/cart
business logic.

**Architecture:** Four independent, sequential changes to the same file: conservation-state badge
colors (DS-gov utility classes), buttons/search input (`Button`/`Input` primitives), the detail
modal (`Modal` primitive), and the toast (motion/token fixes only, stays custom — no DS-gov
component fits it).

**Tech Stack:** React 19, Vite 6, Tailwind CSS 4, `@govbr-ds/core@3.7.0`, `lucide-react`, the Phase
3 primitives (`src/components/{Button,Input,Modal}.tsx`).

## Global Constraints

- No test runner in this repo. Verification is `npm run lint` (`tsc --noEmit`), `npm run build`,
  and real interaction checks via `npm run dev` (or a disposable Playwright harness where a full
  page render isn't the fastest path) — established pattern since Phase 1.
- Search/filter logic (`fuzzySearch`, `filteredProducts`, `displayLimit`, `hasActiveFilters`),
  cart-add logic (`onAddToCart`, `handleAddToCart`), and `showToast`'s timing are unchanged.
  [spec: Out of Scope]
- `Tag` is **not** used in this plan — verified during design that its `status` variant (an
  unlabeled dot) doesn't fit Vitrine's labeled-pill conservation badge; DS-gov's own
  `bg-danger`/`bg-success`/`bg-warning`/`bg-gray-40` utility classes are used directly instead.
  [spec: Product cards correction]
- Icons stay `lucide-react` only — no Font Awesome. [migration-wide policy, Phase 2 Decision 2]
- This plan only touches `src/components/Vitrine.tsx`.

---

### Task 1: Conservation-state badge colors → DS-gov utility classes, `br-card` wrapper

**Files:**
- Modify: `src/components/Vitrine.tsx` (the `getEstadoBadge` function; both places that consume
  its `.bg` field — the catalog card badge and the modal's header badge; the card's outer
  `<article>` className)

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: `getEstadoBadge` now returns `{ tone: string; label: string; desc: string }` instead of
  `{ bg: string; label: string; desc: string }` — Task 3 (which also reads `getEstadoBadge` for the
  modal) needs to know the field renamed from `bg` to `tone` and now holds a bare utility class
  name, not a Tailwind `bg-*/text-*` pair.

- [ ] **Step 1: Replace `getEstadoBadge`**

Find the current function (lines 40-75 of `src/components/Vitrine.tsx`):

```tsx
  const getEstadoBadge = (estado: EstadoConservacao) => {
    switch (estado) {
      case 'NOVO':
        return {
          bg: 'bg-state-novo text-white',
          label: 'Novo (Sem uso)',
          desc: 'Adquirido há < 1 ano, sem uso prévio'
        };
      case 'BOM':
        return {
          bg: 'bg-state-bom text-white',
          label: 'Bom',
          desc: 'Em perfeitas condições, > 1 ano de aquisição'
        };
      case 'REGULAR':
        return {
          bg: 'bg-state-regular text-black font-semibold',
          label: 'Regular',
          desc: 'Precisa apenas de reparos simples'
        };
      case 'PESSIMO':
        return {
          bg: 'bg-state-pessimo text-white',
          label: 'Péssimo',
          desc: 'Apresenta avarias importantes'
        };
      case 'SUCATA':
        return {
          bg: 'bg-state-sucata text-white',
          label: 'Sucata (Inservível)',
          desc: 'Inservível para reuso direto, aproveitável para peças'
        };
      default:
        return { bg: 'bg-gray-500 text-white', label: estado, desc: '' };
    }
  };
```

Replace with:

```tsx
  const getEstadoBadge = (estado: EstadoConservacao) => {
    switch (estado) {
      case 'NOVO':
        return {
          tone: 'bg-success text-white',
          label: 'Novo (Sem uso)',
          desc: 'Adquirido há < 1 ano, sem uso prévio'
        };
      case 'BOM':
        return {
          tone: 'bg-success text-white',
          label: 'Bom',
          desc: 'Em perfeitas condições, > 1 ano de aquisição'
        };
      case 'REGULAR':
        return {
          tone: 'bg-warning text-black font-semibold',
          label: 'Regular',
          desc: 'Precisa apenas de reparos simples'
        };
      case 'PESSIMO':
        return {
          tone: 'bg-danger text-white',
          label: 'Péssimo',
          desc: 'Apresenta avarias importantes'
        };
      case 'SUCATA':
        return {
          tone: 'bg-gray-40 text-white',
          label: 'Sucata (Inservível)',
          desc: 'Inservível para reuso direto, aproveitável para peças'
        };
      default:
        return { tone: 'bg-gray-40 text-white', label: estado, desc: '' };
    }
  };
```

`bg-danger`/`bg-success`/`bg-warning`/`bg-gray-40` are verified DS-gov utility classes (confirmed
present in `@govbr-ds/core@3.7.0`'s compiled `core.min.css`) — the same real classes `Tag`'s
`status` variant would use internally, applied directly here since `Tag`'s dot shape doesn't fit
this labeled-pill slot.

- [ ] **Step 2: Update both consumers of `badge.bg` → `badge.tone`**

In the catalog card (inside the `filteredProducts.slice(...).map(...)` block), find:

```tsx
                      <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-md tracking-wide ${badge.bg}`}>
                        {badge.label}
                      </span>
```

Replace `badge.bg` with `badge.tone`:

```tsx
                      <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-md tracking-wide ${badge.tone}`}>
                        {badge.label}
                      </span>
```

In the detail modal's header (this specific span moves into Task 3's `Modal` migration, but fix
the field name now since it's a one-line change unrelated to the modal restructuring itself), find:

```tsx
              <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold shadow-md ${getEstadoBadge(detailProduct.estadoConservacao).bg}`}>
                {getEstadoBadge(detailProduct.estadoConservacao).label}
              </span>
```

Replace `.bg` with `.tone`:

```tsx
              <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold shadow-md ${getEstadoBadge(detailProduct.estadoConservacao).tone}`}>
                {getEstadoBadge(detailProduct.estadoConservacao).label}
              </span>
```

- [ ] **Step 3: Add `br-card` to the catalog card's outer `<article>`**

Find:

```tsx
                  <article
                    key={produto.id}
                    id={`product-card-${produto.id}`}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-primary transition-all duration-300 flex flex-col justify-between"
                  >
```

Replace with:

```tsx
                  <article
                    key={produto.id}
                    id={`product-card-${produto.id}`}
                    className="br-card hover bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-primary transition-all duration-300 flex flex-col justify-between"
                  >
```

(`br-card` and `hover` are added at the front of the existing class list — the existing Tailwind
classes stay, per the Phase 1 cascade-layer rule where DS-gov owns element-level defaults and
Tailwind utilities always win on conflicts.)

- [ ] **Step 4: Re-token the three filter `<select>` elements**

All three selects (`filter-category`, `filter-secretaria`, `filter-estado`) share the same
className pattern using raw Tailwind grays. Find each occurrence of (the class string is identical
across all three):

```tsx
              className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs py-2 px-3 text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary"
```

Replace all three with:

```tsx
              className="w-full bg-background border border-gray-200 rounded-lg text-xs py-2 px-3 text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary"
```

(`bg-gray-50` → `bg-background`, using the existing `--color-background` token already defined in
`src/index.css`; `text-gray-800` → `text-on-surface-variant`, using the existing
`--color-on-surface-variant` token — both tokens already exist from before this migration started
and are already proven working via `App.tsx`'s root div, per Phase 1 Task 4 — this task is the
first time either gets used inside a form control. `border-gray-200` and `focus:ring-primary` stay
unchanged: the border is a neutral structural line with no semantic color token to map to, and
`ring-primary` already correctly uses the `--color-primary` token.)

Native `<select>` elements themselves stay — this is a re-tokening pass only, not a widget
replacement, per the design decision to keep native selects.

- [ ] **Step 5: Type-check, build, visual check**

Run: `npm run lint` — expected: no errors.
Run: `npm run build` — expected: succeeds.
Run: `npm run dev`. Confirm each of the 5 conservation states (find or temporarily note a product
of each state in `src/data.ts` if not all 5 are visible in the default catalog view) renders the
correct color: NOVO/BOM green, REGULAR yellow/warning, PESSIMO red, SUCATA gray. Confirm this in
both the card badge and the detail modal's badge. Confirm the three filter dropdowns still
function identically (selecting a category/secretaria/estado still filters the grid) and visually
still read as neutral form fields (no jarring color shift from the re-tokening).

- [ ] **Step 6: Commit**

```bash
git add src/components/Vitrine.tsx
git commit -m "style: map Vitrine's conservation-state badges and filter selects to DS-gov tokens"
```

---

### Task 2: `Button` and `Input` primitives across Vitrine

**Files:**
- Modify: `src/components/Vitrine.tsx` (imports; every hand-rolled `<button>`; the search `<input>`)

**Interfaces:**
- Consumes: `Button` (`src/components/Button.tsx`, Phase 3 Task 1) and `Input`
  (`src/components/Input.tsx`, Phase 3 Task 3) — both already built, unchanged by this task.
- Produces: nothing new for other tasks.

- [ ] **Step 1: Add imports**

At the top of `src/components/Vitrine.tsx`, add below the existing `lucide-react` import line:

```tsx
import Button from './Button';
import Input from './Input';
```

- [ ] **Step 2: "Resetar Busca" button**

Find:

```tsx
        <button 
          onClick={clearFilters}
          className="text-xs font-semibold text-primary-dark hover:text-emerald-600 flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-200 bg-gray-50 transition-all hover:bg-gray-100"
        >
          <RefreshCw className="h-3 w-3" />
          Resetar Busca
        </button>
```

Replace with:

```tsx
        <Button
          variant="tertiary"
          size="small"
          onClick={clearFilters}
          icon={<RefreshCw className="h-3 w-3" aria-hidden="true" />}
        >
          Resetar Busca
        </Button>
```

- [ ] **Step 3: Search input**

Find:

```tsx
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome do material, patrimônio, código CATMAT ou categoria... (ex: papel, monitor, cadeira)"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setDisplayLimit(6); // reset pagination when typing
            }}
            id="vitrine-search-input"
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
          />
        </div>
```

Replace with:

```tsx
        <Input
          label="Buscar bens ociosos"
          id="vitrine-search-input"
          type="text"
          placeholder="Buscar por nome do material, patrimônio, código CATMAT ou categoria... (ex: papel, monitor, cadeira)"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setDisplayLimit(6); // reset pagination when typing
          }}
          icon={<Search className="h-4 w-4" aria-hidden="true" />}
        />
```

`Input` always renders a visible `<label>` (DS-gov's own convention) — the previous version had no
visible label at all (only a `placeholder`), which was itself an accessibility gap the new
component fixes. If a visible "Buscar bens ociosos" label reads as redundant next to the icon and
placeholder, that's an intentional, correct behavior of adopting `Input`, not a bug to hide.

- [ ] **Step 4: Category shortcut pills**

Find:

```tsx
          <button
            onClick={() => setSelectedCategory(selectedCategory === '' ? '' : '')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              !selectedCategory ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Todos os Itens
          </button>
          {sortedCategorias.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(selectedCategory === cat ? '' : cat);
                setDisplayLimit(6);
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedCategory === cat ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
```

Replace with:

```tsx
          <Button
            variant={!selectedCategory ? 'primary' : 'tertiary'}
            size="small"
            onClick={() => setSelectedCategory('')}
          >
            Todos os Itens
          </Button>
          {sortedCategorias.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'primary' : 'tertiary'}
              size="small"
              onClick={() => {
                setSelectedCategory(selectedCategory === cat ? '' : cat);
                setDisplayLimit(6);
              }}
            >
              {cat}
            </Button>
          ))}
```

(The original "Todos os Itens" handler, `setSelectedCategory(selectedCategory === '' ? '' : '')`,
always resulted in `''` regardless of branch — simplified to the equivalent `setSelectedCategory('')`
directly. This is the same behavior, not a logic change.)

- [ ] **Step 5: Sidebar "Limpar" button**

Find:

```tsx
            {hasActiveFilters && (
              <button 
                onClick={clearFilters}
                className="text-xs text-red-600 hover:underline"
              >
                Limpar
              </button>
            )}
```

Replace with:

```tsx
            {hasActiveFilters && (
              <Button variant="tertiary" size="small" onClick={clearFilters}>
                Limpar
              </Button>
            )}
```

- [ ] **Step 6: Empty-state "Limpar Todos os Filtros" button**

Find:

```tsx
              <button
                onClick={clearFilters}
                className="mt-2 px-4 py-2 text-xs font-semibold bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                Limpar Todos os Filtros
              </button>
```

Replace with:

```tsx
              <Button variant="primary" onClick={clearFilters} className="mt-2">
                Limpar Todos os Filtros
              </Button>
```

- [ ] **Step 7: Card "Ver Detalhes" and "Reservar Item"/"Adicionado" buttons**

Find:

```tsx
                        <button
                          onClick={() => setDetailProduct(produto)}
                          className="px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Ver Detalhes
                        </button>
                        
                        <button
                          onClick={(e) => handleAddToCart(e, produto)}
                          disabled={isAlreadyInCart}
                          className={`px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                            isAlreadyInCart
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-not-allowed'
                              : 'bg-secondary hover:bg-secondary/90 text-white shadow-sm hover:shadow-md'
                          }`}
                        >
                          {isAlreadyInCart ? (
                            <>
                              <Check className="h-3.5 w-3.5" />
                              Adicionado
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="h-3.5 w-3.5" />
                              Reservar Item
                            </>
                          )}
                        </button>
```

Replace with:

```tsx
                        <Button
                          variant="tertiary"
                          size="small"
                          onClick={() => setDetailProduct(produto)}
                          icon={<Eye className="h-3.5 w-3.5" aria-hidden="true" />}
                        >
                          Ver Detalhes
                        </Button>

                        <Button
                          variant={isAlreadyInCart ? 'secondary' : 'primary'}
                          size="small"
                          onClick={(e) => handleAddToCart(e, produto)}
                          disabled={isAlreadyInCart}
                          icon={
                            isAlreadyInCart
                              ? <Check className="h-3.5 w-3.5" aria-hidden="true" />
                              : <ShoppingCart className="h-3.5 w-3.5" aria-hidden="true" />
                          }
                        >
                          {isAlreadyInCart ? 'Adicionado' : 'Reservar Item'}
                        </Button>
```

- [ ] **Step 8: "Carregar Mais Itens Ociosos" button**

Find:

```tsx
              <button
                onClick={() => setDisplayLimit((prev) => prev + 6)}
                className="px-6 py-3 bg-white hover:bg-gray-50 border-2 border-primary text-primary font-bold text-sm rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2"
              >
                Carregar Mais Itens Ociosos
                <ChevronRight className="h-4 w-4" />
              </button>
```

Replace with:

```tsx
              <Button variant="secondary" onClick={() => setDisplayLimit((prev) => prev + 6)}>
                Carregar Mais Itens Ociosos
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Button>
```

(`ChevronRight` stays a trailing child rather than using `Button`'s `icon` prop, since that prop
always renders before `children` — this button's icon is trailing, which `children` handles
directly without needing to extend `Button`'s API for one call site.)

- [ ] **Step 9: Type-check, build, real interaction check**

Run: `npm run lint` — expected: no errors.
Run: `npm run build` — expected: succeeds.
Run: `npm run dev`. Confirm: typing in the search input still filters in real time; clicking each
category pill still toggles the filter and shows the active state; "Limpar"/"Resetar
Busca"/"Limpar Todos os Filtros" all still clear filters; "Ver Detalhes" still opens the modal;
"Reservar Item" still adds to cart and shows "Adicionado" once added (button becomes disabled);
"Carregar Mais" still increases the displayed count. No console errors.

- [ ] **Step 10: Commit**

```bash
git add src/components/Vitrine.tsx
git commit -m "feat: migrate Vitrine's buttons and search input to Button/Input primitives"
```

---

### Task 3: Detail modal → `Modal` primitive, emoji → `lucide-react` icons

**Files:**
- Modify: `src/components/Vitrine.tsx` (imports; the entire `{detailProduct && (...)}` block)

**Interfaces:**
- Consumes: `Modal` (`src/components/Modal.tsx`, Phase 3 Task 5) — `{ open, onClose, title,
  children, footer }`.
- Consumes: `getEstadoBadge` from Task 1 (`.tone`/`.label`/`.desc` fields).

- [ ] **Step 1: Add imports**

Add below the existing imports:

```tsx
import Modal from './Modal';
```

Add `Leaf` and `Coins` to the existing `lucide-react` import line (replacing the emoji icons used
in the modal body):

```tsx
import { Search, Filter, ShoppingCart, RefreshCw, Layers, Check, ChevronRight, Eye, Building2, Info, ClipboardCopy, Leaf, Coins } from 'lucide-react';
```

- [ ] **Step 2: Replace the entire hand-rolled modal block**

Find the full block (from `{/* MODAL de Detalhes Completo */}` through its closing `)}`, currently
lines 436-547):

```tsx
      {/* MODAL de Detalhes Completo */}
      {detailProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-gray-200 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Header do Modal */}
            <div className="relative h-64 bg-gray-100">
              <img
                src={detailProduct.fotoUrl}
                alt={detailProduct.nome}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setDetailProduct(null)}
                className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-colors focus:outline-none"
                aria-label="Fechar Detalhes"
              >
                ✕
              </button>
              <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold shadow-md ${getEstadoBadge(detailProduct.estadoConservacao).tone}`}>
                {getEstadoBadge(detailProduct.estadoConservacao).label}
              </span>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6 flex flex-col gap-5">
              <div>
                <span className="text-xs font-mono font-bold text-gray-500 uppercase tracking-wider">
                  {detailProduct.categoria}
                </span>
                <h3 className="text-xl md:text-2xl font-bold text-primary font-display mt-0.5 leading-snug">
                  {detailProduct.nome}
                </h3>
                
                {/* Códigos Patrimoniais */}
                <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-600 bg-gray-50 border border-gray-150 p-2.5 rounded-lg font-mono">
                  <div className="flex items-center gap-1.5">
                    <ClipboardCopy className="h-3.5 w-3.5 text-gray-400" />
                    <span>Nº Patrimônio: <strong>{detailProduct.codigoPatrimonio}</strong></span>
                  </div>
                  <div className="h-3 w-[1px] bg-gray-300" />
                  <div>
                    <span>CATMAT: <strong>{detailProduct.codigoCatmat}</strong></span>
                  </div>
                </div>
              </div>

              {/* Descrição */}
              <div className="flex flex-col gap-1.5">
                <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Descrição do Item</h4>
                <p className="text-sm text-gray-700 leading-relaxed bg-gray-50/50 p-3.5 rounded-lg border border-gray-100">
                  {detailProduct.descricaoCompleta || "Sem descrição adicional disponível para este item ocioso."}
                </p>
              </div>

              {/* Informações de Origem e Métricas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-150 rounded-lg p-3 bg-gray-50 flex flex-col gap-1">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Secretaria Cedente</span>
                  <span className="text-xs font-bold text-primary">{detailProduct.secretariaOrigem}</span>
                  <span className="text-[10px] text-gray-500">O estoque e a entrega serão coordenados com este órgão municipal.</span>
                </div>

                <div className="border border-gray-150 rounded-lg p-3 bg-gray-50 flex flex-col gap-1">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Impacto do Reuso</span>
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    💚 Economia B2B: R$ {detailProduct.valorEstimadoNovo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    🌿 Carbono Evitado: {detailProduct.co2eEvitadoKg} kg CO₂e
                  </span>
                </div>
              </div>

              {/* Footer do Modal com Ações */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-150 mt-2">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Físico Disponível</span>
                  <span className="text-lg font-bold text-primary">{detailProduct.quantidade} unidades</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setDetailProduct(null)}
                    className="px-4 py-2 border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Voltar ao Catálogo
                  </button>
                  
                  <button
                    onClick={(e) => {
                      handleAddToCart(e, detailProduct);
                      setDetailProduct(null);
                    }}
                    disabled={cartProductIds.includes(detailProduct.id)}
                    className={`px-5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
                      cartProductIds.includes(detailProduct.id)
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-not-allowed'
                        : 'bg-secondary hover:bg-secondary/90 text-white shadow-sm'
                    }`}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {cartProductIds.includes(detailProduct.id) ? 'Já no Carrinho' : 'Reservar Item'}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
```

Replace with:

```tsx
      {/* MODAL de Detalhes Completo */}
      <Modal
        open={!!detailProduct}
        onClose={() => setDetailProduct(null)}
        title={detailProduct?.nome ?? ''}
        footer={
          detailProduct && (
            <>
              <Button variant="secondary" onClick={() => setDetailProduct(null)}>
                Voltar ao Catálogo
              </Button>
              <Button
                variant="primary"
                onClick={(e) => {
                  handleAddToCart(e, detailProduct);
                  setDetailProduct(null);
                }}
                disabled={cartProductIds.includes(detailProduct.id)}
                icon={<ShoppingCart className="h-4 w-4" aria-hidden="true" />}
              >
                {cartProductIds.includes(detailProduct.id) ? 'Já no Carrinho' : 'Reservar Item'}
              </Button>
            </>
          )
        }
      >
        {detailProduct && (
          <div className="flex flex-col gap-5">
            <div className="relative h-64 -m-6 mb-0 bg-gray-100">
              <img
                src={detailProduct.fotoUrl}
                alt={detailProduct.nome}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold shadow-md ${getEstadoBadge(detailProduct.estadoConservacao).tone}`}>
                {getEstadoBadge(detailProduct.estadoConservacao).label}
              </span>
            </div>

            <div>
              <span className="text-xs font-mono font-bold text-gray-500 uppercase tracking-wider">
                {detailProduct.categoria}
              </span>

              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-600 bg-gray-50 border border-gray-150 p-2.5 rounded-lg font-mono">
                <div className="flex items-center gap-1.5">
                  <ClipboardCopy className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
                  <span>Nº Patrimônio: <strong>{detailProduct.codigoPatrimonio}</strong></span>
                </div>
                <div className="h-3 w-[1px] bg-gray-300" />
                <div>
                  <span>CATMAT: <strong>{detailProduct.codigoCatmat}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Descrição do Item</h4>
              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50/50 p-3.5 rounded-lg border border-gray-100">
                {detailProduct.descricaoCompleta || "Sem descrição adicional disponível para este item ocioso."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-150 rounded-lg p-3 bg-gray-50 flex flex-col gap-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Secretaria Cedente</span>
                <span className="text-xs font-bold text-primary">{detailProduct.secretariaOrigem}</span>
                <span className="text-[10px] text-gray-500">O estoque e a entrega serão coordenados com este órgão municipal.</span>
              </div>

              <div className="border border-gray-150 rounded-lg p-3 bg-gray-50 flex flex-col gap-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Impacto do Reuso</span>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <Coins className="h-3.5 w-3.5" aria-hidden="true" />
                  Economia B2B: R$ {detailProduct.valorEstimadoNovo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <Leaf className="h-3.5 w-3.5" aria-hidden="true" />
                  Carbono Evitado: {detailProduct.co2eEvitadoKg} kg CO₂e
                </span>
              </div>
            </div>

            <div className="flex items-center pt-4 border-t border-gray-150 mt-2">
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Físico Disponível</span>
                <span className="text-lg font-bold text-primary">{detailProduct.quantidade} unidades</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
```

Notes on this replacement:
- `Modal`'s own header (title + close button) replaces the old custom `✕` close button and the
  `<h3>{detailProduct.nome}</h3>` — `title` is passed as a prop, `Modal` renders it inside
  `.br-modal-header`/`.modal-title` with the real `aria-labelledby` wiring already built in Phase 3.
  The product image moves to `-m-6 mb-0` to bleed to the edges of `Modal`'s `br-modal-body` padding,
  approximating the old edge-to-edge header photo.
- `Modal`'s `open` prop is `!!detailProduct` (boolean), but `children`/`footer` still need the full
  `Produto` object's fields — hence the `{detailProduct && (...)}` guard *inside* `children` and
  `footer`, even though `Modal` itself is always mounted (per its own implementation, `if (!open)
  return null` — so nothing renders when closed regardless of the inner guard).
- The physical-quantity footer info now sits inside `children` (just above where the removed custom
  footer used to be), since `Modal`'s `footer` prop is specifically for the action buttons row,
  matching the reference markup's `br-modal-footer` being action-only.
- 💚/🌿 emoji replaced with `Coins`/`Leaf` from `lucide-react`, consistent with this migration's
  icon policy.

- [ ] **Step 3: Type-check, build, real interaction check**

Run: `npm run lint` — expected: no errors.
Run: `npm run build` — expected: succeeds.
Run: `npm run dev`. Confirm: clicking "Ver Detalhes" (or the product name link) opens the modal
with the correct product's photo, badge, description, codes, and impact metrics (now with real
icons, not emoji). Confirm the modal's own focus-trap/Escape/backdrop-click/focus-restore
(inherited from `Modal`, already verified in Phase 3) all work here too. Confirm "Voltar ao
Catálogo" and the modal's own X button both close it. Confirm "Reservar Item" in the modal adds to
cart, shows "Já no Carrinho" once added, and disables.

- [ ] **Step 4: Commit**

```bash
git add src/components/Vitrine.tsx
git commit -m "feat: migrate Vitrine's detail modal to the Modal primitive, replace emoji with icons"
```

---

### Task 4: Toast anti-pattern fixes (motion, tokens)

**Files:**
- Modify: `src/components/Vitrine.tsx` (the toast `<div>` only)

**Interfaces:**
- Consumes: nothing from other tasks.

- [ ] **Step 1: Replace the toast's motion and colors**

Find:

```tsx
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-700 text-white px-5 py-3.5 rounded-lg shadow-xl border border-emerald-500 flex items-center gap-2 animate-bounce">
          <Check className="h-5 w-5 bg-emerald-900 rounded-full p-0.5 text-emerald-300" />
          <span className="font-medium text-sm">{toastMessage}</span>
        </div>
      )}
```

Replace with:

```tsx
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-50 bg-secondary text-on-secondary px-5 py-3.5 rounded-lg shadow-xl border border-secondary flex items-center gap-2 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-reduce:animate-none duration-300"
        >
          <Check className="h-5 w-5 bg-secondary-container rounded-full p-0.5 text-on-secondary-container" aria-hidden="true" />
          <span className="font-medium text-sm">{toastMessage}</span>
        </div>
      )}
```

- `bg-emerald-700`/`border-emerald-500` → `bg-secondary`/`border-secondary` (the existing
  `--color-secondary` token — Florianópolis's municipal green, established in Phase 1's Local
  Branding section — instead of ad hoc Tailwind emerald shades).
- `text-white` → `text-on-secondary` (the existing `--color-on-secondary` token, already `#ffffff`
  per `src/index.css`, so this is a same-value swap to the token-driven name).
- The `Check` icon's `bg-emerald-900`/`text-emerald-300` → `bg-secondary-container`/
  `text-on-secondary-container` (existing tokens already in `src/index.css`'s `@theme` block,
  unused until now — a matching darker/lighter pair for the icon's own background/foreground).
- `animate-bounce` (audit-flagged as jarring) → `motion-safe:animate-in motion-safe:fade-in
  motion-safe:slide-in-from-bottom-2 motion-reduce:animate-none duration-300` — Tailwind's built-in
  `motion-safe`/`motion-reduce` variants respect the `prefers-reduced-motion` media query
  automatically (no separate CSS media-query block needed), replacing the bounce with a calm
  fade+slide entrance, and no animation at all for users who've asked for reduced motion.
- Added `role="status"` (a real accessibility improvement for a transient notification —
  announces the message to screen readers without requiring focus, unlike the unmarked `<div>`
  before).
- `aria-hidden="true"` added to the decorative `Check` icon.

- [ ] **Step 2: Type-check, build, real interaction + reduced-motion check**

Run: `npm run lint` — expected: no errors.
Run: `npm run build` — expected: succeeds.
Run: `npm run dev`. Add an item to the cart, confirm the toast appears with the new colors and a
calm fade/slide entrance (not a bounce), and disappears after 3 seconds (`showToast`'s existing
`setTimeout`, unchanged). Then enable "prefers reduced motion" in your browser/OS settings (or
Chrome DevTools' Rendering tab → "Emulate CSS media feature prefers-reduced-motion: reduce") and
confirm the toast now appears with no animation at all — just present/absent, no motion.

- [ ] **Step 3: Commit**

```bash
git add src/components/Vitrine.tsx
git commit -m "fix: replace toast's animate-bounce with a reduced-motion-aware transition, re-token colors"
```
