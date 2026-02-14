# Repository Guidelines

## Project Structure & Module Organization
This repository combines an Expo mobile app and a FastAPI BFF:
- `app/`: Expo Router entrypoints and route groups (`(auth)`, `(tabs)`, `(modals)`, `(screens)`).
- `components/`: Reusable UI and feature modules (`ui/`, `genesis/`, `training/`, `nutrition/`, etc.).
- `stores/`: Zustand stores (`useXStore.ts`) for app state.
- `services/`: Supabase, agent, vision, and native integration clients.
- `constants/`, `types/`, `utils/`: Shared tokens, types, and helpers.
- `bff/`: FastAPI backend (`routers/`, `services/`, `models/`, `migrations/`).
- `supabase/migrations/`: SQL schema and seed migrations used by the app.
- `assets/` and `docs/plans/`: Static assets and implementation plans.

## Build, Test, and Development Commands
- `npm install`: Install app dependencies.
- `npm run start`: Start Expo dev server.
- `npm run ios` / `npm run android` / `npm run web`: Run the app on each target.
- `npx tsc --noEmit`: Strict TypeScript check (run before opening a PR).

Backend (`bff/`):
- `python -m venv .venv && source .venv/bin/activate`: Create/activate virtualenv.
- `pip install -r requirements.txt`: Install backend dependencies.
- `uvicorn main:app --reload --port 8000`: Run local API.
- Health check: `GET http://localhost:8000/health`.

## Coding Style & Naming Conventions
- TypeScript is strict (`strict`, `noImplicitAny`, `strictNullChecks`): avoid `any`.
- Follow existing style: 2-space indentation in TS/TSX, 4-space indentation in Python.
- Use `PascalCase` for components/screens, `useX` for hooks, `useXStore` for Zustand stores, and `camelCase` for helpers.
- No enforced lint/format scripts are currently configured; keep changes consistent with surrounding files.

## Testing Guidelines
- No automated unit test suite is currently configured.
- Minimum validation for each change: run `npx tsc --noEmit`; run impacted Expo target(s) (`ios`, `android`, or `web`); if backend changes, run BFF and verify `/health` plus modified endpoints.
- Include SQL migrations for schema/data updates under `supabase/migrations/`.

## Commit & Pull Request Guidelines
- Use Conventional Commit style seen in history: `feat(app): ...`, `fix(nav): ...`, `chore(bff): ...`, `docs: ...`.
- Keep commits focused and scoped by area.
- PRs should include: what changed and why, linked issue/task, commands/tests run, screenshots or recordings for UI updates, and migration notes when touching `supabase/` or `bff/migrations/`.

## Security & Configuration Tips
- Do not commit secrets.
- Copy `.env.example` to `.env.local` and `bff/.env.example` to `bff/.env`, then set keys locally.
- Keep Supabase tokens and external API keys in environment variables only.
