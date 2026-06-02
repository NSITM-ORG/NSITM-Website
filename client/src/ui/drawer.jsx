/**
 * @file Drawer.jsx
 * Slide-in panel anchored to any viewport edge.
 *
 * Portal-rendered with backdrop overlay, body scroll lock, focus trap,
 * smooth enter/exit animation, and full CSS-variable theming.
 * Light mode by default; dark mode via the nearest .dark ancestor.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * EXPORTS
 * ─────────────────────────────────────────────────────────────────────────────
 *   Drawer               Root / state manager
 *   DrawerTrigger        Opens the drawer (supports asChild)
 *   DrawerContent        Portal-rendered panel (side, size, animation)
 *   DrawerOverlay        Backdrop — rendered inside DrawerContent by default
 *   DrawerHeader         Top section with bottom border
 *   DrawerTitle          <h2> heading inside DrawerHeader
 *   DrawerDescription    Subtitle/description inside DrawerHeader
 *   DrawerFooter         Bottom action bar with top border
 *   DrawerClose          Closes the drawer (supports asChild)
 *   useDrawerDisclosure  Programmatic open/close hook
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SIDE VALUES
 *   "right" (default) | "left" | "top" | "bottom"
 *
 * SIZE VALUES  (horizontal sides → width, vertical sides → height)
 *   "sm"  → 20rem  / 30vh
 *   "md"  → 25rem  / 45vh   (default)
 *   "lg"  → 34rem  / 60vh
 *   "xl"  → 42rem  / 80vh
 *   "full"→ 100vw  / 100vh
 *   Pass a custom className with w-[Xpx] or h-[Xpx] to override size entirely.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * USAGE
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *   // Basic right-side drawer
 *   <Drawer>
 *     <DrawerTrigger asChild>
 *       <Button>Open cart</Button>
 *     </DrawerTrigger>
 *     <DrawerContent>
 *       <DrawerHeader>
 *         <DrawerTitle>Shopping Cart</DrawerTitle>
 *         <DrawerDescription>3 items in your cart</DrawerDescription>
 *       </DrawerHeader>
 *       <div className="flex-1 overflow-y-auto p-6">
 *         cart items here
 *       </div>
 *       <DrawerFooter>
 *         <DrawerClose asChild>
 *           <Button variant="outline">Continue shopping</Button>
 *         </DrawerClose>
 *         <Button>Checkout</Button>
 *       </DrawerFooter>
 *     </DrawerContent>
 *   </Drawer>
 *
 *   // Bottom sheet
 *   <Drawer>
 *     <DrawerTrigger>Share</DrawerTrigger>
 *     <DrawerContent side="bottom" size="lg">
 *       <DrawerHeader>
 *         <DrawerTitle>Share via</DrawerTitle>
 *       </DrawerHeader>
 *       <div className="p-6">...</div>
 *     </DrawerContent>
 *   </Drawer>
 *
 *   // Left navigation panel
 *   <Drawer>
 *     <DrawerTrigger asChild><MenuIcon /></DrawerTrigger>
 *     <DrawerContent side="left" size="sm">
 *       <nav>...</nav>
 *     </DrawerContent>
 *   </Drawer>
 *
 *   // Controlled
 *   const { isOpen, onOpen, onClose, setIsOpen } = useDrawerDisclosure();
 *   <Drawer open={isOpen} onOpenChange={setIsOpen}>
 *     <DrawerContent side="right">...</DrawerContent>
 *   </Drawer>
 *
 *   // No backdrop, stays open when clicking outside
 *   <DrawerContent backdrop={false} closeOnBackdrop={false}>...</DrawerContent>
 */

import * as React from "react";
import { createPortal } from "react-dom";

// Replace with: import { cn } from "../../lib/utils"
const cn = (...classes) => classes.filter(Boolean).join(" ");

// ─── Animation transforms per side ───────────────────────────────────────────
const TRANSFORMS = {
  left:   { hidden: "translateX(-100%)", shown: "translateX(0)" },
  right:  { hidden: "translateX(100%)",  shown: "translateX(0)" },
  top:    { hidden: "translateY(-100%)", shown: "translateY(0)" },
  bottom: { hidden: "translateY(100%)",  shown: "translateY(0)" },
};

// ─── Fixed-position anchoring per side ───────────────────────────────────────
const POSITION = {
  left:   { top: 0, left:   0, bottom: 0 },
  right:  { top: 0, right:  0, bottom: 0 },
  top:    { top: 0, left:   0, right:  0 },
  bottom: { bottom: 0, left: 0, right: 0 },
};

// ─── Size → CSS value mapping ─────────────────────────────────────────────────
const SIZES = {
  sm:   { h: "20rem",  v: "30vh"  },
  md:   { h: "25rem",  v: "45vh"  },
  lg:   { h: "33.75rem", v: "60vh" },
  xl:   { h: "42.5rem",  v: "80vh" },
  full: { h: "100vw",  v: "100vh" },
};

function sizeStyle(side, size) {
  const map = SIZES[size];
  if (!map) return {};
  return (side === "left" || side === "right")
    ? { width: map.h }
    : { height: map.v };
}

// ─── Context ──────────────────────────────────────────────────────────────────
const DrawerCtx = React.createContext({
  open:    false,
  setOpen: () => {},
  close:   () => {},
});

// ─── Drawer ───────────────────────────────────────────────────────────────────
/**
 * Root component. Manages open state and distributes it to all child components.
 *
 * @param {ReactNode}  props.children
 * @param {boolean}    [props.open]           Controlled open state
 * @param {function}   [props.onOpenChange]   Called with new boolean value
 * @param {boolean}    [props.defaultOpen]    Uncontrolled initial state (default false)
 */
export function Drawer({ children, open: controlledOpen, onOpenChange, defaultOpen = false }) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const setOpen = React.useCallback((val) => {
    if (controlledOpen === undefined) setInternalOpen(val);
    onOpenChange?.(val);
  }, [controlledOpen, onOpenChange]);

  const close = React.useCallback(() => setOpen(false), [setOpen]);
  const ctx   = React.useMemo(() => ({ open, setOpen, close }), [open, setOpen, close]);

  return <DrawerCtx.Provider value={ctx}>{children}</DrawerCtx.Provider>;
}
Drawer.displayName = "Drawer";

// ─── DrawerTrigger ────────────────────────────────────────────────────────────
/**
 * Toggle element. Renders a <button> by default; use asChild to delegate to
 * your own element.
 *
 * @param {boolean} [props.asChild=false] Clone + inject handlers onto single child
 * @param {string}  [props.className]
 *
 * @example
 *   <DrawerTrigger asChild>
 *     <IconButton aria-label="Open menu"><MenuIcon /></IconButton>
 *   </DrawerTrigger>
 */
export const DrawerTrigger = React.forwardRef(function DrawerTrigger(
  { children, asChild = false, className, ...rest },
  ref,
) {
  const { open, setOpen } = React.useContext(DrawerCtx);
  const handleClick = (e) => { rest.onClick?.(e); setOpen(!open); };

  if (asChild) {
    const child = React.Children.only(children);
    return React.cloneElement(child, {
      ref,
      onClick: (e) => { child.props.onClick?.(e); setOpen(!open); },
    });
  }

  return (
    <button type="button" ref={ref} className={cn(className)} {...rest} onClick={handleClick}>
      {children}
    </button>
  );
});
DrawerTrigger.displayName = "DrawerTrigger";

// ─── DrawerOverlay ────────────────────────────────────────────────────────────
/**
 * Backdrop. Rendered inside DrawerContent automatically — only export and use
 * this directly if you need a fully custom backdrop.
 *
 * @param {string}   [props.className]
 * @param {function} [props.onClick]
 */
export const DrawerOverlay = React.forwardRef(function DrawerOverlay(
  { className, visible, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn("fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm", className)}
      style={{ zIndex: 99980, transition: "opacity 0.3s ease", opacity: visible ? 1 : 0 }}
      {...rest}
    />
  );
});
DrawerOverlay.displayName = "DrawerOverlay";

// ─── DrawerContent ────────────────────────────────────────────────────────────
/**
 * The actual drawer panel. Portal-rendered into document.body.
 * Manages enter/exit animation, scroll lock, and focus trap internally.
 *
 * @param {"right"|"left"|"top"|"bottom"}        [props.side="right"]         Which edge to anchor to
 * @param {"sm"|"md"|"lg"|"xl"|"full"}           [props.size="md"]            Panel size
 * @param {boolean}                              [props.backdrop=true]         Show overlay
 * @param {boolean}                              [props.closeOnBackdrop=true]  Click backdrop to close
 * @param {string}                               [props.className]
 *
 * @example
 *   <DrawerContent side="bottom" size="lg" className="rounded-t-2xl">
 *     ...
 *   </DrawerContent>
 */
export const DrawerContent = React.forwardRef(function DrawerContent(
  {
    children,
    className,
    side             = "right",
    size             = "md",
    backdrop         = true,
    closeOnBackdrop  = true,
    ...rest
  },
  forwardedRef,
) {
  const { open, close } = React.useContext(DrawerCtx);
  const drawerRef = React.useRef(null);

  // Two-phase mount: `mounted` keeps the DOM alive during exit animation
  const [mounted, setMounted] = React.useState(false);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setMounted(true);
      // Double rAF: first lets React flush the mount, second starts the CSS transition
      const r1 = requestAnimationFrame(() => {
        const r2 = requestAnimationFrame(() => setVisible(true));
        return () => cancelAnimationFrame(r2);
      });
      return () => cancelAnimationFrame(r1);
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 300); // matches transition duration
      return () => clearTimeout(t);
    }
  }, [open]);

  // Scroll lock — applied while the drawer is visually present
  React.useEffect(() => {
    if (!visible) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [visible]);

  // Focus trap + Escape key
  React.useEffect(() => {
    if (!visible || !drawerRef.current) return;
    const el = drawerRef.current;
    const focusable = el.querySelectorAll(
      'button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',
    );
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    first?.focus();

    const trap = (e) => {
      if (e.key === "Escape") { close(); return; }
      if (e.key !== "Tab")    return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first?.focus(); }
      }
    };

    document.addEventListener("keydown", trap);
    return () => document.removeEventListener("keydown", trap);
  }, [visible, close]);

  if (!mounted) return null;

  const transforms = TRANSFORMS[side] ?? TRANSFORMS.right;

  return createPortal(
    <>
      {backdrop && (
        <DrawerOverlay
          visible={visible}
          onClick={closeOnBackdrop ? close : undefined}
        />
      )}
      <div
        ref={(node) => {
          drawerRef.current = node;
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef) forwardedRef.current = node;
        }}
        role="dialog"
        aria-modal="true"
        style={{
          position:   "fixed",
          zIndex:     99990,
          ...POSITION[side] ?? POSITION.right,
          ...sizeStyle(side, size),
          transform:  visible ? transforms.shown : transforms.hidden,
          transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
        }}
        className={cn(
          "flex flex-col bg-background text-foreground border-border",
          side === "left"   && "border-r shadow-xl",
          side === "right"  && "border-l shadow-[-8px_0_30px_rgba(0,0,0,0.12)] dark:shadow-[-8px_0_30px_rgba(0,0,0,0.4)]",
          side === "top"    && "border-b shadow-xl",
          side === "bottom" && "border-t shadow-[0_-8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.4)]",
          className,
        )}
        {...rest}
      >
        {children}
      </div>
    </>,
    document.body,
  );
});
DrawerContent.displayName = "DrawerContent";

// ─── DrawerHeader ─────────────────────────────────────────────────────────────
/**
 * Top section of the drawer with a bottom border.
 * Place DrawerTitle and DrawerDescription inside.
 */
export function DrawerHeader({ children, className, ...rest }) {
  return (
    <div
      className={cn("flex flex-col gap-1.5 px-6 pt-6 pb-4 border-b border-border shrink-0", className)}
      {...rest}
    >
      {children}
    </div>
  );
}
DrawerHeader.displayName = "DrawerHeader";

// ─── DrawerTitle ──────────────────────────────────────────────────────────────
/** Primary heading rendered as a semantic <h2>. */
export const DrawerTitle = React.forwardRef(function DrawerTitle(
  { children, className, ...rest },
  ref,
) {
  return (
    <h2
      ref={ref}
      className={cn("text-lg font-semibold leading-none tracking-tight text-foreground", className)}
      {...rest}
    >
      {children}
    </h2>
  );
});
DrawerTitle.displayName = "DrawerTitle";

// ─── DrawerDescription ────────────────────────────────────────────────────────
/** Subtitle or helper text below DrawerTitle. */
export const DrawerDescription = React.forwardRef(function DrawerDescription(
  { children, className, ...rest },
  ref,
) {
  return (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...rest}>
      {children}
    </p>
  );
});
DrawerDescription.displayName = "DrawerDescription";

// ─── DrawerFooter ─────────────────────────────────────────────────────────────
/**
 * Sticky bottom action bar with a top border.
 * Content is right-aligned by default; pass className="justify-between" to override.
 */
export function DrawerFooter({ children, className, ...rest }) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-3 px-6 py-4 mt-auto border-t border-border shrink-0",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
DrawerFooter.displayName = "DrawerFooter";

// ─── DrawerClose ──────────────────────────────────────────────────────────────
/**
 * Closes the drawer on click. Renders a <button> by default; use asChild
 * to delegate to your own element.
 *
 * @param {boolean} [props.asChild=false]
 *
 * @example
 *   <DrawerClose asChild>
 *     <Button variant="outline">Cancel</Button>
 *   </DrawerClose>
 */
export const DrawerClose = React.forwardRef(function DrawerClose(
  { children, asChild = false, className, ...rest },
  ref,
) {
  const { close } = React.useContext(DrawerCtx);
  const handleClick = (e) => { rest.onClick?.(e); close(); };

  if (asChild) {
    const child = React.Children.only(children);
    return React.cloneElement(child, {
      ref,
      onClick: (e) => { child.props.onClick?.(e); close(); },
    });
  }

  return (
    <button type="button" ref={ref} className={cn(className)} {...rest} onClick={handleClick}>
      {children}
    </button>
  );
});
DrawerClose.displayName = "DrawerClose";

// ─── useDrawerDisclosure ──────────────────────────────────────────────────────
/**
 * Hook for programmatic drawer control.
 * Pair with <Drawer open={isOpen} onOpenChange={setIsOpen}>.
 *
 * @param {boolean} [defaultOpen=false]
 * @returns {{ isOpen, setIsOpen, onOpen, onClose, onToggle }}
 *
 * @example
 *   const drawer = useDrawerDisclosure();
 *   // open from a notification:
 *   useEffect(() => { if (hasNewMessage) drawer.onOpen(); }, [hasNewMessage]);
 *   <Drawer open={drawer.isOpen} onOpenChange={drawer.setIsOpen}>...</Drawer>
 */
export function useDrawerDisclosure(defaultOpen = false) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  return {
    isOpen,
    setIsOpen,
    onOpen:   React.useCallback(() => setIsOpen(true),  []),
    onClose:  React.useCallback(() => setIsOpen(false), []),
    onToggle: React.useCallback(() => setIsOpen((v) => !v), []),
  };
}

export default Drawer;