import { SectionLabel } from "@/components/SectionLabel";

const LAST_UPDATED = "July 12, 2026";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col gap-10 max-w-2xl mx-auto py-14 w-full">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-4xl text-main tracking-tight leading-none">Privacy Policy</h1>
        <p className="font-test text-sub text-[10px] tracking-[0.15em] uppercase">last updated {LAST_UPDATED}</p>
      </div>

      <div className="flex flex-col gap-8 text-sm text-text/80 leading-relaxed">
        <section className="flex flex-col gap-2">
          <SectionLabel>guest mode</SectionLabel>
          <p>
            You can take typing tests without an account. In guest mode, results live only in your browser&rsquo;s
            memory for that session — nothing is sent to our servers or saved anywhere.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <SectionLabel>what we collect</SectionLabel>
          <p>If you create an account, we store (via Firebase Authentication and Firestore):</p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>Your email, or Google/GitHub account ID, name, and profile photo — however you sign up.</li>
            <li>A username you choose, and an optional theme preference.</li>
            <li>Test results (WPM, accuracy, consistency, timing data) and personal bests you generate.</li>
            <li>Friend list and friend requests, keyed by user ID and username.</li>
            <li>Race invites and race results (yours and, denormalized, your opponent&rsquo;s final stats).</li>
            <li>XP and level, computed from your completed tests.</li>
          </ul>
        </section>

        <section className="flex flex-col gap-2">
          <SectionLabel>what&rsquo;s public</SectionLabel>
          <p>
            Your username, profile photo, personal bests, recent tests, race history, XP/level, and leaderboard
            standing are visible to anyone on your public profile page and the leaderboard — that&rsquo;s the
            point of a leaderboard. We don&rsquo;t show your email or auth provider publicly.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <SectionLabel>local storage</SectionLabel>
          <p>
            Your theme and typing preferences (caret style, sound, blind mode) are saved in your browser&rsquo;s
            localStorage so they persist across visits. This never leaves your device.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <SectionLabel>third parties</SectionLabel>
          <p>
            Authentication and data storage run on Firebase (Google). If you sign in with Google or GitHub,
            those providers share your basic profile info with us per their own privacy policies. We don&rsquo;t
            sell your data or share it with advertisers.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <SectionLabel>your controls</SectionLabel>
          <p>From the account page you can, at any time:</p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>Export everything we have on you as a JSON file.</li>
            <li>Wipe test history, personal bests, race history, and reset XP/level — your account and friends stay.</li>
            <li>Delete your account entirely, which removes your profile, test data, and Firebase Auth identity.</li>
          </ul>
        </section>

        <section className="flex flex-col gap-2">
          <SectionLabel>changes</SectionLabel>
          <p>This policy may be updated occasionally; the date above reflects the latest revision.</p>
        </section>

        <section className="flex flex-col gap-2">
          <SectionLabel>contact</SectionLabel>
          <p>
            Questions? Reach out at{" "}
            <a href="mailto:ashutoshswamy397@gmail.com" className="text-main hover:underline">
              ashutoshswamy397@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
