# DS-gov Migration — Phase 2: Shell (Header + Footer) — Design Spec

Date: 2026-07-17
Branch: `feature/gov-ds-migration`
Parent spec: `docs/superpowers/specs/2026-07-17-govbr-ds-migration-design.md` (Phase 2 — Shell)

## Goal

Rebuild `src/components/Header.tsx` on real gov.br Design System (`@govbr-ds/core@3.7.0`) markup
and add a footer (the app currently has none), resolving the half-migrated look Phase 1
(Foundation) left behind — DS-gov's CSS reset now applies globally, but no component markup uses
its actual classes yet. This is scoped to the shell only; cards/filters/buttons inside
Vitrine/Carrinho/etc. are Phase 3 (Primitives) and Phase 4 (Pages), not this plan.

## Research Basis

Real markup and module structure were read directly from the installed package
(`node_modules/@govbr-ds/core@3.7.0/dist/components/{header,footer,menu}/examples/*.html` and the
unminified `header.js`/`menu.js`), not guessed or reconstructed from documentation summaries:

- `header.js` and `menu.js` are plain ES modules (`export default BRHeader` / `export default
  BRMenu`), separate from the 232KB `core.min.js` bundle — `header.min.js` is 4.2KB, `menu.min.js`
  is 8.9KB. `core.min.css` (already loaded in Phase 1) already contains `.br-header`/`.br-menu`/
  `.br-footer` rules (grep-confirmed) — no new CSS import needed.
- Reference markup for `br-header`, `br-menu` (both `push` and default off-canvas variants), and
  `br-footer` uses Font Awesome icon classes (`<i class="fas fa-*">`) throughout, and DS-gov's menu
  component is toggle-only (hidden by default) at every viewport — there is no persistent
  always-visible horizontal nav bar in the DS-gov component set.

## Decisions (from brainstorming)

1. **JS integration**: import `BRHeader` and `BRMenu` directly as ES modules from
   `@govbr-ds/core/dist/components/{header,menu}/header.js` / `menu.js` — not the `core.min.js`
   UMD bundle Task 1 originally loaded (and the final Phase 1 review already removed, since
   nothing consumed it). This avoids global `window.core` pollution, the bundle's demo-init side
   effects, and most of the StrictMode double-invoke risk the original spec flagged, since each
   class is instantiated explicitly in a scoped `useEffect` with its own cleanup.
2. **Icons**: keep `lucide-react` (already installed, already used everywhere). DS-gov's reference
   `<i class="fas fa-*">` tags are replaced with `<Icon />` components from `lucide-react` in the
   same DOM slots — no Font Awesome dependency added.
3. **Navigation**: the 5 tabs (Vitrine, Carrinho, Requisições, Trava Sistêmica, Placar) stay
   persistently visible on desktop (`lg:` and up) as a `br-button` row — a deliberate deviation
   from DS-gov's toggle-only menu, since these sections are used constantly and hiding them would
   be a real workflow regression. On mobile, the same 5 items render inside DS-gov's actual
   off-canvas `br-menu` (`id="main-navigation"`), triggered by the header's hamburger button using
   DS-gov's real `data-toggle="menu" data-target="#main-navigation"` pattern — matching the
   reference exactly at the viewport where it's the standard anyway.
4. **Header extras**: DS-gov's reference "quick access" and "system functionalities" dropdowns are
   dropped (generic filler, no real content for this app). The search trigger/input is kept, wired
   to the Vitrine catalog (the app's actual search surface). The `header-login`/`header-avatar`
   slot is repurposed to hold the existing name/role chip — no "Entrar" (sign-in) button, since the
   user is already authenticated in this app's context.
5. **Footer** (new — doesn't exist today): minimal `br-footer`, trimmed to Secretaria/city-hall
   branding, a link to the gov.br portal, and a help/support link. No social-media icons, no 6
   fake link columns from the reference — those are built for public ministry sites, not an
   internal tool.

## Component Structure

### Header.tsx (rebuilt)

- Top institutional bar ("BR" mark, Portal do Governo link, "PMF Ativa") — kept as-is, it's a
  custom addition above `br-header` itself, not part of the DS-gov component; only its colors get
  re-tokened (already mostly done in Phase 1's primary-color Task 2).
- `header-top > header-logo`: Florianópolis "Landmark" `lucide-react` icon + "Bolsa de Materiais"
  title (drop the reference's base64 `<img>` logo slot — this app doesn't have a raster logo).
- `header-top > header-actions`: search trigger/input (wired to Vitrine), `header-login >
  header-avatar` repurposed for the name/role chip. Quick-access and functionalities dropdowns
  dropped.
- `header-bottom > header-menu > header-menu-trigger`: hamburger button (`data-toggle="menu"
  data-target="#main-navigation"`) — DS-gov's real pattern, opens the mobile `br-menu`.
- Desktop nav (custom, not literally DS-gov's off-canvas menu): the 5 tabs as a `br-button` row,
  `hidden lg:flex` (Tailwind utility — layout only, per the cascade-layer rule from Phase 1: DS-gov
  owns the `br-button` element styling, Tailwind owns the show/hide breakpoint).

### New: Footer.tsx

New file. Minimal `br-footer` per Decision 5 above.

### New: MobileMenu (or inline in Header.tsx — decided in the implementation plan)

DS-gov's off-canvas `br-menu`, `id="main-navigation"`, containing the same 5 nav items as
`menu-item` elements with `lucide-react` icons, plus `menu-scrim` for the backdrop and the
close button (`data-dismiss="menu"`) — replacing the current hand-rolled mobile dropdown
(`mobileMenuOpen` state + conditional `<div>` in `Header.tsx`).

## JS Wrapper Pattern

```ts
useEffect(() => {
  const headerEl = headerRef.current;
  const menuEl = menuRef.current;
  if (!headerEl || !menuEl) return;
  const header = new BRHeader('header', headerEl);
  const menu = new BRMenu('menu', menuEl);
  return () => {
    header.destroy?.();
    menu.destroy?.();
  };
}, []);
```

(Exact teardown method name — `destroy()` or otherwise — gets confirmed against `header.js`'s
actual public methods during implementation, not assumed here.)

## Accessibility (carried over from the parent spec's gate)

- Skip-to-content link (doesn't exist today) — added here since Header is the natural place for it.
- Hamburger button gets `aria-expanded`/`aria-controls` (currently missing, audit-flagged in
  Phase 1's checkpoint).
- Cart count badge gets an `aria-label` announcing "N items" (currently just a visual number,
  audit-flagged).
- Mobile `br-menu` keyboard/focus behavior comes from DS-gov's own `BRMenu` class — verify it
  actually traps focus and supports Escape during implementation rather than assuming.

## Out of Scope

- Cards, filters, and buttons inside Vitrine/Carrinho/AvisosCompras/Relatorios/WorkflowManager —
  Phase 3 (Primitives) and Phase 4 (Pages), separate specs/plans.
- Any change to business logic (cart state, workflow states, routing).

## Verification

- `npm run lint` / `npm run build` (no test runner in this repo, per Phase 1's Global Constraints).
- Visual smoke test via `npm run dev`: hamburger opens/closes the off-canvas menu, desktop nav row
  shows/hides at the `lg` breakpoint, search trigger works, footer renders.
- `/impeccable audit` checkpoint, per the parent spec's Phase 2 checkpoint.
