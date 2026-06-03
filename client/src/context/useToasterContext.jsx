/* eslint-disable react-hooks/purity */
/* eslint-disable react-hooks/refs */
/**
 * @file toast-context.js
 * @description Global toast notification system for Primemart.
 *
 * Provides a React context (`ToastContext`) that allows any component in the
 * tree to fire lightweight toast notifications via the `useToast()` hook.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FEATURES
 * ─────────────────────────────────────────────────────────────────────────────
 *  • Queue-based display  – toasts are serialised; the next one only appears
 *    after the current one has been dismissed, preventing visual clutter.
 *
 *  • Pause on hover / click
 *      - Moving the cursor onto the toast card pauses the countdown.
 *      - Clicking the toast card once also pauses the countdown.
 *      - Moving the cursor away resumes from exactly where it stopped.
 *      - A second click after a pause-click resumes the countdown from
 *        where it stopped, then lets it run out naturally.
 *
 *  • Auto-play safety net
 *      Whenever the toast is paused (hover OR click), a 35-second idle
 *      watchdog is started.  If the user takes no action within those 35 s,
 *      the timer auto-resumes so the toast eventually clears itself.
 *      The watchdog is cancelled as soon as the user manually resumes.
 *
 *  • Pause countdown UI
 *      While the toast is paused, a live countdown (e.g. "Auto-resumes in 34s")
 *      is displayed inside the toast card so the user knows how long the
 *      system will wait before auto-playing.  The counter is driven by the
 *      existing 50 ms ticker — no additional timers are needed.
 *
 *  • Accurate progress bar
 *      The progress bar tracks true elapsed wall-clock time so that pausing
 *      and resuming produces a seamless visual continuation rather than a
 *      jump or reset.
 *
 *  • Configurable per toast
 *      Each toast object may carry:
 *        { title, description, status, position, isClosable, duration }
 *      All fields except `title` are optional.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * USAGE
 * ─────────────────────────────────────────────────────────────────────────────
 *  // 1. Wrap your app
 *  <ToastProvider>
 *    <App />
 *  </ToastProvider>
 *
 *  // 2. Fire a toast from any component
 *  const addToast = useToast();
 *  addToast({
 *    title      : 'Saved!',
 *    description: 'Your changes have been saved.',
 *    status     : 'success',   // 'success' | 'error' | 'warning' | 'info' | 'pending'
 *    position   : 'top-right', // 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
 *    isClosable : true,
 *    duration   : 4000,        // ms – defaults to 3000
 *  });
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

// ─── Constants ───────────────────────────────────────────────────────────────

/**
 * How long (ms) the system will wait after a user-initiated pause before
 * automatically resuming the countdown.  Prevents a toast from hanging
 * indefinitely if the user forgets about it.
 */
const AUTO_PLAY_IDLE_MS = 35_000;

// ─── Context ─────────────────────────────────────────────────────────────────

const ToastContext = createContext();

// ─── ToastProvider ───────────────────────────────────────────────────────────

export const ToastProvider = ({ children }) => {
  /** Currently visible toasts (max 1 at a time due to queue logic). */
  const [toasts, setToasts] = useState([]);

  /** Toasts waiting to be displayed once the current one clears. */
  const [queue, setQueue] = useState([]);

  /**
   * Per-toast runtime state stored in a ref so mutations never trigger
   * unnecessary re-renders.
   *
   * Shape: { [toastId]: ToastRuntime }
   *
   * @typedef {Object} ToastRuntime
   * @property {number}         duration        - Total display time in ms.
   * @property {number}         elapsed         - ms already consumed before the current segment.
   * @property {number|null}    segmentStart    - wall-clock timestamp (Date.now()) when the
   *                                              current running segment began; null when paused.
   * @property {number|null}    pausedAt        - wall-clock timestamp of when the toast was
   *                                              most recently paused; used to compute the live
   *                                              auto-play countdown shown in the UI.
   * @property {ReturnType<typeof setTimeout>|null} dismissTimer   - handle for the auto-dismiss timeout.
   * @property {ReturnType<typeof setTimeout>|null} autoPlayTimer  - handle for the 35-s idle watchdog.
   * @property {boolean}        isPaused        - whether the countdown is currently paused.
   * @property {boolean}        clickPaused     - whether the pause is currently held by a click
   *                                              (as opposed to a hover).  A second click clears
   *                                              this and resumes the toast.
   */
  const runtimeRef = useRef({});

  // ─── Progress-bar / pause-counter re-render ticker ───────────────────────
  /**
   * A lightweight state tick that increments every ~50 ms while any toast is
   * visible.  It drives both the progress bar width and the live pause
   * countdown label without any additional timers.
   */
  const [, setTick] = useState(0);
  const tickerRef = useRef(null);

  /** Start the 50 ms ticker (idempotent). */
  const startTicker = () => {
    if (tickerRef.current) return;
    tickerRef.current = setInterval(() => setTick((n) => n + 1), 50);
  };

  /** Stop the ticker and clear the interval. */
  const stopTicker = () => {
    if (!tickerRef.current) return;
    clearInterval(tickerRef.current);
    tickerRef.current = null;
  };

  // ─── Core helpers ─────────────────────────────────────────────────────────

  /**
   * Immediately removes a toast from the visible list and cleans up all
   * timers associated with it.
   *
   * @param {number} id - The toast's unique identifier.
   */
  const removeToast = (id) => {
    const rt = runtimeRef.current[id];
    if (rt) {
      if (rt.dismissTimer) clearTimeout(rt.dismissTimer);
      if (rt.autoPlayTimer) clearTimeout(rt.autoPlayTimer);
      delete runtimeRef.current[id];
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  /**
   * Schedules auto-dismiss for the remaining duration of a toast and
   * records the segment start time so the progress bar can compute
   * accurate elapsed time.
   *
   * @param {number} id        - Toast identifier.
   * @param {number} remaining - ms left before dismissal.
   */
  const scheduleDismiss = (id, remaining) => {
    const rt = runtimeRef.current[id];
    if (!rt) return;

    // Record when this running segment started.
    rt.segmentStart = Date.now();
    rt.isPaused = false;
    rt.pausedAt = null; // no longer paused — clear the pause timestamp

    // Clear any existing dismiss timer before setting a new one.
    if (rt.dismissTimer) clearTimeout(rt.dismissTimer);

    rt.dismissTimer = setTimeout(() => removeToast(id), remaining);
  };

  /**
   * Pauses the countdown for a toast.
   *
   * - Freezes elapsed time by accumulating the current segment's duration
   *   into `rt.elapsed`.
   * - Records `pausedAt` so the UI can display a live auto-play countdown.
   * - Clears the dismiss timer so the toast stays visible.
   * - Starts (or restarts) the 35-second idle watchdog.
   *
   * @param {number}  id        - Toast identifier.
   * @param {boolean} [byClick] - Pass `true` when the pause is click-initiated.
   */
  const pauseToast = (id, byClick = false) => {
    const rt = runtimeRef.current[id];
    if (!rt) return;

    // ── Already paused: the only thing a fresh call may do is upgrade a
    //    hover-pause to a click-pause so the second-click-to-resume path works.
    if (rt.isPaused) {
      if (byClick && !rt.clickPaused) {
        rt.clickPaused = true;
        // Restart the watchdog so 35 s counts from this click, not the earlier hover.
        if (rt.autoPlayTimer) clearTimeout(rt.autoPlayTimer);
        rt.pausedAt = Date.now();
        rt.autoPlayTimer = setTimeout(() => resumeToast(id), AUTO_PLAY_IDLE_MS);
      }
      return;
    }

    // Accumulate time elapsed in the current running segment.
    if (rt.segmentStart !== null) {
      rt.elapsed += Date.now() - rt.segmentStart;
      rt.segmentStart = null;
    }

    rt.isPaused = true;
    rt.pausedAt = Date.now(); // snapshot for the live countdown label
    if (byClick) rt.clickPaused = true;

    // Freeze the dismiss timer.
    if (rt.dismissTimer) {
      clearTimeout(rt.dismissTimer);
      rt.dismissTimer = null;
    }

    // ── 35-second idle watchdog ──────────────────────────────────────────
    // If the user leaves the toast paused for AUTO_PLAY_IDLE_MS without any
    // interaction, automatically resume so it can dismiss itself.
    if (rt.autoPlayTimer) clearTimeout(rt.autoPlayTimer);
    rt.autoPlayTimer = setTimeout(() => resumeToast(id), AUTO_PLAY_IDLE_MS);
  };

  /**
   * Resumes the countdown for a toast from where it was paused.
   *
   * - Clears the idle watchdog (user manually resumed, or watchdog fired).
   * - Re-schedules dismissal for the remaining duration.
   *
   * @param {number} id - Toast identifier.
   */
  const resumeToast = (id) => {
    const rt = runtimeRef.current[id];
    if (!rt || !rt.isPaused) return;

    // Cancel the idle watchdog – no longer needed.
    if (rt.autoPlayTimer) {
      clearTimeout(rt.autoPlayTimer);
      rt.autoPlayTimer = null;
    }

    rt.clickPaused = false;

    const remaining = Math.max(0, rt.duration - rt.elapsed);
    scheduleDismiss(id, remaining);
  };

  // ─── Queue / display logic ────────────────────────────────────────────────

  /**
   * Enqueues a new toast for display.  The toast will appear immediately if
   * no other toast is currently visible.
   *
   * @param {Object}  toast                    - Toast configuration.
   * @param {string}  toast.title              - Bold heading text.
   * @param {string}  [toast.description]      - Optional supporting text.
   * @param {string}  [toast.status]           - 'success'|'error'|'warning'|'info'|'pending'
   * @param {string}  [toast.position]         - Screen corner; defaults to 'top-right'.
   * @param {boolean} [toast.isClosable=true]  - Whether the × button is shown.
   * @param {number}  [toast.duration=3000]    - Display time in ms before auto-dismiss.
   */
  const addToast = (toast) => {
    const id = Date.now();
    setQueue((prev) => [...prev, { ...toast, id }]);
  };

  /**
   * Watches the queue and promotes the next toast to visible whenever the
   * display slot is empty.  Also initialises the `runtimeRef` entry and
   * kicks off the dismiss timer + progress ticker.
   */
  useEffect(() => {
    if (queue.length > 0 && toasts.length === 0) {
      const [next, ...rest] = queue;
      const duration = next.duration || 3000;

      // Initialise per-toast runtime state.
      runtimeRef.current[next.id] = {
        duration,
        elapsed: 0,
        segmentStart: null, // set in scheduleDismiss
        pausedAt: null,
        dismissTimer: null,
        autoPlayTimer: null,
        isPaused: false,
        clickPaused: false,
      };

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQueue(rest);
      setToasts([next]);

      // Start dismiss timer and progress ticker.
      scheduleDismiss(next.id, duration);
      startTicker();
    }

    // When all toasts are gone, stop the ticker to save resources.
    if (toasts.length === 0 && queue.length === 0) {
      stopTicker();
    }
  }, [queue, toasts]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Interaction handlers ─────────────────────────────────────────────────

  /**
   * Called when the cursor enters a toast card.
   * Pauses the countdown as a hover-pause (not click-pause).
   *
   * @param {number} id - Toast identifier.
   */
  const handleMouseEnter = (id) => {
    pauseToast(id, false);
  };

  /**
   * Called when the cursor leaves a toast card.
   * Resumes the countdown only when the pause was NOT initiated by a click.
   * If the user click-paused the toast, moving the cursor away does nothing;
   * they must click again to resume.
   *
   * @param {number} id - Toast identifier.
   */
  const handleMouseLeave = (id) => {
    const rt = runtimeRef.current[id];
    if (!rt) return;
    if (rt.isPaused && !rt.clickPaused) {
      resumeToast(id);
    }
  };

  /**
   * Called when the user clicks anywhere on the toast card body.
   *
   * Interaction model:
   *  ┌─────────────────────────────────────┬──────────────────────────────────┐
   *  │ Current state                       │ Effect                           │
   *  ├─────────────────────────────────────┼──────────────────────────────────┤
   *  │ Running (not paused)                │ Pause (click-pause)              │
   *  │ Hover-paused (clickPaused = false)  │ Upgrade to click-pause           │
   *  │ Click-paused  (clickPaused = true)  │ Resume countdown                 │
   *  └─────────────────────────────────────┴──────────────────────────────────┘
   *
   * @param {number} id - Toast identifier.
   */
  const handleCardClick = (id) => {
    const rt = runtimeRef.current[id];
    if (!rt) return;

    if (rt.clickPaused) {
      // Second click on a click-paused toast → resume from where it stopped.
      resumeToast(id);
    } else {
      // First click (running OR hover-paused) → click-pause.
      // pauseToast handles the "already paused" case internally by upgrading
      // hover-pause to click-pause without double-accumulating elapsed time.
      pauseToast(id, true);
    }
  };

  // ─── Style helpers ────────────────────────────────────────────────────────

  /**
   * Returns the Tailwind background-colour class for a given toast status.
   *
   * @param {string} status
   * @returns {string}
   */
  const getStatusStyle = (status) => {
    switch (status) {
      case 'success': return 'bg-green-600';
      case 'error': return 'bg-red-500';
      case 'warning': return 'bg-yellow-600';
      case 'pending':
      case 'info': return 'bg-blue-500';
      default: return 'bg-blue-500';
    }
  };

  /**
   * Returns the Tailwind positioning classes for a given toast position string.
   *
   * @param {string} position
   * @returns {string}
   */
  const getPositionStyle = (position) => {
    switch (position) {
      case 'top-left': return 'top-4 left-5';
      case 'top-right': return 'top-4 right-5';
      case 'bottom-left': return 'bottom-4 left-5';
      case 'bottom-right': return 'bottom-4 right-5';
      default: return 'top-4 right-5';
    }
  };

  /**
   * Computes the current progress-bar fill percentage (0–100) for a toast.
   * Accounts for paused state by using the last known `elapsed` value when
   * `segmentStart` is null.
   *
   * @param {number} id - Toast identifier.
   * @returns {number} A value between 0 and 100 (100 = full, 0 = empty).
   */
  const getProgressPercent = (id) => {
    const rt = runtimeRef.current[id];
    if (!rt) return 0;

    let totalElapsed = rt.elapsed;

    // If currently running (not paused), add the live segment duration.
    if (!rt.isPaused && rt.segmentStart !== null) {
      totalElapsed += Date.now() - rt.segmentStart;
    }

    const percent = Math.min(100, (totalElapsed / rt.duration) * 100);
    // Bar shrinks left-to-right: 100% = full at start, 0% = empty at end.
    return Math.max(0, 100 - percent);
  };

  /**
   * Computes the seconds remaining on the 35-second auto-play watchdog.
   * Returns `null` when the toast is not paused (label should be hidden).
   *
   * The value is derived from `rt.pausedAt` (recorded at pause time) and the
   * current wall clock, so it updates every 50 ms via the ticker with no
   * extra timers.
   *
   * @param {number} id - Toast identifier.
   * @returns {number|null} Whole seconds remaining, or null if not paused.
   */
  const getAutoPlayCountdown = (id) => {
    const rt = runtimeRef.current[id];
    if (!rt || !rt.isPaused || rt.pausedAt === null) return null;

    const msElapsedSincePause = Date.now() - rt.pausedAt;
    const msRemaining = Math.max(0, AUTO_PLAY_IDLE_MS - msElapsedSincePause);
    return Math.ceil(msRemaining / 1000); // whole seconds, rounds up
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {createPortal(
        <div
          className={`fixed z-[9999] flex flex-col gap-2 ${toasts.length > 0 ? getPositionStyle(toasts[0]?.position) : 'top-4 right-5'
            }`}
        >
          // eslint-disable-next-line react-hooks/refs
          {toasts.map((toast) => {
            const rt = runtimeRef.current[toast.id];
            const isPaused = rt?.isPaused ?? false;
            const isClickPaused = rt?.clickPaused ?? false;
            const isClosable = toast.isClosable !== false;
            const progressPct = getProgressPercent(toast.id);
            const autoPlaySeconds = getAutoPlayCountdown(toast.id);

            return (
              <div
                key={toast.id}
                /**
                 * Mouse-enter  → hover-pause.
                 * Mouse-leave  → resume only if NOT click-paused.
                 * Click        → click-pause (or resume if already click-paused).
                 */
                onMouseEnter={() => handleMouseEnter(toast.id)}
                onMouseLeave={() => handleMouseLeave(toast.id)}
                onClick={() => handleCardClick(toast.id)}
                className={`
                  p-4 rounded-md shadow-md text-white flex items-start justify-between
                  min-w-[250px] max-w-[260px] sm:max-w-[550px] animate-fade-in relative
                  cursor-pointer select-none
                  ${getStatusStyle(toast.status)}
                `}
              >
                {/* ── Pause indicator + auto-play countdown ───────────── */}
                {/*
                 * Shown only while paused.  Displays the ⏸ icon alongside a
                 * live "Auto-resumes in Xs" label driven by getAutoPlayCountdown().
                 * The label vanishes on its own when the watchdog fires and the
                 * toast resumes (isPaused flips to false).
                 *
                 * isClickPaused adds a subtle hint telling the user they can
                 * click again to resume immediately, which is non-obvious UX.
                 */}
                {isPaused && (
                  <div className="absolute top-1.5 left-2 flex items-center gap-1 pointer-events-none">
                    <span className="text-white/80 text-xs leading-none">⏸</span>
                    {autoPlaySeconds !== null && (
                      <span className="text-white/70 text-[12px] font-medium leading-none whitespace-nowrap">
                        Auto-resumes in {autoPlaySeconds}s
                        {isClickPaused && ' · click to resume'}
                      </span>
                    )}
                  </div>
                )}

                {/* ── Toast body ──────────────────────────────────────── */}
                <div className="mt-3.5 overflow-hidden">
                  <h4 className="text-base sm:text-lg font-bold break-words">
                    {toast.title}
                  </h4>
                  {toast.description && (
                    <p className="text-sm sm:text-base break-words text-white/90">
                      {toast.description}
                    </p>
                  )}
                </div>

                {/* ── Close (×) button ────────────────────────────────── */}
                <button
                  onClick={(e) => {
                    // Prevent click from also triggering the card's onClick handler.
                    e.stopPropagation();
                    removeToast(toast.id);
                  }}
                  className={`${isClosable ? 'block' : 'hidden'} ml-4 mb-10 text-xl absolute top-1.5 right-2`}
                >
                  &times;
                </button>

                {/* ── Progress bar ────────────────────────────────────── */}
                {/*
                 * Width is driven by progressPct (0–100) rather than a CSS
                 * animation so it can pause/resume seamlessly.  The 50 ms
                 * transition smooths the bar between ticker ticks; it is
                 * disabled while paused so the bar truly freezes.
                 */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20 rounded-b-md overflow-hidden">
                  <div
                    className="h-full bg-white"
                    style={{
                      width: `${progressPct}%`,
                      transition: isPaused ? 'none' : 'width 50ms linear',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

// ─── useToast hook ────────────────────────────────────────────────────────────

/**
 * Returns the `addToast` function from the nearest `<ToastProvider>`.
 *
 * Must be called inside a component that is a descendant of `<ToastProvider>`.
 *
 * @returns {Function} addToast
 *
 * @example
 * const addToast = useToast();
 * addToast({ title: 'Done!', status: 'success' });
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => {
  const { addToast } = useContext(ToastContext);
  return addToast;
};