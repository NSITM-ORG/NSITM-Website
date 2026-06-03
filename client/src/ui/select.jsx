import React, { useState, useRef, useEffect } from "react";
import { FaChevronDown, FaChevronUp, FaCheck } from "react-icons/fa6";
// import { cn } from "../../lib/utils";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const SelectContext = React.createContext();

function Select({ defaultValue, children }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue || "");
  const triggerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (triggerRef.current && !triggerRef.current.parentNode.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <SelectContext.Provider value={{ open, setOpen, value, setValue, triggerRef }}>
      <div className="relative inline-block">{children}</div>
    </SelectContext.Provider>
  );
}

function SelectTrigger({ className, children }) {
  const { open, setOpen, triggerRef } = React.useContext(SelectContext);

  return (
    <button
      ref={triggerRef}
      onClick={() => setOpen(!open)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-default-primary disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      {children}
      {open ? (
        <FaChevronUp className="h-4 w-4 opacity-50" />
      ) : (
        <FaChevronDown className="h-4 w-4 opacity-50" />
      )}
    </button>
  );
}

function SelectValue({ placeholder }) {
  const { value } = React.useContext(SelectContext);
  return <span className="line-clamp-1">{value || placeholder}</span>;
}

function SelectContent({ className, children }) {
  const { open } = React.useContext(SelectContext);
  if (!open) return null;

  return (
    <div
      className={cn(
        "absolute mt-1 z-50 max-h-60 w-full max-w-[16rem] min-w-[8rem] overflow-auto rounded-md border bg-popover bg-white text-default-darkGray shadow-md",
        className
      )}
    >
      <ul className="p-1">{children}</ul>
    </div>
  );
}

function SelectItem({ value, children, className }) {
  const { setValue, setOpen, value: selected } = React.useContext(SelectContext);

  return (
    <li>
      <button
        onClick={() => {
          setValue(value);
          setOpen(false);
        }}
        className={cn(
          "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm bg-default hover:bg-accent hover:text-accent-foreground hover:bg-default-primary hover:text-white",
          className
        )}
      >
        {selected === value && (
          <span className="absolute left-2 flex items-center">
            <FaCheck className="h-4 w-4" />
          </span>
        )}
        {children}
      </button>
    </li>
  );
}

// Optional: Label & Separator for grouping
function SelectLabel({ children, className }) {
  return (
    <div className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}>
      {children}
    </div>
  );
}

function SelectSeparator({ className }) {
  return <div className={cn("my-1 h-px bg-muted -mx-1", className)} />;
}

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectSeparator,
};
