// src/components/ui/tabs.jsx
/**
 * Tabs
 *
 * Supports both uncontrolled (defaultValue) and controlled (value + onValueChange) modes.
 *
 * ── New in this version ────────────────────────────────────────────────────────
 * TabsList now accepts:
 *   scrollable        {boolean}               — enables overflow scrolling (default false)
 *   scrollDirection   {"x"|"y"|"both"}        — scroll axis (default "x")
 *   showScrollButtons {boolean}               — show ‹ › arrows for x-axis (default true when scrollable)
 *
 * All existing usages are fully backward-compatible.
 *
 * @example
 * // Scrollable controlled tabs (AccountsManagement role tabs)
 * <Tabs value={tab} onValueChange={setTab}>
 *   <TabsList scrollable scrollDirection="x">
 *     {ROLE_TABS.map(t => <TabsTrigger key={t.key} value={t.key}>{t.label}</TabsTrigger>)}
 *   </TabsList>
 *   <TabsContent value="all">...</TabsContent>
 * </Tabs>
 *
 * @example
 * // Non-scrollable uncontrolled (existing usages unchanged)
 * <Tabs defaultValue="posts">
 *   <TabsList>
 *     <TabsTrigger value="posts">Posts</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="posts">...</TabsContent>
 * </Tabs>
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
// import { cn } from "../../lib/utils";

const cn = (...classes) => classes.filter(Boolean).join(" ");

// ── Context ───────────────────────────────────────────────────────────────────

const TabsContext = createContext({
  activeTab: "",
  setActiveTab: () => {},
});

// ── Tabs (root) ───────────────────────────────────────────────────────────────

/**
 * @param {object}   props
 * @param {string}   [props.defaultValue]    — initial tab (uncontrolled mode)
 * @param {string}   [props.value]           — active tab (controlled mode)
 * @param {function} [props.onValueChange]   — called with new tab key (controlled mode)
 * @param {string}   [props.className]
 * @param {React.ReactNode} props.children
 */
function Tabs({ defaultValue, value, onValueChange, children, className }) {
  const isControlled = value !== undefined;
  const [internalTab, setInternalTab] = useState(defaultValue ?? "");

  const activeTab = isControlled ? value : internalTab;

  const setActiveTab = useCallback(
    (newTab) => {
      if (isControlled) onValueChange?.(newTab);
      else setInternalTab(newTab);
    },
    [isControlled, onValueChange],
  );

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn("", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

// ── TabsList ──────────────────────────────────────────────────────────────────

/**
 * @param {object}   props
 * @param {boolean}  [props.scrollable=false]
 *   When true the tab strip scrolls instead of wrapping.
 *
 * @param {"x"|"y"|"both"} [props.scrollDirection="x"]
 *   Which axis to scroll. "y" hides horizontal overflow; "both" enables both.
 *
 * @param {boolean}  [props.showScrollButtons=true]
 *   Show ‹ › arrow buttons beside the strip (only applies to x / both directions).
 *   Buttons scroll the list by 160 px per click with smooth behaviour.
 *
 * @param {string}   [props.className]
 * @param {React.ReactNode} props.children
 */
function TabsList({
  children,
  className,
  scrollable = false,
  scrollDirection = "x",
  showScrollButtons = true,
}) {
  const listRef = useRef(null);

  const scrollBy = (delta) => {
    listRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  };

  // Determine overflow classes
  const overflowCls = scrollable
    ? ["y", "vertical"].includes(scrollDirection)
      ? "overflow-y-auto overflow-x-hidden"
      : scrollDirection === "both"
        ? "overflow-auto"
        : ["x", "horizontal"].includes(scrollDirection)
          ? "overflow-x-auto overflow-y-hidden"
          : "overflow-x-auto overflow-y-hidden" // default to horizontal scrolling when scrollable is true but scrollDirection is invalid
    : "overflow-x-auto lg:overflow-x-hidden"; // original default behaviour

  const showArrows = scrollable && scrollDirection !== "y" && showScrollButtons;

  return (
    <div className="relative flex items-center gap-1 w-full">
      {/* ← Left arrow */}
      {showArrows && (
        <button
          type="button"
          onClick={() => scrollBy(-160)}
          aria-label="Scroll tabs left"
          className={cn(
            "shrink-0 flex items-center justify-center h-8 w-8 rounded-md",
            "text-muted-foreground hover:text-foreground hover:bg-muted",
            "transition-colors duration-200 focus-visible:outline-none",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}

      {/* Tab strip */}
      <div
        ref={listRef}
        role="tablist"
        className={cn(
          "inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground",
          "flex-1 min-w-0",
          overflowCls,
          // Visually hide scrollbar but keep it functional across browsers
          scrollable && [
            "[&::-webkit-scrollbar]:hidden",
            "[-ms-overflow-style:none]",
            "[scrollbar-width:none]",
          ],
          className,
        )}
      >
        {children}
      </div>

      {/* → Right arrow */}
      {showArrows && (
        <button
          type="button"
          onClick={() => scrollBy(160)}
          aria-label="Scroll tabs right"
          className={cn(
            "shrink-0 flex items-center justify-center h-8 w-8 rounded-md",
            "text-muted-foreground hover:text-foreground hover:bg-muted",
            "transition-colors duration-200 focus-visible:outline-none",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

// ── TabsTrigger ───────────────────────────────────────────────────────────────

/**
 * @param {object}  props
 * @param {string}  props.value      — tab key this trigger activates
 * @param {string}  [props.active]   — Tailwind classes when active
 * @param {string}  [props.inactive] — Tailwind classes when inactive
 * @param {string}  [props.className]
 * @param {React.ReactNode} props.children
 */
function TabsTrigger({
  value,
  children,
  className,
  active = "bg-brand-secondary text-white shadow-md rounded-xl",
  inactive = "text-muted-foreground hover:text-foreground",
}) {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  const isActive = activeTab === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      data-state={isActive ? "active" : "inactive"}
      onClick={() => setActiveTab(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5",
        "text-xs sm:text-sm font-medium ring-offset-background transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        isActive ? active : inactive,
        className,
      )}
    >
      {children}
    </button>
  );
}

// ── TabsContent ───────────────────────────────────────────────────────────────

/**
 * Renders children only when its value matches the active tab.
 *
 * @param {object}  props
 * @param {string}  props.value
 * @param {string}  [props.className]
 * @param {React.ReactNode} props.children
 */
function TabsContent({ value, children, className }) {
  const { activeTab } = useContext(TabsContext);
  if (activeTab !== value) return null;

  return (
    <div
      className={cn(
        "mt-2 ring-offset-background",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
    >
      {children}
    </div>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
