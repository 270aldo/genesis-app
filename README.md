# GENESIS Mobile App

AI-powered performance and longevity mobile coaching platform built with Expo SDK 54.

## Requirements

- Node.js 20+
- npm 10+

## Setup

```bash
npm install
cp .env.example .env.local
```

Fill required environment variables in `.env.local`.

## Development

```bash
npx expo start --clear
```

Useful commands:

```bash
npm run ios
npm run android
npm run web
npx tsc --noEmit
```

## Project Structure

- `app/` Expo Router routes
- `components/` UI, widgets, and feature components
- `stores/` Zustand stores
- `services/` API and Supabase clients
- `constants/` Theme tokens
- `types/` Shared TypeScript types
- `docs/` Product and architecture documents
