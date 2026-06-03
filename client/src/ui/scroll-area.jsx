// components/ui/scroll-area.jsx
import * as React from "react";
// import { cn } from "../../lib/utils";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const ScrollAreaContext = React.createContext({
  viewportRef: null,
});

const ScrollArea = React.forwardRef(
  (
    {
      className,
      children,
      direction = "vertical", // scroll direction: 'vertical' | 'horizontal' | 'both'
      width, // numeric or string width
      w, // alias
      height,
      h,
      maxH = 550,
      autoHide = true, // auto-hide scrollbar
      smoothScroll = true, // enable smooth scrolling
      scrollbarSize = 10, // customizable scrollbar thickness
      ...props
    },
    ref,
  ) => {
    const viewportRef = React.useRef(null);

    // scroll direction styling
    const overflowClass =
      direction === "horizontal"
        ? "overflow-x-auto flex flex-row flex-nowrap whitespace-nowrap overflow-y-hidden"
        : direction === "both"
          ? "overflow-x-auto overflow-y-auto"
          : direction === "vertical"
            ? "overflow-y-auto overflow-x-hidden"
            : "overflow-y-auto overflow-x-hidden";

    // compute inline styles
    const customWidth =
      width === "full" || w === "full"
        ? "100%"
        : width || w
          ? typeof (width || w) === "string"
            ? width || w
            : `${width || w}px`
          : "100%";

    const customHeight =
      height === "full" || h === "full"
        ? "100%"
        : height || h
          ? typeof (height || h) === "string"
            ? height || h
            : `${height || h}px`
          : "100%";

    const customMaxHeight =
      maxH === "full"
        ? "100%"
        : maxH
          ? typeof maxH === "string"
            ? maxH
            : `${maxH}px`
          : "100%";

    const [isHovered, setIsHovered] = React.useState(false);
    const showScrollbar = !autoHide || isHovered;

    return (
      <ScrollAreaContext.Provider value={{ viewportRef }}>
        <div
          ref={ref}
          className={cn("relative rounded-md z-[1000]", className)}
          style={{
            width: customWidth,
            height: customHeight,
            maxHeight: customMaxHeight,
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          {...props}
        >
          <div
            ref={viewportRef}
            className={cn(
              "h-full w-full rounded-[inherit]",
              overflowClass,
              smoothScroll && "scroll-smooth",
              "scrollbar-hide",
            )}
          >
            {children}
          </div>

          {(direction === "vertical" || direction === "both") &&
            showScrollbar && <ScrollBar size={scrollbarSize} />}
          {(direction === "horizontal" || direction === "both") &&
            showScrollbar && (
              <ScrollBar orientation="horizontal" size={scrollbarSize} />
            )}

          {direction === "both" && showScrollbar && (
            <div
              className="absolute right-0 bottom-0 "
              style={{
                width: scrollbarSize,
                height: scrollbarSize,
                background: "var(--background)",
              }}
            />
          )}
        </div>
      </ScrollAreaContext.Provider>
    );
  },
);

ScrollArea.displayName = "ScrollArea";

const ScrollBar = React.forwardRef(
  ({ className, orientation = "vertical", size = 10, ...props }, ref) => {
    const { viewportRef } = React.useContext(ScrollAreaContext);
    const thumbRef = React.useRef(null);
    const wrapperRef = React.useRef(null);
    const [thumbSize, setThumbSize] = React.useState(20);
    const [dragging, setDragging] = React.useState(false);
    const [startPos, setStartPos] = React.useState(0);
    const [initialScroll, setInitialScroll] = React.useState(0);
    const isVertical = orientation === "vertical";

    const getSizes = () => {
      if (!viewportRef.current) return { client: 0, scroll: 0 };
      return isVertical
        ? {
            client: viewportRef.current.clientHeight,
            scroll: viewportRef.current.scrollHeight,
          }
        : {
            client: viewportRef.current.clientWidth,
            scroll: viewportRef.current.scrollWidth,
          };
    };

    const updateThumb = () => {
      if (!viewportRef.current || !thumbRef.current) return;
      const { client, scroll } = getSizes();
      if (scroll <= client) {
        thumbRef.current.style.display = "none";
        return;
      }
      thumbRef.current.style.display = "";
      const newThumbSize = Math.max((client / scroll) * client, 20);
      setThumbSize(newThumbSize);
      const scrollPos = isVertical
        ? viewportRef.current.scrollTop
        : viewportRef.current.scrollLeft;
      const pos = (scrollPos / scroll) * client;
      thumbRef.current.style.transform = isVertical
        ? `translateY(${pos}px)`
        : `translateX(${pos}px)`;
      if (isVertical) {
        thumbRef.current.style.height = `${newThumbSize}px`;
        thumbRef.current.style.width = `${size}px`;
      } else {
        thumbRef.current.style.width = `${newThumbSize}px`;
        thumbRef.current.style.height = `${size}px`;
      }
    };

    React.useEffect(() => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      const resizeObserver = new ResizeObserver(updateThumb);
      resizeObserver.observe(viewport);
      viewport.addEventListener("scroll", updateThumb);
      updateThumb();
      return () => {
        resizeObserver.unobserve(viewport);
        viewport.removeEventListener("scroll", updateThumb);
      };
    }, []);

    const handleMouseDown = (e) => {
      e.preventDefault();
      setDragging(true);
      setStartPos(isVertical ? e.clientY : e.clientX);
      setInitialScroll(
        isVertical
          ? viewportRef.current.scrollTop
          : viewportRef.current.scrollLeft,
      );
    };

    const handleMouseMove = (e) => {
      if (!dragging) return;
      const delta = (isVertical ? e.clientY : e.clientX) - startPos;
      const { client, scroll } = getSizes();
      const newScroll = initialScroll + (delta / client) * scroll;
      if (isVertical) viewportRef.current.scrollTop = newScroll;
      else viewportRef.current.scrollLeft = newScroll;
    };

    const handleMouseUp = () => setDragging(false);

    React.useEffect(() => {
      if (!dragging) return;
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }, [dragging]);

    const handleTrackClick = (e) => {
      if (e.target === thumbRef.current) return;
      const bound = wrapperRef.current.getBoundingClientRect();
      const clickPos = isVertical
        ? e.clientY - bound.top
        : e.clientX - bound.left;
      const thumbHalf = thumbSize / 2;
      const pos = clickPos - thumbHalf;
      const { client, scroll } = getSizes();
      const scrollTo = (pos / client) * scroll;
      viewportRef.current.scrollTo({
        [isVertical ? "top" : "left"]: scrollTo,
        behavior: "smooth",
      });
    };

    return (
      <div
        ref={wrapperRef}
        className={cn(
          "flex touch-none select-none transition-colors",
          isVertical
            ? `absolute right-0 top-0 h-full border-l border-transparent p-[1px]`
            : `absolute bottom-0 left-0 w-full border-t border-transparent p-[1px] flex-col`,
          className,
        )}
        style={{
          width: isVertical ? size : "100%",
          height: isVertical ? "100%" : size,
        }}
        onClick={handleTrackClick}
        {...props}
      >
        <div
          ref={thumbRef}
          className={cn(
            "relative flex-1 rounded-full bg-border",
            dragging ? "cursor-grabbing" : "cursor-grab",
          )}
          onMouseDown={handleMouseDown}
        />
      </div>
    );
  },
);

ScrollBar.displayName = "ScrollBar";

export { ScrollArea, ScrollBar };
