import { TriggerButton } from "@/components/TriggerButton";
import { HeroType } from "@/components/HeroType";
import { Features } from "@/components/Features";

export default function LandingPage() {
  return (
    <div className="flex flex-col w-full">
      <HeroType />

      <Features />

      <section className="max-w-3xl mx-auto w-full px-4 pb-16 text-sub leading-relaxed">
        <h2 className="font-display text-2xl font-bold text-text mb-3">
          A free typing speed test with live WPM
        </h2>
        <p>
          typerush is a free, minimalist typing test. Pick a timed test (15, 30, 60 or 120
          seconds), a word count, a quote or zen mode, and see your words per minute (WPM),
          accuracy and consistency update as you type.
        </p>
        <h2 className="font-display text-2xl font-bold text-text mt-8 mb-3">
          Race friends, climb the leaderboard
        </h2>
        <p>
          Sign in to save personal bests, earn XP, keep a daily streak, challenge friends to
          live 1v1 typing races and rank on the global leaderboard. No account needed to take
          a test.
        </p>
      </section>

      <section className="max-w-6xl mx-auto w-full px-4 pb-24">
        <div className="surface px-6 py-12 sm:px-12 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-text max-w-md">
            Ready to see your number?
          </h2>
          <TriggerButton href="/type">Start typing</TriggerButton>
        </div>
      </section>
    </div>
  );
}
