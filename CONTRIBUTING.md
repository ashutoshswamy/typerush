# Contributing to typerush

## Setup

```bash
npm install
npm run dev
```

You'll need a Firebase project (Authentication + Firestore) and a `.env.local` — see the README for the required `NEXT_PUBLIC_FIREBASE_*` variables.

## Before opening a PR

```bash
npm run lint
npm run build   # runs the TypeScript project check too
```

Both must pass clean. There's no test suite in this repo yet.

## Code style

- TypeScript strict mode — no `any` escapes without good reason.
- Zustand (`store/`) for anything updating per-keystroke; don't reach for React Context or component state for engine state.
- Keep logic in `lib/` (e.g. `lib/wpm.ts`, `lib/consistency.ts`, `lib/wordgen.ts`) as small, pure, testable functions rather than inlining math into components or the store.
- Dark-first theme via CSS variables (`--bg`, `--main`, `--sub`, `--text`, etc. in `globals.css`) — don't hardcode colors in components. If you add a theme, update it in all three places: the `ThemeName` union in `store/settings.ts`, the `THEMES` list in `lib/themes.ts`, and the matching `[data-theme]` block in `globals.css`.
- Follow the type-role convention: `.font-test` (IBM Plex Mono) for the typing area, `.font-display` (Big Shoulders) for results/headings, default sans for UI chrome.

## Firestore changes

- `testResults` docs are append-only — never edit past docs.
- Any change to how `personalBests` or `leaderboard` docs are written must keep `firestore.rules` in sync (owner-only writes, WPM must only increase) so scores can't be spoofed from the client.

## Commit / PR conventions

Keep commits focused and messages descriptive. Open a PR against `main` and describe what changed and why.
