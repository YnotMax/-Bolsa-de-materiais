# Login Screen — Mock User Selection — Design Spec

Date: 2026-07-21
Branch: `main`

## Goal

Add a Login screen shown before the rest of the app: 3 cards for hardcoded/mock users (photo +
name only). Clicking a card logs in as that user and lands on the home screen (the existing
`vitrine` tab), with the logged-in user's name, photo, and role reflected in the Header (both the
desktop profile block and the mobile off-canvas menu's profile block added in the previous mobile
header pass).

This is intentionally minimal ("for now"): no real auth, no backend call, no password. It swaps
today's single hardcoded name in Header ("Maurício Alexandre") for a small set of mock users the
person testing the app can pick between, with a `rule` (role) that's randomized on each visit to
the Login screen so both `manager` and `commum` roles can be exercised without editing code.

## Data Model

`src/types.ts` gains:

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

Field name is `rule` (not `role`) — matches the term used consistently by the project owner in
both conversation and the pasted JSON shape.

`src/data.ts` gains:

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
  return MOCK_USERS.map((u) => ({
    ...u,
    rule: Math.random() < 0.5 ? 'manager' : 'commum',
  }));
}
```

- 3 distinct people, not the accidental duplicate "Mauricio Alexandre" ×2 from the initial paste.
- `image_url` uses real Unsplash portrait photo URLs (`facearea`/`facepad` crop, framed for a
  circular avatar) — same sourcing pattern as `fotoUrl` in `MOCK_PRODUTOS`.
- `inserted_at`/`updated_at` get a fixed placeholder ISO timestamp. Not read by any UI; they exist
  only because they're part of the given record shape.
- `rule` is deliberately **not** part of the stored base data — `MOCK_USERS` omits it
  (`Omit<User, 'rule'>`), and `getLoginUsers()` assigns it fresh via `Math.random()` each time it's
  called. This is the "randomized per app load" behavior: every time the Login screen mounts
  (first load, or after logout), the role assignment reshuffles.

## App Wiring (`App.tsx`)

- New state: `loggedUser: User | null`, initialized from `localStorage.getItem('bolsa_logged_user')`
  (`JSON.parse` if present, else `null`) — same pattern as `activeTab`/`cart`/`produtos`/
  `requisicoes`.
- New `useEffect` persists `loggedUser` to `localStorage` under `bolsa_logged_user` whenever it
  changes (`removeItem` when `null`, to avoid stringifying `"null"` and to fully clear on logout).
- Render branch at the top of `App`'s returned JSX:
  - `loggedUser === null` → render only `<Login onLogin={handleLogin} />`. No `Header`/`Footer`
    chrome — there's no logged-in identity yet to show in the header, and no tab navigation makes
    sense pre-login.
  - `loggedUser !== null` → render exactly what `App` renders today (Header + tab content +
    Footer), passing `loggedUser` and a new `onLogout` handler into `Header`.
- `handleLogin(user: User)`: `setLoggedUser(user)` and `setActiveTab('vitrine')` — "home screen" is
  the existing default landing tab, no new screen needed for it.
- `handleLogout()`: `setLoggedUser(null)`. Per explicit decision, this does **not** clear `cart`,
  `produtos`, `requisicoes`, or `activeTab` — logging out only ends the identity session, it
  doesn't wipe in-progress work (cart contents, draft requisitions, etc. survive a user switch).

## Login Component (`src/components/Login.tsx`)

- New file. Props: `{ onLogin: (user: User) => void }`.
- `const [users] = useState(() => getLoginUsers())` — computed once per mount, giving the
  randomized-per-visit role behavior described above.
- Centered, full-viewport layout (`min-h-screen flex flex-col items-center justify-center`),
  "Bolsa de Materiais" heading + short prompt ("Selecione seu usuário para continuar"), then the 3
  cards in a responsive row (`flex flex-wrap justify-center gap-6`, stacks naturally on narrow
  viewports).
- Each card is a `<button type="button">` (not a link — this is an in-app state change, not
  navigation to a URL), reusing the existing product-card visual language for consistency with the
  rest of the app:
  `br-card hover bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-primary transition-all duration-300 flex flex-col items-center gap-3`
- Card contents: a circular photo (`<img src={user.image_url} className="h-20 w-20 rounded-full object-cover" alt="" />`,
  `alt=""` since the adjacent visible name already conveys the identity — decorative photo, not
  additional information) and the name below it. Nothing else (no role badge, no id) — matches the
  explicit "profile image ... and name and that's it" requirement.
- `onClick={() => onLogin(user)}`.

## Header Changes (`src/components/Header.tsx`)

- New required props: `loggedUser: User`, `onLogout: () => void`.
- Desktop profile block (`.header-login` / `.header-avatar`) and the mobile off-canvas
  `.menu-profile` block (added in the mobile-header pass) both switch from the hardcoded
  "Maurício Alexandre" / "MA" initials / static "Requisitante / Cedente" text to:
  - Name → `loggedUser.name`.
  - Avatar → `loggedUser.image_url` rendered as a real `<img>` in the circle (replacing the
    initials-in-a-circle treatment — we have a real photo now, so use it), with the same sizing
    (`h-8 w-8` desktop, `h-10 w-10` mobile) and `rounded-full object-cover`.
  - Role line → derived via a small `getRuleLabel(rule: UserRule)` helper: `manager` → `"Gestor"`,
    `commum` → `"Requisitante / Cedente"` (the current fixed copy, now conditional).
- A small logout affordance (`LogOut` icon from `lucide-react`, `aria-label="Sair"`) is added next
  to the profile info in both the desktop `.header-login` block and the mobile `.menu-profile`
  block, calling `onLogout` on click.

## Out of Scope

- Real authentication (password, session tokens, backend call) — this is a mock user picker.
- Any role-gated behavior elsewhere in the app (e.g. `manager`-only tabs/actions). `rule` is stored
  and displayed only; no other screen reads it yet.
- Remembering *which* role a given user had in a previous session — by design, `rule` reshuffles
  every time the Login screen is shown.
