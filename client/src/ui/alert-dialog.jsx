import React, { useState, useCallback } from "react";
import { cn } from "../libs/cn";
// import { buttonVariants } from "./button";

const AlertDialogContext = React.createContext();

function AlertDialog({ children }) {
  const [open, setOpen] = useState(false);

  const onOpen = useCallback(() => setOpen(true), []);
  const onClose = useCallback(() => setOpen(false), []);

  return (
    <AlertDialogContext.Provider value={{ open, onOpen, onClose }}>
      {children}
    </AlertDialogContext.Provider>
  );
}

function AlertDialogTrigger({ children, className, ...props }) {
  const { onOpen } = React.useContext(AlertDialogContext);
  return (
    <button onClick={onOpen} className={className} {...props}>
      {children}
    </button>
  );
}

function AlertDialogPortal({ children }) {
  const { open } = React.useContext(AlertDialogContext);
  if (!open) return null;
  return <>{children}</>;
}

const AlertDialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 animate-in fade-in-0",
      className,
    )}
    {...props}
  />
));
AlertDialogOverlay.displayName = "AlertDialogOverlay";

const AlertDialogContent = React.forwardRef(({ className, ...props }, ref) => {
  // eslint-disable-next-line no-unused-vars
  const { onClose } = React.useContext(AlertDialogContext);
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <div
        ref={ref}
        role="alertdialog"
        aria-modal="true"
        className={cn(
          "fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 shadow-lg duration-200 animate-in fade-in-0 zoom-in-95 sm:rounded-lg",
          className,
        )}
        {...props}
      />
    </AlertDialogPortal>
  );
});
AlertDialogContent.displayName = "AlertDialogContent";

function AlertDialogHeader({ className, ...props }) {
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
AlertDialogHeader.displayName = "AlertDialogHeader";

function AlertDialogFooter({ className, ...props }) {
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
AlertDialogFooter.displayName = "AlertDialogFooter";

const AlertDialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h2 ref={ref} className={cn("text-lg font-semibold", className)} {...props} />
));
AlertDialogTitle.displayName = "AlertDialogTitle";

const AlertDialogDescription = React.forwardRef(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  ),
);
AlertDialogDescription.displayName = "AlertDialogDescription";

const AlertDialogAction = React.forwardRef(({ className, ...props }, ref) => {
  const { onClose } = React.useContext(AlertDialogContext);
  return (
    <button
      ref={ref}
      onClick={onClose}
      //   className={cn(buttonVariants(), className)} // convert to button variants later
      {...props}
    />
  );
});
AlertDialogAction.displayName = "AlertDialogAction";

const AlertDialogCancel = React.forwardRef(({ className, ...props }, ref) => {
  const { onClose } = React.useContext(AlertDialogContext);
  return (
    <button
      ref={ref}
      onClick={onClose}
      className={cn(
        // buttonVariants({ variant: "outline" }), // convert to button variants later
        "mt-2 sm:mt-0",
        className,
      )}
      {...props}
    />
  );
});
AlertDialogCancel.displayName = "AlertDialogCancel";

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
