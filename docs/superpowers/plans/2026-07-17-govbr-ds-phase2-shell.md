# DS-gov Migration — Phase 2: Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `Header.tsx` on real `@govbr-ds/core` markup (header, off-canvas mobile menu) and
extract the existing inline footer out of `App.tsx` into a `Footer.tsx` built on `br-footer`
markup, resolving the half-migrated look Phase 1 left behind.

**Architecture:** `BRHeader` and `BRMenu` are imported as plain ES modules (`export default
BRHeader` / `export default BRMenu`, confirmed from the installed package's unminified source —
NOT the 232KB UMD `core.min.js` bundle) and instantiated once via a `useEffect` + `useRef` guard.
Desktop navigation stays a persistent `br-button` row (Tailwind `hidden lg:flex` for the
breakpoint only); mobile uses DS-gov's real off-canvas `br-menu`, opened by the header's hamburger
button via DS-gov's own `data-toggle="menu" data-target="#main-navigation"` convention.

**Tech Stack:** React 19, Vite 6, Tailwind CSS 4, `@govbr-ds/core@3.7.0` (already installed in
Phase 1), `lucide-react`.

## Global Constraints

- No test runner in this repo. Verification is `npm run lint` (`tsc --noEmit`), `npm run build`,
  and manual visual/interaction checks via `npm run dev`.
- Icons stay `lucide-react` — do not add Font Awesome. DS-gov's reference markup's `<i class="fas
  fa-*">` tags are replaced with `lucide-react` `<Icon />` components in the same DOM slots.
  [spec: Decision 2]
- Cards, filters, and buttons inside Vitrine/Carrinho/AvisosCompras/Relatorios/WorkflowManager are
  explicitly **out of scope** — Phase 3/4, separate plans. [spec: Out of Scope]
- No change to business logic (cart state, workflow states, routing/tab-switching mechanics
  itself). [spec: Out of Scope]
- **Correction to the design spec, found while reading the actual code**: the spec's Decision 5
  said "the app currently has none" about the footer — that's wrong. `App.tsx:290-350` already has
  a real, three-column footer (Prefeitura/SMA info, Marco Regulatório compliance list, Links de
  Transparência) with genuine content, not filler. Task 2 below extracts and restructures that
  *existing* content onto `br-footer` markup — it does not invent a new footer from scratch.
- **`BRHeader`/`BRMenu` have no `destroy()`/teardown method** (verified: read both classes' full
  source in `node_modules/@govbr-ds/core/dist/components/{header,menu}/{header,menu}.js` —
  neither exposes any public method beyond the constructor; all listeners are private closures
  with no removal path). The `useRef` initialization guard in Task 1 exists specifically to stop
  React 19 StrictMode's dev-only double-invoke from constructing two live instances of each class
  — verified this is a real bug, not a theoretical one: `BRMenu`'s hamburger click handler checks
  `this.component.classList.contains('active')` to decide open-vs-close, so two independently
  registered click listeners on the same button would race — the first opens (adds `active`), the
  second sees `active` already present and immediately closes.
- **Verified required DOM attributes** (both classes dereference these without a null check, so
  their absence is a hard crash, not a soft failure): `BRHeader` requires an element matching
  `[data-target="#main-navigation"]` to exist inside its root at construction time. `BRMenu`
  requires a `.menu-body` element inside its root. Both are present in every task below — do not
  remove them even if a future visual pass wants to.
- Real DS-gov button variant classes (verified from `components/button/examples/button-emphasys.html`):
  `br-button primary`, `br-button secondary`, `br-button` (no modifier = tertiary/default). No
  other variant names exist in that reference.

---

### Task 1: Rebuild Header.tsx on `@govbr-ds/core` markup

**Files:**
- Modify: `src/components/Header.tsx` (full rewrite)

**Interfaces:**
- Consumes: `HeaderProps` (`currentTab: string`, `setTab: (tab: string) => void`, `cartCount:
  number`) — unchanged from the current component, so `App.tsx`'s existing `<Header
  currentTab={activeTab} setTab={setActiveTab} cartCount={cart.length} />` call needs no changes.
- Produces: nothing new consumed by other tasks — Task 2 doesn't touch `Header.tsx`.

- [ ] **Step 1: Replace the full contents of `src/components/Header.tsx`**

```tsx
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Package2, ShoppingCart, BarChart3, ShieldAlert, FileText, Menu, X, Landmark, UserCheck, Search } from 'lucide-react';
import BRHeader from '@govbr-ds/core/dist/components/header/header.js';
import BRMenu from '@govbr-ds/core/dist/components/menu/menu.js';

interface HeaderProps {
  currentTab: string;
  setTab: (tab: string) => void;
  cartCount: number;
}

const NAV_ITEMS = [
  { id: 'vitrine', label: 'Vitrine Virtual', icon: Package2 },
  { id: 'carrinho', label: 'Carrinho', icon: ShoppingCart },
  { id: 'requisicoes', label: 'Requisições', icon: FileText },
  { id: 'trava', label: 'Trava Sistêmica', icon: ShieldAlert },
  { id: 'placar', label: 'Placar & Relatórios', icon: BarChart3 },
];

export default function Header({ currentTab, setTab, cartCount }: HeaderProps) {
  const headerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const dsInitialized = useRef(false);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    if (dsInitialized.current) return;
    if (!headerRef.current || !menuRef.current) return;
    dsInitialized.current = true;
    // BRHeader/BRMenu expose no destroy()/teardown method (verified from source), so
    // there is nothing to return as effect cleanup. The dsInitialized ref guard exists
    // to stop StrictMode's dev-only double-invoke from constructing two live instances.
    new BRHeader('header', headerRef.current);
    new BRMenu('menu', menuRef.current);
  }, []);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Phase 2 scope: search switches to the Vitrine tab. Passing the typed term into
    // Vitrine's own filter state is Phase 4 work, when Vitrine.tsx itself is migrated.
    setTab('vitrine');
  };

  const cartLabel = `${cartCount} ${cartCount === 1 ? 'item' : 'itens'} no carrinho`;

  return (
    <>
      {/* Barra de Identificação Institucional superior do gov.br */}
      <div className="bg-primary-dark text-[11px] font-sans border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex justify-between items-center opacity-90 text-white">
          <div className="flex items-center gap-3">
            <span className="font-bold tracking-wider text-amber-400">BR</span>
            <div className="w-[1px] h-3 bg-white/30" />
            <a href="https://www.gov.br" target="_blank" rel="noopener noreferrer" className="hover:underline">Portal do Governo Brasileiro</a>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline">Serviços Municipais</span>
            <span className="font-semibold text-emerald-400">● PMF Ativa</span>
          </div>
        </div>
      </div>

      <header ref={headerRef} className="br-header" data-sticky>
        <div className="container-lg">
          <div className="header-top">
            <div className="header-logo">
              <Landmark className="h-6 w-6 text-primary" aria-hidden="true" />
              <span className="br-divider vertical mx-1" />
              <div className="header-sign">Prefeitura de Florianópolis</div>
            </div>
            <div className="header-actions">
              <div className="header-search-trigger">
                <button className="br-button circle" type="button" aria-label="Abrir Busca" data-toggle="search" data-target=".header-search">
                  <Search className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <div className="header-login">
                <div className="header-avatar flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-primary flex items-center gap-1 justify-end font-semibold">
                      <UserCheck className="h-3 w-3" /> Requisitante / Cedente
                    </div>
                    <div className="text-xs font-medium text-gray-700 max-w-[150px] truncate">Maurício Alexandre</div>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary flex items-center justify-center font-bold text-primary text-sm">
                    MA
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="header-bottom">
            <div className="header-menu">
              <div className="header-menu-trigger">
                <button className="br-button circle" type="button" aria-label="Abrir menu de navegação" aria-controls="main-navigation" data-toggle="menu" data-target="#main-navigation">
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <div className="header-info">
                <div className="header-title">Bolsa de Materiais</div>
                <div className="header-subtitle">Reaproveitamento entre almoxarifados municipais</div>
              </div>
            </div>
            <div className="header-search">
              <form className="br-input has-icon" onSubmit={handleSearchSubmit}>
                <label htmlFor="header-search-input">Texto da pesquisa</label>
                <input
                  id="header-search-input"
                  type="text"
                  placeholder="O que você procura?"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
                <button className="br-button circle small" type="submit" aria-label="Pesquisar">
                  <Search className="h-4 w-4" aria-hidden="true" />
                </button>
              </form>
              <button className="br-button circle search-close ml-1" type="button" aria-label="Fechar Busca" data-dismiss="search">
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {/* Navegação Desktop persistente — decisão de design deliberada: DS-gov usa
                apenas menu off-canvas, mas essas 5 seções são usadas o tempo todo
                (ver Phase 2 design spec, Decisão 3). Off-canvas é usado no mobile abaixo. */}
            <nav className="hidden lg:flex items-center gap-2 ml-4" aria-label="Navegação principal">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTab(item.id)}
                    className={`br-button ${isActive ? 'primary' : ''} small`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    <span>{item.label}</span>
                    {item.id === 'carrinho' && cartCount > 0 && (
                      <span
                        className="bg-red-500 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ml-1"
                        aria-label={cartLabel}
                      >
                        {cartCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Menu off-canvas (mobile). Sibling of <header>, not nested inside it — matches
          DS-gov's own reference structure, connected only via #main-navigation /
          data-target="#main-navigation". */}
      <div className="br-menu" id="main-navigation" ref={menuRef}>
        <div className="menu-container">
          <div className="menu-panel">
            <div className="menu-header">
              <div className="menu-title">
                <Landmark className="h-5 w-5 text-primary" aria-hidden="true" />
                <span>Bolsa de Materiais</span>
              </div>
              <div className="menu-close">
                <button className="br-button circle" type="button" aria-label="Fechar o menu" data-dismiss="menu">
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
            <nav className="menu-body" role="tree">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.id}
                    className="menu-item"
                    href="#"
                    role="treeitem"
                    onClick={(e) => {
                      e.preventDefault();
                      setTab(item.id);
                    }}
                  >
                    <span className="icon"><Icon className="h-4 w-4" aria-hidden="true" /></span>
                    <span className="content">{item.label}</span>
                    {item.id === 'carrinho' && cartCount > 0 && (
                      <span
                        className="bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full ml-2"
                        aria-label={cartLabel}
                      >
                        {cartCount}
                      </span>
                    )}
                  </a>
                );
              })}
            </nav>
          </div>
          <div className="menu-scrim" data-dismiss="menu" tabIndex={0} />
        </div>
      </div>
    </>
  );
}
```

This removes the old `mobileMenuOpen` React state entirely — `BRMenu` now owns opening/closing by
toggling the `active` class directly on its own root DOM node (verified from `menu.js`'s
`_openMenu`/`_closeMenu`), bypassing React state for that concern on purpose.

- [ ] **Step 2: Type-check**

Run: `npm run lint`

Expected: no errors. If TypeScript complains about the untyped `.js` imports
(`@govbr-ds/core/dist/components/header/header.js` / `.../menu/menu.js`), that means
`allowJs`/implicit-any isn't permissive enough as currently configured — in that case, add a
minimal ambient module declaration rather than changing `tsconfig.json`'s strictness project-wide.
Create `src/govbr-ds.d.ts`:

```ts
declare module '@govbr-ds/core/dist/components/header/header.js' {
  export default class BRHeader {
    constructor(name: string, component: HTMLElement);
  }
}
declare module '@govbr-ds/core/dist/components/menu/menu.js' {
  export default class BRMenu {
    constructor(name: string, component: HTMLElement);
  }
}
```

Only add this file if Step 2's `npm run lint` actually fails without it — don't add it
speculatively if the existing `allowJs: true` config already lets it through cleanly.

- [ ] **Step 3: Build**

Run: `npm run build`

Expected: succeeds.

- [ ] **Step 4: Visual and interaction smoke test**

Run: `npm run dev`, open the app in a browser.

Verify all of the following (this task's real acceptance criteria — it's testable, not just
"renders"):
- Desktop (`lg` and up): the 5 nav tabs show as a persistent row, active tab visually distinct
  (`br-button primary` vs `br-button`), clicking switches tabs correctly.
- Narrow viewport (below `lg`): the persistent nav row is hidden; the hamburger button is visible.
- Click the hamburger button: the off-canvas menu opens, showing the same 5 items.
- Click a mobile menu item: the tab switches AND the menu closes (verify both — closing is
  `BRMenu`'s own behavior, not something this code implements manually).
- Click the menu's own close button (X) and separately click the scrim/backdrop: both close the
  menu.
- Click the header search icon: the search input reveals. Type something and press Enter: the tab
  switches to Vitrine (per this task's documented scope boundary — actual filtering is Phase 4).
- Click the search close button: search input hides again.
- Cart badge: add an item to the cart (via the Vitrine tab), confirm the badge count appears on
  both the desktop nav row and the mobile menu's Carrinho item.
- Open the browser console: confirm no errors, and specifically no duplicate-registration
  symptoms (e.g. the mobile menu opening and instantly closing again — the StrictMode
  double-construction bug this task's `dsInitialized` guard exists to prevent).

- [ ] **Step 5: Commit**

```bash
git add src/components/Header.tsx
git commit -m "feat: rebuild Header on @govbr-ds/core markup (br-header, off-canvas br-menu)"
```

---

### Task 2: Extract Footer.tsx onto `br-footer` markup, add skip-link

**Files:**
- Create: `src/components/Footer.tsx`
- Modify: `src/App.tsx` (remove the inline `<footer>` at lines 290-350, render `<Footer />`
  instead; add a skip-link; add `id="main-content"` to `<main>`)

**Interfaces:**
- Produces: `Footer` — a zero-prop component (`export default function Footer()`), consumed by
  `App.tsx`.

- [ ] **Step 1: Create `src/components/Footer.tsx`**

This preserves the actual existing content from `App.tsx`'s current footer (Prefeitura/SMA info,
Marco Regulatório compliance list, Links de Transparência, copyleft bar) restructured onto
`br-footer` markup — it is not new content. No `footer.js` import: this footer has no
mobile-collapsible categories (the reference's accordion-style category headers don't apply to 3
short, always-visible blocks), so no JS instantiation is needed for it.

```tsx
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Landmark, ShieldCheck, Scale, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="br-footer mt-auto">
      <div className="container-lg">
        <div className="logo flex items-center gap-2">
          <Landmark className="h-5 w-5" aria-hidden="true" />
          <span className="font-bold uppercase tracking-wider text-sm">Prefeitura de Florianópolis</span>
        </div>
        <div className="br-list horizontal">
          <div className="col-4">
            <div className="br-item header">
              <div className="content text-down-01 text-bold text-uppercase">Prefeitura</div>
            </div>
            <div className="br-list">
              <div className="br-item">
                <div className="content text-down-01">
                  Secretaria Municipal de Administração (SMA)<br />
                  Diretoria de Patrimônio e Gestão de Almoxarifados Públicos.
                </div>
              </div>
              <div className="br-item">
                <span className="text-down-01 text-bold">Desafio 14 - PoC TRL3</span>
              </div>
            </div>
          </div>
          <div className="col-4">
            <div className="br-item header">
              <div className="content text-down-01 text-bold text-uppercase">Marco Regulatório</div>
            </div>
            <div className="br-list">
              <div className="br-item">
                <span className="icon"><ShieldCheck className="h-4 w-4" aria-hidden="true" /></span>
                <div className="content text-down-01">Lei Federal nº 14.133/2021 (Nova Lei de Licitações)</div>
              </div>
              <div className="br-item">
                <span className="icon"><Scale className="h-4 w-4" aria-hidden="true" /></span>
                <div className="content text-down-01">Decreto Estadual nº 45.242/2009 (Estado de Conservação)</div>
              </div>
              <div className="br-item">
                <span className="icon"><Globe className="h-4 w-4" aria-hidden="true" /></span>
                <div className="content text-down-01">eMAG &amp; WCAG 2.1 AA (Acessibilidade Digital)</div>
              </div>
            </div>
          </div>
          <div className="col-4">
            <div className="br-item header">
              <div className="content text-down-01 text-bold text-uppercase">Links de Transparência</div>
            </div>
            <div className="br-list">
              <a className="br-item" href="#" onClick={(e) => e.preventDefault()}>
                <div className="content text-down-01">Acessibilidade</div>
              </a>
              <a className="br-item" href="#" onClick={(e) => e.preventDefault()}>
                <div className="content text-down-01">Dados Abertos</div>
              </a>
              <a className="br-item" href="#" onClick={(e) => e.preventDefault()}>
                <div className="content text-down-01">Privacidade</div>
              </a>
              <a className="br-item" href="#" onClick={(e) => e.preventDefault()}>
                <div className="content text-down-01">Termos de Uso</div>
              </a>
              <a className="br-item" href="#" onClick={(e) => e.preventDefault()}>
                <div className="content text-down-01">Ouvidoria</div>
              </a>
              <a className="br-item" href="#" onClick={(e) => e.preventDefault()}>
                <div className="content text-down-01">Portal de Compras</div>
              </a>
            </div>
          </div>
        </div>
      </div>
      <span className="br-divider my-3" />
      <div className="container-lg">
        <div className="info">
          <div className="text-down-01 text-medium pb-3">
            © 2026 Prefeitura Municipal de Florianópolis. Todos os direitos reservados.<br />
            Desenvolvido no âmbito da 1ª Jornada Incubintech de Inovação Aberta.
          </div>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Wire `Footer` into `App.tsx`, remove the old inline footer, add a skip-link**

In `src/App.tsx`, add the import near the other component imports (below the `Header` import):

```tsx
import Footer from './components/Footer';
```

Replace the entire inline `<footer className="bg-primary-dark ...">...</footer>` block (currently
`App.tsx` lines 290-350, from `{/* Rodapé Oficial da Prefeitura de Florianópolis gov.br DS */}`
through its closing `</footer>`) with:

```tsx
      <Footer />
```

Add a skip-link as the first child inside the root `<div>`, immediately before the institutional
bar / `<Header />`, and add `id="main-content"` to the `<main>` element so the skip-link has a
real target:

```tsx
    <div className="min-h-screen flex flex-col bg-background text-on-background">

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-md"
      >
        Pular para o conteúdo principal
      </a>

      {/* Header oficial gov.br DS e PMF */}
      <Header
        currentTab={activeTab}
        setTab={setActiveTab}
        cartCount={cart.length}
      />

      {/* Main Container */}
      <main id="main-content" className="flex-grow max-w-7xl w-full mx-auto px-4 py-8 md:py-10">
```

(Only the `<a>` skip-link block and the `id="main-content"` addition on `<main>` are new here —
everything else in that region of `App.tsx` is unchanged.)

Also remove the now-unused `Landmark, Info, MessageSquareCode, ShieldCheck, Scale, Globe` icon
imports from `App.tsx`'s `lucide-react` import line if `Landmark` and the others are no longer
referenced directly in `App.tsx` after the footer is removed — check with `grep -n
"Landmark\|ShieldCheck\|Scale\|Globe\|Info\|MessageSquareCode" src/App.tsx` after Step 2's edit and
delete whichever of those six names have zero remaining matches from the `lucide-react` import
line.

- [ ] **Step 3: Type-check**

Run: `npm run lint`

Expected: no errors, including no "declared but never read" warnings on the `lucide-react` import
line in `App.tsx` (resolved by the cleanup at the end of Step 2).

- [ ] **Step 4: Build**

Run: `npm run build`

Expected: succeeds.

- [ ] **Step 5: Visual smoke test**

Run: `npm run dev`. Confirm: the footer renders at the bottom of every tab with all three content
blocks (Prefeitura, Marco Regulatório, Links de Transparência) and the copyleft line, styled by
`br-footer`'s CSS rather than the old hand-rolled dark bar. Confirm the skip-link: press Tab once
from the very top of the page (click the address bar first, then Tab) — a "Pular para o conteúdo
principal" link should become visible, and activating it (Enter) should move focus to `<main>`.

- [ ] **Step 6: Commit**

```bash
git add src/components/Footer.tsx src/App.tsx
git commit -m "feat: extract Footer onto br-footer markup, add skip-link"
```

---

## Post-Implementation (not a coded task)

- [x] Run `/impeccable audit` — per the parent design spec's Phase 2 checkpoint.

  Result: 11/20 (Acceptable), up from Phase 1's 10/20. Skip-link and cart `aria-label` findings
  from Phase 1 are resolved. Most remaining findings are correctly `[Deferred-to-pages]` (modal
  ARIA, `gray-400` contrast, anti-pattern tells — all pre-existing, unaffected by this phase). Five
  findings were tagged `[Shell-scope]` — things this phase's own Header/Footer/App.tsx work should
  have gotten right — and get a follow-up Task 3 below.

---

### Task 3: Fix Shell-scope audit findings (aria-expanded, focus trap, h1, badge contrast, dead tab-stop)

**Files:**
- Modify: `src/components/Header.tsx`
- Modify: `src/index.css` (add `--color-error`/`--color-on-error` tokens)

**Interfaces:**
- Consumes: nothing new from earlier tasks.
- Produces: `--color-error`/`--color-on-error` tokens, consumed only within this task (cart badge)
  but available for later phases' rejection/delete UI (`Carrinho.tsx`, `WorkflowManager.tsx`,
  `AvisosCompras.tsx` all currently hardcode raw reds — out of scope to touch here, but the token
  now exists for when those files get migrated).

- [ ] **Step 1: Add error/danger tokens**

In `src/index.css`, in the `@theme` block, add these two lines directly after the existing
`--color-state-sucata: #737373;` line:

```css
  --color-error: #dc2626;
  --color-on-error: #ffffff;
```

`#dc2626` (Tailwind's `red-600`) computes to ≈4.9:1 against white, passing WCAG AA (verified
during the audit that flagged this) — unlike the `red-500` (`#ef4444`, ≈3.76:1) currently used for
the cart badge.

- [ ] **Step 2: Fix cart badge contrast using the new token**

In `src/components/Header.tsx`, both cart-badge `<span>` elements currently use
`bg-red-500 text-white`. Replace `bg-red-500` with `bg-error` and `text-white` with `text-on-error`
in both places (the desktop nav row's badge and the mobile menu item's badge).

- [ ] **Step 3: Promote the header title to a real `<h1>`**

In `src/components/Header.tsx`, the `header-info` block currently has:

```tsx
              <div className="header-info">
                <div className="header-title">Bolsa de Materiais</div>
                <div className="header-subtitle">Reaproveitamento entre almoxarifados municipais</div>
              </div>
```

Change `<div className="header-title">` to `<h1 className="header-title">` (closing tag too).
DS-gov's `.header-title` CSS class controls the visual appearance independent of tag name, but
verify this visually in Step 7 below — if the browser's default `<h1>` styling (bold weight, extra
margin, larger font-size) visibly clashes with `.header-title`'s intended look, add an inline
override (e.g. `style={{ margin: 0, font: 'inherit' }}`) rather than reverting to a `<div>`, since
the goal is a real semantic heading, not just visual preservation.

- [ ] **Step 4: Wire real `aria-expanded` to the hamburger and search triggers**

`BRHeader`/`BRMenu` manage open/close state via direct DOM class toggling from multiple paths
(click, Escape, scrim, X button, and this plan's own Task 1 fix for item-click) — trying to mirror
that with React state would desync from whichever path the library itself handles. Instead, use a
`MutationObserver` to watch the actual DOM state and reflect it onto the trigger buttons' `aria-expanded`, which stays correct regardless of which path caused the change.

Add refs for both trigger buttons. In the `<button>` with `data-toggle="menu"` (the hamburger),
add `ref={menuTriggerRef}`. In the `<button>` with `data-toggle="search"` (the search icon), add
`ref={searchTriggerRef}`.

Add these two ref declarations near the existing `headerRef`/`menuRef`/`dsInitialized` refs:

```tsx
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const searchTriggerRef = useRef<HTMLButtonElement>(null);
```

Add a second `useEffect` (separate from the existing DS-gov init effect) that observes both:

```tsx
  useEffect(() => {
    const menuEl = menuRef.current;
    const menuTrigger = menuTriggerRef.current;
    const searchEl = headerRef.current?.querySelector('.header-search');
    const searchTrigger = searchTriggerRef.current;
    if (!menuEl || !menuTrigger || !searchEl || !searchTrigger) return;

    menuTrigger.setAttribute('aria-expanded', menuEl.classList.contains('active') ? 'true' : 'false');
    searchTrigger.setAttribute('aria-expanded', searchEl.classList.contains('active') ? 'true' : 'false');

    const menuObserver = new MutationObserver(() => {
      menuTrigger.setAttribute('aria-expanded', menuEl.classList.contains('active') ? 'true' : 'false');
    });
    menuObserver.observe(menuEl, { attributes: true, attributeFilter: ['class'] });

    const searchObserver = new MutationObserver(() => {
      searchTrigger.setAttribute('aria-expanded', searchEl.classList.contains('active') ? 'true' : 'false');
    });
    searchObserver.observe(searchEl, { attributes: true, attributeFilter: ['class'] });

    return () => {
      menuObserver.disconnect();
      searchObserver.disconnect();
    };
  }, []);
```

This is a plain `MutationObserver` created and owned entirely by this component (not by
`BRHeader`/`BRMenu`), so its cleanup function is real and safe to run on every unmount — unlike the
DS-gov classes themselves, there is no "no destroy method" problem here.

- [ ] **Step 5: Add a focus trap to the open off-canvas menu**

`BRMenu`'s own JS (verified from source in Task 1's review) handles Escape and Arrow-key
navigation but never constrains Tab within the open panel — a keyboard user can Tab past the last
menu item onto page content hidden behind the scrim. Add a third `useEffect`:

```tsx
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const menuEl = menuRef.current;
      if (e.key !== 'Tab' || !menuEl || !menuEl.classList.contains('active')) return;
      const focusable = menuEl.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
```

- [ ] **Step 6: Remove the dead tab-stop on the menu scrim**

The `menu-scrim` div currently has `tabIndex={0}`, but `BRMenu`'s dismiss handling is click-only
(verified from source) — a keyboard user who tabs onto it and presses Enter/Space gets no
response. Remove the `tabIndex={0}` prop from the `<div className="menu-scrim" ...>` element
entirely (keep `data-dismiss="menu"` — that's what makes the scrim clickable-to-close, unrelated
to the dead tab-stop issue).

- [ ] **Step 7: Type-check, build, and verify**

Run: `npm run lint` — expected: no errors.
Run: `npm run build` — expected: succeeds.
Run: `npm run dev` and verify:
- The `<h1>` renders visually the same as the old `<div>` did (or, if browser default `<h1>`
  styling leaks through, confirm your Step 3 override neutralizes it — check computed
  font-weight/margin/font-size in devtools).
- Open the mobile menu (hamburger button): its `aria-expanded` flips to `"true"` in the DOM;
  closing it via the X button, Escape, the scrim, or clicking a nav item (all four paths) flips it
  back to `"false"`.
- Open the search panel: same `aria-expanded` check on the search trigger button, opening and
  closing.
- With the mobile menu open, press Tab repeatedly from the first focusable element inside it:
  focus should cycle back to the first element after the last, never escaping onto the page behind
  the scrim. Shift+Tab from the first element should wrap to the last.
- Cart badge: add an item to the cart, confirm the badge now renders with the darker red
  (`bg-error`/`#dc2626`) instead of the previous brighter red.

- [ ] **Step 8: Commit**

```bash
git add src/components/Header.tsx src/index.css
git commit -m "fix: address Shell-scope audit findings (aria-expanded, focus trap, h1, badge contrast)"
```

## Post-Task-3 Checkpoint (not a coded task)

- [ ] Re-run `/impeccable audit` if useful to confirm the score improvement, but this is optional
  — the fixes above are individually verifiable via Step 7, not dependent on a re-audit to prove
  they work.
