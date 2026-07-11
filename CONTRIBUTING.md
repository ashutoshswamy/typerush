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
- Any change to how `personalBests`, `leaderboard`, or `users/{uid}` stat fields (`xp`, `testsCompleted`, `totalTimeSeconds`, `longestStreak`) are written must keep `firestore.rules` in sync — those fields only ratchet up (or reset to exactly 0), enforced via the `ratchetOrReset()` rules helper, so they can't be spoofed from the client.
- Usernames must match `/^[a-zA-Z0-9_]{3,20}$/` (`USERNAME_PATTERN` in `lib/firestore.ts`) — enforced both client-side and in `firestore.rules`'s `usernameOk()` helper. Don't add a way to set a username that bypasses `setUsername()`.
- After changing `firestore.rules`, deploy it: `npx firebase-tools deploy --only firestore:rules --project <project-id>` (requires `npx firebase-tools login` first). Untested rule changes are a common source of silent `permission-denied` bugs — features (friends, races, invites) that write to a new collection won't work until the matching rule is both written *and* deployed.

## Commit / PR conventions

Keep commits focused and messages descriptive. Open a PR against `main` and describe what changed and why.
