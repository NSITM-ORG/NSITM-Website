import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../libs/cn";

const CollapsibleContext = React.createContext({
  open: false,
  setOpen: () => {},
});

const Collapsible = ({
  children,
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
}) => {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const setOpen = React.useCallback(
    (value) => {
      if (controlledOpen !== undefined) {
        onOpenChange?.(value);
      } else {
        setInternalOpen(value);
      }
    },
    [controlledOpen, onOpenChange],
  );

  return (
    <CollapsibleContext.Provider value={{ open, setOpen }}>
      <div className="w-full">{children}</div>
    </CollapsibleContext.Provider>
  );
};
Collapsible.displayName = "Collapsible";

const CollapsibleTrigger = React.forwardRef(
  ({ className, children, asChild = false, ...props }, ref) => {
    const { open, setOpen } = React.useContext(CollapsibleContext);

    const handleClick = () => setOpen(!open);

    if (asChild) {
      return React.cloneElement(React.Children.only(children), {
        onClick: (e) => {
          children.props.onClick?.(e);
          handleClick();
        },
        "aria-expanded": open,
        ref,
        ...props,
      });
    }

    return (
      <button
        type="button"
        ref={ref}
        onClick={handleClick}
        aria-expanded={open}
        className={cn(
          "flex w-full items-center justify-between py-2 text-left font-medium transition-all hover:underline",
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>
    );
  },
);
CollapsibleTrigger.displayName = "CollapsibleTrigger";

const CollapsibleContent = React.forwardRef(
  ({ className, children, ...props }, ref) => {
    const { open } = React.useContext(CollapsibleContext);
    const contentRef = React.useRef(null);
    const [height, setHeight] = React.useState(0);

    React.useEffect(() => {
      if (contentRef.current) {
        if (open) {
          setHeight(contentRef.current.scrollHeight);
        } else {
          setHeight(0);
        }
      }
    }, [open, children]);

    return (
      <div
        ref={ref}
        className={cn(
          "overflow-hidden transition-all duration-200 ease-in-out",
          className,
        )}
        style={{ maxHeight: open ? `${height}px` : "0px" }}
        {...props}
      >
        <div ref={contentRef} className="pb-2">
          {children}
        </div>
      </div>
    );
  },
);
CollapsibleContent.displayName = "CollapsibleContent";

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
