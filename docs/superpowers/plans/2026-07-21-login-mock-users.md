# Login Mock-User Selection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Login screen with 3 mock-user cards (photo + name); clicking one logs in as that
user, lands on the home (`vitrine`) tab, and reflects that user's name/photo/role in the Header.

**Architecture:** Pure client-side, no backend/auth. A new `User` type and `MOCK_USERS`/
`getLoginUsers()` in the existing mock-data file back a new `Login` component. `App.tsx` gains a
`loggedUser` state (persisted to `localStorage`, same pattern as its existing `activeTab`/`cart`
state) that gates which screen renders. `Header.tsx` swaps its hardcoded profile markup for props
driven by `loggedUser`.

**Tech Stack:** React 19 + TypeScript, Tailwind v4 utility classes, `@govbr-ds/core` DS-gov
component library, `lucide-react` icons. No router, no test framework — this repo has neither
(`npm run lint` = `tsc --noEmit` is the only automated check); verification in this plan is
type-check + manual walkthrough in the already-running dev server, consistent with how prior
phases in this codebase were verified.

## Global Constraints

- Field name is `rule`, not `role` — copied verbatim from the spec's `User` type.
- `rule` is never stored in `MOCK_USERS` — it's assigned fresh by `getLoginUsers()` on every call
  (`Math.random() < 0.5 ? 'manager' : 'commum'`), so it reshuffles each time the Login screen
  mounts.
- No real authentication — no password field, no backend call.
- Logging out clears only `loggedUser`; `cart`, `produtos`, `requisicoes`, and `activeTab` are left
  untouched.
- Avatar `<img>` elements use `alt=""` (decorative — the adjacent visible name already conveys
  identity).
- Reuse the existing product-card visual language for the login cards:
  `br-card hover bg-white border border-gray-200 rounded-xl ... hover:shadow-lg hover:border-primary transition-all duration-300`.
- No new npm dependencies.

---

### Task 1: User type and mock user data

**Files:**
- Modify: `src/types.ts` (append after the `CompraSimulada` interface, end of file)
- Modify: `src/data.ts:6` (import line) and insert a new block between the `MOCK_SECRETARIAS`
  array (ends `src/data.ts:167`) and `MOTIVOS_REJEICAO` (starts `src/data.ts:169`)

**Interfaces:**
- Produces: `UserRule` (`'manager' | 'commum'`), `User` (`{ id, name, image_url, rule, inserted_at, updated_at }`, all `string` except `rule: UserRule`), `getLoginUsers(): User[]` — a fresh array of 3 users with `rule` randomized on each call.

- [ ] **Step 1: Add `UserRule` and `User` to `src/types.ts`**

Append at the end of the file (after the closing `}` of `CompraSimulada`):

```ts

export type UserRule = 'manager' | 'commum';

export interface User {
  id: string;
  name: string;
  image_url: string;
  rule: UserRule;
  inserted_at: string;
  updated_at: string;
}
```

- [ ] **Step 2: Update the type import in `src/data.ts`**

Change line 6 from:

```ts
import { Produto, EstadoConservacao } from './types';
```

to:

```ts
import { Produto, EstadoConservacao, User, UserRule } from './types';
```

- [ ] **Step 3: Add `MOCK_USERS` and `getLoginUsers` to `src/data.ts`**

Insert this new block between the end of `MOCK_SECRETARIAS` (`];` on line 167) and the
`MOTIVOS_REJEICAO` declaration (line 169) — i.e. replace the single blank line 168 with:

```ts

export const MOCK_USERS: Omit<User, 'rule'>[] = [
  {
    id: '1',
    name: 'Mauricio Alexandre',
    image_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=400&h=400&q=80',
    inserted_at: '2026-01-10T08:30:00-03:00',
    updated_at: '2026-01-10T08:30:00-03:00',
  },
  {
    id: '2',
    name: 'Tonny',
    image_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=400&h=400&q=80',
    inserted_at: '2026-01-10T08:30:00-03:00',
    updated_at: '2026-01-10T08:30:00-03:00',
  },
  {
    id: '3',
    name: 'Alex',
    image_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=facearea&facepad=2&w=400&h=400&q=80',
    inserted_at: '2026-01-10T08:30:00-03:00',
    updated_at: '2026-01-10T08:30:00-03:00',
  },
];

export function getLoginUsers(): User[] {
  const rules: UserRule[] = ['manager', 'commum'];
  return MOCK_USERS.map((u) => ({
    ...u,
    rule: rules[Math.floor(Math.random() * rules.length)],
  }));
}
```

- [ ] **Step 4: Type-check**

Run: `npm run lint`
Expected: completes with no output (matches current clean baseline — no errors).

- [ ] **Step 5: Sanity-check `getLoginUsers` output**

Run: `npx tsx -e "import('./src/data.ts').then(m => console.log(m.getLoginUsers()))"`
Expected: prints an array of 3 objects, each with `id`/`name`/`image_url`/`inserted_at`/
`updated_at` plus a `rule` of either `manager` or `commum` (run it 2-3 times — the `rule` values
should vary between runs, confirming the randomization).

- [ ] **Step 6: Commit**

```bash
git add src/types.ts src/data.ts
git commit -m "feat: add User type and mock login users"
```

---

### Task 2: Login component

**Files:**
- Create: `src/components/Login.tsx`

**Interfaces:**
- Consumes: `User` from `../types`; `getLoginUsers` from `../data` (both from Task 1).
- Produces: `Login` (default export), props `{ onLogin: (user: User) => void }`.

- [ ] **Step 1: Create `src/components/Login.tsx`**

```tsx
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { User } from '../types';
import { getLoginUsers } from '../data';

interface LoginProps {
  onLogin: (user: User) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [users] = useState<User[]>(() => getLoginUsers());

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-background px-4 py-10">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-on-background">Bolsa de Materiais</h1>
        <p className="mt-1 text-sm text-on-surface-variant">Selecione seu usuário para continuar</p>
      </div>
      <div className="flex flex-wrap justify-center gap-6">
        {users.map((user) => (
          <button
            key={user.id}
            type="button"
            onClick={() => onLogin(user)}
            className="br-card hover bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-primary transition-all duration-300 flex flex-col items-center gap-3 w-40"
          >
            <img src={user.image_url} alt="" className="h-20 w-20 rounded-full object-cover" />
            <span className="text-sm font-medium text-on-background text-center">{user.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npm run lint`
Expected: completes with no output.

- [ ] **Step 3: Commit**

```bash
git add src/components/Login.tsx
git commit -m "feat: add Login component with mock user cards"
```

---

### Task 3: Wire Login and logged-in identity into App and Header

**Files:**
- Modify: `src/App.tsx` (imports, new state, new effect, new handlers, render branch, `<Header>` call site)
- Modify: `src/components/Header.tsx` (imports, `HeaderProps`, `getRuleLabel` helper, function signature, desktop `.header-login` block, mobile `.menu-profile` block)

**Interfaces:**
- Consumes: `User`, `UserRule` from `../types` (Task 1); `Login` from `./components/Login` (Task 2).
- Produces: `Header` now requires `loggedUser: User` and `onLogout: () => void` props — any future
  caller of `Header` must supply both.

- [ ] **Step 1: Add `User` to the type import in `src/App.tsx`**

Change:

```ts
import { Produto, CartItem, Requisicao, StatusRequisicao, RequisitanteData } from './types';
```

to:

```ts
import { Produto, CartItem, Requisicao, StatusRequisicao, RequisitanteData, User } from './types';
```

- [ ] **Step 2: Import `Login` in `src/App.tsx`**

Add this line alongside the other component imports (after `import Header from './components/Header';`):

```ts
import Login from './components/Login';
```

- [ ] **Step 3: Add `loggedUser` state in `src/App.tsx`**

Immediately after the existing `activeTab` state block:

```ts
  const [activeTab, setActiveTab] = useState<string>(() => {
    return localStorage.getItem('bolsa_active_tab') || 'vitrine';
  });
```

insert:

```ts

  const [loggedUser, setLoggedUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('bolsa_logged_user');
    return saved ? JSON.parse(saved) : null;
  });
```

- [ ] **Step 4: Persist `loggedUser` in `src/App.tsx`**

Immediately after the existing `requisicoes` persistence effect:

```ts
  useEffect(() => {
    localStorage.setItem('bolsa_requisicoes', JSON.stringify(requisicoes));
  }, [requisicoes]);
```

insert:

```ts

  useEffect(() => {
    if (loggedUser) {
      localStorage.setItem('bolsa_logged_user', JSON.stringify(loggedUser));
    } else {
      localStorage.removeItem('bolsa_logged_user');
    }
  }, [loggedUser]);
```

- [ ] **Step 5: Add login/logout handlers in `src/App.tsx`**

Immediately before the `return (` statement (after the existing `handleAddFromSimulated`
function), insert:

```ts
  const handleLogin = (user: User) => {
    setLoggedUser(user);
    setActiveTab('vitrine');
  };

  const handleLogout = () => {
    setLoggedUser(null);
  };

```

- [ ] **Step 6: Gate the render on `loggedUser` in `src/App.tsx`**

Immediately before the existing `return (` statement (right after the handlers added in Step 5),
insert:

```ts
  if (!loggedUser) {
    return <Login onLogin={handleLogin} />;
  }

```

- [ ] **Step 7: Pass `loggedUser`/`onLogout` to `Header` in `src/App.tsx`**

Change:

```tsx
      <Header
        currentTab={activeTab}
        setTab={setActiveTab}
        cartCount={cart.length}
      />
```

to:

```tsx
      <Header
        currentTab={activeTab}
        setTab={setActiveTab}
        cartCount={cart.length}
        loggedUser={loggedUser}
        onLogout={handleLogout}
      />
```

- [ ] **Step 8: Update imports in `src/components/Header.tsx`**

Change:

```tsx
import { Package2, ShoppingCart, BarChart3, ShieldAlert, FileText, Menu, X, Landmark, UserCheck, Search } from 'lucide-react';
```

to:

```tsx
import { Package2, ShoppingCart, BarChart3, ShieldAlert, FileText, Menu, X, Landmark, UserCheck, Search, LogOut } from 'lucide-react';
```

and add, immediately after it:

```tsx
import { User, UserRule } from '../types';
```

- [ ] **Step 9: Update `HeaderProps` and add `getRuleLabel` in `src/components/Header.tsx`**

Change:

```tsx
interface HeaderProps {
  currentTab: string;
  setTab: (tab: string) => void;
  cartCount: number;
}
```

to:

```tsx
interface HeaderProps {
  currentTab: string;
  setTab: (tab: string) => void;
  cartCount: number;
  loggedUser: User;
  onLogout: () => void;
}

function getRuleLabel(rule: UserRule): string {
  return rule === 'manager' ? 'Gestor' : 'Requisitante / Cedente';
}
```

- [ ] **Step 10: Update the component signature in `src/components/Header.tsx`**

Change:

```tsx
export default function Header({ currentTab, setTab, cartCount }: HeaderProps) {
```

to:

```tsx
export default function Header({ currentTab, setTab, cartCount, loggedUser, onLogout }: HeaderProps) {
```

- [ ] **Step 11: Replace the desktop profile block in `src/components/Header.tsx`**

Change:

```tsx
              <div className="header-login hidden lg:block">
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
```

to:

```tsx
              <div className="header-login hidden lg:block">
                <div className="header-avatar flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-primary flex items-center gap-1 justify-end font-semibold">
                      <UserCheck className="h-3 w-3" /> {getRuleLabel(loggedUser.rule)}
                    </div>
                    <div className="text-xs font-medium text-gray-700 max-w-[150px] truncate">{loggedUser.name}</div>
                  </div>
                  <img
                    src={loggedUser.image_url}
                    alt=""
                    className="h-8 w-8 rounded-full object-cover border border-primary"
                  />
                  <button
                    type="button"
                    onClick={onLogout}
                    aria-label="Sair"
                    className="br-button circle small"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
```

- [ ] **Step 12: Replace the mobile profile block in `src/components/Header.tsx`**

Change:

```tsx
            <div className="menu-profile lg:hidden flex items-center gap-3 px-4 py-3 border-b border-gray-200">
              <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary flex items-center justify-center font-bold text-primary text-sm shrink-0">
                MA
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-700 truncate">Maurício Alexandre</div>
                <div className="text-xs text-primary flex items-center gap-1 font-semibold">
                  <UserCheck className="h-3 w-3" /> Requisitante / Cedente
                </div>
              </div>
            </div>
```

to:

```tsx
            <div className="menu-profile lg:hidden flex items-center gap-3 px-4 py-3 border-b border-gray-200">
              <img
                src={loggedUser.image_url}
                alt=""
                className="h-10 w-10 rounded-full object-cover border border-primary shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-gray-700 truncate">{loggedUser.name}</div>
                <div className="text-xs text-primary flex items-center gap-1 font-semibold">
                  <UserCheck className="h-3 w-3" /> {getRuleLabel(loggedUser.rule)}
                </div>
              </div>
              <button
                type="button"
                onClick={onLogout}
                aria-label="Sair"
                className="br-button circle small"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
```

- [ ] **Step 13: Type-check**

Run: `npm run lint`
Expected: completes with no output.

- [ ] **Step 14: Manual verification in the running dev server**

The dev server is already running at `localhost:3000`. In the browser:

1. Open dev tools → Application/Storage → clear the `bolsa_logged_user` localStorage key if
   present (so you start logged out).
2. Reload the page. Expected: the Login screen renders — "Bolsa de Materiais" heading, "Selecione
   seu usuário para continuar", and 3 cards (Mauricio Alexandre, Tonny, Alex), each with a round
   photo and name only.
3. Click one card, e.g. Tonny. Expected: immediately redirected to the main app on the `vitrine`
   tab; the header (desktop width) shows Tonny's name and photo where "Maurício Alexandre"/"MA"
   used to be, and a role line reading either "Gestor" or "Requisitante / Cedente".
4. Resize to a mobile width and open the hamburger menu. Expected: the same name/photo/role line
   appear in the menu's profile block, plus a logout icon.
5. Reload the page (still logged in). Expected: still on Tonny's session — not bounced back to
   Login (`bolsa_logged_user` persisted).
6. Add an item to the cart, then click the logout icon (desktop header or mobile menu). Expected:
   returned to the Login screen.
7. Log back in as any user. Expected: the cart item added in step 6 is still there (logout does
   not clear cart/produtos/requisicoes/activeTab).
8. Log out and back in a few times. Expected: the role label ("Gestor" vs "Requisitante /
   Cedente") varies across logins for the same person, confirming the per-mount randomization.

- [ ] **Step 15: Commit**

```bash
git add src/App.tsx src/components/Header.tsx
git commit -m "feat: wire Login screen and logged-in identity into Header"
```

---

## Self-Review Notes

- **Spec coverage:** Data model (Task 1) ✓, Login component (Task 2) ✓, App wiring incl.
  login/logout/persistence (Task 3 steps 1-7) ✓, Header changes incl. avatar/name/role/logout in
  both desktop and mobile blocks (Task 3 steps 8-12) ✓, Out-of-scope items (real auth, role-gating,
  cross-session role memory) intentionally have no task — matches the spec.
- **Placeholder scan:** No TBD/TODO; every step has literal before/after code.
- **Type consistency:** `User`/`UserRule` field names and `getLoginUsers()` signature are identical
  everywhere they're referenced (Task 1 definition → Task 2 and Task 3 usage). `Header`'s new
  `loggedUser`/`onLogout` props match exactly between the interface (Step 9), the destructured
  signature (Step 10), and the `App.tsx` call site (Step 7).
