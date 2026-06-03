import React, { useState, useRef, useEffect } from "react";
import { Dot } from "lucide-react";
// import { cn } from "../../lib/utils";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const InputOTP = React.forwardRef(
  (
    {
      length = 6,
      onChange,
      className,
      type = "text",
      size = "default",
      scheme,
      containerClassName,
      ...props
    },
    ref,
  ) => {
    const [values, setValues] = useState(Array(length).fill(""));
    const inputsRef = useRef([]);

    // function that handles type check
    function typeCheck(value) {
      return true; // allow all if type is not specified
    }

    const handleChange = (value, index) => {
      // run a type check if type is specified
      if (type === "number" && !/^[0-9]?$/.test(value)) return; // allow only one digit
      if (type === "text" && !/^[a-zA-Z]?$/.test(value)) return; // allow only one letter
      if (type === "alphanumeric" && !/^[0-9a-zA-Z]?$/.test(value)) return; // allow only one alphanumeric char

      const newValues = [...values];
      newValues[index] = value;
      setValues(newValues);
      onChange?.(newValues.join(""));

      if (value && index < length - 1) {
        inputsRef.current[index + 1]?.focus();
      }
    };

    const handleKeyDown = (e, index) => {
      if (e.key === "Backspace" && !values[index] && index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    };

    const handlePaste = (e) => {
      e.preventDefault();
      const pasteData = e.clipboardData.getData("text").slice(0, length);
      const newValues = pasteData.split("");
      setValues((prev) => {
        const merged = [...prev];
        for (let i = 0; i < newValues.length; i++) {
          merged[i] = newValues[i];
        }
        onChange?.(merged.join(""));
        return merged;
      });
    };

    const sizeClasses = {
      default: "h-10 w-10 text-base",
      xs: "h-7 w-7 text-xs",
      sm: "h-9 w-9 text-sm",
      md: "h-12 w-12 text-lg",
      lg: "h-14 w-14 text-xl",
      xl: "h-16 w-16 text-2xl",
    };

    // Dynamically resolve focus color based on scheme prop
    const focusColor =
      scheme &&
      [
        "admin",
        "user",
        "vendor",
        "author",
        "affiliate",
        "primary",
        "secondary",
      ].includes(scheme)
        ? scheme
        : "primary";

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center gap-2",
          containerClassName,
        )}
        onPaste={handlePaste}
        {...props}
      >
        {Array.from({ length }).map((_, i) => (
          <input
            key={i}
            ref={(el) => (inputsRef.current[i] = el)}
            value={values[i]}
            onChange={(e) => handleChange(e.target.value.toUpperCase(), i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            maxLength={1}
            className={cn(
              `text-center border border-input rounded-md shadow-sm
              bg-background/60 text-foreground
               focus:border-${focusColor} focus:ring-${focusColor} 
               focus:ring-2 focus:ring-offset-2 outline-none transition-all border-gray-300 text-sm`,
              sizeClasses[size],
              className,
            )}
          />
        ))}
      </div>
    );
  },
);
InputOTP.displayName = "InputOTP";

const InputOTPGroup = ({ children, className, ...props }) => (
  <div className={cn("flex items-center", className)} {...props}>
    {children}
  </div>
);

const InputOTPSlot = ({ value, isActive, className }) => (
  <div
    className={cn(
      "relative flex h-10 w-10 items-center justify-center border-y border-r border-input text-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md",
      isActive && "z-10 ring-2 ring-ring ring-offset-background",
      className,
    )}
  >
    {value || ""}
  </div>
);

const InputOTPSeparator = (props) => (
  <div role="separator" {...props}>
    <Dot />
  </div>
);

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };

{
  /* <InputOTP length={6} onChange={(value) => console.log("OTP Value:", value)} />; */
}
