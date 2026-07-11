# typerush

A minimalist, fast typing speed test web app inspired by Monkeytype. Type randomly generated word sequences against a timer or word-count target, get real-time WPM, accuracy, and consistency stats, add friends and race them live, and level up via XP.

Live at [typerush.ashutoshswamy.in](https://typerush.ashutoshswamy.in).

## Features

- **Test modes:** Time (15/30/60/120s), Words (10/25/50/100), Quote, Zen
- **Live typing engine:** per-character correctness highlighting, real-time WPM (raw + net), accuracy, and consistency, driven by `performance.now()` for drift-free timing
- **Results screen:** WPM, accuracy, consistency, char stats, a per-second WPM graph, and XP gained
- **Auth + history:** sign in with Google, GitHub, or email/password to save test results, personal bests (per mode/duration/word-count), race history, and XP
- **Friends:** search by username, send/accept friend requests, mutual friend list
- **Races:** invite a friend to a live 1v1 typing race (chosen mode/duration/word-count), synced in real time, with a 30-second invite timeout
- **XP & leveling:** every completed test (including races) earns XP toward an escalating level curve; leaderboard shows each racer's level
- **Streaks:** daily current/longest typing streak, tracked on your profile
- **Profile stats:** tests taken, total time typed, personal bests, recent tests, race history
- **Data export:** full account as JSON, or test-by-test results as CSV
- **Leaderboard:** global, filterable by mode and duration
- **Themes:** 40 color themes (20 dark, 20 light), persisted across sessions — default is Ayu Dark
- **Settings:** caret style, sound on click, blind mode, font
- **Legal:** Terms of Service and Privacy Policy pages

## Tech Stack

- [Next.js](https://nextjs.org) 16 (App Router), TypeScript (strict mode)
- Tailwind CSS
- Firebase Authentication (Google, GitHub, Email/Password) and Firestore — no Cloud Functions, all writes are client-side and validated by `firestore.rules`
- Zustand for the typing-engine state and persisted settings
- Hosted on Vercel

## Getting Started

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

You'll need a Firebase project with Authentication and Firestore enabled. Create a `.env.local` with:

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Deploy `firestore.rules` to your Firebase project (`npx firebase-tools deploy --only firestore:rules`) so leaderboard/personal-best/friends/race writes are validated server-side — the app won't work correctly without this, since races, friends, and stat writes all get rejected by the default rules otherwise.

## Scripts

```bash
npm run dev      # start dev server
npm run build    # production build (includes type checking)
npm run start    # serve the production build
npm run lint     # eslint
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

[MIT](./LICENSE) © Ashutosh Swamy
