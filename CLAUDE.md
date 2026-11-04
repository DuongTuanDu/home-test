# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Vite dev server (http://localhost:5173)
- `npm run build` — `tsc -b && vite build` (type-checks first)
- `npm run lint` — ESLint
- `npm run preview` — serve the production build

There is no test runner configured.

## Architecture

React 19 + Vite + TypeScript SPA styled with Tailwind CSS 3 (theme variables in `src/index.css`). The `@` alias maps to `src/` (set in both `vite.config.ts` and the tsconfig). `components.json` is configured for shadcn/ui (new-york style; `ui` → `@/components/ui`, `utils` → `@/lib/utils`), but those directories don't exist yet.

Flow: `main.tsx` (BrowserRouter) → `App.tsx` → `routes/index.tsx` → `pages/*`.

- Routes are exported as JSX fragments, not components. Each feature has a file in `src/routes/common/*.route.tsx` exporting `<Route>` elements, which `routes/index.tsx` composes inside the shared `<Route element={<Layout />}>`. To add a page: create it under `src/pages/`, add a `*.route.tsx`, and include it in `routes/index.tsx`.
- `src/components/Carousel` is a custom carousel (no third-party carousel library is used in it, though `embla-carousel-react` is installed). Drag/swipe uses native Pointer Events with pointer capture; a drag of at least `minDragDistance` (default 40px) changes slides, and clicks are suppressed for 300ms after a drag so slide links don't fire. Slides are typed as `CarouselSlide` (`id`, `title`, `image`, `landing_page`) in `types.ts`; the public API is re-exported from `index.ts`.
- The Home page (`src/pages/Home/index.tsx`) holds hardcoded demo slides.

The README is written in Vietnamese and documents the drag/swipe design in more detail.
