/**
 * The celebration shown after marking a contact as talked. The choice is a
 * per-browser preference in localStorage, picked on /settings. The particle
 * libraries load only when an effect actually plays.
 */

export const TALK_EFFECTS = ["none", "small", "extreme"] as const;
export type TalkEffect = (typeof TALK_EFFECTS)[number];

const TALK_EFFECT_STORAGE_KEY = "talkEffect";
// The small burst is on screen about 3 s. The extreme one fires for 2.5 s,
// then fades like the small one, so it ends after about 6 s.
const EXTREME_DURATION_MS = 2500;

// One party at a time: extra clicks during the extreme effect add nothing.
let isPartying = false;

function isTalkEffect(value: unknown): value is TalkEffect {
  return TALK_EFFECTS.includes(value as TalkEffect);
}

/** The saved effect, or "small" when nothing valid is saved or storage is blocked. */
export function readTalkEffect(): TalkEffect {
  try {
    const saved = localStorage.getItem(TALK_EFFECT_STORAGE_KEY);
    return isTalkEffect(saved) ? saved : "small";
  } catch {
    return "small";
  }
}

// The "storage" event fires only in other tabs, so saves in this tab notify
// subscribers directly.
const listeners = new Set<() => void>();

export function saveTalkEffect(effect: TalkEffect) {
  try {
    localStorage.setItem(TALK_EFFECT_STORAGE_KEY, effect);
  } catch (error) {
    console.error("Could not save the talk effect:", error);
  }
  listeners.forEach((listener) => listener());
}

/** Subscribe API for `useSyncExternalStore`; also follows changes from other tabs. */
export function subscribeTalkEffect(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

/**
 * Plays the effect. "small" bursts from `sourceElement` when given. Never
 * throws: the effect is decoration and must not break the action behind it.
 */
export async function playTalkEffect(
  effect: TalkEffect,
  sourceElement?: Element | null,
) {
  if (
    effect === "none" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return;
  }
  try {
    if (effect === "small") {
      const { confetti } = await import("@tsparticles/confetti");
      await confetti({
        particleCount: 100,
        spread: 70,
        origin: originOf(sourceElement),
      });
    } else {
      await playExtreme();
    }
  } catch (error) {
    console.error("Could not play the talk effect:", error);
  }
}

/** The element's center as fractions of the viewport, as confetti expects. */
function originOf(element?: Element | null) {
  if (!element) {
    return { y: 0.6 };
  }
  const rect = element.getBoundingClientRect();
  return {
    x: (rect.left + rect.width / 2) / window.innerWidth,
    y: (rect.top + rect.height / 2) / window.innerHeight,
  };
}

/**
 * Full-screen party: one big burst from the middle, then confetti cannons
 * firing from both sides for 2.5 s.
 */
async function playExtreme() {
  if (isPartying) {
    return;
  }
  isPartying = true;
  try {
    const { confetti } = await import("@tsparticles/confetti");
    await confetti({
      particleCount: 150,
      spread: 120,
      startVelocity: 55,
      origin: { y: 0.6 },
    });
    await repeatUntil(
      () =>
        Promise.all([
          confetti({
            particleCount: 30,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.7 },
          }),
          confetti({
            particleCount: 30,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.7 },
          }),
        ]),
      200,
      performance.now() + EXTREME_DURATION_MS,
    );
  } finally {
    isPartying = false;
  }
}

/** Calls `fire` every `intervalMs` until `endTime`, resolving when done. */
function repeatUntil(
  fire: () => Promise<unknown>,
  intervalMs: number,
  endTime: number,
) {
  return new Promise<void>((resolve) => {
    const tick = () => {
      if (performance.now() > endTime) {
        resolve();
        return;
      }
      fire().catch((error) =>
        console.error("Talk effect frame failed:", error),
      );
      setTimeout(tick, intervalMs);
    };
    tick();
  });
}
