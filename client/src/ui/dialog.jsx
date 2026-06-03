// src/components/ui/dialog.jsx
import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "../libs/cn";

// ---------------------------------------------------------------------------
// Global Dialog Stack Manager
//
// Solves two problems decisively:
//
// Problem 1 — Stacking context traps
//   When a dialog is opened from inside a dropdown, tooltip, or any element with
//   `transform`, `filter`, `will-change`, `isolation`, or `overflow:hidden`, the
//   browser creates a new stacking context. Any child z-index — no matter how high
//   the number — is clamped to that parent's layer. The portal MUST escape to
//   document.body to break out of this trap entirely.
//
// Problem 2 — Dialog-on-dialog ordering
//   A static zIndex prop cannot guarantee the second dialog always sits above the
//   first, because both dialogs have separate React trees and neither knows about
//   the other. A module-level stack counter solves this: each dialog that mounts
//   claims the next z-index tier, and releases it on unmount. The stack is always
//   ordered correctly regardless of how or where the dialog was triggered.
//
// Base z-index is 1000 — safely above Tailwind's z-50 (50), fixed navbars (~100),
// dropdowns (~200), and toasts (~900).
// ---------------------------------------------------------------------------

const DIALOG_Z_BASE = 90000000;
const DIALOG_Z_STEP = 50; // overlay gets N, panel gets N+10

/** @type {number[]} Live stack of active z-index tiers, one entry per open DialogContent. */
let dialogStack = [];

/**
 * Claims the next z-index tier for a newly mounted DialogContent.
 * @returns {number} The overlay z-index for this dialog; panel uses this + 10.
 */
function claimDialogZ() {
  const next =
    dialogStack.length === 0
      ? DIALOG_Z_BASE
      : dialogStack[dialogStack.length - 1] + DIALOG_Z_STEP;
  dialogStack.push(next);
  return next;
}

/**
 * Releases a z-index tier when a DialogContent unmounts.
 * @param {number} z
 */
function releaseDialogZ(z) {
  dialogStack = dialogStack.filter((v) => v !== z);
}

// ---------------------------------------------------------------------------
// Context (internal)
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} DialogContextValue
 * @property {boolean}  open          - Whether the dialog is currently open.
 * @property {function(boolean): void} setOpen - Setter to open or close the dialog.
 * @property {boolean}  bgCloseable   - Whether clicking the overlay closes the dialog.
 */

/** @type {React.Context<DialogContextValue>} */
const DialogContext = React.createContext({
  open: false,
  setOpen: () => {},
  bgCloseable: true,
});

// ---------------------------------------------------------------------------
// Dialog (root)
// ---------------------------------------------------------------------------

/**
 * `Dialog` — Root container for the dialog system.
 *
 * Manages open/closed state and exposes it via context to all child components.
 * Supports both **uncontrolled** (self-managed) and **controlled** (disclosure-driven) usage.
 *
 * Dialogs always render over the full viewport regardless of where in the React tree
 * they are triggered. Stacked dialogs (dialog opened from another dialog, or from a
 * dropdown/menu) always layer correctly — the most recently opened dialog always
 * sits on top.
 *
 * ---
 *
 * ### Uncontrolled — context-driven (no hook needed)
 * ```jsx
 * <Dialog>
 *   <DialogTrigger asChild>
 *     <button>Open</button>
 *   </DialogTrigger>
 *   <DialogContent>
 *     <DialogHeader>
 *       <DialogTitle>Hello</DialogTitle>
 *     </DialogHeader>
 *     <p>Dialog body content.</p>
 *   </DialogContent>
 * </Dialog>
 * ```
 *
 * ### Controlled — with `useDialogDisclosure`
 * ```jsx
 * const { isOpen, onOpen, onClose, setIsOpen } = useDialogDisclosure();
 *
 * <button onClick={onOpen}>Open from outside</button>
 *
 * <Dialog open={isOpen} onOpenChange={setIsOpen}>
 *   <DialogContent onClose={onClose}>
 *     <DialogTitle>Controlled Dialog</DialogTitle>
 *   </DialogContent>
 * </Dialog>
 * ```
 *
 * ### Dialog opened from inside a dropdown or another dialog
 * No special handling needed — stack manager guarantees correct layering automatically.
 * ```jsx
 * <DropdownMenu>
 *   <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
 *   <DropdownMenuContent>
 *     <Dialog>
 *       <DialogTrigger asChild>
 *         <DropdownMenuItem>Delete</DropdownMenuItem>
 *       </DialogTrigger>
 *       <DialogContent>
 *         <DialogTitle>Confirm Delete</DialogTitle>
 *       </DialogContent>
 *     </Dialog>
 *   </DropdownMenuContent>
 * </DropdownMenu>
 * ```
 *
 * @param {Object}   props
 * @param {React.ReactNode} props.children                  - Dialog sub-components.
 * @param {boolean}  [props.open]                           - Controlled open state. Omit for uncontrolled mode.
 * @param {function(boolean): void} [props.onOpenChange]    - Called when open state should change.
 * @param {boolean}  [props.bgCloseable=true]               - Whether clicking the overlay dismisses the dialog.
 */
const Dialog = ({
  children,
  open: controlledOpen,
  onOpenChange,
  bgCloseable = true,
}) => {
  const [internalOpen, setInternalOpen] = React.useState(false);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const setOpen = React.useCallback(
    (value) => {
      if (controlledOpen !== undefined) {
        onOpenChange?.(value);
      } else {
        setInternalOpen(value);
      }
    },
    [controlledOpen, onOpenChange],
  );

  return (
    <DialogContext.Provider value={{ open, setOpen, bgCloseable }}>
      {children}
    </DialogContext.Provider>
  );
};
Dialog.displayName = "Dialog";

// ---------------------------------------------------------------------------
// DialogPortal
// ---------------------------------------------------------------------------

/**
 * `DialogPortal` — Renders children directly into `document.body` via a React portal.
 *
 * This is the core escape hatch that guarantees full-viewport coverage. By mounting
 * into `document.body`, all dialog content lives at the top of the DOM stacking
 * context — completely outside any parent element that could create a new stacking
 * context (`transform`, `filter`, `overflow:hidden`, `isolation`, `will-change`).
 *
 * This is why a dialog opened from inside a dropdown, a fixed sidebar, a transformed
 * card, or another dialog always covers the full screen — its DOM node is a direct
 * child of `<body>`, not of whatever triggered it.
 *
 * > **Warning:** The `container` prop accepts a custom target for exceptional cases
 * > but should almost never be used. Passing anything other than `document.body`
 * > risks reintroducing the exact stacking context traps this portal is designed
 * > to escape.
 *
 * ```jsx
 * // Used internally by DialogContent — you rarely need this directly.
 * <DialogPortal>
 *   <div>Rendered as a direct child of document.body</div>
 * </DialogPortal>
 * ```
 *
 * @param {Object}          props
 * @param {React.ReactNode} props.children       - Content to portal.
 * @param {HTMLElement}     [props.container]    - Target DOM node. Defaults to `document.body`.
 *                                                 Avoid overriding unless you have a specific reason.
 */
const DialogPortal = ({ children, container }) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const target =
    container ?? (typeof document !== "undefined" ? document.body : null);

  return mounted && target ? createPortal(children, target) : null;
};
DialogPortal.displayName = "DialogPortal";

// ---------------------------------------------------------------------------
// DialogOverlay
// ---------------------------------------------------------------------------

/**
 * `DialogOverlay` — The dimmed full-viewport backdrop behind the dialog panel.
 *
 * Uses `position: fixed` and `inset: 0` to cover the entire viewport regardless
 * of scroll position. The `zIndex` is injected via `style` by `DialogContent`
 * from the stack manager — do not add z-index classes to `className` or it will
 * conflict with stacking order.
 *
 * Animates in/out via `data-state` (`"open"` | `"closed"`).
 *
 * ```jsx
 * // Rendered automatically by DialogContent — you do not need this directly.
 * <DialogOverlay dataState="open" />
 *
 * // Custom tint — keep z-index out of className
 * <DialogOverlay dataState="open" className="bg-black/70" />
 * ```
 *
 * @param {Object}           props
 * @param {string}           [props.className]  - Additional Tailwind classes. Avoid z-index utilities.
 * @param {"open"|"closed"}  [props.dataState]  - Drives enter/exit animations. Set by `DialogContent`.
 */
const DialogOverlay = React.forwardRef(
  ({ className, bgScheme = "blur", dataState, ...props }, ref) => {
    const background = ["blur", "transparent"].includes(bgScheme)
      ? "bg-black/40 backdrop-blur-[2px]"
      : ["white", "scale"].includes(bgScheme)
        ? " bg-foreground/80 backdrop-blur-[2px]"
        : `bg-${bgScheme}-100/40 backdrop-blur-[2px]`;

    return (
      <div
        ref={ref}
        className={cn(
          `fixed inset-0 ${background} z-[9999999]`,
          "data-[state=open]:animate-in  data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          className,
        )}
        data-state={dataState}
        {...props}
      />
    );
  },
);
DialogOverlay.displayName = "DialogOverlay";

// ---------------------------------------------------------------------------
// DialogTrigger
// ---------------------------------------------------------------------------

/**
 * `DialogTrigger` — A button (or wrapped element) that opens the dialog.
 *
 * Reads `setOpen` from `DialogContext`. Works identically whether placed inside
 * a dropdown item, another dialog's content, a table row, or anywhere else —
 * the stacking context of the trigger's DOM position has no effect on the dialog
 * that opens, because `DialogContent` always portals to `document.body`.
 *
 * ```jsx
 * // Default — renders a <button>
 * <DialogTrigger>Open Dialog</DialogTrigger>
 *
 * // asChild — merges click handler onto your own element
 * <DialogTrigger asChild>
 *   <button className="btn-primary">Open</button>
 * </DialogTrigger>
 *
 * // Inside a dropdown item
 * <Dialog>
 *   <DialogTrigger asChild>
 *     <DropdownMenuItem>Delete Vendor</DropdownMenuItem>
 *   </DialogTrigger>
 *   <DialogContent>...</DialogContent>
 * </Dialog>
 * ```
 *
 * @param {Object}   props
 * @param {React.ReactNode} props.children   - Button label or single child (for asChild).
 * @param {boolean}  [props.asChild=false]   - Merge open behaviour onto the single child element.
 * @param {string}   [props.className]       - Additional Tailwind classes.
 * @param {function} [props.onClick]         - Additional click handler, called before open fires.
 */
const DialogTrigger = React.forwardRef(
  ({ className, children, asChild = false, onClick, ...props }, ref) => {
    const { setOpen } = React.useContext(DialogContext);

    const handleClick = (e) => {
      onClick?.(e);
      setOpen(true);
    };

    if (asChild) {
      return React.cloneElement(React.Children.only(children), {
        onClick: (e) => {
          children.props.onClick?.(e);
          handleClick(e);
        },
        ref,
        ...props,
      });
    }

    return (
      <button
        type="button"
        ref={ref}
        onClick={handleClick}
        className={cn(className)}
        {...props}
      >
        {children}
      </button>
    );
  },
);
DialogTrigger.displayName = "DialogTrigger";

// ---------------------------------------------------------------------------
// DialogClose
// ---------------------------------------------------------------------------

/**
 * `DialogClose` — A button (or wrapped element) that closes the dialog.
 *
 * Use in footer actions, cancel buttons, or any element that should dismiss
 * the dialog without relying on the built-in X button inside `DialogContent`.
 *
 * ```jsx
 * // Default — renders a <button>
 * <DialogClose>Cancel</DialogClose>
 *
 * // asChild — delegates onto your own element
 * <DialogClose asChild>
 *   <button className="btn-ghost">Cancel</button>
 * </DialogClose>
 * ```
 *
 * @param {Object}   props
 * @param {React.ReactNode} props.children   - Button label or single child (for asChild).
 * @param {boolean}  [props.asChild=false]   - Merge close behaviour onto the single child element.
 * @param {string}   [props.className]       - Additional Tailwind classes.
 * @param {function} [props.onClick]         - Additional handler called before close fires.
 */
const DialogClose = React.forwardRef(
  ({ className, children, asChild = false, onClick, ...props }, ref) => {
    const { setOpen } = React.useContext(DialogContext);

    const handleClick = (e) => {
      onClick?.(e);
      setOpen(false);
    };

    if (asChild) {
      return React.cloneElement(React.Children.only(children), {
        onClick: (e) => {
          children.props.onClick?.(e);
          handleClick(e);
        },
        ref,
        ...props,
      });
    }

    return (
      <button
        type="button"
        ref={ref}
        onClick={handleClick}
        className={cn(className)}
        {...props}
      >
        {children}
      </button>
    );
  },
);
DialogClose.displayName = "DialogClose";

// ---------------------------------------------------------------------------
// DialogContent
// ---------------------------------------------------------------------------

/**
 * `DialogContent` — The main modal panel.
 *
 * ### Viewport coverage guarantee
 * `DialogContent` always covers the full viewport because:
 * 1. It renders into `document.body` via `DialogPortal`, escaping any stacking
 *    context created by its trigger's parent (dropdowns, fixed headers, transforms, etc.).
 * 2. Its z-index is assigned by the global stack manager — never a static value —
 *    so it always sits above everything open before it.
 *
 * ### Stacking order guarantee
 * Every `DialogContent` that mounts claims the next z-index tier (`1000`, `1050`,
 * `1100`, …). When it unmounts the tier is released. This means any number of
 * dialogs layered on top of each other will always render in the correct order,
 * and closing one mid-stack does not disrupt the rest.
 *
 * ### Delayed unmount
 * The DOM node stays alive for 300 ms after `open` becomes `false` so the exit
 * animation completes before the node is removed.
 *
 * ---
 *
 * ### Uncontrolled
 * ```jsx
 * <Dialog>
 *   <DialogTrigger>Open</DialogTrigger>
 *   <DialogContent>
 *     <DialogTitle>Title</DialogTitle>
 *     <DialogClose>Close</DialogClose>
 *   </DialogContent>
 * </Dialog>
 * ```
 *
 * ### Controlled — no X button
 * ```jsx
 * const disc = useDialogDisclosure();
 *
 * <Dialog open={disc.isOpen} onOpenChange={disc.setIsOpen}>
 *   <DialogContent onClose={disc.onClose} closable={false}>
 *     <DialogFooter>
 *       <button onClick={disc.onClose}>Done</button>
 *     </DialogFooter>
 *   </DialogContent>
 * </Dialog>
 * ```
 *
 * ### Opened from a dropdown (no special treatment needed)
 * ```jsx
 * <DropdownMenu>
 *   <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
 *   <DropdownMenuContent>
 *     <Dialog>
 *       <DialogTrigger asChild>
 *         <DropdownMenuItem>Delete</DropdownMenuItem>
 *       </DialogTrigger>
 *       <DialogContent>
 *         <DialogTitle>Confirm Delete</DialogTitle>
 *       </DialogContent>
 *     </Dialog>
 *   </DropdownMenuContent>
 * </DropdownMenu>
 * ```
 *
 * @param {Object}   props
 * @param {React.ReactNode} props.children   - Modal body content.
 * @param {string}   [props.className]       - Additional Tailwind classes for the panel.
 * @param {function} [props.onClose]         - Explicit close handler merged with context close.
 *                                             Use for side-effects: reset form state, clear errors, etc.
 * @param {boolean}  [props.closable=true]   - Show or hide the built-in X close button.
 */
const DialogContent = React.forwardRef(
  ({ className, children, onClose, closable = true, ...props }, ref) => {
    const { open, setOpen, bgCloseable } = React.useContext(DialogContext);
    const [mounted, setMounted] = React.useState(false);
    const timeoutRef = React.useRef(null);

    // Each DialogContent instance owns its z-index tier for its entire lifetime.
    // claimDialogZ is called once on mount and releaseDialogZ once on unmount.
    const zRef = React.useRef(null);

    React.useEffect(() => {
      zRef.current = claimDialogZ();
      return () => {
        if (zRef.current !== null) releaseDialogZ(zRef.current);
      };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleClose = React.useCallback(() => {
      setOpen(false);
      onClose?.();
    }, [setOpen, onClose]);

    // Delay DOM removal so the 300 ms exit animation plays out fully.
    React.useEffect(() => {
      if (open) {
        setMounted(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      } else {
        timeoutRef.current = setTimeout(() => setMounted(false), 300);
      }
      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }, [open]);

    if (!mounted) return null;

    const dataState = open ? "open" : "closed";
    const overlayZ = zRef.current ?? DIALOG_Z_BASE;
    const panelZ = overlayZ + 10;

    const handleAnimationEnd = () => {
      if (dataState === "closed") {
        setMounted(false);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      }
    };

    return (
      <DialogPortal>
        {/* Overlay — fixed inset-0, z-index from stack manager */}
        <DialogOverlay
          dataState={dataState}
          style={{ zIndex: overlayZ }}
          onClick={bgCloseable ? handleClose : undefined}
        />

        {/* Panel — fixed centered, always 10 above its own overlay */}
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          data-state={dataState}
          onAnimationEnd={handleAnimationEnd}
          style={{ zIndex: panelZ }}
          className={cn(
            // fixed + translate-50% centering: viewport-centered regardless of scroll
            "fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]",
            // Responsive widths
            "w-full max-w-md sm:max-w-xl md:max-w-[600px] lg:max-w-[900px]",
            // Appearance
            "rounded-lg bg-card text-card-foreground p-6 shadow-lg",
            "border border-border",
            "max-h-[90vh] overflow-y-auto",
            // Animations
            "duration-200",
            "data-[state=open]:animate-in  data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2",
            "data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%]",
            className,
          )}
          {...props}
        >
          {children}

          {closable && (
            <button
              type="button"
              onClick={handleClose}
              data-state={dataState}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-brand-red focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-card data-[state=open]:text-brand-red"
            >
              <X className="h-5 w-5 text-muted-foreground hover:text-brand-red transition-all duration-700" />
              <span className="sr-only">Close</span>
            </button>
          )}
        </div>
      </DialogPortal>
    );
  },
);
DialogContent.displayName = "DialogContent";

// ---------------------------------------------------------------------------
// DialogHeader
// ---------------------------------------------------------------------------

/**
 * `DialogHeader` — Layout wrapper for the dialog title and description.
 *
 * ```jsx
 * <DialogHeader>
 *   <DialogTitle>Confirm Delete</DialogTitle>
 *   <DialogDescription>This action cannot be undone.</DialogDescription>
 * </DialogHeader>
 * ```
 *
 * @param {Object} props
 * @param {string} [props.className]        - Additional Tailwind classes.
 * @param {React.ReactNode} props.children  - Typically `DialogTitle` and `DialogDescription`.
 */
const DialogHeader = ({ className, ...props }) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      "pr-6 pt-6 text-lg md:text-xl font-semibold text-card-foreground",
      className,
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

// ---------------------------------------------------------------------------
// DialogFooter
// ---------------------------------------------------------------------------

/**
 * `DialogFooter` — Layout wrapper for dialog action buttons.
 *
 * ```jsx
 * <DialogFooter>
 *   <DialogClose asChild>
 *     <button className="btn-ghost">Cancel</button>
 *   </DialogClose>
 *   <button className="btn-primary" onClick={handleConfirm}>Confirm</button>
 * </DialogFooter>
 * ```
 *
 * @param {Object} props
 * @param {string} [props.className]        - Additional Tailwind classes.
 * @param {React.ReactNode} props.children  - Action buttons or other footer content.
 */
const DialogFooter = ({ className, ...props }) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      "px-6 pb-6",
      className,
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

// ---------------------------------------------------------------------------
// DialogTitle
// ---------------------------------------------------------------------------

/**
 * `DialogTitle` — The primary heading of the dialog.
 *
 * Always include a title — screen readers announce it when the dialog opens.
 *
 * ```jsx
 * <DialogTitle>Delete Account</DialogTitle>
 * <DialogTitle className="text-brand-red">Warning</DialogTitle>
 * ```
 *
 * @param {Object} props
 * @param {string} [props.className]        - Additional Tailwind classes.
 * @param {React.ReactNode} props.children  - Title text.
 */
const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-none text-start tracking-tight text-card-foreground",
      className,
    )}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

// ---------------------------------------------------------------------------
// DialogDescription
// ---------------------------------------------------------------------------

/**
 * `DialogDescription` — Supporting description text beneath the dialog title.
 *
 * ```jsx
 * <DialogHeader>
 *   <DialogTitle>Remove Vendor</DialogTitle>
 *   <DialogDescription>
 *     This will permanently remove the vendor and all associated listings.
 *   </DialogDescription>
 * </DialogHeader>
 * ```
 *
 * @param {Object} props
 * @param {string} [props.className]        - Additional Tailwind classes.
 * @param {React.ReactNode} props.children  - Description text.
 */
const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = "DialogDescription";

// ---------------------------------------------------------------------------
// useDialogDisclosure
// ---------------------------------------------------------------------------

/**
 * `useDialogDisclosure` — Control hook for managing dialog open/close state externally.
 *
 * Pairs with `<Dialog open={isOpen} onOpenChange={setIsOpen}>` for controlled usage.
 * Use when you need to open/close programmatically — from a form handler, async
 * operation, parent component, or a button placed outside the dialog tree.
 *
 * @param {boolean} [defaultOpen=false] - Initial open state.
 * @returns {{ isOpen: boolean, onOpen: function, onClose: function, onToggle: function, setIsOpen: function }}
 *
 * ---
 *
 * ### Basic
 * ```jsx
 * const { isOpen, onOpen, onClose, setIsOpen } = useDialogDisclosure();
 *
 * <button onClick={onOpen}>Open</button>
 *
 * <Dialog open={isOpen} onOpenChange={setIsOpen}>
 *   <DialogContent onClose={onClose}>
 *     <DialogTitle>Title</DialogTitle>
 *     <DialogFooter>
 *       <button onClick={onClose}>Close</button>
 *     </DialogFooter>
 *   </DialogContent>
 * </Dialog>
 * ```
 *
 * ### Open after async action
 * ```jsx
 * const { isOpen, onOpen, onClose, setIsOpen } = useDialogDisclosure();
 *
 * const handleDelete = async () => {
 *   await deleteVendor(id);
 *   onOpen(); // show result dialog after operation
 * };
 * ```
 *
 * ### Two stacked dialogs — each with its own disclosure, correct order guaranteed
 * ```jsx
 * const first  = useDialogDisclosure();
 * const second = useDialogDisclosure();
 *
 * // First dialog
 * <Dialog open={first.isOpen} onOpenChange={first.setIsOpen}>
 *   <DialogContent onClose={first.onClose}>
 *     <DialogTitle>First</DialogTitle>
 *     <button onClick={second.onOpen}>Open Second</button>
 *   </DialogContent>
 * </Dialog>
 *
 * // Second dialog — automatically layers above the first
 * <Dialog open={second.isOpen} onOpenChange={second.setIsOpen}>
 *   <DialogContent onClose={second.onClose}>
 *     <DialogTitle>Second — always on top</DialogTitle>
 *   </DialogContent>
 * </Dialog>
 * ```
 */
const useDialogDisclosure = (defaultOpen = false) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);
  const onToggle = () => setIsOpen((prev) => !prev);
  return { isOpen, onOpen, onClose, onToggle, setIsOpen };
};

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  useDialogDisclosure,
};
