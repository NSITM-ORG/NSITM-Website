/**
 * @file Accordion.jsx
 * Animated collapsible section system.
 *
 * Uses the CSS grid-template-rows trick for smooth height animation without
 * any JavaScript height measurement. No ResizeObserver required.
 * Light mode by default; dark mode via the nearest .dark ancestor.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * EXPORTS
 * ─────────────────────────────────────────────────────────────────────────────
 *   Accordion         Root — manages which items are open
 *   AccordionItem     Individual collapsible section (requires a unique `value`)
 *   AccordionTrigger  Clickable header row (with animated chevron)
 *   AccordionContent  Animated content panel
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * USAGE
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *   // Single — only one item open at a time
 *   <Accordion type="single" collapsible defaultValue="item-1">
 *     <AccordionItem value="item-1">
 *       <AccordionTrigger>What is your return policy?</AccordionTrigger>
 *       <AccordionContent>
 *         <p className="text-muted-foreground">
 *           You can return any item within 30 days...
 *         </p>
 *       </AccordionContent>
 *     </AccordionItem>
 *     <AccordionItem value="item-2">
 *       <AccordionTrigger>Do you offer free shipping?</AccordionTrigger>
 *       <AccordionContent>Free shipping on orders over $50.</AccordionContent>
 *     </AccordionItem>
 *   </Accordion>
 *
 *   // Multiple — any number of items can be open simultaneously
 *   <Accordion type="multiple" defaultValue={["section-a", "section-b"]}>
 *     <AccordionItem value="section-a">
 *       <AccordionTrigger>Section A</AccordionTrigger>
 *       <AccordionContent>...</AccordionContent>
 *     </AccordionItem>
 *     <AccordionItem value="section-b">
 *       <AccordionTrigger>Section B</AccordionTrigger>
 *       <AccordionContent>...</AccordionContent>
 *     </AccordionItem>
 *   </Accordion>
 *
 *   // Controlled single
 *   <Accordion type="single" value={openItem} onValueChange={setOpenItem}>
 *     ...
 *   </Accordion>
 *
 *   // Controlled multiple
 *   <Accordion type="multiple" value={openItems} onValueChange={setOpenItems}>
 *     ...
 *   </Accordion>
 *
 *   // Custom trigger styling
 *   <AccordionTrigger className="text-primary font-bold">
 *     Custom heading
 *   </AccordionTrigger>
 *
 *   // Custom icon (overrides default chevron)
 *   <AccordionTrigger icon={<PlusIcon className="w-4 h-4" />}>
 *     FAQ Item
 *   </AccordionTrigger>
 *
 *   // No dividers
 *   <Accordion type="single" className="divide-y-0 border-0">...</Accordion>
 */

import * as React from "react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

// ─── Root context ─────────────────────────────────────────────────────────────
const AccordionCtx = React.createContext({
    value: null,
    onToggle: () => { },
    type: "single",
    collapsible: true,
});

// ─── Item context (each AccordionItem provides this to its children) ──────────
const AccordionItemCtx = React.createContext({
    itemValue: "",
    isOpen: false,
    onToggle: () => { },
    disabled: false,
});

// ─── Value helpers ────────────────────────────────────────────────────────────
function isItemOpen(value, itemValue, type) {
    if (type === "multiple") return Array.isArray(value) && value.includes(itemValue);
    return value === itemValue;
}

function computeNextValue(current, itemValue, type, collapsible) {
    if (type === "multiple") {
        const arr = Array.isArray(current) ? current : [];
        return arr.includes(itemValue)
            ? arr.filter((v) => v !== itemValue)
            : [...arr, itemValue];
    }
    // single
    if (current === itemValue) return collapsible ? null : current;
    return itemValue;
}

// ─── Accordion ────────────────────────────────────────────────────────────────
/**
 * Root container. Controls which items are open.
 *
 * @param {"single"|"multiple"} [props.type="single"]
 *   "single"   — At most one item open at a time.
 *   "multiple" — Any number of items can be open.
 *
 * @param {boolean}       [props.collapsible=true]
 *   When type="single", whether clicking the open item closes it.
 *
 * @param {string|string[]|null} [props.value]
 *   Controlled value. String for "single", string[] for "multiple".
 *
 * @param {function} [props.onValueChange]
 *   Called with the new value whenever an item is toggled.
 *
 * @param {string|string[]|null} [props.defaultValue]
 *   Uncontrolled initial value.
 *
 * @param {string} [props.className]
 */
export function Accordion({
    children,
    type = "single",
    collapsible = true,
    value: controlledValue,
    onValueChange,
    defaultValue,
    className,
    ...rest
}) {
    const initial = defaultValue ?? (type === "multiple" ? [] : null);
    const [internalValue, setInternalValue] = React.useState(initial);

    const value = controlledValue !== undefined ? controlledValue : internalValue;

    const onToggle = React.useCallback((itemValue) => {
        const next = computeNextValue(value, itemValue, type, collapsible);
        if (controlledValue === undefined) setInternalValue(next);
        onValueChange?.(next);
    }, [value, type, collapsible, controlledValue, onValueChange]);

    const ctx = React.useMemo(() => ({ value, onToggle, type, collapsible }),
        [value, onToggle, type, collapsible]);

    return (
        <AccordionCtx.Provider value={ctx}>
            <div
                className={cn("divide-y divide-border border border-border rounded-xl overflow-hidden", className)}
                {...rest}
            >
                {children}
            </div>
        </AccordionCtx.Provider>
    );
}
Accordion.displayName = "Accordion";

// ─── AccordionItem ────────────────────────────────────────────────────────────
/**
 * A single collapsible section. Provides its own context to AccordionTrigger
 * and AccordionContent.
 *
 * @param {string}  props.value              Unique identifier for this item
 * @param {boolean} [props.disabled=false]   Prevents expanding
 * @param {string}  [props.className]
 */
export function AccordionItem({ children, value, disabled = false, className, ...rest }) {
    const { value: rootValue, onToggle, type } = React.useContext(AccordionCtx);
    const isOpen = isItemOpen(rootValue, value, type);

    const ctx = React.useMemo(() => ({
        itemValue: value,
        isOpen,
        onToggle: () => { if (!disabled) onToggle(value); },
        disabled,
    }), [value, isOpen, onToggle, disabled]);

    return (
        <AccordionItemCtx.Provider value={ctx}>
            <div
                className={cn(
                    "bg-background",
                    disabled && "opacity-50",
                    className,
                )}
                data-state={isOpen ? "open" : "closed"}
                {...rest}
            >
                {children}
            </div>
        </AccordionItemCtx.Provider>
    );
}
AccordionItem.displayName = "AccordionItem";

// ─── AccordionTrigger ─────────────────────────────────────────────────────────
/**
 * The clickable header row for an AccordionItem.
 * Renders a chevron icon that rotates 180° when the item is open.
 * Pass a custom `icon` prop to replace the chevron entirely.
 *
 * @param {string}    [props.className]
 * @param {ReactNode} [props.icon]  Replaces the default animated chevron
 *
 * @example
 *   // With custom icon
 *   <AccordionTrigger icon={<PlusIcon className="w-4 h-4 transition-transform data-[state=open]:rotate-45" />}>
 *     Frequently asked
 *   </AccordionTrigger>
 */
export const AccordionTrigger = React.forwardRef(function AccordionTrigger(
    { children, className, icon, ...rest },
    ref,
) {
    const { isOpen, onToggle, disabled, itemValue } = React.useContext(AccordionItemCtx);

    return (
        <button
            ref={ref}
            type="button"
            aria-expanded={isOpen}
            aria-controls={`accordion-content-${itemValue}`}
            id={`accordion-trigger-${itemValue}`}
            onClick={onToggle}
            disabled={disabled}
            className={cn(
                "flex w-full items-center justify-between px-4 py-4",
                "text-sm font-medium text-foreground text-left",
                "hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                "transition-colors duration-150 select-none",
                disabled && "cursor-not-allowed",
                className,
            )}
            {...rest}
        >
            <span className="flex-1">{children}</span>

            {/* Icon: custom or default animated chevron */}
            {icon ?? (
                <svg
                    viewBox="0 0 12 12"
                    fill="none"
                    aria-hidden="true"
                    style={{ transition: "transform 0.2s ease", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                    className="w-4 h-4 shrink-0 ml-3 text-muted-foreground"
                >
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            )}
        </button>
    );
});
AccordionTrigger.displayName = "AccordionTrigger";

// ─── AccordionContent ─────────────────────────────────────────────────────────
/**
 * The animated content panel for an AccordionItem.
 *
 * Uses the CSS `grid-template-rows: 0fr → 1fr` trick for smooth height animation
 * without measuring the content height — works correctly even with dynamic content.
 *
 * @param {string} [props.className]  Applied to the inner padding div
 * @param {string} [props.outerClassName]  Applied to the outer grid wrapper
 */
export const AccordionContent = React.forwardRef(function AccordionContent(
    { children, className, outerClassName, ...rest },
    ref,
) {
    const { isOpen, itemValue } = React.useContext(AccordionItemCtx);

    return (
        /*
         * Outer grid div: animates grid-template-rows between 0fr and 1fr.
         * This collapses/expands the inner div's height without overflow: hidden
         * on the grid itself (which would clip box shadows on the inner content).
         */
        <div
            id={`accordion-content-${itemValue}`}
            role="region"
            aria-labelledby={`accordion-trigger-${itemValue}`}
            style={{
                display: "grid",
                gridTemplateRows: isOpen ? "1fr" : "0fr",
                transition: "grid-template-rows 0.25s cubic-bezier(0.4,0,0.2,1)",
            }}
            className={outerClassName}
        >
            {/*
       * Inner div: overflow:hidden is on this element, not the grid wrapper,
       * so the animation clips correctly while the grid item size animates.
       */}
            <div ref={ref} style={{ overflow: "hidden" }}>
                <div
                    className={cn("px-4 pb-4 pt-0 text-sm text-muted-foreground", className)}
                    {...rest}
                >
                    {children}
                </div>
            </div>
        </div>
    );
});
AccordionContent.displayName = "AccordionContent";

export default Accordion;