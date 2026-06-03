import React from "react";
// import { cn } from "../../lib/utils";

const cn = (...classes) => classes.filter(Boolean).join(" ");

// StatusBadge Component
const StatusBadge = React.forwardRef(
  ({ className, status = "pending", children, ...props }, ref) => {
    const statusStyles = {
      pending: "bg-orange-500 text-white",
      processing: "bg-yellow-500 text-white",
      shipping: "bg-blue-500 text-white",
      error: "bg-red-500 text-white",
      success: "bg-green-500 text-white",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex px-3 py-1 text-sm rounded-tr-[999px] rounded-br-[999px]",
          statusStyles[status.toLowerCase()] || statusStyles.pending,
          className
        )}
        {...props}
      >
        {children || status.charAt(0).toUpperCase() + status.slice(1)}
      </div>
    );
  }
);

StatusBadge.displayName = "StatusBadge";

// StatusBadgeGroup Component
const StatusBadgeGroup = React.forwardRef(
  ({ className, children, spacing = "space-x-2", ...props }, ref) => {
    return (
      <div ref={ref} className={cn("flex px-2", spacing, className)} {...props}>
        {children}
      </div>
    );
  }
);

StatusBadgeGroup.displayName = "StatusBadgeGroup";

export { StatusBadge, StatusBadgeGroup };
