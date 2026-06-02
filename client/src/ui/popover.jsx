/**
 * @file Popover.jsx
 * @description Unified portal-based Popover system.
 *
 * Merges two designs into one cohesive component family:
 *   1. Compound API  — <Popover> + <PopoverTrigger> + <PopoverContent>
 *   2. Self-contained API — <Popover content={…}><trigger /></Popover>
 *
 * Both APIs share the same positioning engine, entrance animation, and
 * design-token theming. Light mode is the default; dark mode is activated
 * via the `.dark` class on any ancestor, matching your Tailwind + CSS-variable setup.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * EXPORTS
 * ─────────────────────────────────────────────────────────────────────────────
 *   Popover           Root/orchestrator — API is chosen by the props you pass
 *   PopoverTrigger    Compound-API trigger wrapper (supports asChild)
 *   PopoverContent    Compound-API content panel (portal-rendered, positioned)
 *   PopoverCard       Pre-styled card shell for any popover content
 *   PopoverDivider    Thin horizontal rule using the --border token
 *   PopoverMenuItem   Menu-button row with icon, danger, and disabled states
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * PLACEMENT VALUES  (shared by both APIs)
 * ─────────────────────────────────────────────────────────────────────────────
 *   top | top-start | top-end
 *   bottom | bottom-start | bottom-end   ← default: "bottom"
 *   left | left-start | left-end
 *   right | right-start | right-end
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * COMPOUND API  (Shadcn / Radix-compatible style)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *   // Basic uncontrolled
 *   <Popover>
 *     <PopoverTrigger asChild>
 *       <Button variant="outline">Open</Button>
 *     </PopoverTrigger>
 *     <PopoverContent>
 *       <p>Content goes here</p>
 *     </PopoverContent>
 *   </Popover>
 *
 *   // Custom placement + offset
 *   <Popover>
 *     <PopoverTrigger>Click me</PopoverTrigger>
 *     <PopoverContent placement="top-end" sideOffset={12}>
 *       Positioned top-right of the trigger
 *     </PopoverContent>
 *   </Popover>
 *
 *   // Controlled
 *   <Popover open={isOpen} onOpenChange={setIsOpen}>
 *     <PopoverTrigger asChild><button>Toggle</button></PopoverTrigger>
 *     <PopoverContent>Controlled popover</PopoverContent>
 *   </Popover>
 *
 *   // Hover-activated (tooltip style)
 *   <Popover trigger="hover">
 *     <PopoverTrigger asChild><span>Hover me</span></PopoverTrigger>
 *     <PopoverContent placement="top">Tooltip-style content</PopoverContent>
 *   </Popover>
 *
 *   // align shorthand (maps to placement variants)
 *   <Popover>
 *     <PopoverTrigger>Open</PopoverTrigger>
 *     <PopoverContent align="start">Aligned to trigger's left edge</PopoverContent>
 *   </Popover>
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SELF-CONTAINED API  (prop-driven, single component)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *   // Basic
 *   <Popover content={<p>Hello world</p>} placement="bottom-end">
 *     <button>Open</button>
 *   </Popover>
 *
 *   // Render-prop — receives the `close` function
 *   <Popover content={(close) => <button onClick={close}>Dismiss</button>}>
 *     <span>Click me</span>
 *   </Popover>
 *
 *   // Hover trigger
 *   <Popover trigger="hover" content={<span>Tooltip text</span>} placement="top">
 *     <span>Hover me</span>
 *   </Popover>
 *
 *   // Controlled
 *   <Popover
 *     isOpen={open}
 *     onOpen={() => setOpen(true)}
 *     onClose={() => setOpen(false)}
 *     content={<div>Controlled content</div>}
 *   >
 *     <button>Open</button>
 *   </Popover>
 *
 *   // With PopoverCard + PopoverMenuItem (action menu pattern)
 *   <Popover
 *     placement="bottom-end"
 *     content={(close) => (
 *       <PopoverCard className="w-56 py-1">
 *         <PopoverMenuItem icon={<EditIcon />} onClick={close}>Edit</PopoverMenuItem>
 *         <PopoverDivider />
 *         <PopoverMenuItem danger onClick={close}>Delete</PopoverMenuItem>
 *       </PopoverCard>
 *     )}
 *   >
 *     <button>Actions ▾</button>
 *   </Popover>
 */

import * as React from "react";
import { createPortal } from "react-dom";

// ─── cn ───────────────────────────────────────────────────────────────────────
// Joins truthy class strings. Swap for your own clsx/twMerge import:
//   import { cn } from "../../lib/utils";
const cn = (...classes) => classes.filter(Boolean).join(" ");

// ─── Placement calculators ────────────────────────────────────────────────────
// Each fn: (triggerRect, popoverRect, offsetPx) → { top, left }
const PLACEMENTS = {
  top: (t, p, o) => ({
    top: t.top - p.height - o,
    left: t.left + t.width / 2 - p.width / 2,
  }),
  "top-start": (t, p, o) => ({ top: t.top - p.height - o, left: t.left }),
  "top-end": (t, p, o) => ({
    top: t.top - p.height - o,
    left: t.right - p.width,
  }),
  bottom: (t, p, o) => ({
    top: t.bottom + o,
    left: t.left + t.width / 2 - p.width / 2,
  }),
  "bottom-start": (t, p, o) => ({ top: t.bottom + o, left: t.left }),
  "bottom-end": (t, p, o) => ({ top: t.bottom + o, left: t.right - p.width }),
  left: (t, p, o) => ({
    top: t.top + t.height / 2 - p.height / 2,
    left: t.left - p.width - o,
  }),
  "left-start": (t, p, o) => ({ top: t.top, left: t.left - p.width - o }),
  "left-end": (t, p, o) => ({
    top: t.bottom - p.height,
    left: t.left - p.width - o,
  }),
  right: (t, p, o) => ({
    top: t.top + t.height / 2 - p.height / 2,
    left: t.right + o,
  }),
  "right-start": (t, p, o) => ({ top: t.top, left: t.right + o }),
  "right-end": (t, p, o) => ({ top: t.bottom - p.height, left: t.right + o }),
};

/**
 * Clamps a {top, left} pair so the popover never clips the viewport edge.
 * @param {{ top: number, left: number }} pos
 * @param {DOMRect} rect  — popover bounding rect
 * @param {number}  [pad] — minimum clearance in px (default 8)
 */
function clampToViewport({ top, left }, rect, pad = 8) {
  return {
    top: Math.max(pad, Math.min(top, window.innerHeight - rect.height - pad)),
    left: Math.max(pad, Math.min(left, window.innerWidth - rect.width - pad)),
  };
}

/**
 * Converts a Shadcn-style `align` shorthand + inferred side into a full placement key.
 * e.g. resolveAlign("start", "bottom") → "bottom-start"
 * @param {"start"|"center"|"end"} align
 * @param {string} side  — "top" | "bottom" | "left" | "right"
 */
function resolveAlign(align, side = "bottom") {
  if (align === "start") return `${side}-start`;
  if (align === "end") return `${side}-end`;
  return side;
}

// ─── PopoverPortal (internal) ─────────────────────────────────────────────────
/**
 * Shared portal renderer used by both APIs.
 * Not exported — consume via <PopoverContent> or <Popover content={…}>.
 *
 * Handles:
 *  • Viewport-relative positioning using triggerRef
 *  • Entrance animation (opacity + scale + translateY)
 *  • Outside-click, Escape, scroll, and resize listeners
 *  • Hover-mode mouse-bridge (prevents closing when moving from trigger to popover)
 *
 * @param {object}          props
 * @param {boolean}         props.open
 * @param {function}        props.close
 * @param {React.RefObject} props.triggerRef       DOM ref of the trigger element
 * @param {string}          [props.placement]      One of the PLACEMENTS keys
 * @param {number}          [props.offset]         Gap between trigger edge and popover (px)
 * @param {boolean}         [props.closeOnOutside] Close when clicking outside (default true)
 * @param {ReactNode}       props.children
 * @param {string}          [props.className]      CSS classes on the outer portal div
 * @param {object}          [props.style]          Inline styles on the outer portal div
 * @param {object}          [props.hoverHandlers]  { onMouseEnter, onMouseLeave } for hover mode
 */
function PopoverPortal({
  open,
  close,
  triggerRef,
  placement = "bottom",
  offset = 8,
  closeOnOutside = true,
  children,
  className = "",
  style = {},
  hoverHandlers = {},
}) {
  const popoverRef = React.useRef(null);
  const [pos, setPos] = React.useState({ top: -9999, left: -9999 });
  const [ready, setReady] = React.useState(false);

  // ── Positioning ─────────────────────────────────────────────────────────────
  const reposition = React.useCallback(() => {
    if (!triggerRef?.current || !popoverRef.current) return;
    const t = triggerRef.current.getBoundingClientRect();
    const p = popoverRef.current.getBoundingClientRect();
    const fn = PLACEMENTS[placement] ?? PLACEMENTS["bottom"];
    setPos(clampToViewport(fn(t, p, offset), p));
    setReady(true);
  }, [triggerRef, placement, offset]);

  // rAF gives the portal a chance to mount before we measure dimensions
  React.useEffect(() => {
    if (!open) {
      setReady(false);
      return;
    }
    const raf = requestAnimationFrame(reposition);
    return () => cancelAnimationFrame(raf);
  }, [open, reposition]);

  // ── Global listeners ────────────────────────────────────────────────────────
  React.useEffect(() => {
    if (!open) return;
    const onOutside = (e) => {
      if (!closeOnOutside) return;
      if (popoverRef.current?.contains(e.target)) return;
      if (triggerRef?.current?.contains(e.target)) return;
      close();
    };
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    const onScroll = () => reposition();
    const onResize = () => reposition();
    document.addEventListener("mousedown", onOutside);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [open, close, closeOnOutside, reposition, triggerRef]);

  if (!open) return null;

  return createPortal(
    <div
      ref={popoverRef}
      role="dialog"
      aria-modal="false"
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        zIndex: 99990,
        // Invisible until positioned so there's no layout flash
        opacity: ready ? 1 : 0,
        transform: ready
          ? "scale(1) translateY(0px)"
          : "scale(0.95) translateY(-6px)",
        transition:
          "opacity 0.14s cubic-bezier(.4,0,.2,1), transform 0.14s cubic-bezier(.4,0,.2,1)",
        ...style,
      }}
      className={className}
      {...hoverHandlers}
    >
      {children}
    </div>,
    document.body,
  );
}

// ─── Context ──────────────────────────────────────────────────────────────────
/**
 * Internal context consumed by PopoverTrigger and PopoverContent.
 * leaveTimerRef is shared so the hover mouse-bridge works correctly:
 * trigger's onMouseLeave starts the timer; content's onMouseEnter cancels it.
 */
const PopoverCtx = React.createContext({
  open: false,
  setOpen: () => {},
  close: () => {},
  triggerRef: { current: null },
  leaveTimerRef: { current: null },
  trigger: "click",
  hoverDelay: 120,
  disabled: false,
  placement: "bottom",
  offset: 8,
  closeOnOutside: true,
});

// ─── Popover ──────────────────────────────────────────────────────────────────
/**
 * Root component. The API is chosen by which props you provide:
 *
 *   • Supply `content` prop → self-contained mode (children = trigger element)
 *   • Omit `content`       → compound mode (children = <PopoverTrigger> + <PopoverContent>)
 *
 * ─── COMPOUND API PROPS ──────────────────────────────────────────────────────
 * @param {ReactNode}         props.children
 * @param {boolean}           [props.open]           Controlled open state
 * @param {function}          [props.onOpenChange]   Called with the new boolean value
 * @param {"click"|"hover"}   [props.trigger]        How the popover is activated (default "click")
 * @param {number}            [props.hoverDelay]     Ms before closing on mouseleave (default 120)
 * @param {boolean}           [props.disabled]       Prevents opening
 * @param {boolean}           [props.closeOnOutside] Close on outside click/Escape (default true)
 * @param {string}            [props.placement]      Default placement passed to <PopoverContent> (default "bottom")
 * @param {number}            [props.offset]         Default gap in px passed to <PopoverContent> (default 8)
 *
 * ─── SELF-CONTAINED API PROPS ────────────────────────────────────────────────
 * @param {ReactNode|function} props.content         Popover body or (close) => ReactNode
 * @param {boolean}            [props.isOpen]        Controlled open state
 * @param {function}           [props.onOpen]        Called when the popover opens
 * @param {function}           [props.onClose]       Called when the popover closes
 * @param {string}             [props.className]     Class on the trigger wrapper div
 * @param {string}             [props.popoverClass]  Class on the popover outer div
 * @param {object}             [props.popoverStyle]  Inline style on the popover outer div
 * (placement, offset, trigger, hoverDelay, disabled, closeOnOutside are shared with compound)
 */
export function Popover({
  children,
  // Compound API — controlled
  open: controlledOpen,
  onOpenChange,
  // Self-contained API — controlled
  isOpen: legacyIsOpen,
  onOpen,
  onClose,
  // Shared behaviour
  trigger = "click",
  hoverDelay = 120,
  disabled = false,
  closeOnOutside = true,
  placement = "bottom",
  offset = 8,
  // Self-contained only
  content,
  className = "",
  popoverClass = "",
  popoverStyle = {},
}) {
  // Detect which API is in use for this instance
  const isSelfContained = content !== undefined;

  const [internalOpen, setInternalOpen] = React.useState(false);

  // Resolve the live open value from whichever API + control mode is active
  const open = isSelfContained
    ? legacyIsOpen !== undefined
      ? legacyIsOpen
      : internalOpen
    : controlledOpen !== undefined
      ? controlledOpen
      : internalOpen;

  const toggle = React.useCallback(
    (val) => {
      if (isSelfContained) {
        if (legacyIsOpen === undefined) setInternalOpen(val);
        val ? onOpen?.() : onClose?.();
      } else {
        if (controlledOpen === undefined) setInternalOpen(val);
        onOpenChange?.(val);
      }
    },
    [
      isSelfContained,
      legacyIsOpen,
      controlledOpen,
      onOpen,
      onClose,
      onOpenChange,
    ],
  );

  const close = React.useCallback(() => toggle(false), [toggle]);
  const setOpen = React.useCallback((val) => toggle(val), [toggle]);

  // triggerRef → positioning anchor for PopoverPortal
  // leaveTimerRef → shared hover timer so trigger + content can cancel each other
  const triggerRef = React.useRef(null);
  const leaveTimerRef = React.useRef(null);

  // ── Self-contained: trigger event handlers ──────────────────────────────────
  const clickHandlers = {
    onClick: () => {
      if (!disabled) toggle(!open);
    },
  };
  const hoverTriggerHandlers = {
    onMouseEnter: () => {
      clearTimeout(leaveTimerRef.current);
      if (!disabled) toggle(true);
    },
    onMouseLeave: () => {
      leaveTimerRef.current = setTimeout(close, hoverDelay);
    },
  };
  // Keeps the popover open while the mouse is over its own body (hover mode only)
  const hoverPopoverHandlers =
    trigger === "hover"
      ? {
          onMouseEnter: () => clearTimeout(leaveTimerRef.current),
          onMouseLeave: () => {
            leaveTimerRef.current = setTimeout(close, hoverDelay);
          },
        }
      : {};

  const triggerHandlers =
    trigger === "hover" ? hoverTriggerHandlers : clickHandlers;

  // ── Context value (compound mode) ──────────────────────────────────────────
  const contextValue = React.useMemo(
    () => ({
      open,
      setOpen,
      close,
      triggerRef,
      leaveTimerRef,
      trigger,
      hoverDelay,
      disabled,
      placement,
      offset,
      closeOnOutside,
    }),
    // leaveTimerRef / triggerRef are stable refs — intentionally omitted
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      open,
      setOpen,
      close,
      trigger,
      hoverDelay,
      disabled,
      placement,
      offset,
      closeOnOutside,
    ],
  );

  // ── SELF-CONTAINED render ───────────────────────────────────────────────────
  if (isSelfContained) {
    return (
      <>
        {/* Inline trigger wrapper — receives all activation handlers */}
        <div
          ref={triggerRef}
          className={cn("inline-block", className)}
          {...triggerHandlers}
        >
          {children}
        </div>

        <PopoverPortal
          open={open}
          close={close}
          triggerRef={triggerRef}
          placement={placement}
          offset={offset}
          closeOnOutside={closeOnOutside}
          className={popoverClass}
          style={popoverStyle}
          hoverHandlers={hoverPopoverHandlers}
        >
          {/* Render-prop receives `close`; plain nodes render as-is */}
          {typeof content === "function" ? content(close) : content}
        </PopoverPortal>
      </>
    );
  }

  // ── COMPOUND render ─────────────────────────────────────────────────────────
  return (
    <PopoverCtx.Provider value={contextValue}>{children}</PopoverCtx.Provider>
  );
}
Popover.displayName = "Popover";

// ─── PopoverTrigger ───────────────────────────────────────────────────────────
/**
 * Compound-API trigger.
 * Attaches the positioning ref and event handlers to the trigger element.
 *
 * @param {boolean} [props.asChild=false]
 *   When true, clones the single child element instead of rendering a <button>,
 *   merging all handlers and the ref onto the child. Use for custom components
 *   (e.g. <IconButton>, <Avatar>) that already render their own DOM element.
 * @param {string}  [props.className]
 *
 * @example — asChild with a custom button
 *   <PopoverTrigger asChild>
 *     <IconButton aria-label="More options">
 *       <DotsIcon />
 *     </IconButton>
 *   </PopoverTrigger>
 *
 * @example — default button wrapper
 *   <PopoverTrigger className="px-4 py-2 rounded bg-primary text-white">
 *     Open menu
 *   </PopoverTrigger>
 */
export const PopoverTrigger = React.forwardRef(function PopoverTrigger(
  { children, asChild = false, className, ...rest },
  forwardedRef,
) {
  const {
    open,
    setOpen,
    close,
    triggerRef,
    leaveTimerRef,
    trigger,
    hoverDelay,
    disabled,
  } = React.useContext(PopoverCtx);

  // Merge the consumer's forwarded ref with our internal positioning ref
  const mergedRef = React.useCallback(
    (node) => {
      triggerRef.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [triggerRef, forwardedRef],
  );

  // Click mode: toggle on each activation
  const clickHandlers = {
    onClick: (e) => {
      rest.onClick?.(e);
      if (!disabled) setOpen(!open);
    },
  };

  // Hover mode: open on enter, start close timer on leave
  const hoverHandlers = {
    onMouseEnter: (e) => {
      rest.onMouseEnter?.(e);
      clearTimeout(leaveTimerRef.current);
      if (!disabled) setOpen(true);
    },
    onMouseLeave: (e) => {
      rest.onMouseLeave?.(e);
      leaveTimerRef.current = setTimeout(close, hoverDelay);
    },
  };

  const handlers = trigger === "hover" ? hoverHandlers : clickHandlers;

  if (asChild) {
    // Clone the child, preserving its own handlers while adding ours
    const child = React.Children.only(children);
    const childClickHandlers = {
      onClick: (e) => {
        child.props.onClick?.(e);
        if (!disabled) setOpen(!open);
      },
    };
    const childHoverHandlers = {
      onMouseEnter: (e) => {
        child.props.onMouseEnter?.(e);
        clearTimeout(leaveTimerRef.current);
        if (!disabled) setOpen(true);
      },
      onMouseLeave: (e) => {
        child.props.onMouseLeave?.(e);
        leaveTimerRef.current = setTimeout(close, hoverDelay);
      },
    };
    return React.cloneElement(child, {
      ...(trigger === "hover" ? childHoverHandlers : childClickHandlers),
      ref: mergedRef,
    });
  }

  return (
    <button
      type="button"
      ref={mergedRef}
      className={cn(className)}
      {...rest}
      {...handlers}
    >
      {children}
    </button>
  );
});
PopoverTrigger.displayName = "PopoverTrigger";

// ─── PopoverContent ───────────────────────────────────────────────────────────
/**
 * Compound-API content panel.
 * Renders via React portal, automatically positioned relative to <PopoverTrigger>.
 * All positioning defaults flow down from <Popover>; any prop here overrides them.
 *
 * @param {string} [props.placement]
 *   Full placement key. When supplied, takes precedence over `align`.
 * @param {string} [props.align="center"]
 *   Shorthand: "start" | "center" | "end". Combined with the side from the root
 *   <Popover placement> to form a full key (e.g. align="start" on a bottom popover → "bottom-start").
 *   Ignored if `placement` is provided directly.
 * @param {number} [props.sideOffset]
 *   Gap override in px. Falls back to <Popover offset> when omitted.
 * @param {string} [props.className]
 *   Merged onto the styled content panel (overrides or extends defaults).
 * @param {object} [props.style]
 *
 * @example — with explicit placement
 *   <PopoverContent placement="bottom-start" sideOffset={12} className="w-80">
 *     <p className="text-sm">Rich content</p>
 *   </PopoverContent>
 *
 * @example — with align shorthand
 *   <PopoverContent align="end" className="w-64 p-3">
 *     Aligned to trigger's right edge
 *   </PopoverContent>
 */
export const PopoverContent = React.forwardRef(function PopoverContent(
  {
    children,
    className,
    style,
    placement: placementProp,
    align = "center",
    sideOffset,
    ...rest
  },
  forwardedRef,
) {
  const {
    open,
    close,
    triggerRef,
    leaveTimerRef,
    placement: ctxPlacement,
    offset: ctxOffset,
    closeOnOutside,
    trigger,
    hoverDelay,
  } = React.useContext(PopoverCtx);

  // Derive the side (e.g. "bottom") from the root placement for align resolution
  const ctxSide = ctxPlacement.split("-")[0];

  // Explicit `placement` wins; otherwise derive from `align` + context side
  const resolvedPlacement = placementProp ?? resolveAlign(align, ctxSide);
  const resolvedOffset = sideOffset ?? ctxOffset;

  // Hover mode: keep the popover open while the mouse is over its body
  const hoverHandlers =
    trigger === "hover"
      ? {
          onMouseEnter: () => clearTimeout(leaveTimerRef.current),
          onMouseLeave: () => {
            leaveTimerRef.current = setTimeout(close, hoverDelay);
          },
        }
      : {};

  return (
    <PopoverPortal
      open={open}
      close={close}
      triggerRef={triggerRef}
      placement={resolvedPlacement}
      offset={resolvedOffset}
      closeOnOutside={closeOnOutside}
      hoverHandlers={hoverHandlers}
      style={style}
      className={cn(
        // Design-token classes — resolve correctly in both light and dark mode
        // via --popover, --popover-foreground, --border CSS variables
        "rounded-xl border border-border bg-popover p-4 text-popover-foreground shadow-lg outline-none",
        className,
      )}
    >
      {/*
       * Inner div carries forwardedRef and any extra props (data-*, aria-*, etc.)
       * so consumers can target the logical "content" node, not the positioning shell.
       */}
      <div ref={forwardedRef} {...rest}>
        {children}
      </div>
    </PopoverPortal>
  );
});
PopoverContent.displayName = "PopoverContent";

// ─── PopoverCard ──────────────────────────────────────────────────────────────
/**
 * Optional pre-styled card shell for self-contained popover content.
 * Uses --card / --card-foreground / --border design tokens.
 * Renders correctly in light and dark mode with no extra configuration.
 *
 * @param {ReactNode} props.children
 * @param {string}    [props.className]  e.g. "w-64 p-4"
 * @param {object}    [props.style]
 *
 * @example
 *   <Popover
 *     content={(close) => (
 *       <PopoverCard className="w-56 p-3">
 *         <p className="text-sm text-muted-foreground">Confirm action?</p>
 *         <button onClick={close} className="mt-2 text-sm text-primary">
 *           Dismiss
 *         </button>
 *       </PopoverCard>
 *     )}
 *   >
 *     <button>Open card</button>
 *   </Popover>
 */
export function PopoverCard({ children, className = "", style }) {
  return (
    <div
      style={style}
      className={cn(
        "bg-card text-card-foreground",
        "border border-border",
        "rounded-xl shadow-lg overflow-hidden",
        className,
      )}
    >
      {children}
    </div>
  );
}
PopoverCard.displayName = "PopoverCard";

// ─── PopoverDivider ───────────────────────────────────────────────────────────
/**
 * Thin horizontal rule separator using the --border design token.
 * Adapts automatically to light and dark mode.
 *
 * @param {string} [props.className]
 *
 * @example
 *   <PopoverCard>
 *     <PopoverMenuItem>Item A</PopoverMenuItem>
 *     <PopoverDivider />
 *     <PopoverMenuItem danger>Delete</PopoverMenuItem>
 *   </PopoverCard>
 */
export function PopoverDivider({ className = "" }) {
  return <div className={cn("border-t border-border", className)} />;
}
PopoverDivider.displayName = "PopoverDivider";

// ─── PopoverMenuItem ──────────────────────────────────────────────────────────
/**
 * Convenience button row for menu-style popovers.
 * Hover states adapt automatically for light and dark mode via Tailwind token classes.
 *
 * @param {ReactNode}  props.children
 * @param {function}   [props.onClick]
 * @param {string}     [props.className]
 * @param {boolean}    [props.danger=false]  Destructive red styling
 * @param {ReactNode}  [props.icon]          Leading icon element (e.g. a Lucide icon)
 * @param {boolean}    [props.disabled=false]
 *
 * @example
 *   <PopoverMenuItem
 *     icon={<Pencil className="w-4 h-4" />}
 *     onClick={handleEdit}
 *   >
 *     Edit post
 *   </PopoverMenuItem>
 *
 *   <PopoverMenuItem danger icon={<Trash className="w-4 h-4" />} onClick={handleDelete}>
 *     Delete permanently
 *   </PopoverMenuItem>
 *
 *   <PopoverMenuItem disabled>Coming soon</PopoverMenuItem>
 */
export function PopoverMenuItem({
  children,
  onClick,
  className = "",
  danger = false,
  icon,
  disabled = false,
}) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={cn(
        "w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left",
        "transition-colors duration-150",
        danger
          ? "text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20"
          : "text-foreground hover:bg-muted dark:hover:bg-muted/60",
        disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
        className,
      )}
    >
      {icon && <span className="flex-shrink-0 opacity-70">{icon}</span>}
      {children}
    </button>
  );
}
PopoverMenuItem.displayName = "PopoverMenuItem";

export default Popover;
