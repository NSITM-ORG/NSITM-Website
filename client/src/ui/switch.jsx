/**
 * @file Switch.jsx
 * Accessible toggle switch with full controlled/uncontrolled support.
 *
 * Backward-compatible with both callback conventions used across the codebase:
 *   • `onCheckedChange(newValue)`      — Shadcn / Radix-UI style
 *   • `onChange(event, newValue)`      — event-driven style
 * Both callbacks can safely coexist on the same instance.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CONTROLLED vs UNCONTROLLED
 * ─────────────────────────────────────────────────────────────────────────────
 * Controlled   — pass `checked`; the parent owns the state.
 *                Internal state is bypassed; only the callback fires.
 * Uncontrolled — omit `checked`; the component manages its own state
 *                initialised from `defaultChecked`.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * USAGE — CONTROLLED (Shadcn-style callback)
 * ─────────────────────────────────────────────────────────────────────────────
 *   const [active, setActive] = useState(false);
 *   <Switch checked={active} onCheckedChange={setActive} />
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * USAGE — CONTROLLED (event-style callback)
 * ─────────────────────────────────────────────────────────────────────────────
 *   <Switch
 *     checked={isOn}
 *     onChange={(event, newValue) => setIsOn(newValue)}
 *   />
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * USAGE — BOTH CALLBACKS (legacy + new layer simultaneously)
 * ─────────────────────────────────────────────────────────────────────────────
 *   <Switch
 *     checked={value}
 *     onCheckedChange={setValue}          // fires first
 *     onChange={(e, v) => analytics(v)}   // fires second
 *   />
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * USAGE — UNCONTROLLED
 * ─────────────────────────────────────────────────────────────────────────────
 *   <Switch defaultChecked />
 *   <Switch defaultChecked={false} onCheckedChange={(v) => console.log(v)} />
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * USAGE — DISABLED
 * ─────────────────────────────────────────────────────────────────────────────
 *   <Switch disabled />
 *   <Switch checked disabled />
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * USAGE — CUSTOM COLOURS (override via className)
 * ─────────────────────────────────────────────────────────────────────────────
 *   // Blue when checked, darker gray when unchecked
 *   <Switch
 *     className="data-[checked=true]:bg-primary data-[checked=false]:bg-muted-foreground/30"
 *   />
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ACCESSIBILITY
 * ─────────────────────────────────────────────────────────────────────────────
 * - Renders as <button type="button"> with role="switch" and aria-checked.
 * - Fully keyboard-accessible (Space / Enter toggle when focused).
 * - Respects disabled via both HTML attribute and aria conventions.
 * - Focus ring uses the design system --ring token.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * PROPS
 * ─────────────────────────────────────────────────────────────────────────────
 * @param {string}   [props.className]           Extra classes merged onto the track element
 * @param {boolean}  [props.checked]             Controlled value; omit for uncontrolled mode
 * @param {boolean}  [props.defaultChecked=false] Initial value for uncontrolled mode
 * @param {function} [props.onCheckedChange]     (newValue: boolean) => void — Shadcn style
 * @param {function} [props.onChange]            (event, newValue: boolean) => void — event style
 * @param {boolean}  [props.disabled]            Prevents interaction and dims the component
 * @param {React.Ref} ref                        Forwarded to the root <button> element
 */

import * as React from "react";
// import { cn } from "../../lib/utils";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const Switch = React.forwardRef(function Switch(
  {
    className,
    checked,
    defaultChecked = false,
    onCheckedChange, // Shadcn / Radix-UI style: (newValue: boolean) => void
    onChange, // Event style:              (event, newValue: boolean) => void
    disabled,
    ...props
  },
  ref,
) {
  // Internal state — only used when the component is uncontrolled
  const [isChecked, setIsChecked] = React.useState(defaultChecked);

  /*
   * Derive the live display value.
   * Controlled mode:   `checked` prop wins — internal state is completely ignored.
   * Uncontrolled mode: internal `isChecked` is the source of truth.
   *
   * NOTE: This fixes the controlled-mode bug present in Switch v2, where
   * `newValue = !isChecked` was always computed from internal state even
   * when the `checked` prop was supplied by the parent.
   */
  const currentValue = checked !== undefined ? checked : isChecked;

  const handleToggle = (e) => {
    if (disabled) return;

    const newValue = !currentValue;

    /*
     * Only mutate internal state when uncontrolled.
     * In controlled mode, the parent is responsible for updating `checked`.
     */
    if (checked === undefined) {
      setIsChecked(newValue);
    }

    // Fire both callback styles — safe to call even if only one is wired up
    onCheckedChange?.(newValue); // Shadcn-style (no event)
    onChange?.(e, newValue); // Event-style  (event + value)
  };

  return (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={currentValue}
      disabled={disabled}
      onClick={handleToggle}
      className={cn(
        // Layout & shape
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full",
        "border-2 border-transparent",
        // Animation
        "transition-colors duration-200 ease-in-out",
        // Focus ring — uses design system --ring token
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        // Disabled state
        "disabled:cursor-not-allowed disabled:opacity-50",
        // Track colour — green when on, slate when off
        // Override via className: e.g. "data-[state=checked]:bg-primary"
        currentValue ? "bg-green-300" : "bg-slate-300",
        className,
      )}
      {...props}
    >
      {/*
       * Thumb — slides right when on, sits at the left edge when off.
       * bg-default-primary resolves to the near-white #FFFFFA token from
       * the shared palette, giving a clean white thumb on both track colours.
       */}
      <span
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full",
          "bg-default-primary shadow-lg ring-0",
          "transition-transform duration-200 ease-in-out",
          currentValue ? "translate-x-5" : "translate-x-0",
        )}
      />
    </button>
  );
});

Switch.displayName = "Switch";

export { Switch };
