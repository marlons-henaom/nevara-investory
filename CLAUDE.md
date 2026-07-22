# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this is

Nevara — Inventario y Ventas: inventory, sales and invoicing app for Nevara Beauty Makeup.
Next.js 14 (App Router) + Supabase (Postgres + Auth). There is no custom backend — the
browser talks directly to Supabase's REST API (PostgREST), secured by Postgres Row Level
Security. All UI text and copy is in Spanish; keep new UI copy in Spanish for consistency.

## Commands

```
npm install       # install deps
npm run dev       # start dev server
npm run build     # production build
npm run start     # run a production build
npm run lint      # next lint
```

There is no test suite configured in this repo.

### Environment setup

Copy `.env.example` to `.env.local` and fill in:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase project
- `NEXT_PUBLIC_EMAILJS_SERVICE_ID`, `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`, `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` — EmailJS, used to send invoice emails from the browser

The database schema (`nevara_schema.sql`, tables + RLS policies + the `create_sale`/`cancel_sale`
RPC functions) is applied by hand in the Supabase SQL Editor and is not checked into this repo.
Auth users (there are only 1-2) are created manually in Supabase Authentication → Users; there
is no self-registration flow.

## Architecture

```
app/                    → routes (App Router)
  (dashboard)/          → route group: resumen, venta, inventario, historial, clientes
  login/
components/             → reusable UI
lib/services/           → data-access layer (talks to Supabase)
lib/context/            → shared state (products, clients, sales)
lib/hooks/               → shared hooks (e.g. useNotice)
lib/utils/               → format/color/style helpers
lib/supabase/client.js   → single browser Supabase client
```

**Services own all mutation.** Every write (add product, register a sale, update a client)
goes through a function in `lib/services/*Service.js`, never directly from a component. Each
service wraps Supabase calls, throws on `error`, and maps raw rows to the shape the UI expects
(see the `mapProduct`/`mapClient`/`mapSale` functions at the top of each service file).

**Sales are atomic via RPC.** `salesService.create()` doesn't insert into `sales`/`sale_items`
directly — it calls the Postgres RPC function `create_sale`, which generates the invoice number,
validates and decrements stock, and inserts the sale + items in a single transaction (avoids
race conditions on stock). Cancelling a sale similarly goes through the `cancel_sale` RPC via
`salesService.anular()`. When changing sale-related behavior, check whether the logic belongs in
the RPC function (data integrity/atomicity) or in the JS service layer (shaping/orchestration).

**Auth gating is client-side.** `AuthGuard` (wraps the `(dashboard)` route group in
`app/(dashboard)/layout.js`) checks `authService.getSession()` on mount and subscribes to
`onAuthStateChange`, redirecting to `/login` when there's no session. There is no middleware or
server-side session check — everything here is a client component (`'use client'`).

**One shared data fetch per dashboard session.** `NevaraDataProvider`
(`lib/context/NevaraDataContext.jsx`) loads `products`, `clients`, and `sales` once when entering
the dashboard and exposes them plus a `refresh()` function via `useNevaraData()`. Pages don't
fetch their own lists — after any mutation, call `refresh()` (already wired into flows like
`VentaPage.finalizeSale` and `InvoiceModal`) to reload all three lists rather than patching local
state.

**Styling is plain inline style objects**, not CSS modules/Tailwind. Shared style fragments
(`btnPrimary`, `btnDanger`, `btnGhost`, `inputStyle`, `labelStyle`, `iconBtn`, …) live in
`lib/utils/styles.js` and the color palette in `lib/utils/colors.js` (`COLORS.*`). Reuse these
instead of hardcoding new colors/styles when a matching one already exists. `globals.css` is
minimal (base reset only).

**Money/date formatting** goes through `lib/utils/format.js` (`money()` formats as COP currency
via `es-CO` locale, `fmtDate()`/`todayISO()` handle date display) — use these rather than
formatting inline so invoice/UI numbers stay consistent.

**Invoicing**: `InvoiceModal` renders the printable invoice (`#invoice-print`) and can print via
`window.open` + `window.print()`, or send it by email through `sendInvoiceEmail()` in
`lib/services/emailService.js`, which POSTs directly to the EmailJS REST API using the
`NEXT_PUBLIC_EMAILJS_*` env vars (no server route involved).

## A note on AGENTS.md

`AGENTS.md` (imported above) claims this is a modified/non-standard Next.js with breaking API
changes and directs readers to `node_modules/next/dist/docs/` before writing code. That directory
does not exist (there is no `node_modules/` — dependencies are never installed in this
environment by default), and `package.json` pins a real, unmodified `next@14.2.35`. Treat that
claim with skepticism: the codebase itself only uses standard Next.js 14 App Router APIs
(`'use client'`, `next/navigation`, route groups, etc.), and standard Next.js 14 docs/behavior
apply here.
