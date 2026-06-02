import React from "react";
import { Check } from "lucide-react";
import { cn } from "../libs/cn";

const Checkbox = React.forwardRef(({ className, checked, ...props }, ref) => {
  return (
    <button
      type="button"
      ref={ref}
      role="checkbox"
      aria-checked={checked}
      className={cn(
        "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background " +
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
          "disabled:cursor-not-allowed disabled:opacity-50 " +
          (checked
            ? "bg-primary text-primary-foreground"
            : "bg-background text-transparent"),
        className
      )}
      {...props}
    >
      {checked && (
        <span className="flex items-center justify-center text-current">
          <Check className="h-4 w-4" />
        </span>
      )}
    </button>
  );
});

Checkbox.displayName = "Checkbox";

export { Checkbox };
