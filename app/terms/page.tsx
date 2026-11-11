import { LegalLayout, LegalSection } from "@/components/LegalLayout";

const TOC = [
  { id: "acceptance", title: "Acceptance" },
  { id: "accounts", title: "Accounts" },
  { id: "acceptable-use", title: "Acceptable use" },
  { id: "your-data", title: "Your data" },
  { id: "no-warranty", title: "No warranty" },
  { id: "changes", title: "Changes" },
  { id: "contact", title: "Contact" },
];
const LAST_UPDATED = "July 12, 2026";

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" updated={LAST_UPDATED} toc={TOC}>
        <LegalSection id="acceptance" title="Acceptance">
          <p>
            typerush is a free typing speed test. By using the site you agree to these terms. If you don&rsquo;t
            agree, don&rsquo;t use the site.
          </p>
        </LegalSection>

        <LegalSection id="accounts" title="Accounts">
          <p>
            You can use typerush as a guest with no account. Creating an account (email/password, Google, or
            GitHub) lets you save test history, personal bests, and race results, and appear on the leaderboard.
            You&rsquo;re responsible for keeping your credentials secure and for anything that happens under your
            account. Usernames must not impersonate another person or be used for abuse or harassment.
          </p>
        </LegalSection>

        <LegalSection id="acceptable-use" title="Acceptable use">
          <p>
            Don&rsquo;t use bots, scripts, or automation to inflate WPM, XP, or leaderboard rank; don&rsquo;t
            attempt to bypass or exploit the app or its Firestore security rules; don&rsquo;t harass other users
            through usernames, friend requests, or race invites. We may remove content, reset stats, or terminate
            accounts that violate this.
          </p>
        </LegalSection>

        <LegalSection id="your-data" title="Your data">
          <p>
            Test results, personal bests, race history, and leaderboard entries you generate are yours. The
            account page lets you export your data as JSON, wipe your test/race history and XP, or delete your
            account and all associated data entirely — see the{" "}
            <a href="/privacy" className="text-main underline underline-offset-2">
              Privacy Policy
            </a>{" "}
            for what&rsquo;s stored and for how long.
          </p>
        </LegalSection>

        <LegalSection id="no-warranty" title="No warranty">
          <p>
            typerush is provided &ldquo;as is,&rdquo; with no guarantee of uptime, accuracy, or fitness for any
            particular purpose. Features (leaderboard, races, XP, etc.) may change or be removed at any time.
          </p>
        </LegalSection>

        <LegalSection id="changes" title="Changes">
          <p>
            These terms may be updated occasionally; continued use after a change means you accept the new
            terms.
          </p>
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
