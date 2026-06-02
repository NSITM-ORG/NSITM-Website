// src/components/ui/framer-motion.jsx
/**
 * animationUtils
 *
 * A self-contained animation utility module that fully replaces `framer-motion`.
 * No external dependencies — uses React, pure CSS transitions, and Tailwind classes.
 *
 * Exports:
 *   AnimatePresence  — conditionally mounts/unmounts children with enter/exit transitions
 *   Motion           — generic animated wrapper div (fade, slide, scale)
 *   FadeIn           — fade-in wrapper
 *   SlideIn          — slide-in from a direction
 *   useAnimatedMount — hook: returns { mounted, visible } for transition-driven mount/unmount
 *   TRANSITION_CLS   — object of Tailwind transition class presets
 *
 * Design decisions:
 *   - All transitions use Tailwind's `transition`, `duration-*`, `ease-*` classes.
 *   - Enter/exit classes are applied via the `useAnimatedMount` hook pattern.
 *   - No JavaScript-based animation — only class toggling on mount/unmount.
 *   - `AnimatePresence` uses a short delay (matching `duration-*`) before unmounting.
 *
 * Usage:
 *   // Simple conditional fade
 *   <AnimatePresence show={isOpen}>
 *     <div>Content that fades in/out</div>
 *   </AnimatePresence>
 *
 *   // Slide in from top
 *   <SlideIn direction="top" show={isOpen}>
 *     <Dropdown />
 *   </SlideIn>
 *
 *   // Hook-driven (for portals, custom targets)
 *   const { mounted, visible } = useAnimatedMount(isOpen, 200);
 *   {mounted && (
 *     <div className={cn("transition-opacity duration-200", visible ? "opacity-100" : "opacity-0")}>
 *       ...
 *     </div>
 *   )}
 */

import React, { useEffect, useRef, useState } from "react";
// import { cn } from "../../lib/utils";

const cn = (...classes) => classes.filter(Boolean).join(" ");

// ─── Presets ──────────────────────────────────────────────────────────────────

/**
 * Tailwind transition class presets for common patterns.
 * Import and spread wherever you need consistent motion.
 *
 * @example
 * <div className={cn(TRANSITION_CLS.fade, visible ? "opacity-100" : "opacity-0")} />
 */
export const TRANSITION_CLS = {
  /** Standard opacity fade */
  fade: "transition-opacity   duration-200 ease-in-out",
  /** Fade + slight scale (dropdown feel) */
  fadeScale: "transition-all       duration-200 ease-in-out",
  /** Smooth slide (combined transform + opacity) */
  slide: "transition-all       duration-300 ease-in-out",
  /** Fast snap (e.g. toasts) */
  snap: "transition-all       duration-150 ease-out",
  /** Slow reveal (modals, overlays) */
  slow: "transition-all       duration-500 ease-in-out",
};

// ─── useAnimatedMount ─────────────────────────────────────────────────────────

/**
 * useAnimatedMount
 *
 * A hook that coordinates CSS-transition-based mount/unmount.
 * Returns `{ mounted, visible }` where:
 *   - `mounted`  — whether the element should be in the DOM at all
 *   - `visible`  — whether the "visible" state classes should be applied
 *
 * Pattern:
 *   1. When `show` becomes true:  mount immediately, then flip `visible` on next tick.
 *   2. When `show` becomes false: flip `visible` off, then unmount after `duration` ms.
 *
 * @param {boolean} show        - Whether the element should be shown.
 * @param {number}  [duration=200] - Transition duration in ms (must match your CSS duration).
 * @returns {{ mounted: boolean, visible: boolean }}
 *
 * @example
 * const { mounted, visible } = useAnimatedMount(isOpen, 300);
 * {mounted && (
 *   <div
 *     className={cn(
 *       "transition-all duration-300",
 *       visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
 *     )}
 *   >
 *     ...
 *   </div>
 * )}
 */
export const useAnimatedMount = (show, duration = 200) => {
  const [mounted, setMounted] = useState(show);
  const [visible, setVisible] = useState(show);
  const timerRef = useRef(null);

  useEffect(() => {
    if (show) {
      setMounted(true);
      // Flip visible on the next tick so the enter transition fires
      timerRef.current = setTimeout(() => setVisible(true), 10);
    } else {
      setVisible(false);
      // Unmount after the CSS transition completes
      timerRef.current = setTimeout(() => setMounted(false), duration);
    }
    return () => clearTimeout(timerRef.current);
  }, [show, duration]);

  return { mounted, visible };
};

// ─── AnimatePresence ──────────────────────────────────────────────────────────

/**
 * AnimatePresence
 *
 * Conditionally mounts/unmounts children with a CSS-driven enter/exit transition.
 * Acts as a drop-in for framer-motion's `<AnimatePresence>` + `<motion.div>`.
 *
 * @param {object}  props
 * @param {boolean} props.show               - Whether children should be visible.
 * @param {React.ReactNode} props.children   - Content to animate.
 * @param {number}  [props.duration=200]     - Transition duration in ms.
 * @param {string}  [props.enterCls]         - Tailwind classes for the visible state.
 * @param {string}  [props.exitCls]          - Tailwind classes for the hidden state.
 * @param {string}  [props.baseCls]          - Always-applied base classes.
 * @param {string}  [props.className]        - Additional wrapper classes.
 *
 * @example
 * <AnimatePresence show={isOpen} duration={300} enterCls="opacity-100 scale-100" exitCls="opacity-0 scale-95">
 *   <Dropdown />
 * </AnimatePresence>
 */
export const AnimatePresence = ({
  show,
  children,
  duration = 200,
  delay = 0,
  enterCls = "opacity-100",
  exitCls = "opacity-0",
  baseCls = "transition-all",
  className,
}) => {
  const { mounted, visible } = useAnimatedMount(show, duration);
  if (!mounted) return null;

  return (
    <div
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: delay ? `${delay}ms` : undefined,
      }}
      className={cn(baseCls, visible ? enterCls : exitCls, className)}
    >
      {children}
    </div>
  );
};

// ─── Motion ───────────────────────────────────────────────────────────────────

/**
 * Motion
 *
 * A generic animated `<div>` that supports fade, slide, and scale presets.
 * Replaces `<motion.div initial=... animate=... exit=...>` from framer-motion.
 *
 * @param {object}  props
 * @param {boolean} [props.show=true]         - When false, plays exit animation and unmounts.
 * @param {"fade"|"fadeUp"|"fadeDown"|"fadeLeft"|"fadeRight"|"scale"|"none"} [props.variant="fade"]
 * @param {number}  [props.duration=200]      - Transition duration in ms.
 * @param {string}  [props.className]
 * @param {React.ReactNode} props.children
 *
 * @example
 * <Motion variant="fadeUp" show={isOpen}>
 *   <Card>...</Card>
 * </Motion>
 */
export const Motion = ({
  show = true,
  autoEnter = false, // ← ADD: animate in on first mount (replaces framer-motion initial/animate)
  delay = 0, // ← ADD: ms delay before enter transition fires
  variant = "fade",
  duration = 200,
  className,
  children,
  ...rest
}) => {
  const [enterShow, setEnterShow] = useState(!autoEnter);

  useEffect(() => {
    if (autoEnter) {
      const t = setTimeout(() => setEnterShow(true), 10);
      return () => clearTimeout(t);
    }
  }, [autoEnter]);

  const finalShow = autoEnter ? enterShow : show;

  const presets = {
    fade: { enter: "opacity-100", exit: "opacity-0" },
    fadeUp: {
      enter: "opacity-100 translate-y-0",
      exit: "opacity-0 translate-y-2",
    },
    fadeDown: {
      enter: "opacity-100 -translate-y-0",
      exit: "opacity-0 -translate-y-2",
    },
    fadeLeft: {
      enter: "opacity-100 translate-x-0",
      exit: "opacity-0 translate-x-2",
    },
    fadeRight: {
      enter: "opacity-100 -translate-x-0",
      exit: "opacity-0 -translate-x-2",
    },
    scale: { enter: "opacity-100 scale-100", exit: "opacity-0 scale-95" },
    none: { enter: "", exit: "" },
  };

  const { enter, exit } = presets[variant] || presets.fade;

  return (
    <AnimatePresence
      show={finalShow}
      duration={duration}
      delay={delay}
      enterCls={enter}
      exitCls={exit}
      baseCls="transition-all transform"
      className={className}
      {...rest}
    >
      {children}
    </AnimatePresence>
  );
};

// ─── Convenience wrappers ─────────────────────────────────────────────────────

/**
 * FadeIn
 * Always-mounted fade wrapper (no unmount logic — use when element stays in DOM).
 *
 * @param {object}  props
 * @param {boolean} [props.visible=true] - Controls opacity class.
 * @param {string}  [props.className]
 * @param {React.ReactNode} props.children
 *
 * @example
 * <FadeIn visible={!!successMessage}>
 *   <Alert>Success!</Alert>
 * </FadeIn>
 */
export const FadeIn = ({ visible = true, className, children, ...rest }) => (
  <div
    className={cn(
      "transition-opacity duration-200",
      visible ? "opacity-100" : "opacity-0 pointer-events-none",
      className,
    )}
    {...rest}
  >
    {children}
  </div>
);

/**
 * SlideIn
 * Mounts/unmounts with a directional slide + fade.
 *
 * @param {object}  props
 * @param {boolean} [props.show=true]
 * @param {"top"|"bottom"|"left"|"right"} [props.direction="top"]
 * @param {number}  [props.duration=300]
 * @param {string}  [props.className]
 * @param {React.ReactNode} props.children
 *
 * @example
 * <SlideIn direction="top" show={isMenuOpen}>
 *   <MobileMenu />
 * </SlideIn>
 */
export const SlideIn = ({
  show = true,
  direction = "top",
  duration = 300,
  className,
  children,
  ...rest
}) => {
  const dirMap = {
    top: {
      enter: "opacity-100 translate-y-0",
      exit: "opacity-0 -translate-y-2",
    },
    bottom: {
      enter: "opacity-100 translate-y-0",
      exit: "opacity-0 translate-y-2",
    },
    left: {
      enter: "opacity-100 translate-x-0",
      exit: "opacity-0 -translate-x-2",
    },
    right: {
      enter: "opacity-100 translate-x-0",
      exit: "opacity-0 translate-x-2",
    },
  };

  const { enter, exit } = dirMap[direction] || dirMap.top;

  return (
    <AnimatePresence
      show={show}
      duration={duration}
      enterCls={enter}
      exitCls={exit}
      baseCls="transition-all transform"
      className={className}
      {...rest}
    >
      {children}
    </AnimatePresence>
  );
};
