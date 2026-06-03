// src/components/ui/animated-dots.jsx
import { cn } from "../libs/cn";

// ---------------------------------------------------------------------------
// Dot pulse animation
//
// Requires the following addition to tailwind.config.js → theme.extend:
//
//   keyframes: {
//     "dot-pulse": {
//       "0%, 100%": { transform: "scale(1)",   opacity: "0.7" },
//       "50%":       { transform: "scale(1.3)", opacity: "1"   },
//     },
//   },
//   animation: {
//     "dot-pulse": "dot-pulse 1s ease-in-out infinite",
//   },
//
// This is a purely additive change — it does not affect any existing
// keyframe or animation already defined in the config.
//
// Color:
//   The original hardcoded #232734 is replaced with `bg-foreground`.
//   `--foreground` is 220 13% 18% in light mode and 210 40% 96% in dark mode,
//   so the dots always contrast correctly against their surface regardless of theme.
// ---------------------------------------------------------------------------

/**
 * A single animated dot — internal building block used by both exported components.
 *
 * @param {Object} props
 * @param {string} [props.className]          - Additional Tailwind classes.
 * @param {string} [props.animationDelay="0s"] - CSS animation-delay value (e.g. "0.9s").
 * @param {string} [props.heightClass="h-[6px]"] - Tailwind height class. AnimatedTypingDots passes "h-[5px]".
 */
const Dot = ({ className, animationDelay = "0s", heightClass = "h-[6px]" }) => (
  <span
    className={cn(
      "mx-[2.6px] w-[6px] rounded-full bg-foreground",
      "animate-dot-pulse",
      heightClass,
      className,
    )}
    style={{ animationDelay }}
  />
);

// ---------------------------------------------------------------------------
// AnimatedDots
// ---------------------------------------------------------------------------

/**
 * `AnimatedDots` — Three pulsing dots centered in a flex row.
 *
 * Used for loading states, pending indicators, or anywhere a subtle
 * "something is happening" signal is needed. Dots scale and fade in a
 * staggered sequence using the `dot-pulse` keyframe.
 *
 * Dot color automatically adapts to light/dark mode via the `foreground` token.
 *
 * ```jsx
 * // Basic usage
 * <AnimatedDots />
 *
 * // Inside a button
 * <button disabled>
 *   <AnimatedDots />
 * </button>
 *
 * // Custom dot color
 * <AnimatedDots dotClassName="bg-brand-primary" />
 * ```
 *
 * @param {Object} props
 * @param {string} [props.className]    - Additional classes for the outer flex container.
 * @param {string} [props.dotClassName] - Additional classes applied to each dot (e.g. custom color).
 */
export const AnimatedDots = ({ className, dotClassName }) => (
  <div className={cn("flex items-center justify-center", className)}>
    <Dot heightClass="h-[6px]" animationDelay="0s" className={dotClassName} />
    <Dot heightClass="h-[6px]" animationDelay="0.9s" className={dotClassName} />
    <Dot heightClass="h-[6px]" animationDelay="1.2s" className={dotClassName} />
  </div>
);

// ---------------------------------------------------------------------------
// AnimatedTypingDots
// ---------------------------------------------------------------------------

/**
 * `AnimatedTypingDots` — Three pulsing dots in a fixed-width row, styled for
 * inline use inside a chat bubble or typing indicator.
 *
 * Differences from `AnimatedDots`:
 * - Dot height is 5 px instead of 6 px (slightly flatter, fits chat line height).
 * - Container has a fixed width of ~2.6 rem (`w-[2.6rem]`) and a top offset of
 *   3.5 px (`mt-[3.5px]`) to align with chat message text baselines.
 *
 * ```jsx
 * // Inside a chat bubble
 * <div className="flex items-start gap-2">
 *   <AvatarMain size="sm" name="Bot" />
 *   <div className="bg-muted rounded-lg px-3 py-2">
 *     <AnimatedTypingDots />
 *   </div>
 * </div>
 *
 * // Custom dot color for a specific role theme
 * <AnimatedTypingDots dotClassName="bg-brand-primary" />
 * ```
 *
 * @param {Object} props
 * @param {string} [props.className]    - Additional classes for the outer flex container.
 * @param {string} [props.dotClassName] - Additional classes applied to each dot.
 */
export const AnimatedTypingDots = ({ className, dotClassName }) => (
  <div
    className={cn(
      "flex items-center justify-center",
      "w-[2.6rem] mt-[3.5px]",
      className,
    )}
  >
    <Dot heightClass="h-[5px]" animationDelay="0s" className={dotClassName} />
    <Dot heightClass="h-[5px]" animationDelay="0.9s" className={dotClassName} />
    <Dot heightClass="h-[5px]" animationDelay="1.2s" className={dotClassName} />
  </div>
);
