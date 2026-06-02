import React, { forwardRef } from "react";
// import { cn } from "../../lib/utils";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const Slider = forwardRef(
  ({ className, value, onValueChange, max = 100, step = 1, ...props }, ref) => {
    return (
      <div className={cn("relative w-full flex items-center", className)}>
        <input
          type="range"
          ref={ref}
          value={value}
          max={max}
          step={step}
          onChange={(e) => {
            const newValue = Number(e.target.value);
            onValueChange && onValueChange(newValue);
          }}
          className={cn(
            "w-full h-2 appearance-none rounded-full bg-default-primary cursor-pointer",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          )}
          {...props}
        />
        {/* Thumb styling (using ::-webkit-slider-thumb etc. handled via CSS) */}
        <style jsx>{`
          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            height: 20px;
            width: 20px;
            border-radius: 9999px;
            border: 2px solid var(--tw-color-primary, #3b82f6);
            background: white;
            cursor: pointer;
            transition: background 0.2s;
          }
          input[type="range"]::-moz-range-thumb {
            height: 20px;
            width: 20px;
            border-radius: 9999px;
            border: 2px solid var(--tw-color-primary, #3b82f6);
            background: white;
            cursor: pointer;
          }
        `}</style>
      </div>
    );
  },
);

Slider.displayName = "Slider";

export { Slider };
