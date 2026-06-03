// src/components/ui/sheet.tsx (fixed SheetTrigger to avoid cloneElement(undefined) crash)
import React, { createContext, useContext, useState, useCallback } from "react";
// import { cn } from "../../lib/utils";
import { Menu, X } from "lucide-react";
import { Button } from "./button";

const cn = (...classes) => classes.filter(Boolean).join(" ");

// Context for open/close state
const SheetContext = createContext();

function Sheet({
  children,
  isOpen: controlledIsOpen,
  onOpen: controlledOnOpen,
  onClose: controlledOnClose,
}) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledIsOpen !== undefined;
  const open = isControlled ? controlledIsOpen : internalOpen;

  const setOpen = isControlled
    ? (newValue) => {
        if (newValue === true && controlledOnOpen) {
          controlledOnOpen();
        } else if (newValue === false && controlledOnClose) {
          controlledOnClose();
        }
      }
    : setInternalOpen;

  return (
    <SheetContext.Provider value={{ open, setOpen }}>
      {children}
    </SheetContext.Provider>
  );
}

// Trigger Button - safe asChild handling + default menu design
function SheetTrigger({
  asChild = false,
  children,
  variant = "scale",
  size = "icon",
  scheme = "gray",
  className = "",
  isSticky,
}) {
  const { setOpen } = useContext(SheetContext);

  const defaultTrigger = (
    <Button
      variant={variant}
      size={size}
      scheme={scheme}
      aria-label="Open menu"
      className={className}
      onClick={() => setOpen(true)}
    >
      <Menu
        className="h-6 w-6 sm:h-7 sm:w-7"
        // style={{ color: isSticky ? "#000" : "#959595" }}
      />
    </Button>
  );

  if (asChild) {
    if (!children) {
      console.warn(
        "SheetTrigger asChild used without children - falling back to default",
      );
      return defaultTrigger;
    }
    return React.cloneElement(children, {
      onClick: (e) => {
        children.props.onClick?.(e);
        setOpen(true);
      },
    });
  }

  return defaultTrigger;
}

// Overlay
function SheetOverlay({ className }) {
  const { open, setOpen } = useContext(SheetContext);

  if (!open) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[99] bg-black/80 transition-opacity",
        className,
      )}
      onClick={() => setOpen(false)}
    />
  );
}

// Content (Drawer)
function SheetContent({ direction = "right", className, children }) {
  const { open, setOpen } = useContext(SheetContext);

  if (!open) return null;

  if (!["right", "left"].includes(direction)) direction = "left";

  const sideClasses = {
    right: "right-0 top-0 h-full w-3/4 sm:max-w-sm border-l",
    left: "left-0 top-0 h-full w-3/4 sm:max-w-sm border-r",
    // top: "top-0 left-0 w-full h-1/3 border-b",
    // bottom: "bottom-0 left-0 w-full h-1/3 border-t",
  };

  const sideCloseClasses = {
    right: "left-4 top-4 rounded",
    left: "right-4 top-4 rounded",
    // top: "right-4 top-4 rounded",
    // bottom: "right-4 top-4 rounded",
  };

  return (
    <>
      <SheetOverlay />
      <div
        className={cn(
          "fixed z-[999] bg-default p-6 shadow-lg transition-all duration-700",
          sideClasses[direction],
          open
            ? "translate-x-0"
            : direction === "left"
              ? "-translate-x-full"
              : "translate-x-full",
          className,
        )}
      >
        {children}
        <button
          onClick={() => setOpen(false)}
          className={cn(
            "absolute rounded-sm opacity-70 transition-all hover:opacity-100 duration-700 focus:outline-none",
            sideCloseClasses[direction],
          )}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </>
  );
}

// Header, Footer, Title, Description (unchanged)
function SheetHeader({ className, ...props }) {
  return (
    <div
      className={cn(
        "flex flex-col space-y-2 text-center sm:text-left",
        className,
      )}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
        className,
      )}
      {...props}
    />
  );
}

function SheetTitle({ className, ...props }) {
  return (
    <h2
      className={cn("text-lg font-semibold text-foreground", className)}
      {...props}
    />
  );
}

function SheetDescription({ className, ...props }) {
  return (
    <p className={cn("text-sm text-default-light", className)} {...props} />
  );
}

function useDisclosure() {
  const [isOpen, setIsOpen] = useState(false);

  const onOpen = useCallback(() => setIsOpen(true), []);
  const onClose = useCallback(() => setIsOpen(false), []);
  const onToggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    isOpen,
    onOpen,
    onClose,
    onToggle,
  };
}

export {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  useDisclosure,
};
