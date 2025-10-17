# Repository Guidelines

## Project Structure & Module Organization
The project uses the Next.js App Router. Route groups and server actions live under `app/`, with shared UI fragments in `app/components` and auth/sockets context in `app/context` and `app/hooks`. Legacy shared atoms remain in `components/`—prefer adding new reusable primitives there. Database schema resides in `prisma/schema.prisma`, which generates the client into `app/generated/prisma`. Static assets, fonts, and upload placeholders belong in `public/`, while repo-level configuration sits at the root (`tailwind.config.ts`, `eslint.config.mjs`, `middleware.ts`).

## Build, Test, and Development Commands
- `npm run dev` starts the local server on port 3000 with hot reload; ensure a valid `.env` before signing in.
- `npm run build` creates the production bundle and validates route metadata.
- `npm run start` serves the built app; run this after `npm run build` for smoke testing.
- `npm run lint` runs Next + ESLint against all TypeScript and TSX files.
- `npx prisma migrate dev` applies MongoDB schema changes locally and rebuilds the generated client.

## Coding Style & Naming Conventions
Use TypeScript with React function components. Keep indentation at two spaces and rely on Prettier defaults baked into Next/ESLint (no manual formatting tweaks). Components and hooks use PascalCase files (`Avatar.tsx`, `useOtherUser.ts`) while server actions stay in camelCase files inside `app/actions`. Prefer async/await, Tailwind utility classes, and `clsx` for conditional styling.

## Testing Guidelines
An automated test suite has not been established; when adding coverage, colocate `*.test.ts(x)` files beside the component or route. Favor React Testing Library for UI behavior and integration-style checks that exercise server actions. Always run `npm run lint` and verify critical flows manually (`/conversations`, `/users`, OAuth sign-in) before opening a PR.

## Commit & Pull Request Guidelines
Follow the concise, imperative commit style already in Git history (`add cloudinary`, `chat page`). Group related changes into a single commit and include schema or config updates in the same commit when they are required. PRs should explain the user-facing impact, list environment or migration steps (`DATABASE_URL`, OAuth secrets), and attach screenshots or GIFs for UI tweaks. Link tracking issues when available and flag any follow-up tasks in the description.

## Security & Configuration Notes
Environment variables include `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, and provider credentials (`GITHUB_ID`, `GOOGLE_CLIENT_ID`, etc.). Never commit `.env` files; update `README.md` if new variables are introduced. Upload features depend on browser-side credentials—review `next.config.mjs` when adding new host domains.
