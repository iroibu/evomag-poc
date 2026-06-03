# EvoMag POC — Agent Guidelines

EvoMag is a **mobile-first ecommerce PWA** (proof of concept) for a Romanian electronics retailer, built with React + TypeScript + Vite and deployed to GitHub Pages.

## Architecture

```
src/
  app/
    App.tsx               # Root component — tab-based SPA navigation (no router)
    components/           # Screen-level and shared UI components
      ui/                 # shadcn/ui primitives (Radix UI + Tailwind)
    services/             # Business logic + localStorage persistence + AI calls
  data/                   # Static JSON catalogs (products, categories, reviews, …)
  styles/                 # Global CSS, Tailwind entry, theme tokens
```

- **Navigation** is state-driven in `App.tsx` (`activeTab` + overlay flags); there is no React Router.
- **Persistence** is handled via `localStorage` in `src/app/services/` (cart, wishlist, orders, addresses, cards, recently viewed, user preferences).
- **AI features** (search, assistant) call the Google Gemini API through `src/app/services/gemini*.ts`. The API key is obfuscated in `gemini.ts` — do not log or expose it.
- **Data** lives in `src/data/*.json`; `types.ts` defines shared TypeScript interfaces for that data.

## Tech Stack

| Concern | Library |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 6 |
| Styling | Tailwind CSS v4 |
| UI primitives | shadcn/ui (Radix UI) + MUI v7 |
| AI | Google Gemini (`@google/genai`) |
| Maps | React-Leaflet (locker picker) |
| Charts | Recharts |
| PWA | vite-plugin-pwa |

## Build & Dev

```bash
npm install     # install dependencies
npm run dev     # start dev server
npm run build   # production build → ./dist
```

Deployment is automatic on push to `main` via `.github/workflows/deploy.yml` (GitHub Pages, base path `/evomag-poc/`).

## Conventions

- **Language**: All user-facing text is in **Romanian**. Keep new UI strings in Romanian.
- **Layout**: Mobile-first, constrained to `max-w-md mx-auto`. Do not break this container when adding screens.
- **Path alias**: `@` resolves to `src/` (configured in `vite.config.ts`).
- **New screens**: Add as a component in `src/app/components/`, wire the navigation state in `App.tsx`, and add a tab entry in `BottomNav.tsx` only if it requires a persistent tab.
- **New services**: Place in `src/app/services/`, use `localStorage` for client-side persistence, and keep AI calls inside the `gemini*.ts` files.
- **Styling**: Prefer Tailwind utility classes and shadcn/ui components over custom CSS. Custom theme tokens are in `src/styles/theme.css`.
- **No test suite** exists. Do **not** run the build or check for errors after making changes.
