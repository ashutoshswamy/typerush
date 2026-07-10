# typerush

A minimalist, fast typing speed test web app inspired by Monkeytype. Type randomly generated word sequences against a timer or word-count target, and get real-time WPM, accuracy, and consistency stats — with a results screen, personal bests, and a global leaderboard.

Live at [typerush.ashutoshswamy.in](https://typerush.ashutoshswamy.in).

## Features

- **Test modes:** Time (15/30/60/120s), Words (10/25/50/100), Quote, Zen
- **Live typing engine:** per-character correctness highlighting, real-time WPM (raw + net), accuracy, and consistency, driven by `performance.now()` for drift-free timing
- **Results screen:** WPM, accuracy, consistency, char stats, and a per-second WPM graph
- **Auth + history:** sign in with Google or email/password to save test results, personal bests (per mode/duration/word-count), and appear on the leaderboard
- **Leaderboard:** global, filterable by mode and duration
- **Themes:** 40 color themes (20 dark, 20 light), persisted across sessions
- **Settings:** caret style, sound on click, blind mode, font, smooth caret

## Tech Stack

- [Next.js](https://nextjs.org) 16 (App Router), TypeScript (strict mode)
- Tailwind CSS
- Firebase Authentication (Google + Email/Password) and Firestore
- Zustand for the typing-engine state
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

Deploy `firestore.rules` to your Firebase project so leaderboard/personal-best writes are validated server-side.

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
