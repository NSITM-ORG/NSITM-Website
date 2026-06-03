import React, { forwardRef } from "react";
// import { cn } from "../../lib/utils"; // your simple cn helper

const cn = (...classes) => classes.filter(Boolean).join(" ");

const baseClasses =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm sm:text-base ring-offset-gray " +
  "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground " +
  "placeholder:text-default-gray focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";

const Input = forwardRef(({ className, type = "text", ...props }, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(className, baseClasses)}
      {...props}
    />
  );
});

Input.displayName = "Input";

export { Input };
