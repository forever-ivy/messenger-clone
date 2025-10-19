# Repository Guidelines

## Project Structure & Module Organization
The Next.js App Router lives in `app/`, with server actions in `app/actions` and API handlers in `app/api`. Shared authentication UI stays under `app/components`, while reusable atoms belong in `components/`. Database schema sits in `prisma/schema.prisma`, generating Prisma Client code in `app/generated/prisma`. Store static assets inside `public/`. When you add page-specific fragments, prefer a colocated `app/<route>/components` directory.

## Build, Test & Development Commands
- `npm run dev`: Start the local Next.js dev server at port 3000 (requires a populated `.env`).
- `npm run lint`: Run the Next.js ESLint suite; resolve all errors before committing.
- `npm run build`: Create a production build and verify route metadata.
- `npm run start`: Preview the production bundle locally after `npm run build`.
- `npx prisma migrate dev`: Apply MongoDB schema changes and regenerate Prisma Client outputs.

## Coding Style & Naming Conventions
Use TypeScript React function components with async/await and Tailwind utilities. Keep indentation to two spaces, and rely on the repo’s ESLint/Prettier config—avoid manual alignment. Components and hooks use PascalCase (`Avatar.tsx`, `useConversation.ts`); server actions use camelCase. Reach for `clsx` when composing conditional class names.

## Testing Guidelines
There is no formal automated suite yet. When you introduce tests, colocate them beside their targets (e.g., `Component.test.tsx`) and prefer React Testing Library. Always run `npm run lint` before pushing, and manually verify `/users`, `/conversations`, and OAuth login flows.

## Commit & Pull Request Practices
Commit messages follow short, imperative phrases (`add cloudinary`, `chat page`). Keep related changes in one commit when possible. PRs should summarize user-facing impact, list environment or migration steps, attach UI screenshots/GIFs for visual tweaks, and link relevant issues alongside any follow-up TODOs.

## Security & Configuration Tips
Ensure `.env` stays untracked; required variables include `DATABASE_URL`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL` with provider credentials. Update `README.md` when adding environment keys, and extend `next.config.mjs` `images.remotePatterns` if you introduce new external image domains.
