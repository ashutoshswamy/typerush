import { LegalLayout, LegalSection } from "@/components/LegalLayout";

const TOC = [
  { id: "guest-mode", title: "Guest mode" },
  { id: "what-we-collect", title: "What we collect" },
  { id: "what-s-public", title: "What’s public" },
  { id: "local-storage", title: "Local storage" },
  { id: "third-parties", title: "Third parties" },
  { id: "your-controls", title: "Your controls" },
  { id: "changes", title: "Changes" },
  { id: "contact", title: "Contact" },
];
const LAST_UPDATED = "July 12, 2026";

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated={LAST_UPDATED} toc={TOC}>
        <LegalSection id="guest-mode" title="Guest mode">
          <p>
            You can take typing tests without an account. In guest mode, results live only in your browser&rsquo;s
            memory for that session — nothing is sent to our servers or saved anywhere.
          </p>
        </LegalSection>

        <LegalSection id="what-we-collect" title="What we collect">
          <p>If you create an account, we store (via Firebase Authentication and Firestore):</p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>Your email, or Google/GitHub account ID, name, and profile photo — however you sign up.</li>
            <li>A username you choose, and an optional theme preference.</li>
            <li>Test results (WPM, accuracy, consistency, timing data) and personal bests you generate.</li>
            <li>Friend list and friend requests, keyed by user ID and username.</li>
            <li>Race invites and race results (yours and, denormalized, your opponent&rsquo;s final stats).</li>
            <li>XP and level, computed from your completed tests.</li>
          </ul>
        </LegalSection>

        <LegalSection id="what-s-public" title="What’s public">
          <p>
            Your username, profile photo, personal bests, recent tests, race history, XP/level, and leaderboard
            standing are visible to anyone on your public profile page and the leaderboard — that&rsquo;s the
            point of a leaderboard. We don&rsquo;t show your email or auth provider publicly.
          </p>
        </LegalSection>

        <LegalSection id="local-storage" title="Local storage">
          <p>
            Your theme and typing preferences (caret style, sound, blind mode) are saved in your browser&rsquo;s
            localStorage so they persist across visits. This never leaves your device.
          </p>
        </LegalSection>

        <LegalSection id="third-parties" title="Third parties">
          <p>
            Authentication and data storage run on Firebase (Google). If you sign in with Google or GitHub,
            those providers share your basic profile info with us per their own privacy policies. We don&rsquo;t
            sell your data or share it with advertisers.
          </p>
        </LegalSection>

        <LegalSection id="your-controls" title="Your controls">
          <p>From the account page you can, at any time:</p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>Export everything we have on you as a JSON file.</li>
            <li>Wipe test history, personal bests, race history, and reset XP/level — your account and friends stay.</li>
            <li>Delete your account entirely, which removes your profile, test data, and Firebase Auth identity.</li>
          </ul>
        </LegalSection>

        <LegalSection id="changes" title="Changes">
          <p>This policy may be updated occasionally; the date above reflects the latest revision.</p>
        </LegalSection>

        <LegalSection id="contact" title="Contact">
          <p>
            Questions? Reach out at{" "}
            <a href="mailto:ashutoshswamy397@gmail.com" className="text-main underline underline-offset-2">
              ashutoshswamy397@gmail.com
            </a>
            .
          </p>
        </LegalSection>
    </LegalLayout>
  );
}
