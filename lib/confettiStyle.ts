/**
 * The celebration shown after marking a contact as talked. The choice is a
 * per-browser preference in localStorage, picked on /settings. The particle
 * library is not in the initial bundle: `preloadConfettiStyle` loads it once the
 * page is idle, so the first confetti does not wait for a download.
 */

export const CONFETTI_STYLES = ["none", "small", "extreme"] as const;
export type ConfettiStyle = (typeof CONFETTI_STYLES)[number];

const CONFETTI_STYLE_STORAGE_KEY = "confettiStyle";
// The small burst is on screen about 3 s. The extreme one fires for 2.5 s,
// then fades like the small one, so it ends after about 6 s.
const EXTREME_DURATION_MS = 2500;

// One party at a time: extra clicks during the extreme confetti add nothing.
let isPartying = false;

let confettiModule: Promise<typeof import("@tsparticles/confetti")> | null =
  null;
let isPreloadScheduled = false;

function loadConfetti() {
  if (!confettiModule) {
    confettiModule = import("@tsparticles/confetti");
    // A failed load (offline) is retried on the next call.
    confettiModule.catch(() => {
      confettiModule = null;
    });
  }
  return confettiModule;
}

function canPlay(style: ConfettiStyle) {
  return (
    style !== "none" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function isConfettiStyle(value: unknown): value is ConfettiStyle {
  return CONFETTI_STYLES.includes(value as ConfettiStyle);
}

/** The saved style, or "small" when nothing valid is saved or storage is blocked. */
export function readConfettiStyle(): ConfettiStyle {
  try {
    const saved = localStorage.getItem(CONFETTI_STYLE_STORAGE_KEY);
    return isConfettiStyle(saved) ? saved : "small";
  } catch {
    return "small";
  }
}

// The "storage" event fires only in other tabs, so saves in this tab notify
// subscribers directly.
const listeners = new Set<() => void>();

export function saveConfettiStyle(style: ConfettiStyle) {
  try {
    localStorage.setItem(CONFETTI_STYLE_STORAGE_KEY, style);
  } catch (error) {
    console.error("Could not save the confetti style:", error);
  }
  listeners.forEach((listener) => listener());
}

/** Subscribe API for `useSyncExternalStore`; also follows changes from other tabs. */
export function subscribeConfettiStyle(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

/**
 * Loads the particle library when the browser is idle, so the first confetti
 * plays without a download. Safe to call many times; it schedules once, and
 * skips the download when no confetti can play.
 */
export function preloadConfettiStyle() {
  if (isPreloadScheduled || !canPlay(readConfettiStyle())) {
    return;
  }
  isPreloadScheduled = true;
  const load = () => {
    // Best effort: playConfettiStyle retries and logs a failed load.
    loadConfetti().catch(() => {});
  };
  // Safari has no requestIdleCallback.
  if ("requestIdleCallback" in window) {
    requestIdleCallback(load, { timeout: 3000 });
  } else {
    setTimeout(load, 2000);
  }
}

/**
 * Plays the confetti. "small" bursts from `sourceElement` when given. Never
 * throws: the confetti is decoration and must not break the action behind it.
 */
export async function playConfettiStyle(
  style: ConfettiStyle,
  sourceElement?: Element | null,
) {
  if (!canPlay(style)) {
    return;
  }
  try {
    if (style === "small") {
      const { confetti } = await loadConfetti();
      await confetti({
        particleCount: 100,
        spread: 70,
        origin: originOf(sourceElement),
      });
    } else {
      await playExtreme();
    }
  } catch (error) {
    console.error("Could not play the confetti:", error);
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
    const { confetti } = await loadConfetti();
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
      fire().catch((error) => console.error("Confetti frame failed:", error));
      setTimeout(tick, intervalMs);
    };
    tick();
  });
}
