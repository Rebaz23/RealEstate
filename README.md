# RealEstate AI — Prototype

An AI-powered real estate marketplace for Iraq. Unlike existing listing-board apps
(offices post, users browse), this prototype adds an AI agent layer that acts like a
real agent on both sides:

- **End users**: conversational property search, proactive match notifications, and
  a "reality check" trust score that cross-references an office's claims (price,
  condition, availability) against signals gathered from real users.
- **Offices (B2B)**: AI-qualified leads (budget + intent confirmed via conversation)
  instead of raw inbound contacts.

This round: **mobile app + AI agent are fully functional**. The B2B portal and admin
panel are demo-depth (enough to show the flow, lighter polish, no auth).

## Monorepo layout

```
/apps
  /api          Express API + AI agent service (Prisma/SQLite)
  /mobile       Expo (React Native) app for end users
  /b2b-portal   Next.js demo portal for real estate offices (port 3001)
  /admin        Next.js demo read-only admin panel (port 3002)
/packages
  /shared       Shared TypeScript types used by all apps
```

## Prerequisites

- Node.js >= 20
- `npm install` from the repo root (installs all workspaces)

## 1. API (`apps/api`) — required by every other app

```bash
cd apps/api
cp .env.example .env
```

Edit `.env`:

- `DATABASE_URL` — leave as `file:./dev.db` for local SQLite.
- `ANTHROPIC_API_KEY` — a real Claude API key. **Without this, `/agent/chat` and
  `/agent/qualify` will return a graceful `502 AI agent is unavailable` response**
  instead of crashing — the rest of the API (listings/offices/leads/notifications)
  works fine without a key, but the AI features are the point of this prototype, so
  set a real key to see them work.
- `PORT` — defaults to `4000`.

Set up the database and seed demo data:

```bash
npm run db:migrate   # from repo root, or `npx prisma migrate deploy` inside apps/api
npm run db:seed       # from repo root, or `npx tsx prisma/seed.ts` inside apps/api
```

This seeds 3 demo offices, ~18 listings across Baghdad neighborhoods (Mansour,
Karrada, etc.), a few demo end users, and pre-existing trust signals so the trust
score and chat demo have real substance immediately.

Run the API:

```bash
npm run dev --workspace=apps/api
```

Confirm it's up: `curl http://localhost:4000/health` → `{"ok":true}`.

### Network-restricted environments (Prisma engine binaries)

If `prisma migrate`/`generate` fails trying to download engine binaries from
`binaries.prisma.sh` (common in sandboxed/offline environments), download the
`libquery_engine` and `schema-engine` binaries for your platform once (e.g. via a
machine with network access, or from a Prisma CDN mirror) and either:

- place them at `node_modules/@prisma/engines/{libquery_engine,schema-engine}-<platform>[.so.node]`
  so the `prisma` CLI's existence check passes and it skips downloading, and/or
- set `PRISMA_QUERY_ENGINE_LIBRARY` / `PRISMA_SCHEMA_ENGINE_BINARY` in `.env` to point
  directly at the binaries — this is what `@prisma/client`'s runtime reads at request
  time (the CLI and the client resolve engines independently, so both may be needed).

## 2. Mobile app (`apps/mobile`) — the primary user-facing experience

```bash
npm run dev:mobile   # or: npm run start --workspace=apps/mobile
```

This opens the Expo CLI; press `w` for web, or scan the QR code with Expo Go for
iOS/Android. The app talks to the API at `http://localhost:4000`
(`apps/mobile/src/api/client.ts`) — update that constant if your API runs elsewhere
(e.g. a physical device needs your machine's LAN IP instead of `localhost`).

Flow to try: chat-first search on the Home screen → tap a matched listing → view its
trust badge → submit feedback (price/condition/availability) → check the
Notifications tab for proactive match alerts.

## 3. B2B portal (`apps/b2b-portal`) — demo depth

```bash
npm run dev:b2b   # or: npm run dev --workspace=apps/b2b-portal
```

Runs on `http://localhost:3001`. Mock login (pick a seeded office, no password).
Flow: Dashboard → Listings (create/edit/suspend) → Leads inbox (AI-qualified leads
with qualification notes, mark contacted/closed).

Optional `.env.local` (defaults to `http://localhost:4000` if unset):

```
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

## 4. Admin panel (`apps/admin`) — demo depth, read-only

```bash
npm run dev:admin   # or: npm run dev --workspace=apps/admin
```

Runs on `http://localhost:3002`. No auth — read-only platform-operator view:
Overview stats, all Offices, all Listings (with trust scores), all Leads across
every office. Same optional `NEXT_PUBLIC_API_URL` override as the B2B portal.

## Running everything together

In four terminals (after `apps/api/.env` is set up and the DB is seeded):

```bash
npm run dev --workspace=apps/api      # http://localhost:4000
npm run dev:mobile                     # Expo dev tools
npm run dev:b2b                        # http://localhost:3001
npm run dev:admin                      # http://localhost:3002
```

## Known limitations (prototype scope)

- Auth is mocked everywhere (mobile, B2B portal, admin) — no real login/sessions.
- No push notifications — in-app notification feed only.
- Subscription tiers and lead credits are modeled in the schema but not wired to a
  payment provider.
- Proactive matching runs synchronously on listing creation, not via a background
  job/queue — fine for demo data volume, not production scale.
- No automated test suite yet; verification has been manual (curl + running the
  apps directly).
