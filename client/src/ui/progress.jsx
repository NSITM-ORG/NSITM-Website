import React from "react";
// import { cn } from "../../lib/utils";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const Progress = React.forwardRef(({ className, value = 0, ...props }, ref) => {
  return (
    <div
      ref={ref}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-green-200",
        className
      )}
      {...props}
    >
      <div
        className="h-full w-full flex-1 bg-default-primary transition-all"
        style={{ transform: `translateX(-${100 - value}%)` }}
      />
    </div>
  );
});

Progress.displayName = "Progress";

export { Progress };
