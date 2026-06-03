/**
 * @file Menu.jsx
 * Fully-featured dropdown and context-menu system.
 *
 * Portal-rendered, keyboard-navigable, ARIA-correct, with sub-menus,
 * checkbox items, radio groups, and full CSS-variable theming.
 * Light mode by default; dark mode via the nearest .dark ancestor.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * EXPORTS
 * ─────────────────────────────────────────────────────────────────────────────
 *   Menu               Root / state manager
 *   MenuTrigger        Toggle element (supports asChild, "click" and "context" modes)
 *   MenuContent        Portal-rendered positioned panel (role="menu")
 *   MenuItem           Basic action row (icon, danger, disabled, closeOnSelect)
 *   MenuLabel          Non-interactive section label
 *   MenuSeparator      Horizontal divider
 *   MenuGroup          Logical group wrapper (no visual effect — semantic only)
 *   MenuCheckboxItem   Checkable item (checked, onCheckedChange)
 *   MenuRadioGroup     Wraps MenuRadioItems; manages selected value
 *   MenuRadioItem      Single radio option inside MenuRadioGroup
 *   MenuSub            Sub-menu root
 *   MenuSubTrigger     MenuItem that opens a nested MenuSubContent on hover / →
 *   MenuSubContent     Portal-rendered sub-menu panel
 *   useMenuDisclosure  Programmatic open/close hook
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * PLACEMENT VALUES  (for MenuContent)
 *   bottom-start (default) | bottom | bottom-end
 *   top-start | top | top-end
 *   left-start | right-start | etc.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * USAGE
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *   // Basic dropdown
 *   <Menu>
 *     <MenuTrigger asChild>
 *       <Button>Actions ▾</Button>
 *     </MenuTrigger>
 *     <MenuContent>
 *       <MenuItem icon={<EditIcon />} onClick={handleEdit}>Edit</MenuItem>
 *       <MenuItem icon={<CopyIcon />} onClick={handleDuplicate}>Duplicate</MenuItem>
 *       <MenuSeparator />
 *       <MenuItem danger icon={<TrashIcon />} onClick={handleDelete}>Delete</MenuItem>
 *     </MenuContent>
 *   </Menu>
 *
 *   // Right-click context menu
 *   <Menu mode="context">
 *     <MenuTrigger asChild>
 *       <div className="canvas">Right-click anywhere</div>
 *     </MenuTrigger>
 *     <MenuContent>
 *       <MenuItem>Paste</MenuItem>
 *       <MenuItem>Select all</MenuItem>
 *     </MenuContent>
 *   </Menu>
 *
 *   // With sub-menu
 *   <Menu>
 *     <MenuTrigger>Options</MenuTrigger>
 *     <MenuContent>
 *       <MenuItem>Profile</MenuItem>
 *       <MenuSub>
 *         <MenuSubTrigger>More</MenuSubTrigger>
 *         <MenuSubContent>
 *           <MenuItem>Settings</MenuItem>
 *           <MenuItem>Help</MenuItem>
 *         </MenuSubContent>
 *       </MenuSub>
 *     </MenuContent>
 *   </Menu>
 *
 *   // Checkbox items
 *   <Menu>
 *     <MenuTrigger>View</MenuTrigger>
 *     <MenuContent>
 *       <MenuLabel>Panels</MenuLabel>
 *       <MenuCheckboxItem checked={showGrid} onCheckedChange={setShowGrid}>
 *         Grid
 *       </MenuCheckboxItem>
 *       <MenuCheckboxItem checked={showRuler} onCheckedChange={setShowRuler}>
 *         Ruler
 *       </MenuCheckboxItem>
 *     </MenuContent>
 *   </Menu>
 *
 *   // Radio group
 *   <Menu>
 *     <MenuTrigger>Sort by</MenuTrigger>
 *     <MenuContent>
 *       <MenuRadioGroup value={sort} onValueChange={setSort}>
 *         <MenuRadioItem value="name">Name</MenuRadioItem>
 *         <MenuRadioItem value="date">Date</MenuRadioItem>
 *         <MenuRadioItem value="size">Size</MenuRadioItem>
 *       </MenuRadioGroup>
 *     </MenuContent>
 *   </Menu>
 *
 *   // Controlled
 *   const menu = useMenuDisclosure();
 *   <Menu open={menu.isOpen} onOpenChange={menu.setIsOpen}>...</Menu>
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * KEYBOARD NAVIGATION
 * ─────────────────────────────────────────────────────────────────────────────
 *   ↓ / ↑     — Move between items
 *   Home / End — Jump to first / last item
 *   Enter / Space — Activate focused item
 *   Escape    — Close menu (restores focus to trigger)
 *   →         — Open focused sub-menu
 *   ←         — Close current sub-menu, return to parent
 */

import * as React from "react";
import { createPortal } from "react-dom";

const cn = (...classes) => classes.filter(Boolean).join(" ");

// ─── Shared positioning engine ────────────────────────────────────────────────
const PLACEMENTS = {
  "bottom":        (t, p, o) => ({ top: t.bottom + o,           left: t.left + t.width  / 2 - p.width / 2 }),
  "bottom-start":  (t, p, o) => ({ top: t.bottom + o,           left: t.left }),
  "bottom-end":    (t, p, o) => ({ top: t.bottom + o,           left: t.right - p.width }),
  "top":           (t, p, o) => ({ top: t.top  - p.height - o,  left: t.left + t.width  / 2 - p.width / 2 }),
  "top-start":     (t, p, o) => ({ top: t.top  - p.height - o,  left: t.left }),
  "top-end":       (t, p, o) => ({ top: t.top  - p.height - o,  left: t.right - p.width }),
  "right-start":   (t, p, o) => ({ top: t.top,                  left: t.right + o }),
  "right":         (t, p, o) => ({ top: t.top  + t.height / 2 - p.height / 2, left: t.right + o }),
  "left-start":    (t, p, o) => ({ top: t.top,                  left: t.left - p.width - o }),
  "left":          (t, p, o) => ({ top: t.top  + t.height / 2 - p.height / 2, left: t.left - p.width - o }),
};

function clampToViewport({ top, left }, rect, pad = 6) {
  return {
    top:  Math.max(pad, Math.min(top,  window.innerHeight - rect.height - pad)),
    left: Math.max(pad, Math.min(left, window.innerWidth  - rect.width  - pad)),
  };
}

// ─── Internal portal renderer (shared by MenuContent + MenuSubContent) ────────
function MenuPortal({
  open, close, anchorRef, placement, offset, outsideRef,
  children, className, style, onKeyDown, role = "menu", id,
}) {
  const panelRef              = React.useRef(null);
  const [pos, setPos]         = React.useState({ top: -9999, left: -9999 });
  const [ready, setReady]     = React.useState(false);

  const reposition = React.useCallback(() => {
    if (!anchorRef?.current || !panelRef.current) return;
    const t  = anchorRef.current.getBoundingClientRect();
    const p  = panelRef.current.getBoundingClientRect();
    const fn = PLACEMENTS[placement] ?? PLACEMENTS["bottom-start"];
    setPos(clampToViewport(fn(t, p, offset), p));
    setReady(true);
  }, [anchorRef, placement, offset]);

  React.useEffect(() => {
    if (!open) { setReady(false); return; }
    const r = requestAnimationFrame(reposition);
    return () => cancelAnimationFrame(r);
  }, [open, reposition]);

  // Auto-focus first item on open
  React.useEffect(() => {
    if (!open || !ready || !panelRef.current) return;
    const first = panelRef.current.querySelector('[data-menu-item]:not([data-disabled="true"])');
    first?.focus();
  }, [open, ready]);

  React.useEffect(() => {
    if (!open) return;
    const onOutside = (e) => {
      if (panelRef.current?.contains(e.target)) return;
      if (outsideRef?.current?.contains(e.target)) return;
      close();
    };
    const onScroll = () => reposition();
    const onResize = () => reposition();
    document.addEventListener("mousedown", onOutside);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("mousedown", onOutside);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [open, close, reposition, outsideRef]);

  if (!open) return null;

  return createPortal(
    <div
      ref={panelRef}
      id={id}
      role={role}
      tabIndex={-1}
      onKeyDown={onKeyDown}
      style={{
        position:   "fixed",
        top:        pos.top,
        left:       pos.left,
        zIndex:     99990,
        opacity:    ready ? 1 : 0,
        transform:  ready ? "scale(1) translateY(0)" : "scale(0.95) translateY(-4px)",
        transition: "opacity 0.12s ease, transform 0.12s ease",
        outline:    "none",
        ...style,
      }}
      className={cn(
        "min-w-[10rem] overflow-hidden rounded-xl border border-border",
        "bg-popover text-popover-foreground shadow-lg py-1",
        className,
      )}
    >
      {children}
    </div>,
    document.body,
  );
}

// ─── Contexts ─────────────────────────────────────────────────────────────────
const MenuCtx = React.createContext({
  open:         false,
  setOpen:      () => {},
  close:        () => {},
  triggerRef:   { current: null },
  mousePos:     { current: null },
  mode:         "click",
  closeOnSelect: true,
  placement:    "bottom-start",
  offset:       4,
});

const MenuSubCtx = React.createContext({
  subOpen:      false,
  setSubOpen:   () => {},
  subClose:     () => {},
  subTriggerRef:{ current: null },
  parentClose:  () => {},
});

const MenuRadioCtx = React.createContext({
  value:         null,
  onValueChange: () => {},
});

// ─── Keyboard navigation helpers ──────────────────────────────────────────────
const ITEM_QUERY = '[data-menu-item]:not([data-disabled="true"])';

function navDown(el)  { const items = [...(el?.querySelectorAll(ITEM_QUERY) ?? [])]; const i = items.indexOf(document.activeElement); items[(i + 1) % items.length]?.focus(); }
function navUp(el)    { const items = [...(el?.querySelectorAll(ITEM_QUERY) ?? [])]; const i = items.indexOf(document.activeElement); items[(i - 1 + items.length) % items.length]?.focus(); }
function navFirst(el) { el?.querySelector(ITEM_QUERY)?.focus(); }
function navLast(el)  { const items = [...(el?.querySelectorAll(ITEM_QUERY) ?? [])]; items[items.length - 1]?.focus(); }

// ─── Menu ─────────────────────────────────────────────────────────────────────
/**
 * Root component. Manages state and distributes it to all child components.
 *
 * @param {ReactNode}          props.children
 * @param {"click"|"context"}  [props.mode="click"]        "context" enables right-click trigger
 * @param {boolean}            [props.open]                Controlled open state
 * @param {function}           [props.onOpenChange]        Called with new boolean
 * @param {boolean}            [props.closeOnSelect=true]  Auto-close when an item is clicked
 * @param {string}             [props.placement]           Default MenuContent placement
 * @param {number}             [props.offset]              Default gap in px (default 4)
 */
export function Menu({
  children,
  mode         = "click",
  open:          controlledOpen,
  onOpenChange,
  closeOnSelect  = true,
  placement      = "bottom-start",
  offset         = 4,
}) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const setOpen = React.useCallback((val) => {
    if (controlledOpen === undefined) setInternalOpen(val);
    onOpenChange?.(val);
  }, [controlledOpen, onOpenChange]);

  const close      = React.useCallback(() => setOpen(false), [setOpen]);
  const triggerRef = React.useRef(null);
  const mousePos   = React.useRef(null); // used in context-menu mode

  const ctx = React.useMemo(() => ({
    open, setOpen, close, triggerRef, mousePos,
    mode, closeOnSelect, placement, offset,
  }), [open, setOpen, close, mode, closeOnSelect, placement, offset]);

  return <MenuCtx.Provider value={ctx}>{children}</MenuCtx.Provider>;
}
Menu.displayName = "Menu";

// ─── MenuTrigger ──────────────────────────────────────────────────────────────
/**
 * The element that opens the menu.
 *
 * In "click" mode (default), clicking opens/closes the menu.
 * In "context" mode, right-clicking opens the menu at the cursor position.
 *
 * @param {boolean} [props.asChild=false]
 *
 * @example
 *   // Context menu on a canvas element
 *   <Menu mode="context">
 *     <MenuTrigger asChild>
 *       <div className="w-full h-64 bg-muted rounded-xl">Canvas</div>
 *     </MenuTrigger>
 *     ...
 *   </Menu>
 */
export const MenuTrigger = React.forwardRef(function MenuTrigger(
  { children, asChild = false, className, ...rest },
  ref,
) {
  const { open, setOpen, triggerRef, mousePos, mode } = React.useContext(MenuCtx);

  const mergedRef = React.useCallback((node) => {
    triggerRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  }, [triggerRef, ref]);

  const clickHandler = { onClick: (e) => { rest.onClick?.(e); setOpen(!open); } };
  const contextHandler = {
    onContextMenu: (e) => {
      e.preventDefault();
      rest.onContextMenu?.(e);
      mousePos.current = { x: e.clientX, y: e.clientY };
      setOpen(true);
    },
  };

  const handlers = mode === "context" ? contextHandler : clickHandler;

  if (asChild) {
    const child = React.Children.only(children);
    const childHandlers = mode === "context"
      ? { onContextMenu: (e) => { e.preventDefault(); child.props.onContextMenu?.(e); mousePos.current = { x: e.clientX, y: e.clientY }; setOpen(true); } }
      : { onClick: (e) => { child.props.onClick?.(e); setOpen(!open); } };
    return React.cloneElement(child, { ...childHandlers, ref: mergedRef });
  }

  return (
    <button type="button" ref={mergedRef} className={cn(className)} {...rest} {...handlers}>
      {children}
    </button>
  );
});
MenuTrigger.displayName = "MenuTrigger";

// ─── MenuContent ──────────────────────────────────────────────────────────────
/**
 * The dropdown panel. Positioned relative to MenuTrigger (click mode)
 * or at the cursor position (context mode).
 *
 * @param {string} [props.placement] Override root placement
 * @param {number} [props.sideOffset] Override root offset
 * @param {string} [props.className]
 */
export const MenuContent = React.forwardRef(function MenuContent(
  { children, className, placement: placementProp, sideOffset, ...rest },
  _ref,
) {
  const {
    open, close, triggerRef, mousePos, mode,
    placement: ctxPlacement, offset: ctxOffset,
  } = React.useContext(MenuCtx);

  const resolvedPlacement = placementProp ?? ctxPlacement;
  const resolvedOffset    = sideOffset    ?? ctxOffset;

  // Context menu: use a virtual rect at cursor position instead of triggerRef
  const contextAnchorRef = React.useRef(null);
  React.useEffect(() => {
    if (mode === "context" && mousePos.current && open) {
      const { x, y } = mousePos.current;
      contextAnchorRef.current = {
        getBoundingClientRect: () => ({ top: y, bottom: y, left: x, right: x, width: 0, height: 0 }),
      };
    }
  }, [open, mode, mousePos]);

  const anchorRef = mode === "context" ? contextAnchorRef : triggerRef;

  const handleKeyDown = React.useCallback((e) => {
    const el = e.currentTarget;
    switch (e.key) {
      case "ArrowDown": e.preventDefault(); navDown(el);  break;
      case "ArrowUp":   e.preventDefault(); navUp(el);    break;
      case "Home":      e.preventDefault(); navFirst(el); break;
      case "End":       e.preventDefault(); navLast(el);  break;
      case "Escape":
        e.preventDefault();
        close();
        triggerRef.current?.focus();
        break;
    }
  }, [close, triggerRef]);

  return (
    <MenuPortal
      open={open}
      close={close}
      anchorRef={anchorRef}
      outsideRef={triggerRef}
      placement={resolvedPlacement}
      offset={resolvedOffset}
      onKeyDown={handleKeyDown}
      className={className}
      {...rest}
    >
      {children}
    </MenuPortal>
  );
});
MenuContent.displayName = "MenuContent";

// ─── MenuItem ─────────────────────────────────────────────────────────────────
/**
 * A standard action row.
 *
 * @param {ReactNode}  [props.icon]           Leading icon element
 * @param {ReactNode}  [props.shortcut]       Keyboard shortcut hint (right-aligned)
 * @param {boolean}    [props.danger=false]   Destructive red styling
 * @param {boolean}    [props.disabled=false]
 * @param {boolean}    [props.closeOnSelect]  Override root closeOnSelect for this item
 * @param {function}   [props.onClick]
 *
 * @example
 *   <MenuItem icon={<Share2 className="w-4 h-4" />} shortcut="⌘S" onClick={handleShare}>
 *     Share
 *   </MenuItem>
 */
export function MenuItem({
  children,
  onClick,
  className,
  icon,
  shortcut,
  danger       = false,
  disabled     = false,
  closeOnSelect: localCloseOnSelect,
  ...rest
}) {
  const { close, closeOnSelect: ctxCloseOnSelect } = React.useContext(MenuCtx);
  const shouldClose = localCloseOnSelect ?? ctxCloseOnSelect;

  const handleClick = (e) => {
    if (disabled) return;
    onClick?.(e);
    if (shouldClose) close();
  };

  return (
    <button
      type="button"
      role="menuitem"
      tabIndex={-1}
      data-menu-item=""
      data-disabled={disabled || undefined}
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        "w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left select-none",
        "transition-colors duration-100 outline-none",
        danger
          ? "text-destructive hover:bg-destructive/10 focus:bg-destructive/10 dark:hover:bg-destructive/20 dark:focus:bg-destructive/20"
          : "text-foreground hover:bg-muted focus:bg-muted",
        disabled && "opacity-40 cursor-not-allowed pointer-events-none",
        className,
      )}
      {...rest}
    >
      {icon && <span className="shrink-0 w-4 h-4 opacity-70 flex items-center">{icon}</span>}
      <span className="flex-1">{children}</span>
      {shortcut && <span className="ml-auto text-xs text-muted-foreground">{shortcut}</span>}
    </button>
  );
}
MenuItem.displayName = "MenuItem";

// ─── MenuLabel ────────────────────────────────────────────────────────────────
/**
 * Non-interactive section label.
 *
 * @example
 *   <MenuLabel>Account</MenuLabel>
 *   <MenuItem>Profile</MenuItem>
 *   <MenuItem>Settings</MenuItem>
 */
export function MenuLabel({ children, className, ...rest }) {
  return (
    <div
      className={cn("px-3 py-1.5 text-xs font-medium text-muted-foreground select-none", className)}
      {...rest}
    >
      {children}
    </div>
  );
}
MenuLabel.displayName = "MenuLabel";

// ─── MenuSeparator ────────────────────────────────────────────────────────────
/** Thin horizontal rule between menu sections. */
export function MenuSeparator({ className, ...rest }) {
  return (
    <div
      role="separator"
      className={cn("my-1 border-t border-border", className)}
      {...rest}
    />
  );
}
MenuSeparator.displayName = "MenuSeparator";

// ─── MenuGroup ────────────────────────────────────────────────────────────────
/** Semantic grouping wrapper with no visual output. Use MenuLabel for a group header. */
export function MenuGroup({ children, ...rest }) {
  return <div role="group" {...rest}>{children}</div>;
}
MenuGroup.displayName = "MenuGroup";

// ─── MenuCheckboxItem ─────────────────────────────────────────────────────────
/**
 * A checkable menu item that shows a tick when selected.
 *
 * @param {boolean}  props.checked
 * @param {function} props.onCheckedChange  Called with new boolean value
 * @param {boolean}  [props.disabled=false]
 *
 * @example
 *   <MenuCheckboxItem checked={autoSave} onCheckedChange={setAutoSave}>
 *     Auto-save
 *   </MenuCheckboxItem>
 */
export function MenuCheckboxItem({
  children,
  checked,
  onCheckedChange,
  disabled   = false,
  className,
  closeOnSelect: localCloseOnSelect,
  ...rest
}) {
  const { close, closeOnSelect: ctxCloseOnSelect } = React.useContext(MenuCtx);
  const shouldClose = localCloseOnSelect ?? false; // checkboxes usually don't close menu

  const handleClick = () => {
    if (disabled) return;
    onCheckedChange?.(!checked);
    if (shouldClose) close();
  };

  return (
    <button
      type="button"
      role="menuitemcheckbox"
      aria-checked={checked}
      tabIndex={-1}
      data-menu-item=""
      data-disabled={disabled || undefined}
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left select-none",
        "transition-colors duration-100 outline-none",
        "text-foreground hover:bg-muted focus:bg-muted",
        disabled && "opacity-40 cursor-not-allowed pointer-events-none",
        className,
      )}
      {...rest}
    >
      {/* Checkmark indicator */}
      <span className="flex items-center justify-center w-4 h-4 shrink-0">
        {checked && (
          <svg viewBox="0 0 12 12" fill="none" className="w-3.5 h-3.5 text-foreground">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      {children}
    </button>
  );
}
MenuCheckboxItem.displayName = "MenuCheckboxItem";

// ─── MenuRadioGroup ───────────────────────────────────────────────────────────
/**
 * Container for radio-style selection within a menu.
 *
 * @param {string}   props.value           Currently selected value
 * @param {function} props.onValueChange   Called with the new selected value
 *
 * @example
 *   <MenuRadioGroup value={density} onValueChange={setDensity}>
 *     <MenuRadioItem value="compact">Compact</MenuRadioItem>
 *     <MenuRadioItem value="default">Default</MenuRadioItem>
 *     <MenuRadioItem value="comfortable">Comfortable</MenuRadioItem>
 *   </MenuRadioGroup>
 */
export function MenuRadioGroup({ children, value, onValueChange, ...rest }) {
  const ctx = React.useMemo(() => ({ value, onValueChange }), [value, onValueChange]);
  return (
    <MenuRadioCtx.Provider value={ctx}>
      <div role="group" {...rest}>{children}</div>
    </MenuRadioCtx.Provider>
  );
}
MenuRadioGroup.displayName = "MenuRadioGroup";

// ─── MenuRadioItem ────────────────────────────────────────────────────────────
/** Single radio option. Must be inside a MenuRadioGroup. */
export function MenuRadioItem({
  children,
  value,
  disabled   = false,
  className,
  ...rest
}) {
  const { value: groupValue, onValueChange } = React.useContext(MenuRadioCtx);
  const { close, closeOnSelect } = React.useContext(MenuCtx);
  const checked = groupValue === value;

  const handleClick = () => {
    if (disabled) return;
    onValueChange?.(value);
    if (closeOnSelect) close();
  };

  return (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={checked}
      tabIndex={-1}
      data-menu-item=""
      data-disabled={disabled || undefined}
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left select-none",
        "transition-colors duration-100 outline-none",
        "text-foreground hover:bg-muted focus:bg-muted",
        disabled && "opacity-40 cursor-not-allowed pointer-events-none",
        className,
      )}
      {...rest}
    >
      <span className="flex items-center justify-center w-4 h-4 shrink-0">
        {checked && (
          <span className="w-2 h-2 rounded-full bg-foreground block" />
        )}
      </span>
      {children}
    </button>
  );
}
MenuRadioItem.displayName = "MenuRadioItem";

// ─── MenuSub ──────────────────────────────────────────────────────────────────
/**
 * Root of a nested sub-menu. Place MenuSubTrigger and MenuSubContent inside.
 *
 * @example
 *   <MenuSub>
 *     <MenuSubTrigger>Language</MenuSubTrigger>
 *     <MenuSubContent>
 *       <MenuItem>English</MenuItem>
 *       <MenuItem>French</MenuItem>
 *     </MenuSubContent>
 *   </MenuSub>
 */
export function MenuSub({ children }) {
  const { close: parentClose } = React.useContext(MenuCtx);
  const [subOpen, setSubOpen]  = React.useState(false);
  const subTriggerRef          = React.useRef(null);
  const leaveTimer             = React.useRef(null);

  const subClose = React.useCallback(() => setSubOpen(false), []);

  const ctx = React.useMemo(() => ({
    subOpen, setSubOpen, subClose, subTriggerRef, parentClose, leaveTimer,
  }), [subOpen, subClose, parentClose]);

  return <MenuSubCtx.Provider value={ctx}>{children}</MenuSubCtx.Provider>;
}
MenuSub.displayName = "MenuSub";

// ─── MenuSubTrigger ───────────────────────────────────────────────────────────
/**
 * A MenuItem that opens the sibling MenuSubContent on hover or → key.
 * Shows a › chevron automatically.
 *
 * @param {boolean} [props.disabled=false]
 */
export function MenuSubTrigger({ children, className, disabled = false, ...rest }) {
  const { subOpen, setSubOpen, subClose, subTriggerRef, leaveTimer } = React.useContext(MenuSubCtx);

  const mergedRef = React.useCallback((node) => { subTriggerRef.current = node; }, [subTriggerRef]);

  const handleMouseEnter = () => {
    clearTimeout(leaveTimer.current);
    if (!disabled) setSubOpen(true);
  };
  const handleMouseLeave = () => {
    leaveTimer.current = setTimeout(subClose, 200);
  };
  const handleKeyDown = (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); e.stopPropagation(); if (!disabled) setSubOpen(true); }
    if (e.key === "ArrowLeft")  { e.preventDefault(); e.stopPropagation(); subClose(); }
  };

  return (
    <button
      type="button"
      role="menuitem"
      aria-haspopup="menu"
      aria-expanded={subOpen}
      tabIndex={-1}
      data-menu-item=""
      data-disabled={disabled || undefined}
      ref={mergedRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      className={cn(
        "w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left select-none",
        "transition-colors duration-100 outline-none",
        "text-foreground hover:bg-muted focus:bg-muted",
        disabled && "opacity-40 cursor-not-allowed pointer-events-none",
        className,
      )}
      {...rest}
    >
      <span className="flex-1">{children}</span>
      {/* Chevron right indicator */}
      <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3 ml-auto opacity-60">
        <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
MenuSubTrigger.displayName = "MenuSubTrigger";

// ─── MenuSubContent ───────────────────────────────────────────────────────────
/**
 * The panel for a nested sub-menu. Portal-rendered, positioned to the right of
 * MenuSubTrigger by default. Clicking an item inside closes the entire menu tree.
 *
 * @param {string} [props.placement="right-start"]  Override positioning
 * @param {number} [props.sideOffset=2]
 * @param {string} [props.className]
 */
export function MenuSubContent({
  children,
  className,
  placement  = "right-start",
  sideOffset = 2,
  ...rest
}) {
  const { subOpen, subClose, subTriggerRef, parentClose, leaveTimer } = React.useContext(MenuSubCtx);

  const handleMouseEnter = () => clearTimeout(leaveTimer.current);
  const handleMouseLeave = () => { leaveTimer.current = setTimeout(subClose, 200); };

  const handleKeyDown = React.useCallback((e) => {
    const el = e.currentTarget;
    switch (e.key) {
      case "ArrowDown": e.preventDefault(); navDown(el);  break;
      case "ArrowUp":   e.preventDefault(); navUp(el);    break;
      case "Home":      e.preventDefault(); navFirst(el); break;
      case "End":       e.preventDefault(); navLast(el);  break;
      case "ArrowLeft":
      case "Escape":
        e.preventDefault();
        e.stopPropagation();
        subClose();
        subTriggerRef.current?.focus();
        break;
    }
  }, [subClose, subTriggerRef]);

  return (
    <MenuPortal
      open={subOpen}
      close={subClose}
      anchorRef={subTriggerRef}
      outsideRef={subTriggerRef}
      placement={placement}
      offset={sideOffset}
      onKeyDown={handleKeyDown}
      className={cn("", className)}
      style={{ onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave }}
      {...rest}
    >
      {/*
       * Wrap children to inject parentClose so selecting a final item
       * closes the entire menu tree, not just the sub-menu.
       * We do this via a local override context.
       */}
      <MenuCtx.Provider
        value={{
          ...React.useContext(MenuCtx),
          close: parentClose,
        }}
      >
        <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {children}
        </div>
      </MenuCtx.Provider>
    </MenuPortal>
  );
}
MenuSubContent.displayName = "MenuSubContent";

// ─── useMenuDisclosure ────────────────────────────────────────────────────────
/**
 * Hook for programmatic menu control.
 *
 * @param {boolean} [defaultOpen=false]
 * @returns {{ isOpen, setIsOpen, onOpen, onClose, onToggle }}
 *
 * @example
 *   const menu = useMenuDisclosure();
 *   <Menu open={menu.isOpen} onOpenChange={menu.setIsOpen}>...</Menu>
 */
export function useMenuDisclosure(defaultOpen = false) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  return {
    isOpen,
    setIsOpen,
    onOpen:   React.useCallback(() => setIsOpen(true),  []),
    onClose:  React.useCallback(() => setIsOpen(false), []),
    onToggle: React.useCallback(() => setIsOpen((v) => !v), []),
  };
}

export default Menu;