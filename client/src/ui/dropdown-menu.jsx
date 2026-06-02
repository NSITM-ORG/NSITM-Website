// src/components/ui/dropdown-menu.jsx
import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Circle,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./button";

// ---------------------------------------------------------------------------
// Context (internal)
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} DropdownMenuContextValue
 * @property {boolean} open             - Whether the dropdown is currently open.
 * @property {function(boolean): void} setOpen - Setter to open or close the dropdown.
 */

/** @type {React.Context<DropdownMenuContextValue>} */
const DropdownMenuContext = createContext(null);

// ---------------------------------------------------------------------------
// DropdownMenu
// ---------------------------------------------------------------------------

/**
 * `DropdownMenu` — Root container for the dropdown system.
 *
 * Manages open/closed state at the root level and exposes it via context to all
 * child components. Supports **uncontrolled** (self-managed), **controlled**
 * (disclosure-driven), and **defaultOpen** usage patterns.
 *
 * Click-outside is handled by a `mousedown` listener attached at mount time,
 * so consumers do not need to wire this up themselves.
 *
 * ---
 *
 * ### Uncontrolled — self-managed (most common)
 * ```jsx
 * <DropdownMenu>
 *   <DropdownMenuTrigger>Options</DropdownMenuTrigger>
 *   <DropdownMenuContent>
 *     <DropdownMenuItem>Edit</DropdownMenuItem>
 *     <DropdownMenuItem>Delete</DropdownMenuItem>
 *   </DropdownMenuContent>
 * </DropdownMenu>
 * ```
 *
 * ### Uncontrolled — open by default
 * ```jsx
 * <DropdownMenu defaultOpen>
 *   <DropdownMenuTrigger>Options</DropdownMenuTrigger>
 *   <DropdownMenuContent>...</DropdownMenuContent>
 * </DropdownMenu>
 * ```
 *
 * ### Controlled — with `useDropdownDisclosure`
 * ```jsx
 * const { isOpen, onOpen, onClose, setIsOpen } = useDropdownDisclosure();
 *
 * <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
 *   <DropdownMenuTrigger>Options</DropdownMenuTrigger>
 *   <DropdownMenuContent>...</DropdownMenuContent>
 * </DropdownMenu>
 * ```
 *
 * @param {Object}   props
 * @param {React.ReactNode} props.children                  - Dropdown sub-components.
 * @param {boolean}  [props.defaultOpen=false]              - Initial open state for uncontrolled mode.
 * @param {boolean}  [props.open]                           - Controlled open state. Omit for uncontrolled mode.
 * @param {function(boolean): void} [props.onOpenChange]    - Called when open state should change (controlled mode).
 */
const DropdownMenu = ({
  children,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
}) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const containerRef = useRef(null);

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

  // Click-outside: unified handler at the root level (replaces v1's per-trigger listener)
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setOpen]);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div ref={containerRef} className="relative inline-block text-left">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
};
DropdownMenu.displayName = "DropdownMenu";

// ---------------------------------------------------------------------------
// DropdownMenuTrigger
// ---------------------------------------------------------------------------

/**
 * `DropdownMenuTrigger` — The element that toggles the dropdown open/closed.
 *
 * Supports two rendering modes controlled by the `asButton` prop:
 *
 * - **`asButton={false}` (default)** — Renders a plain bordered `<button>` matching
 *   the original `dropdown-menu.jsx` (v1) style. Use this for all existing v1 consumers.
 * - **`asButton={true}`** — Renders using the shared `<Button>` component with `variant`,
 *   `size`, and an optional animated chevron arrow. Use this for all existing
 *   `dropdown-menu-two.jsx` (v2) consumers.
 *
 * Both modes read open/close state from `DropdownMenuContext` — no local state needed.
 *
 * ---
 *
 * ### Plain button (v1 style — default)
 * ```jsx
 * <DropdownMenuTrigger>
 *   My Account
 * </DropdownMenuTrigger>
 * ```
 *
 * ### With custom class on plain button
 * ```jsx
 * <DropdownMenuTrigger className="text-brand-red border-brand-red">
 *   Settings
 * </DropdownMenuTrigger>
 * ```
 *
 * ### Button component style (v2 style)
 * ```jsx
 * <DropdownMenuTrigger asButton size="sm" arrow>
 *   Filters
 * </DropdownMenuTrigger>
 *
 * // No arrow
 * <DropdownMenuTrigger asButton arrow={false}>
 *   Sort by
 * </DropdownMenuTrigger>
 * ```
 *
 * @param {Object}   props
 * @param {React.ReactNode} props.children      - Trigger label or content.
 * @param {string}   [props.className]          - Additional Tailwind classes.
 * @param {boolean}  [props.asButton=false]     - Render with the shared Button component (v2 style).
 * @param {string}   [props.variant="ghost"]    - Button variant (only when asButton=true).
 * @param {string}   [props.size="default"]     - Button size (only when asButton=true).
 * @param {boolean}  [props.arrow=true]         - Show animated chevron arrow (only when asButton=true).
 */
const DropdownMenuTrigger = ({
  children,
  className,
  asButton = false,
  variant = "ghost",
  size = "default",
  arrow = true,
  ...props
}) => {
  const ctx = useContext(DropdownMenuContext);
  if (!ctx) {
    throw new Error("DropdownMenuTrigger must be used inside <DropdownMenu>");
  }

  const handleClick = () => ctx.setOpen(!ctx.open);

  // v2 style — Button component with optional animated chevron
  if (asButton) {
    return (
      <Button
        variant={variant}
        size={size}
        className={cn("cursor-pointer", className)}
        onClick={handleClick}
        {...props}
      >
        <div className="flex flex-row justify-center items-center">
          {children}
          {arrow && (
            <>
              {ctx.open ? (
                <ChevronUp className="ml-1 h-4 w-4 opacity-70" />
              ) : (
                <ChevronDown className="ml-1 h-4 w-4 opacity-70" />
              )}
            </>
          )}
        </div>
      </Button>
    );
  }

  // v1 style — plain bordered button (default, backwards-compatible)
  return (
    <button
      onClick={handleClick}
      className={cn(
        "px-3 py-2 rounded-md border border-border bg-background text-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

// ---------------------------------------------------------------------------
// DropdownMenuContent
// ---------------------------------------------------------------------------

/**
 * `DropdownMenuContent` — The floating panel containing dropdown items.
 *
 * Renders a fixed inset backdrop overlay (catches outside clicks) alongside the
 * positioned menu panel. Animates in/out via CSS transitions on `opacity`, `scale`,
 * and `translateY`. Supports responsive widths and scroll overflow for long lists.
 *
 * The `align` prop controls which edge of the trigger the panel anchors to.
 *
 * ---
 *
 * ```jsx
 * // Right-aligned (default)
 * <DropdownMenuContent>
 *   <DropdownMenuItem>Edit</DropdownMenuItem>
 * </DropdownMenuContent>
 *
 * // Left-aligned
 * <DropdownMenuContent align="start">
 *   <DropdownMenuItem>Edit</DropdownMenuItem>
 * </DropdownMenuContent>
 *
 * // Custom width
 * <DropdownMenuContent className="w-48">
 *   <DropdownMenuItem>Edit</DropdownMenuItem>
 * </DropdownMenuContent>
 * ```
 *
 * @param {Object}  props
 * @param {React.ReactNode} props.children       - Menu items, separators, labels, groups.
 * @param {string}  [props.className]            - Additional Tailwind classes for the panel.
 * @param {"start"|"end"} [props.align="end"]    - Anchor alignment: "start" = left edge, "end" = right edge.
 */
const DropdownMenuContent = ({ children, className, align = "end" }) => {
  const ctx = useContext(DropdownMenuContext);
  if (!ctx) {
    throw new Error("DropdownMenuContent must be used inside <DropdownMenu>");
  }

  if (!ctx.open) return null;

  return (
    <>
      {/* Backdrop — catches clicks outside the panel */}
      <div className="fixed inset-0 z-40" onClick={() => ctx.setOpen(false)} />

      {/* Floating panel */}
      <div
        className={cn(
          // Positioning
          "absolute mt-2 z-50 origin-top-right",
          align === "start" ? "left-0" : "right-0",
          // Sizing — responsive with min-w fallback for v1 consumers
          "min-w-[8rem] w-72 sm:w-80",
          // Appearance
          "rounded-md border border-border bg-popover text-popover-foreground shadow-lg",
          "ring-1 ring-border focus:outline-none",
          // Scroll
          "max-h-[70vh] overflow-y-auto",
          // Enter animation
          "transition-all duration-200 ease-out",
          ctx.open
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 -translate-y-2 pointer-events-none",
          className,
        )}
      >
        <div className="py-1 p-1">{children}</div>
      </div>
    </>
  );
};
DropdownMenuContent.displayName = "DropdownMenuContent";

// ---------------------------------------------------------------------------
// DropdownMenuItem
// ---------------------------------------------------------------------------

/**
 * `DropdownMenuItem` — A single interactive item in the dropdown list.
 *
 * Supports an `inset` prop that adds left padding to align text with items that
 * have a leading icon (e.g. checkboxes or radio indicators at the left edge).
 *
 * ```jsx
 * <DropdownMenuItem onClick={handleEdit}>Edit</DropdownMenuItem>
 *
 * // With inset (aligns text with icon-bearing sibling items)
 * <DropdownMenuItem inset>Profile</DropdownMenuItem>
 *
 * // With shortcut
 * <DropdownMenuItem>
 *   New Tab <DropdownMenuShortcut>⌘T</DropdownMenuShortcut>
 * </DropdownMenuItem>
 * ```
 *
 * @param {Object}  props
 * @param {React.ReactNode} props.children  - Item content (text, icons, shortcuts).
 * @param {boolean} [props.inset=false]     - Add extra left padding to align with icon-bearing items.
 * @param {string}  [props.className]       - Additional Tailwind classes.
 */
const DropdownMenuItem = ({ children, inset, className, ...props }) => {
  return (
    <div
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm",
        "text-popover-foreground transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        inset && "pl-8",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};
DropdownMenuItem.displayName = "DropdownMenuItem";

// ---------------------------------------------------------------------------
// DropdownMenuCheckboxItem
// ---------------------------------------------------------------------------

/**
 * `DropdownMenuCheckboxItem` — A menu item with a leading checkmark indicator.
 *
 * Renders a check icon when `checked` is true. Manages its own visual state —
 * you control `checked` from outside (treat it like a controlled checkbox).
 *
 * ```jsx
 * const [notifications, setNotifications] = useState(true);
 *
 * <DropdownMenuCheckboxItem
 *   checked={notifications}
 *   onClick={() => setNotifications(prev => !prev)}
 * >
 *   Enable Notifications
 * </DropdownMenuCheckboxItem>
 * ```
 *
 * @param {Object}  props
 * @param {React.ReactNode} props.children  - Item label.
 * @param {boolean} [props.checked=false]   - Whether the checkmark is shown.
 * @param {string}  [props.className]       - Additional Tailwind classes.
 */
const DropdownMenuCheckboxItem = ({
  children,
  checked,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm",
        "hover:bg-accent hover:text-accent-foreground",
        className,
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {checked && <Check className="h-4 w-4" />}
      </span>
      {children}
    </div>
  );
};
DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem";

// ---------------------------------------------------------------------------
// DropdownMenuRadioItem
// ---------------------------------------------------------------------------

/**
 * `DropdownMenuRadioItem` — A menu item with a leading radio indicator.
 *
 * Renders a filled circle when `selected` is true. Use multiple of these
 * inside a `DropdownMenuGroup` to form a single-select option group.
 *
 * ```jsx
 * const [sort, setSort] = useState("newest");
 *
 * {["newest", "oldest", "popular"].map((option) => (
 *   <DropdownMenuRadioItem
 *     key={option}
 *     selected={sort === option}
 *     onClick={() => setSort(option)}
 *   >
 *     {option.charAt(0).toUpperCase() + option.slice(1)}
 *   </DropdownMenuRadioItem>
 * ))}
 * ```
 *
 * @param {Object}  props
 * @param {React.ReactNode} props.children  - Item label.
 * @param {boolean} [props.selected=false]  - Whether the radio indicator is filled.
 * @param {string}  [props.className]       - Additional Tailwind classes.
 */
const DropdownMenuRadioItem = ({ children, selected, className, ...props }) => {
  return (
    <div
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm",
        "hover:bg-accent hover:text-accent-foreground",
        className,
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {selected && <Circle className="h-2 w-2 fill-current" />}
      </span>
      {children}
    </div>
  );
};
DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem";

// ---------------------------------------------------------------------------
// DropdownMenuLabel
// ---------------------------------------------------------------------------

/**
 * `DropdownMenuLabel` — A non-interactive section heading inside the dropdown.
 *
 * Use to group related items under a visible label. Supports `inset` to align
 * the label text with icon-bearing items in the same group.
 *
 * ```jsx
 * <DropdownMenuLabel>My Account</DropdownMenuLabel>
 * <DropdownMenuSeparator />
 * <DropdownMenuItem>Profile</DropdownMenuItem>
 * <DropdownMenuItem>Billing</DropdownMenuItem>
 *
 * // Inset — aligns with checkbox/radio items
 * <DropdownMenuLabel inset>Sort By</DropdownMenuLabel>
 * ```
 *
 * @param {Object}  props
 * @param {React.ReactNode} props.children  - Label text.
 * @param {boolean} [props.inset=false]     - Add left padding to align with icon-bearing items.
 * @param {string}  [props.className]       - Additional Tailwind classes.
 */
const DropdownMenuLabel = ({ children, inset, className }) => (
  <div
    className={cn(
      "px-2 py-1.5 text-sm font-semibold text-foreground",
      inset && "pl-8",
      className,
    )}
  >
    {children}
  </div>
);
DropdownMenuLabel.displayName = "DropdownMenuLabel";

// ---------------------------------------------------------------------------
// DropdownMenuSeparator
// ---------------------------------------------------------------------------

/**
 * `DropdownMenuSeparator` — A thin horizontal rule that divides menu sections.
 *
 * ```jsx
 * <DropdownMenuLabel>My Account</DropdownMenuLabel>
 * <DropdownMenuSeparator />
 * <DropdownMenuItem>Profile</DropdownMenuItem>
 * <DropdownMenuSeparator />
 * <DropdownMenuItem className="text-brand-red">Log out</DropdownMenuItem>
 * ```
 *
 * @param {Object} props
 * @param {string} [props.className] - Additional Tailwind classes.
 */
const DropdownMenuSeparator = ({ className }) => (
  <div
    className={cn("-mx-1 my-1 h-px bg-muted border-t border-border", className)}
  />
);
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

// ---------------------------------------------------------------------------
// DropdownMenuShortcut
// ---------------------------------------------------------------------------

/**
 * `DropdownMenuShortcut` — Keyboard shortcut label displayed at the right of a menu item.
 *
 * Renders muted, small-caps text auto-pushed to the far right of the item via `ml-auto`.
 * Place it as the last child inside `DropdownMenuItem`.
 *
 * ```jsx
 * <DropdownMenuItem>
 *   New Window <DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
 * </DropdownMenuItem>
 *
 * <DropdownMenuItem>
 *   Close Tab <DropdownMenuShortcut>⌘W</DropdownMenuShortcut>
 * </DropdownMenuItem>
 * ```
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children  - Shortcut text (e.g. "⌘K", "Ctrl+S").
 * @param {string} [props.className]        - Additional Tailwind classes.
 */
const DropdownMenuShortcut = ({ children, className }) => (
  <span className={cn("ml-auto text-xs tracking-widest opacity-60", className)}>
    {children}
  </span>
);
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

// ---------------------------------------------------------------------------
// DropdownMenuGroup
// ---------------------------------------------------------------------------

/**
 * `DropdownMenuGroup` — A logical grouping wrapper for related menu items.
 *
 * Adds vertical padding around a cluster of items. Combine with
 * `DropdownMenuLabel` and `DropdownMenuSeparator` for clearly structured menus.
 *
 * ```jsx
 * <DropdownMenuGroup>
 *   <DropdownMenuLabel>Preferences</DropdownMenuLabel>
 *   <DropdownMenuCheckboxItem checked={darkMode} onClick={toggleDark}>
 *     Dark Mode
 *   </DropdownMenuCheckboxItem>
 *   <DropdownMenuCheckboxItem checked={notifications} onClick={toggleNotifs}>
 *     Notifications
 *   </DropdownMenuCheckboxItem>
 * </DropdownMenuGroup>
 * ```
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children  - Menu items, labels, separators.
 * @param {string} [props.className]        - Additional Tailwind classes.
 */
const DropdownMenuGroup = ({ children, className }) => (
  <div className={cn("py-1", className)}>{children}</div>
);
DropdownMenuGroup.displayName = "DropdownMenuGroup";

// ---------------------------------------------------------------------------
// useDropdownDisclosure
// ---------------------------------------------------------------------------

/**
 * `useDropdownDisclosure` — Control hook for managing dropdown open/close state externally.
 *
 * Pairs with `<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>` for programmatic control.
 * Use when you need to open/close the dropdown from outside its own tree — e.g. after a
 * form submission, from a keyboard shortcut handler, or to sync with other UI state.
 *
 * @param {boolean} [defaultOpen=false] - Initial open state.
 * @returns {{ isOpen: boolean, onOpen: function, onClose: function, onToggle: function, setIsOpen: function }}
 *
 * ---
 *
 * ### Open after an action
 * ```jsx
 * const { isOpen, onOpen, onClose, setIsOpen } = useDropdownDisclosure();
 *
 * <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
 *   <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
 *   <DropdownMenuContent>
 *     <DropdownMenuItem onClick={onClose}>Edit</DropdownMenuItem>
 *     <DropdownMenuItem onClick={onClose}>Delete</DropdownMenuItem>
 *   </DropdownMenuContent>
 * </DropdownMenu>
 * ```
 *
 * ### Close after selecting an item
 * ```jsx
 * const { isOpen, onClose, setIsOpen } = useDropdownDisclosure();
 *
 * const handleSelect = (value) => {
 *   setSelectedSort(value);
 *   onClose(); // close immediately after selection
 * };
 *
 * <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
 *   <DropdownMenuTrigger asButton arrow>Sort</DropdownMenuTrigger>
 *   <DropdownMenuContent>
 *     {["Newest", "Oldest", "Popular"].map((opt) => (
 *       <DropdownMenuRadioItem
 *         key={opt}
 *         selected={selectedSort === opt}
 *         onClick={() => handleSelect(opt)}
 *       >
 *         {opt}
 *       </DropdownMenuRadioItem>
 *     ))}
 *   </DropdownMenuContent>
 * </DropdownMenu>
 * ```
 */
const useDropdownDisclosure = (defaultOpen = false) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);
  const onToggle = () => setIsOpen((prev) => !prev);
  return { isOpen, onOpen, onClose, onToggle, setIsOpen };
};

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  useDropdownDisclosure,
};
