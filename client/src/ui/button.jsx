// src/components/ui/Button.jsx
import React, { forwardRef } from "react";
import { cn } from "../libs/cn";
import { Spinner } from "./loader";

// Extended Tailwind schemes (~40 colors)
const colorSchemes = {
  slate: schemeGen("slate"),
  gray: schemeGen("gray"),
  zinc: schemeGen("zinc"),
  neutral: schemeGen("neutral"),
  stone: schemeGen("stone"),
  red: schemeGen("red"),
  orange: schemeGen("orange"),
  amber: schemeGen("amber"),
  yellow: schemeGen("yellow"),
  lime: schemeGen("lime"),
  green: schemeGen("green"),
  emerald: schemeGen("emerald"),
  teal: schemeGen("teal"),
  cyan: schemeGen("cyan"),
  sky: schemeGen("sky"),
  blue: schemeGen("blue"),
  indigo: schemeGen("indigo"),
  violet: schemeGen("violet"),
  purple: schemeGen("purple"),
  fuchsia: schemeGen("fuchsia"),
  pink: schemeGen("pink"),
  rose: schemeGen("rose"),
};

function schemeGen(color) {
  return {
    text: `text-${color}-500`,
    autoText: `text-${color}`,
    bg: `bg-${color}-500`,
    autoBg: `bg-${color}`,
    hoverText: `hover:text-${color}-600`,
    border: `border-${color}-300 hover:border-${color}-400`,
    autoColor: `${color}`,
    gradientFrom: `from-${color}-700`,
    gradientVia: `via-${color}-600`,
    gradientTo: `to-${color}-500`,
    hoverFrom: `hover:from-${color}-500`,
    hoverVia: `hover:via-${color}-600`,
    hoverTo: `hover:to-${color}-700`,
  };
}

// Static variant styles — all tokens from the design system
const staticVariants = {
  transparent:
    "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-700",
  default:
    "bg-brand-primary/80 text-white hover:bg-brand-primary hover:text-white transition-all duration-700",
  primary:
    "bg-brand-primary/80 text-white hover:bg-brand-primary hover:text-white transition-all duration-700",
  secondary:
    "bg-brand-secondary text-white hover:bg-brand-secondary/85 hover:text-white transition-all duration-700",
  accent:
    "bg-brand-blue/90 text-white hover:bg-brand-blue hover:text-white transition-all duration-700",
  destructive:
    "bg-destructive/90 text-destructive-foreground hover:bg-destructive hover:text-destructive-foreground transition-all duration-700",
  disabled:
    "bg-muted text-muted-foreground hover:bg-muted/90 hover:text-muted-foreground transition-all duration-700",
};

const getVariantClasses = (variant, schemeKey) => {
  const scheme = colorSchemes[schemeKey] || colorSchemes.gray;

  switch (variant) {
    case "outline":
      return `border-[0.2px] hover:border-[1.6px] border-solid hover:${scheme?.autoBg}-100 ${scheme?.border} ${scheme?.text} ${scheme?.hoverText} transition-all duration-700`;
    case "ghost":
      return `${scheme?.text} bg-gray-100 hover:bg-${scheme?.autoColor}-100 ${scheme?.hoverText} transition-all duration-700`;
    case "link":
      return `${scheme?.text} ${scheme?.hoverText} hover:${scheme?.autoBg}-100 hover:border-b ${scheme?.border} transition-all duration-700`;
    case "solid":
      return `${scheme?.autoText}-700 ${scheme?.autoBg}-500 text-white hover:${scheme?.autoBg}-600 border-none transition-all duration-700`;
    case "soft":
      return `${scheme?.autoBg}-100 ${scheme?.text} hover:${scheme?.autoBg}-200 hover:${scheme?.hoverText} border border-transparent hover:border-${scheme?.autoColor}-300 transition-all duration-700`;
    case "scale":
      return `${scheme?.autoText}-700 hover:text-white hover:${scheme?.autoBg}-600 border-none transition-all duration-700`;
    case "fade":
      return `text-muted-foreground bg-transparent hover:text-white hover:${scheme?.bg} transition-all duration-700`;
    case "gradient":
      return `text-white bg-gradient-to-r ${scheme?.gradientFrom} ${scheme?.gradientVia} ${scheme?.gradientTo} 
              ${scheme?.hoverFrom} ${scheme?.hoverVia} ${scheme?.hoverTo} 
              transition-all duration-700`;
    default:
      return staticVariants[variant] || staticVariants.default;
  }
};

const sizeClasses = {
  default: "h-10 px-4 py-2",
  xs: "text-[20px] rounded-md px-3.5 lg:px-4.5 py-2 lg:py-3",
  sm: "text-[20px] rounded-md px-4 lg:px-5 py-2 lg:py-3",
  md: "text-[22px] rounded-md px-5 lg:px-6 py-2.5 lg:py-3.5",
  lg: "text-[24px] rounded-md px-5 lg:px-6 py-3 lg:py-4",
  xl: "text-[26px] font-bold rounded-md px-6 lg:px-7 py-4 lg:py-5",
  "2xl": "text-[27.5px] font-bold rounded-md px-7 lg:px-8 py-5 lg:py-6",
  icon: "text-[25px] px-2 py-2 rounded-full",
};

const baseClasses =
  "flex flex-row items-center justify-center text-center gap-1 cursor-pointer whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
  "disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0";

const Button = forwardRef(
  (
    {
      className,
      variant = "default",
      type = "button",
      scheme = "gray",
      size = "default",
      loading = false,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref,
  ) => {
    const hasLeftIcon = !!leftIcon;
    const hasRightIcon = !!rightIcon;

    const breakpoints = ["", "sm:", "md:", "lg:", "xl:", "2xl:"];

    let sizeArray = Array.isArray(size) ? size : [size];
    while (sizeArray.length < 6) {
      sizeArray.push(sizeArray[sizeArray.length - 1] || "md");
    }

    const responsiveSizeClass = sizeArray
      .map((s, index) => {
        const prefix = breakpoints[index];
        const cls = sizeClasses[s] || sizeClasses.md;
        return prefix + cls;
      })
      .join(" ");

    return (
      <button
        type={type}
        ref={ref}
        disabled={loading || props?.disabled}
        className={cn(
          baseClasses,
          getVariantClasses(variant, scheme),
          responsiveSizeClass,
          hasLeftIcon || hasRightIcon ? "" : "gap-1",
          className,
        )}
        {...props}
      >
        {leftIcon && <span>{leftIcon}</span>}
        <span className="text-center flex flex-row justify-center items-center">
          {loading ? <Spinner size={25} thickness={5} /> : children}
        </span>
        {rightIcon && <span>{rightIcon}</span>}
      </button>
    );
  },
);

Button.displayName = "Button";

export { Button, getVariantClasses };
