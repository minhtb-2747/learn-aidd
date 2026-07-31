# Sun\* Annual Awards 2025

Next.js 16 (App Router) + Supabase. Hosts the SAA 2025 homepage, the awards
system, the **Sun\* Kudos** board, and Sunner profiles.

---

## Prerequisites

| Tool | Why |
|------|-----|
| Node.js 20.9+ | Next.js 16 |
| Docker (running) | the Supabase CLI runs Postgres, Auth, Storage and Studio in containers |
| Google OAuth credentials | **the only way to sign in** — see [Google sign-in](#google-sign-in) |

The Supabase CLI is a devDependency, so use `npx supabase …` rather than
installing it globally.

---

## Quick start

```bash
npm install
cp .env.example .env.local     # then edit — see "Environment" below
npx supabase start             # boots Postgres + Auth + Storage, applies migrations, seeds
npm run dev                    # http://localhost:3333
```

`npx supabase start` prints an **API URL** and a **publishable/anon key**. Copy
them into `.env.local` as `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`.

> **The app runs on port 3333, not 3000.** `supabase/config.toml` pins
> `site_url` to `http://localhost:3333`, so the OAuth redirect only works on
> that port.

---

## Environment

Copy `.env.example` to `.env.local` and fill it in.

| Variable | Read by | Notes |
|----------|---------|-------|
| `SUPABASE_URL` | app | From `supabase start`; locally `http://127.0.0.1:54321` |
| `SUPABASE_PUBLISHABLE_KEY` | app | The anon/publishable key from `supabase start` |
| `SUPABASE_SECRET_KEY` | — | Present in `.env.example` for tooling; **nothing in the app reads it** |
| `GOOGLE_CLIENT_ID` | `supabase/config.toml` | Substituted into the local Auth container, not read by the app |
| `GOOGLE_CLIENT_SECRET` | `supabase/config.toml` | Same |
| `SITE_URL` | app | OAuth callback origin. Set it to `http://localhost:3333` — `.env.example` still says `3000`, which will break the redirect |
| `EVENT_DATETIME` | app | ISO-8601 event start. **See the gate below.** |

### ⚠ `EVENT_DATETIME` gates the entire site

`proxy.ts` runs a prelaunch check *before* the auth guards: while
`EVENT_DATETIME` is in the future, **every** route redirects to `/prelaunch`
(the countdown). The value shipped in `.env.example` is a future date, so a
fresh clone shows nothing but the countdown.

To work on any real screen, set it to a past date or delete the line:

```bash
EVENT_DATETIME=2020-01-01T00:00:00+07:00
```

An unset or unparseable value is treated as "event already passed", which is
the state you want during development.

---

## Database

Schema lives in `supabase/migrations/` (7 migrations, applied in filename
order). Seed data lives in `supabase/seeds/common/` and is wired up in
`supabase/config.toml`:

```toml
[db.seed]
sql_paths = ["./seeds/common/*.sql", "env(SUPABASE_EXTRA_SEEDS)"]
```

so every seed file runs automatically on a database reset — there is no
separate seed command.

| Task | Command |
|------|---------|
| Start the stack | `npx supabase start` |
| Stop it | `npx supabase stop` |
| **Wipe + re-migrate + re-seed** | `npx supabase db reset` |
| New migration | `npx supabase migration new <name>` |
| Inspect data | Studio at http://localhost:54323 |

### Local ports

| Service | Port |
|---------|------|
| API gateway | 54321 |
| Postgres | 54322 |
| Studio | 54323 |
| Mailpit (captured email) | 54324 |

### Seed contents

`01-reference-data.sql` (departments, honor titles, campaigns) →
`02-users-profiles.sql` (Sunners in `auth.users` + `public.profiles`) →
`03-kudos-and-engagement.sql` (kudos, likes, hashtags) →
`04-rewards-and-notifications.sql` (secret boxes, notifications).

Seed accounts are created with `provider: google` so they behave like real
sign-ins once you authenticate as one of them.

### Storage

The `kudo-images` bucket and its RLS policies are declared in
`supabase/migrations/20260421000001_storage_policies.sql`, **not** in
`config.toml` — so the bucket and the policies protecting it stay in one
reviewable unit. `db reset` recreates both.

---

## Google sign-in

Email/password signup is disabled (`enable_signup = false`), and the login
screen offers Google only. Without OAuth credentials you cannot get past
`/login`, and every protected route will bounce you back to it.

1. Create an OAuth client at
   [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials).
2. Add `http://127.0.0.1:54321/auth/v1/callback` as an authorised redirect URI.
3. Put the client ID and secret in `.env.local`.
4. Restart the stack (`npx supabase stop && npx supabase start`) — the Auth
   container reads those variables at boot.

`skip_nonce_check = true` is already set in `config.toml`; local Google
sign-in fails without it.

---

## Routing and guards

Both gates live in `proxy.ts`, in this order:

1. **Prelaunch** — before `EVENT_DATETIME`, everything redirects to
   `/prelaunch`. After it, `/prelaunch` itself redirects home.
2. **Auth** — `/todo`, `/award-system`, `/kudos` and `/profile` require a
   session; `/login` redirects away when you already have one.

| Route | What it is |
|-------|------------|
| `/` | SAA 2025 homepage |
| `/login` | Google sign-in |
| `/prelaunch` | Countdown (see the gate above) |
| `/award-system` | Award categories |
| `/kudos` | Kudos board: highlight carousel, Spotlight, feed |
| `/profile/[id]` | Sunner profile — own and other-person variants differ |

---

## Everyday commands

```bash
npm run dev      # dev server on :3333
npm run build    # production build (also type-checks)
npm run lint     # eslint
npx tsc --noEmit # type-check alone
```

There is no test suite — unit tests were deliberately declined for this
project. Verification is type-check + lint + build plus manual checks.

---

## Layout

```
app/               routes (server components) + server actions in app/actions/
components/        UI, grouped by screen: home, kudos, profile, login, award-system
lib/               server-side queries, view-models and hooks
  kudos/queries/   Supabase reads — server-only, never imported by a client component
i18n/messages/     vi.json / en.json (locale via the NEXT_LOCALE cookie)
supabase/          migrations, seeds, config.toml
docs/              architecture, routing/auth model, changelog, roadmap
plans/             per-feature implementation plans
```

**Data-flow rule:** pages are server components that call `lib/**/queries` and
pass plain serializable props down. Client components never import a query
module — those transitively pull in `next/headers` and would break the client
bundle. Client-side mutations go through server actions in `app/actions/`.

---

## Further reading

- `docs/system-architecture.md` — architecture
- `docs/homepage-routing-and-auth.md` — routing and auth model in depth
- `docs/project-changelog.md` — change log
- `AGENTS.md` — conventions this codebase expects
