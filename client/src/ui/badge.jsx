// src/components/ui/badge.jsx
import React from "react";
import { cn } from "../libs/cn";

/**
 * Badge
 *
 * A small labelling pill used for status indicators, counts, role labels,
 * and categorical tags throughout the panel.
 *
 * ── Variants ──────────────────────────────────────────────────────────────────
 *
 * Solid (filled background):
 *   default | primary | secondary | success | warning | destructive |
 *   green | amber | red | blue | purple | orange | gray
 *
 * Soft (low-opacity background, coloured text):
 *   soft-primary | soft-secondary | soft-success | soft-warning |
 *   soft-destructive | soft-green | soft-amber | soft-red | soft-blue |
 *   soft-purple | soft-gray
 *
 * Outlined (transparent background, coloured border + text):
 *   outline | outline-primary | outline-secondary | outline-success |
 *   outline-warning | outline-destructive | outline-green | outline-amber |
 *   outline-red | outline-blue | outline-purple | outline-gray
 *
 * Semantic aliases (maps to the above):
 *   orange  → same as amber
 *   disabled → gray solid
 *
 * ── Usage ─────────────────────────────────────────────────────────────────────
 * @example
 * <Badge>Default</Badge>
 * <Badge variant="primary">Admin</Badge>
 * <Badge variant="soft-success">Active</Badge>
 * <Badge variant="outline-destructive">Banned</Badge>
 * <Badge variant="warning" className="text-xs">Pending</Badge>
 */

// ─── Variant map ──────────────────────────────────────────────────────────────

const variantClasses = {
  // ── Solid ──────────────────────────────────────────────────────────────────
  default:
    "border-transparent bg-primary text-primary-foreground hover:bg-primary/90",
  primary:
    "border-transparent bg-primary text-primary-foreground hover:bg-primary/90",
  secondary:
    "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
  success:
    "border-transparent bg-success text-success-foreground hover:bg-success/90",
  warning:
    "border-transparent bg-warning text-warning-foreground hover:bg-warning/90",
  destructive:
    "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90",

  // Tailwind colour solids
  green: "border-transparent bg-green-500 text-white hover:bg-green-600",
  amber: "border-transparent bg-amber-500 text-white hover:bg-amber-600",
  orange: "border-transparent bg-orange-500 text-white hover:bg-orange-600",
  red: "border-transparent bg-red-500 text-white hover:bg-red-600",
  blue: "border-transparent bg-blue-500 text-white hover:bg-blue-600",
  purple: "border-transparent bg-purple-500 text-white hover:bg-purple-600",
  gray: "border-transparent bg-gray-400 text-white hover:bg-gray-500",
  disabled:
    "border-transparent bg-gray-400 text-white cursor-not-allowed opacity-60",

  // ── Soft (muted tint background) ───────────────────────────────────────────
  "soft-primary":
    "border-transparent bg-primary/10 text-primary hover:bg-primary/20",
  "soft-secondary":
    "border-transparent bg-secondary/30 text-secondary-foreground hover:bg-secondary/40",
  "soft-success":
    "border-transparent bg-success/10 text-success hover:bg-success/20",
  "soft-warning":
    "border-transparent bg-warning/10 text-warning hover:bg-warning/20",
  "soft-destructive":
    "border-transparent bg-destructive/10 text-destructive hover:bg-destructive/20",
  "soft-green":
    "border-transparent bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20",
  "soft-amber":
    "border-transparent bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20",
  "soft-orange":
    "border-transparent bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20",
  "soft-red":
    "border-transparent bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20",
  "soft-blue":
    "border-transparent bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20",
  "soft-purple":
    "border-transparent bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20",
  "soft-gray":
    "border-transparent bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300",

  // ── Outline (border only, transparent fill) ────────────────────────────────
  outline: "border-border text-foreground bg-transparent hover:bg-muted",
  "outline-primary":
    "border-primary/40 text-primary bg-transparent hover:bg-primary/10",
  "outline-secondary":
    "border-secondary/60 text-secondary-foreground bg-transparent hover:bg-secondary/10",
  "outline-success":
    "border-success/40 text-success bg-transparent hover:bg-success/10",
  "outline-warning":
    "border-warning/40 text-warning bg-transparent hover:bg-warning/10",
  "outline-destructive":
    "border-destructive/40 text-destructive bg-transparent hover:bg-destructive/10",
  "outline-green":
    "border-green-500/40 text-green-600 dark:text-green-400 bg-transparent hover:bg-green-500/10",
  "outline-amber":
    "border-amber-500/40 text-amber-600 dark:text-amber-400 bg-transparent hover:bg-amber-500/10",
  "outline-orange":
    "border-orange-500/40 text-orange-600 dark:text-orange-400 bg-transparent hover:bg-orange-500/10",
  "outline-red":
    "border-red-500/40 text-red-600 dark:text-red-400 bg-transparent hover:bg-red-500/10",
  "outline-blue":
    "border-blue-500/40 text-blue-600 dark:text-blue-400 bg-transparent hover:bg-blue-500/10",
  "outline-purple":
    "border-purple-500/40 text-purple-600 dark:text-purple-400 bg-transparent hover:bg-purple-500/10",
  "outline-gray":
    "border-gray-400/50 text-gray-600 dark:text-gray-400 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800",
};

const baseClasses =
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold " +
  "transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

/**
 * Badge
 *
 * @param {object}  props
 * @param {string}  [props.variant="default"] - One of the variant keys above.
 * @param {string}  [props.className]         - Additional Tailwind classes.
 * @param {React.ReactNode} props.children    - Badge label content.
 */
function Badge({ className, variant = "default", ...props }) {
  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant] ?? variantClasses.default,
        className,
      )}
      {...props}
    />
  );
}

Badge.displayName = "Badge";

export { Badge };
