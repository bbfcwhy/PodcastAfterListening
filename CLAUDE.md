# PodcastAfterListening Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-01-28

## Active Technologies
- TypeScript 5.x（與 001 一致） + Next.js 14+ (App Router), Tailwind CSS 4.x, shadcn/ui（既有）, ui_reference 為風格參考來源 (002-ui-reference-style)
- N/A（本 feature 不涉及資料庫變更） (002-ui-reference-style)
- TypeScript 5.x, Node 18+ + Next.js 16, React 19, Supabase (SSR + JS client), Tailwind CSS 4 (003-admin-content-editing)
- Supabase (PostgreSQL)；既有表：shows, episodes, comments, affiliate_contents, profiles (003-admin-content-editing)
- TypeScript 5.x, Node 18+ + Next.js 14+, React 19, Supabase (SSR + JS client), Tailwind CSS 4, shadcn/ui, Lucide icons (004-admin-ui-shows)
- Supabase (PostgreSQL)；既有表：shows（id, name, slug, description, cover_image_url, original_url, created_at, updated_at） (004-admin-ui-shows)
- TypeScript 5.x（延續既有專案） + Next.js 16 (App Router), @supabase/ssr, 既有 UI / services (005-rss-metadata-transcript)
- Supabase (PostgreSQL)；Show / Episode 擴充欄位或對應表 (005-rss-metadata-transcript)

- TypeScript 5.x (前後端統一) + Next.js 14+ (App Router), @supabase/ssr, shadcn/ui, Tailwind CSS (001-podcast-review-site)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5.x (前後端統一): Follow standard conventions

## Recent Changes
- 005-rss-metadata-transcript: Added TypeScript 5.x（延續既有專案） + Next.js 16 (App Router), @supabase/ssr, 既有 UI / services
- 004-admin-ui-shows: Added [if applicable, e.g., PostgreSQL, CoreData, files or N/A]
- 004-admin-ui-shows: Added TypeScript 5.x, Node 18+ + Next.js 14+, React 19, Supabase (SSR + JS client), Tailwind CSS 4, shadcn/ui, Lucide icons


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
