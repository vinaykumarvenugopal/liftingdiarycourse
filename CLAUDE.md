# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Stack

- **Next.js 16** with App Router (`src/app/`)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4** (configured via PostCSS)

## Architecture

This is a fresh Next.js App Router project. All pages and layouts live under `src/app/`. The entry point is `src/app/page.tsx` and the root layout is `src/app/layout.tsx`. Global styles are in `src/app/globals.css`.
