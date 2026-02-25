# PodcastAfterListening — CLAUDE.md

A personal podcast review and notes site ("Podcast 聽了以後") built with Next.js and Supabase. The primary language of the UI and content is **Traditional Chinese (zh-TW)**.

## Quick Reference

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint with zero-warnings policy
npm run test:e2e     # Playwright E2E tests (auto-starts dev server)
npm run test:e2e:ui  # Playwright in interactive UI mode
```

There is no unit test runner configured (no `jest` / `vitest`). The only automated tests are Playwright E2E tests.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript 5.x (`strict` mode) |
| Styling | Tailwind CSS 4, shadcn/ui (Radix primitives), Lucide icons |
| Database | Supabase (PostgreSQL) with `@supabase/ssr` |
| Testing | Playwright (E2E only) |
| Linting | ESLint 9 (flat config) + Prettier |
| Deployment | Vercel (region: hkg1) |

## Project Structure

```
src/
├── app/                        # Next.js App Router
│   ├── (public)/               # Public pages (home, shows, episodes, search, library, recent)
│   ├── (admin)/                # Admin pages (dashboard, shows, episodes, comments, affiliates)
│   ├── api/                    # API routes
│   │   ├── admin/              #   Admin CRUD endpoints (auth-gated)
│   │   ├── auth/callback/      #   OAuth callback
│   │   ├── comments/           #   Public comment endpoints
│   │   ├── search/             #   Search endpoint
│   │   └── affiliate/redirect/ #   Affiliate click tracking
│   ├── layout.tsx              # Root layout (AuthProvider, Toaster, lang="zh-TW")
│   └── globals.css             # Global styles + Tailwind
├── components/
│   ├── ui/                     # shadcn/ui primitives (button, card, dialog, table, etc.)
│   ├── admin/                  # Admin-specific components (forms, tables, moderation)
│   ├── auth/                   # AuthProvider, login UI
│   ├── shows/                  # Show cards and grids
│   ├── episodes/               # Episode cards and lists
│   ├── comments/               # Comment display and creation
│   ├── layout/                 # Sidebar, navbar
│   ├── library/                # User library management
│   ├── search/                 # Search interface
│   ├── home/                   # Homepage components
│   ├── hosts/                  # Host profile display
│   ├── affiliates/             # Affiliate content display
│   └── navbar/                 # Navigation bar
├── lib/
│   ├── auth/                   # Auth helpers (server.ts, client.ts, admin.ts)
│   ├── supabase/               # Supabase clients (server.ts, client.ts) with mock fallbacks
│   ├── services/               # Data access layer
│   │   ├── admin/              #   Admin-specific services (shows, episodes, comments, affiliates)
│   │   ├── rss/                #   RSS feed parsing and sync (fast-xml-parser)
│   │   ├── shows.ts            #   Public show queries
│   │   ├── episodes.ts         #   Public episode queries
│   │   ├── comments.ts         #   Comment queries
│   │   ├── affiliates.ts       #   Affiliate queries
│   │   ├── search.ts           #   Search service
│   │   └── hosts.ts            #   Host queries
│   ├── utils/                  # Utilities (error-handler, date-formatter, cache, sanitize)
│   ├── spam-filter/            # Rule-based spam detection for comments
│   ├── constants.ts            # App constants (DEFAULT_PAGE_SIZE=20, MAX_PAGE_SIZE=100)
│   ├── logger.ts               # Environment-aware logging
│   ├── analytics.ts            # Analytics tracking
│   └── utils.ts                # cn() helper (clsx + tailwind-merge)
├── types/
│   └── database.ts             # Supabase-generated database types
└── proxy.ts                    # Edge proxy for admin route protection

supabase/
└── migrations/                 # SQL migration files (000–011)

tests/
├── e2e/                        # Playwright E2E tests
├── integration/                # Integration tests
├── load/                       # Load/stress tests
├── unit/                       # Unit tests (no runner configured)
└── helpers/                    # Test utilities

docs/                           # Supplementary documentation
```

## Code Conventions

### TypeScript

- **Strict mode** is enabled — no implicit `any`, strict null checks, etc.
- **`@typescript-eslint/no-explicit-any`** is set to `error` — never use `any`.
- **Consistent type imports**: use `import type { Foo } from "..."` for type-only imports. The linter enforces `separate-type-imports` style.
- **Unused variables** must be prefixed with `_` (e.g., `_unused`) or removed.
- **Path alias**: use `@/` to reference `src/` (e.g., `import { cn } from "@/lib/utils"`).
- **No `console.log`** in production code — use `console.warn` or `console.error`, or use the `logger` from `@/lib/logger`.

### Formatting (Prettier)

- Double quotes, semicolons, trailing commas (ES5 style)
- 2-space indentation, 80-character print width

### React / Next.js

- **App Router** conventions — use `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`.
- **Route groups**: `(public)` for public-facing pages, `(admin)` for admin pages.
- **Server Components** by default; add `"use client"` only when client interactivity is needed.
- `AuthProvider` wraps the entire app at the root layout level.
- Toast notifications use `sonner` via `<Toaster />`.

### Supabase / Database

- **Server-side client**: `@/lib/supabase/server.ts` (SSR-compatible, reads cookies).
- **Client-side client**: `@/lib/supabase/client.ts` (browser singleton).
- Both clients include **mock fallbacks** for when Supabase env vars are not configured (enables local dev / E2E tests without a live database).
- **Auth flow**: Supabase Auth (OAuth) → `profiles` table with `is_admin` flag for role-based access.
- **Admin protection**: enforced in `proxy.ts` (edge middleware equivalent) and in each admin API route.
- **RLS (Row-Level Security)** is configured via migration `002_rls_policies_integrated.sql`.

### Database Tables

Key tables: `shows`, `episodes`, `hosts`, `show_hosts`, `comments`, `profiles`, `library_items`, `affiliate_contents`, `episode_affiliates`, `affiliate_clicks`, `tags`, `episode_tags`.

### Services Layer

All database access goes through `src/lib/services/`. Do not write raw Supabase queries directly in components or API routes. Services are split into:
- **Public services** (`services/*.ts`) — for public-facing data fetching
- **Admin services** (`services/admin/*.ts`) — for admin CRUD operations with pagination/filtering

### API Routes

- Admin endpoints verify `is_admin` before proceeding.
- Comment endpoints include spam filtering and client-side rate limiting.
- Pagination uses `offset`/`limit` pattern with `DEFAULT_PAGE_SIZE` (20) and `MAX_PAGE_SIZE` (100).
- Consistent JSON error responses with appropriate HTTP status codes.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=...       # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=...  # Supabase anonymous key
SUPABASE_SERVICE_ROLE_KEY=...      # Supabase service role key (server-only)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Design Tokens (from ui_reference)

The project uses a warm, brown-toned color palette defined in `tailwind.config.ts`:

- **Canvas**: `#E4CBAC` (warm tan background)
- **Surface**: `#FFFFFF` (white cards)
- **Text Primary**: `#664129` (brown)
- **Text Secondary**: `#B0967B` (muted brown)
- **CTA**: `#DAA551` (gold/amber)

## Image Hosts

`next.config.js` allowlists these remote image domains: `files.soundon.fm`, `image.firstory-cdn.me`, `d3mww1g1pfq2pt.cloudfront.net`, `d3t3ozftmdmh3i.cloudfront.net`, `storage.buzzsprout.com`, `*.sndcdn.com`.

## Commit Style

Commit messages follow conventional-commit style in a mix of English and Chinese:
- `feat:` / `fix:` / `refactor:` prefixes
- Scoped variants like `feat(mobile):`
- Chinese descriptions are acceptable (e.g., `修復首頁 React Hydration Error`)
