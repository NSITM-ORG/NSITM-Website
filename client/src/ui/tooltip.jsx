/**
 * @file Tooltip.jsx
 * Portal-based tooltip with placement engine, configurable delays,
 * optional arrow, and programmatic control.
 *
 * Full upgrade from the original CSS-relative version:
 *  • Portal-rendered — never clipped by overflow:hidden parents
 *  • 12 placement options (same engine as Popover)
 *  • delayDuration wired from TooltipProvider down to each Tooltip
 *  • Optional arrow indicator
 *  • asChild support on TooltipTrigger
 *  • Fully backward-compatible API shape
 *
 * Light mode by default; dark mode via the nearest .dark ancestor.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * EXPORTS
 * ─────────────────────────────────────────────────────────────────────────────
 *   TooltipProvider      Optional root for shared delay/config (wrap once at layout level)
 *   Tooltip              Root — manages open state
 *   TooltipTrigger       Hover element (supports asChild)
 *   TooltipContent       Portal-rendered bubble (placement, arrow, styling)
 *   useTooltipDisclosure Programmatic open/close hook
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * PLACEMENT VALUES
 * ─────────────────────────────────────────────────────────────────────────────
 *   top (default) | top-start | top-end
 *   bottom | bottom-start | bottom-end
 *   left | left-start | left-end
 *   right | right-start | right-end
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * USAGE
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *   // Wrap your app once (optional — sets global delay for all tooltips)
 *   <TooltipProvider delayDuration={500}>
 *     <App />
 *   </TooltipProvider>
 *
 *   // Basic hover tooltip
 *   <Tooltip>
 *     <TooltipTrigger asChild>
 *       <button aria-label="Settings"><SettingsIcon /></button>
 *     </TooltipTrigger>
 *     <TooltipContent>Settings</TooltipContent>
 *   </Tooltip>
 *
 *   // Custom placement + offset
 *   <Tooltip>
 *     <TooltipTrigger>Hover me</TooltipTrigger>
 *     <TooltipContent placement="right" sideOffset={8}>
 *       Appears to the right
 *     </TooltipContent>
 *   </Tooltip>
 *
 *   // With arrow indicator
 *   <Tooltip>
 *     <TooltipTrigger asChild><InfoIcon /></TooltipTrigger>
 *     <TooltipContent showArrow>Helpful hint</TooltipContent>
 *   </Tooltip>
 *
 *   // Per-tooltip delay override
 *   <Tooltip delayDuration={0}>
 *     <TooltipTrigger asChild><Button>Instant</Button></TooltipTrigger>
 *     <TooltipContent>Shows immediately</TooltipContent>
 *   </Tooltip>
 *
 *   // Programmatic control (e.g. copy confirmation)
 *   const { isOpen, onOpen, onClose, setIsOpen } = useTooltipDisclosure();
 *   const handleCopy = () => {
 *     navigator.clipboard.writeText(value);
 *     onOpen();
 *     setTimeout(onClose, 2000);
 *   };
 *   <Tooltip open={isOpen} onOpenChange={setIsOpen}>
 *     <TooltipTrigger asChild>
 *       <button onClick={handleCopy}><CopyIcon /></button>
 *     </TooltipTrigger>
 *     <TooltipContent>Copied!</TooltipContent>
 *   </Tooltip>
 *
 *   // Validation error tooltip (stays open until field is valid)
 *   const { isOpen, onOpen, onClose, setIsOpen } = useTooltipDisclosure();
 *   <Tooltip open={isOpen} onOpenChange={setIsOpen}>
 *     <TooltipTrigger asChild>
 *       <input onFocus={!isValid ? onOpen : undefined} onBlur={onClose} />
 *     </TooltipTrigger>
 *     <TooltipContent className="border-destructive text-destructive" placement="bottom-start">
 *       This field is required.
 *     </TooltipContent>
 *   </Tooltip>
 *
 *   // Rich content
 *   <Tooltip>
 *     <TooltipTrigger asChild><HelpCircleIcon /></TooltipTrigger>
 *     <TooltipContent className="max-w-xs" showArrow>
 *       <p className="font-medium">Pro tip</p>
 *       <p className="text-xs opacity-80 mt-0.5">Hold Shift to select multiple items.</p>
 *     </TooltipContent>
 *   </Tooltip>
 */

import * as React from "react";
import { createPortal } from "react-dom";

const cn = (...classes) => classes.filter(Boolean).join(" ");

// ─── Placement engine ─────────────────────────────────────────────────────────
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

function clampToViewport({ top, left }, rect, pad = 6) {
  return {
    top: Math.max(pad, Math.min(top, window.innerHeight - rect.height - pad)),
    left: Math.max(pad, Math.min(left, window.innerWidth - rect.width - pad)),
  };
}

// ─── Arrow styles per placement side ─────────────────────────────────────────
function getArrowStyle(placement) {
  const side = placement.split("-")[0];
  const base = {
    position: "absolute",
    width: "6px",
    height: "6px",
    background: "hsl(var(--popover))",
    transform: "rotate(45deg)",
  };
  switch (side) {
    case "top":
      return {
        ...base,
        bottom: "-3px",
        left: "50%",
        marginLeft: "-3px",
        borderRight: "1px solid hsl(var(--border))",
        borderBottom: "1px solid hsl(var(--border))",
      };
    case "bottom":
      return {
        ...base,
        top: "-3px",
        left: "50%",
        marginLeft: "-3px",
        borderLeft: "1px solid hsl(var(--border))",
        borderTop: "1px solid hsl(var(--border))",
      };
    case "left":
      return {
        ...base,
        right: "-3px",
        top: "50%",
        marginTop: "-3px",
        borderRight: "1px solid hsl(var(--border))",
        borderTop: "1px solid hsl(var(--border))",
      };
    case "right":
      return {
        ...base,
        left: "-3px",
        top: "50%",
        marginTop: "-3px",
        borderLeft: "1px solid hsl(var(--border))",
        borderBottom: "1px solid hsl(var(--border))",
      };
    default:
      return base;
  }
}

// ─── Provider context (for global delay config) ───────────────────────────────
const TooltipProviderCtx = React.createContext({ delayDuration: 700 });

// ─── TooltipProvider ──────────────────────────────────────────────────────────
/**
 * Optional layout-level wrapper that sets a shared `delayDuration` for all
 * Tooltip components in the subtree. Individual Tooltips can override it via
 * their own `delayDuration` prop.
 *
 * @param {number}    [props.delayDuration=700]  Hover delay in ms before tooltip opens
 * @param {ReactNode} props.children
 *
 * @example
 *   // In your root layout
 *   <TooltipProvider delayDuration={400}>
 *     <App />
 *   </TooltipProvider>
 */
export function TooltipProvider({ children, delayDuration = 700 }) {
  const ctx = React.useMemo(() => ({ delayDuration }), [delayDuration]);
  return (
    <TooltipProviderCtx.Provider value={ctx}>
      {children}
    </TooltipProviderCtx.Provider>
  );
}
TooltipProvider.displayName = "TooltipProvider";

// ─── Tooltip context ──────────────────────────────────────────────────────────
const TooltipCtx = React.createContext({
  open: false,
  setOpen: () => {},
  close: () => {},
  triggerRef: { current: null },
  openTimerRef: { current: null },
  delayDuration: 700,
});

// ─── Tooltip ──────────────────────────────────────────────────────────────────
/**
 * Root tooltip component. Manages open state and distributes it via context.
 *
 * Supports **uncontrolled** (hover-driven) and **controlled** (programmatic) modes.
 *
 * @param {ReactNode}  props.children
 * @param {boolean}    [props.open]            Controlled open state
 * @param {function}   [props.onOpenChange]    Called when open state should change
 * @param {boolean}    [props.defaultOpen]     Uncontrolled initial state
 * @param {number}     [props.delayDuration]   Per-tooltip delay override (ms).
 *                                             Falls back to TooltipProvider value.
 */
export function Tooltip({
  children,
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
  delayDuration: localDelay,
}) {
  const { delayDuration: providerDelay } = React.useContext(TooltipProviderCtx);
  const delayDuration = localDelay ?? providerDelay;

  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const setOpen = React.useCallback(
    (val) => {
      if (controlledOpen !== undefined) {
        onOpenChange?.(val);
        return;
      }
      setInternalOpen(val);
      onOpenChange?.(val);
    },
    [controlledOpen, onOpenChange],
  );

  const close = React.useCallback(() => setOpen(false), [setOpen]);
  const triggerRef = React.useRef(null);
  const openTimerRef = React.useRef(null);

  const ctx = React.useMemo(
    () => ({
      open,
      setOpen,
      close,
      triggerRef,
      openTimerRef,
      delayDuration,
    }),
    [open, setOpen, close, delayDuration],
  );

  return <TooltipCtx.Provider value={ctx}>{children}</TooltipCtx.Provider>;
}
Tooltip.displayName = "Tooltip";

// ─── TooltipTrigger ───────────────────────────────────────────────────────────
/**
 * The element that shows/hides the tooltip on hover.
 * In controlled mode, hover still works alongside programmatic control — both
 * can coexist without conflict.
 *
 * @param {boolean} [props.asChild=false]
 *   Merge hover handlers onto the single child element instead of wrapping in a div.
 * @param {string}  [props.className]
 *
 * @example
 *   // Default wrapper div
 *   <TooltipTrigger><InfoIcon /></TooltipTrigger>
 *
 *   // asChild — no extra wrapper in the DOM
 *   <TooltipTrigger asChild>
 *     <button type="button">Hover me</button>
 *   </TooltipTrigger>
 */
export const TooltipTrigger = React.forwardRef(function TooltipTrigger(
  { children, asChild = false, className, ...rest },
  forwardedRef,
) {
  const { setOpen, close, triggerRef, openTimerRef, delayDuration } =
    React.useContext(TooltipCtx);

  const mergedRef = React.useCallback(
    (node) => {
      triggerRef.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [triggerRef, forwardedRef],
  );

  const handleMouseEnter = () => {
    clearTimeout(openTimerRef.current);
    if (delayDuration > 0) {
      openTimerRef.current = setTimeout(() => setOpen(true), delayDuration);
    } else {
      setOpen(true);
    }
  };
  const handleMouseLeave = () => {
    clearTimeout(openTimerRef.current);
    close();
  };
  const handleFocus = () => {
    clearTimeout(openTimerRef.current);
    setOpen(true);
  };
  const handleBlur = () => {
    close();
  };

  const handlers = {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onFocus: handleFocus,
    onBlur: handleBlur,
  };

  if (asChild) {
    const child = React.Children.only(children);
    return React.cloneElement(child, {
      ref: mergedRef,
      onMouseEnter: (e) => {
        child.props.onMouseEnter?.(e);
        handleMouseEnter();
      },
      onMouseLeave: (e) => {
        child.props.onMouseLeave?.(e);
        handleMouseLeave();
      },
      onFocus: (e) => {
        child.props.onFocus?.(e);
        handleFocus();
      },
      onBlur: (e) => {
        child.props.onBlur?.(e);
        handleBlur();
      },
    });
  }

  return (
    <div
      ref={mergedRef}
      className={cn("inline-block", className)}
      {...rest}
      {...handlers}
    >
      {children}
    </div>
  );
});
TooltipTrigger.displayName = "TooltipTrigger";

// ─── TooltipContent ───────────────────────────────────────────────────────────
/**
 * The floating tooltip bubble. Portal-rendered, so it's never clipped by
 * overflow:hidden parents. Positioned relative to TooltipTrigger.
 *
 * @param {string}  [props.placement="top"]  One of the 12 placement keys
 * @param {number}  [props.sideOffset=6]     Gap between trigger and bubble in px
 * @param {boolean} [props.showArrow=false]  Render a small directional arrow
 * @param {string}  [props.className]        Extra classes merged onto the bubble
 *
 * @example
 *   <TooltipContent placement="bottom-start" sideOffset={8} showArrow className="max-w-xs">
 *     <p className="font-medium">Keyboard shortcut</p>
 *     <p className="text-xs opacity-75 mt-0.5">Press ⌘K to open the command palette</p>
 *   </TooltipContent>
 */
export const TooltipContent = React.forwardRef(function TooltipContent(
  {
    children,
    className,
    placement = "top",
    sideOffset = 6,
    showArrow = false,
    style,
    ...rest
  },
  forwardedRef,
) {
  const { open, close, triggerRef } = React.useContext(TooltipCtx);

  const bubbleRef = React.useRef(null);
  const [pos, setPos] = React.useState({ top: -9999, left: -9999 });
  const [ready, setReady] = React.useState(false);

  // ── Positioning ─────────────────────────────────────────────────────────────
  const reposition = React.useCallback(() => {
    if (!triggerRef?.current || !bubbleRef.current) return;
    const t = triggerRef.current.getBoundingClientRect();
    const p = bubbleRef.current.getBoundingClientRect();
    const fn = PLACEMENTS[placement] ?? PLACEMENTS["top"];
    setPos(clampToViewport(fn(t, p, sideOffset), p));
    setReady(true);
  }, [triggerRef, placement, sideOffset]);

  React.useEffect(() => {
    if (!open) {
      setReady(false);
      return;
    }
    const r = requestAnimationFrame(reposition);
    return () => cancelAnimationFrame(r);
  }, [open, reposition]);

  React.useEffect(() => {
    if (!open) return;
    const onScroll = () => reposition();
    const onResize = () => reposition();
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close, reposition]);

  if (!open) return null;

  return createPortal(
    <div
      ref={(node) => {
        bubbleRef.current = node;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      }}
      role="tooltip"
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        zIndex: 99995,
        opacity: ready ? 1 : 0,
        transform: ready ? "scale(1)" : "scale(0.94)",
        transition: "opacity 0.1s ease, transform 0.1s ease",
        ...style,
      }}
      className={cn(
        // Uses --popover / --popover-foreground / --border CSS tokens
        // Adapts automatically in both light and dark mode
        "z-50 overflow-visible rounded-md border border-border",
        "bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md",
        className,
      )}
      {...rest}
    >
      {children}
      {showArrow && <div aria-hidden="true" style={getArrowStyle(placement)} />}
    </div>,
    document.body,
  );
});
TooltipContent.displayName = "TooltipContent";

// ─── useTooltipDisclosure ─────────────────────────────────────────────────────
/**
 * Hook for programmatic tooltip control. Pair with
 * `<Tooltip open={isOpen} onOpenChange={setIsOpen}>`.
 *
 * @param {boolean} [defaultOpen=false]
 * @returns {{ isOpen, onOpen, onClose, onToggle, setIsOpen }}
 *
 * @example — Auto-dismiss after copy
 *   const { isOpen, onOpen, onClose, setIsOpen } = useTooltipDisclosure();
 *   const handleCopy = () => {
 *     navigator.clipboard.writeText(value);
 *     onOpen();
 *     setTimeout(onClose, 2000);
 *   };
 *
 * @example — Toggle on click (touch-friendly)
 *   const { isOpen, onToggle, setIsOpen } = useTooltipDisclosure();
 *   <Tooltip open={isOpen} onOpenChange={setIsOpen}>
 *     <TooltipTrigger asChild>
 *       <button onClick={onToggle}><InfoIcon /></button>
 *     </TooltipTrigger>
 *     <TooltipContent>Tap again to dismiss</TooltipContent>
 *   </Tooltip>
 */
export function useTooltipDisclosure(defaultOpen = false) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  return {
    isOpen,
    setIsOpen,
    onOpen: React.useCallback(() => setIsOpen(true), []),
    onClose: React.useCallback(() => setIsOpen(false), []),
    onToggle: React.useCallback(() => setIsOpen((v) => !v), []),
  };
}

export default Tooltip;
