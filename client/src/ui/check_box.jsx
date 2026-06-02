import { forwardRef } from "react";
import { cn } from "../libs/cn";

const CheckBox = forwardRef(({ className, checked, ...props }, ref) => {
  return (
    <label className="inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        ref={ref}
        checked={checked}
        className={cn(
          "peer h-4 w-4 shrink-0 rounded-sm border cursor-pointer border-primary ring-offset-background " +
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
            "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
      {/* Custom check indicator */}
      <span className="pointer-events-none absolute opacity-0 peer-checked:opacity-100 text-primary-foreground flex items-center justify-center">
        {/* Irrelevant */}
        {/* <FaCheck className="h-3 w-3" /> */}
      </span>
    </label>
  );
});

CheckBox.displayName = "Checkbox";

export { CheckBox };
