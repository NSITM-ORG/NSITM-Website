import React from "react";
// import { cn } from "../../lib/utils";

const cn = (...classes) => classes.filter(Boolean).join(" ");

/**
 * Table
 *
 * Props:
 *  - scrollable {boolean}  — enables a fixed header + scrollable body via sticky thead
 *  - height    {string}   — max height of the scroll container (default "400px")
 *  - minW      {string}   — min-width before horizontal scroll kicks in (default "600px")
 *  - stickyCol {boolean}  — pins the first column (useful for wide tables on mobile)
 */
const Table = React.forwardRef(
  (
    {
      className,
      scrollable = false,
      fitHeight = false, // override height when you want the table to grow with content instead of scrolling
      height = "400px",
      minW = "600px",
      stickyCol = false,
      children,
      ...props
    },
    ref,
  ) => {
    const containerCls = cn(
      "relative w-full",
      scrollable ? "overflow-auto" : "overflow-x-auto",
    );

    const tableCls = cn(
      "w-full caption-bottom text-sm",
      // Honour the caller's min-width so horizontal scroll fires at the right point
      className,
    );

    const containerStyle = scrollable
      ? { maxHeight: fitHeight ? "fit-content" : height, minWidth: minW }
      : { minWidth: minW };

    return (
      <div className={containerCls} style={containerStyle}>
        <table ref={ref} className={tableCls} {...props}>
          {React.Children.map(children, (child) => {
            if (!React.isValidElement(child)) return child;

            // Inject stickyCol so cells can opt-in without prop-drilling manually
            if (
              child.type?.displayName === "TableHeader" ||
              child.type?.displayName === "TableBody" ||
              child.type?.displayName === "TableFooter"
            ) {
              return React.cloneElement(child, {
                "data-sticky-col": stickyCol,
              });
            }
            return child;
          })}
        </table>
      </div>
    );
  },
);
Table.displayName = "Table";

// ─── Sub-components ────────────────────────────────────────────────────────────

const TableHeader = React.forwardRef(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(
      // Sticky header — works inside the scrollable container above
      "sticky top-0 z-20 [&_tr]:border-b border-border",
      className,
    )}
    {...props}
  />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      // Sticky footer sits at the bottom of the scroll container
      "sticky bottom-0 z-20 border-t border-border bg-muted/80 backdrop-blur-sm font-medium [&>tr]:last:border-b-0",
      className,
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef(
  ({ className, hover = true, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        "border-b border-border transition-colors cursor-pointer",
        hover && "hover:bg-muted/50 data-[state=selected]:bg-muted",
        className,
      )}
      {...props}
    />
  ),
);
TableRow.displayName = "TableRow";

/**
 * TableHead
 * Gets a solid bg so it actually covers body rows when sticky.
 * Pass `sticky` to pin this specific column (first-column freeze).
 */
const TableHead = React.forwardRef(
  ({ className, sticky = false, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        "h-12 px-4 text-left align-middle font-semibold text-sm md:text-base",
        "bg-muted text-foreground whitespace-nowrap",
        "[&:has([role=checkbox])]:pr-0",
        // First-column sticky
        sticky &&
          "sticky left-0 z-30 bg-muted shadow-[2px_0_4px_-2px_rgba(0,0,0,.12)]",
        className,
      )}
      {...props}
    />
  ),
);
TableHead.displayName = "TableHead";

/**
 * TableCell
 * Pass `sticky` to freeze this cell in the first column (pair with TableHead sticky).
 */
const TableCell = React.forwardRef(
  ({ className, sticky = false, ...props }, ref) => (
    <td
      ref={ref}
      className={cn(
        "p-4 align-middle text-sm md:text-base text-foreground",
        "[&:has([role=checkbox])]:pr-0",
        // First-column sticky
        sticky &&
          "sticky left-0 z-10 bg-background shadow-[2px_0_4px_-2px_rgba(0,0,0,.08)]",
        className,
      )}
      {...props}
    />
  ),
);
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
