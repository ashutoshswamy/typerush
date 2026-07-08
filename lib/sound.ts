let ctx: AudioContext | null = null;

// Synthesized, not an mp3 asset — a soft sine "tock" per keystroke, low-pass
// filtered to strip harmonics and pitch-jittered slightly so it doesn't
// sound like a machine gun on fast runs. Keeps the setting dependency-free.
export function playClickSound() {
  if (typeof window === "undefined") return;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return;
  ctx ??= new Ctor();
  if (ctx.state === "suspended") void ctx.resume();

  const now = ctx.currentTime;
  const jitter = 1 + (Math.random() - 0.5) * 0.06;

  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.value = 380 * jitter;
  filter.type = "lowpass";
  filter.frequency.value = 1200;

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.045, now + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

  osc.connect(filter).connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.06);
}
