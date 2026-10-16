# Chambaka SMS Portal

Vue 3 + TypeScript frontend for the Chambaka SMS gateway. Sign in, send and track messages, manage campaigns and contacts, top up the wallet, and run platform admin tasks.

## Stack

- Vue 3 + Vite 6
- TypeScript
- Vue Router
- Pinia

## Prerequisites

- Node.js 20+ (or current LTS)
- Chambaka SMS API running (default `http://localhost:8080`)

## Setup

```bash
cd sms-gateway-vue
npm install
```

## Configuration

API base URL (see `src/api.ts`):

```text
VITE_API_BASE  (default: http://localhost:8080)
```

Optional `.env.local`:

```bash
VITE_API_BASE=http://localhost:8080
```

Restart the dev server after changing env files.

## Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and sign in via `/login`.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Vite dev server on port `5173` |
| `npm run build` | Type-check with `vue-tsc`, then build to `dist/` |
| `npm run preview` | Serve the production build locally |

## Features

- **Dashboard** — wallet balance and usage
- **Messages** — message list and detail
- **Campaigns** — create and review campaigns
- **Contacts** — list and CSV import
- **Sender IDs** — request sender names
- **Templates** — message templates
- **Team** — organization members
- **Developers** — API keys and webhooks
- **Billing** — wallet, transactions, invoices
- **Admin** — organizations, sender approvals, providers, queue health, payments

## Project layout

```text
src/
  api.ts              # fetch helper + VITE_API_BASE
  router.ts           # routes + auth guard
  stores/session.ts   # login session (Pinia)
  views/              # page screens
  styles.css
  main.ts
  App.vue
```

## Build for production

```bash
npm run build
```

Serve `dist/` behind your reverse proxy. Set `VITE_API_BASE` to the public API origin **at build time**.

## Related

- SMS gateway API (backend service that exposes `/api/v1/...`)
