import { SectionLabel } from "@/components/SectionLabel";

const LAST_UPDATED = "July 12, 2026";

export default function TermsPage() {
  return (
    <div className="flex flex-col gap-10 max-w-2xl mx-auto py-14 w-full">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-4xl text-main tracking-tight leading-none">Terms of Service</h1>
        <p className="font-test text-sub text-[10px] tracking-[0.15em] uppercase">last updated {LAST_UPDATED}</p>
      </div>

      <div className="flex flex-col gap-8 text-sm text-text/80 leading-relaxed">
        <section className="flex flex-col gap-2">
          <SectionLabel>acceptance</SectionLabel>
          <p>
            typerush is a free typing speed test. By using the site you agree to these terms. If you don&rsquo;t
            agree, don&rsquo;t use the site.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <SectionLabel>accounts</SectionLabel>
          <p>
            You can use typerush as a guest with no account. Creating an account (email/password, Google, or
            GitHub) lets you save test history, personal bests, and race results, and appear on the leaderboard.
            You&rsquo;re responsible for keeping your credentials secure and for anything that happens under your
            account. Usernames must not impersonate another person or be used for abuse or harassment.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <SectionLabel>acceptable use</SectionLabel>
          <p>
            Don&rsquo;t use bots, scripts, or automation to inflate WPM, XP, or leaderboard rank; don&rsquo;t
            attempt to bypass or exploit the app or its Firestore security rules; don&rsquo;t harass other users
            through usernames, friend requests, or race invites. We may remove content, reset stats, or terminate
            accounts that violate this.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <SectionLabel>your data</SectionLabel>
          <p>
            Test results, personal bests, race history, and leaderboard entries you generate are yours. The
            account page lets you export your data as JSON, wipe your test/race history and XP, or delete your
            account and all associated data entirely — see the{" "}
            <a href="/privacy" className="text-main hover:underline">
              Privacy Policy
            </a>{" "}
            for what&rsquo;s stored and for how long.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <SectionLabel>no warranty</SectionLabel>
          <p>
            typerush is provided &ldquo;as is,&rdquo; with no guarantee of uptime, accuracy, or fitness for any
            particular purpose. Features (leaderboard, races, XP, etc.) may change or be removed at any time.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <SectionLabel>changes</SectionLabel>
          <p>
            These terms may be updated occasionally; continued use after a change means you accept the new
            terms.
          </p>
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
