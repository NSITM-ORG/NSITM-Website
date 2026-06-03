import * as React from "react";
import { Circle } from "lucide-react";

// import { cn } from "../../lib/utils";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const RadioGroupContext = React.createContext({
  value: "",
  onValueChange: () => {},
});

const RadioGroup = React.forwardRef(
  (
    { className, value: controlledValue, onValueChange, children, ...props },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState("");

    const value =
      controlledValue !== undefined ? controlledValue : internalValue;

    const handleValueChange = (newValue) => {
      if (controlledValue !== undefined) {
        onValueChange?.(newValue);
      } else {
        setInternalValue(newValue);
      }
    };

    return (
      <RadioGroupContext.Provider
        value={{ value, onValueChange: handleValueChange }}
      >
        <div
          role="radiogroup"
          ref={ref}
          className={cn("grid gap-2", className)}
          {...props}
        >
          {children}
        </div>
      </RadioGroupContext.Provider>
    );
  }
);
RadioGroup.displayName = "RadioGroup";

const RadioGroupItem = React.forwardRef(
  ({ className, value, disabled, children, ...props }, ref) => {
    const { value: groupValue, onValueChange } =
      React.useContext(RadioGroupContext);
    const isChecked = value === groupValue;

    return (
      <button
        type="button"
        role="radio"
        aria-checked={isChecked}
        data-state={isChecked ? "checked" : "unchecked"}
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          onValueChange(value);
        }}
        ref={ref}
        className={cn(
          "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-default-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          "flex items-center justify-center",
          className
        )}
        {...props}
      >
        {isChecked && (
          <Circle className="h-2.5 w-2.5 fill-current text-current" />
        )}
        {children}
      </button>
    );
  }
);
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
