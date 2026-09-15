# SAVEONY – Finance Manager

A personal finance management web app for Indian users. Track expenses, manage savings goals, and monitor investments — all in one place, with ₹ INR currency and Indian number formatting throughout.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, served via proxy at `/api`)
- `pnpm --filter @workspace/saveony-app run dev` — run the frontend (served via proxy at `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind + shadcn/ui + wouter + React Query + Recharts
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec at `lib/api-spec/openapi.yaml`)
- Build: esbuild (CJS bundle for API server)

## Where things live

- `lib/api-spec/openapi.yaml` — single source of truth for all API contracts
- `lib/api-client-react/src/generated/api.ts` — generated React Query hooks (do not edit)
- `lib/api-zod/src/generated/api.ts` — generated Zod schemas for backend validation (do not edit)
- `lib/db/src/schema/` — Drizzle ORM table definitions (transactions, savingsGoals, investments)
- `artifacts/api-server/src/routes/` — Express route handlers (transactions, savingsGoals, investments, dashboard)
- `artifacts/saveony-app/src/pages/` — React pages (dashboard, expenses, investments, savings, transactions)
- `artifacts/saveony-app/src/components/layout.tsx` — shared sidebar + header layout

## Architecture decisions

- Contract-first API: OpenAPI spec drives both React Query hooks (frontend) and Zod validation (backend) via Orval codegen.
- All numeric DB columns use `numeric` (string at DB level) — always `parseFloat()` when returning JSON.
- Dashboard summary and expense breakdown are computed server-side from raw transactions, not stored.
- Monthly income/expenses are filtered to the current calendar month in the API.
- Indian number formatting uses `Intl.NumberFormat('en-IN')` throughout the frontend.

## Product

- **Dashboard**: Net worth card with sparkline, monthly income/expenses, savings rate, portfolio return YTD, expense breakdown donut chart, savings goals progress, portfolio table, recent transactions.
- **Expenses & Income**: Full transaction list with add/delete. Categories: Housing, Food, Transport, Entertainment, Health, Shopping, Utilities, Income, Other.
- **Investments Portfolio**: Holdings table (ticker, allocation %, value, 24h change). Add/edit/delete holdings.
- **Savings Goals**: Progress cards per goal. Add/edit/delete goals with current and target amounts.
- **Transactions History**: Full history with merchant search and category filtering.

## User preferences

- Currency: always ₹ (INR), Indian number formatting (`en-IN` locale) — never $ or comma-separated Western format.
- Theme: Light / Dark / System — controlled via ThemeContext in `src/contexts/theme-context.tsx`. Persisted in localStorage (`saveony-theme`). Applied by toggling `.dark` class on `<html>`. Theme switcher lives in the sidebar and the dedicated Settings page (`/settings`).
- Accent: emerald-500 (`--primary: 152 73% 42%` light, `152 68% 48%` dark).

## Gotchas

- Always run `pnpm --filter @workspace/api-spec run codegen` after editing `openapi.yaml`.
- Always run `pnpm --filter @workspace/db run push` after editing schema files in `lib/db/src/schema/`.
- Do not run `pnpm dev` at the workspace root — use individual workflow restarts.
- `numeric` DB columns return strings from Drizzle — always `parseFloat()` when serializing to JSON.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
