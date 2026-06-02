// File: components/OrderStatusLevel.jsx
import React from "react";
// import { cn } from "../../lib/utils"; // className merge utility

const cn = (...classes) => classes.filter(Boolean).join(" ");

const STATUS_STYLES = {
    ordered: { bg: "bg-blue-100", text: "text-blue-600", label: "Ordered" },
    initiated: { bg: "bg-blue-200", text: "text-blue-700", label: "Initiated" },
    pending: { bg: "bg-yellow-100", text: "text-yellow-600", label: "Pending" },
    shipped: { bg: "bg-amber-200", text: "text-amber-700", label: "Shipped" },
    delivered: { bg: "bg-green-200", text: "text-green-700", label: "Delivered" },
    cancelled: { bg: "bg-red-200", text: "text-red-700", label: "Cancelled" },
    success: { bg: "bg-emerald-200", text: "text-emerald-700", label: "Success" },
};

export const OrderStatusLevel = React.forwardRef(
    ({ status = "ordered", size = "md", showLabel = true, className }, ref) => {
        const current = STATUS_STYLES[status] || STATUS_STYLES["pending"];
        const sizes = {
            sm: "text-xs px-2 py-0.5 rounded-md",
            md: "text-sm px-3 py-1 rounded-lg",
            lg: "text-base px-4 py-1.5 rounded-xl",
        };

        return (
            <div
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center font-semibold uppercase transition-all duration-200",
                    current.bg,
                    current.text,
                    sizes[size],
                    className
                )}
            >
                {showLabel && current.label}
            </div>
        );
    }
);

OrderStatusLevel.displayName = "OrderStatusLevel";
