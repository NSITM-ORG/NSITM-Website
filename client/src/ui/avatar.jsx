// src/components/ui/avatar.jsx
import React, { createContext, useContext, useState } from "react";
import { User } from "lucide-react";
import { cn } from "../libs/cn";

// ---------------------------------------------------------------------------
// Helpers (shared between compound and convenience APIs)
// ---------------------------------------------------------------------------

/**
 * Size token → Tailwind h/w/text class map.
 * Used by both the `size` prop on `<Avatar>` and `<AvatarMain>`.
 *
 * @type {Record<string, string>}
 */
const AVATAR_SIZE_CLASSES = {
  xs: "h-6 w-6 text-xs",
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
  lg: "h-12 w-12 text-lg",
  xl: "h-14 w-14 text-xl",
  "2xl": "h-16 w-16 text-2xl",
};

const RESPONSIVE_BREAKPOINTS = ["", "sm:", "md:", "lg:", "xl:", "2xl:"];

/**
 * Converts a size string or responsive size array into a single Tailwind class string.
 *
 * - String input:  `"lg"` → `"h-12 w-12 text-lg"` (applied at all breakpoints)
 * - Array input:   `["sm", "md", "lg"]` → breakpoint-prefixed classes for each
 *                   position: `"h-8 w-8 text-sm sm:h-10 w-10 text-base md:h-12 w-12 text-lg …"`
 *
 * The array is padded to 6 entries by repeating the last value, covering all
 * Tailwind responsive breakpoints (base, sm, md, lg, xl, 2xl).
 *
 * @param {string|string[]} size - Size token or array of size tokens.
 * @returns {string} Tailwind class string.
 */
function resolveResponsiveSize(size) {
  if (!size) return AVATAR_SIZE_CLASSES.md;

  if (typeof size === "string") {
    return AVATAR_SIZE_CLASSES[size] ?? AVATAR_SIZE_CLASSES.md;
  }

  const arr = [...size];
  while (arr.length < 6) arr.push(arr[arr.length - 1] || "md");

  return arr
    .map((s, i) => {
      const prefix = RESPONSIVE_BREAKPOINTS[i];
      const cls = AVATAR_SIZE_CLASSES[s] ?? AVATAR_SIZE_CLASSES.md;
      return prefix + cls;
    })
    .join(" ");
}

/**
 * Derives up to two initials from a display name.
 *
 * - `"Tony Stark"` → `"TS"`
 * - `"Tony"`       → `"TO"`
 * - `""`           → `null`
 *
 * @param {string|undefined} name
 * @returns {string|null}
 */
function getInitials(name) {
  if (!name) return null;
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

/**
 * Returns a deterministic Tailwind background + text-white class pair based on
 * the first character of `name`. The same name will always produce the same colour.
 *
 * Returns `""` if no name is provided (caller should fall back to `bg-muted`).
 *
 * @param {string|undefined} name
 * @returns {string} Tailwind class string e.g. `"bg-indigo-500 text-white"`.
 */
function getBgColor(name) {
  if (!name) return "";
  const charCode = name.trim().toUpperCase().charCodeAt(0) - 65;
  const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-amber-500",
    "bg-yellow-500",
    "bg-lime-500",
    "bg-green-500",
    "bg-emerald-500",
    "bg-teal-500",
    "bg-cyan-500",
    "bg-sky-500",
    "bg-blue-500",
    "bg-indigo-500",
    "bg-violet-500",
    "bg-purple-500",
    "bg-fuchsia-500",
    "bg-pink-500",
    "bg-rose-500",
    "bg-red-600",
    "bg-orange-600",
    "bg-amber-600",
    "bg-yellow-600",
    "bg-lime-600",
    "bg-green-600",
    "bg-emerald-600",
    "bg-teal-600",
    "bg-cyan-600",
  ];
  return colors[charCode % colors.length] + " text-white";
}

// ---------------------------------------------------------------------------
// Context (internal — used by compound API only)
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} AvatarContextValue
 * @property {string|undefined}  src          - Image source URL passed to the root Avatar.
 * @property {string|undefined}  name         - Display name for initials and bg color.
 * @property {string|null}       initials     - Pre-computed initials derived from `name`.
 * @property {string}            bgColorClass - Pre-computed Tailwind bg+text class from `name`.
 * @property {boolean}           imageError   - True once AvatarImage fires an onError event.
 * @property {function(): void}  onImageError - Called by AvatarImage to signal load failure.
 */

/** @type {React.Context<AvatarContextValue>} */
const AvatarContext = createContext({
  src: undefined,
  name: undefined,
  initials: null,
  bgColorClass: "",
  imageError: false,
  onImageError: () => {},
});

// ---------------------------------------------------------------------------
// Avatar (compound root)
// ---------------------------------------------------------------------------

/**
 * `Avatar` — Root container for the compound avatar system.
 *
 * All state (image error, initials, bg colour) is derived here and shared with
 * `AvatarImage` and `AvatarFallback` via context.
 *
 * Supports an optional `size` prop (string or responsive array) for built-in sizing,
 * or leave it out and size via `className` exactly as the original v1 usage did.
 *
 * ---
 *
 * ### V1 — compound, no size prop (fully backwards-compatible)
 * ```jsx
 * <Avatar className="h-12 w-12">
 *   <AvatarImage src={user.avatarUrl} alt={user.name} />
 *   <AvatarFallback>TK</AvatarFallback>
 * </Avatar>
 * ```
 *
 * ### V1 + size prop (new)
 * ```jsx
 * <Avatar size="lg">
 *   <AvatarImage src={user.avatarUrl} alt={user.name} />
 *   <AvatarFallback>TK</AvatarFallback>
 * </Avatar>
 * ```
 *
 * ### Compound with name — auto initials + colour in AvatarFallback
 * ```jsx
 * <Avatar name="Tony Stark" size="md">
 *   <AvatarImage src={user.avatarUrl} alt="Tony Stark" />
 *   <AvatarFallback />   {/* renders "TS" with deterministic colour automatically *\/}
 * </Avatar>
 * ```
 *
 * ### Responsive size array
 * ```jsx
 * <Avatar size={["sm", "sm", "md", "lg"]}>
 *   <AvatarImage src={url} alt="User" />
 *   <AvatarFallback />
 * </Avatar>
 * ```
 *
 * @param {Object}          props
 * @param {React.ReactNode} props.children        - AvatarImage and/or AvatarFallback.
 * @param {string}          [props.className]     - Additional Tailwind classes.
 * @param {string|string[]} [props.size]          - Size token ("xs"|"sm"|"md"|"lg"|"xl"|"2xl")
 *                                                  or responsive array of tokens. Omit to size via className.
 * @param {string}          [props.name]          - Display name. Passed to AvatarFallback for
 *                                                  auto-initials and deterministic bg colour.
 * @param {string}          [props.src]           - Image URL. When provided here, AvatarImage
 *                                                  will use it if its own `src` is omitted.
 */
const Avatar = React.forwardRef(
  ({ className, size, name, src, ...props }, ref) => {
    const [imageError, setImageError] = useState(false);

    const sizeClass = size ? resolveResponsiveSize(size) : "";
    const initials = getInitials(name);
    const bgColorClass = getBgColor(name);

    return (
      <AvatarContext.Provider
        value={{
          src,
          name,
          initials,
          bgColorClass,
          imageError,
          onImageError: () => setImageError(true),
        }}
      >
        <div
          ref={ref}
          className={cn(
            "relative flex shrink-0 overflow-hidden rounded-full",
            sizeClass,
            // Default h-10 w-10 only when no size prop and no explicit sizing in className
            !size && "h-10 w-10",
            className,
          )}
          {...props}
        />
      </AvatarContext.Provider>
    );
  },
);
Avatar.displayName = "Avatar";

// ---------------------------------------------------------------------------
// AvatarImage
// ---------------------------------------------------------------------------

/**
 * `AvatarImage` — The image element inside a compound Avatar.
 *
 * Reads `src` from context if its own `src` prop is omitted, so you can pass
 * `src` once on `<Avatar src={…}>` and skip it here. If the image fails to load,
 * signals the context (`onImageError`) so `AvatarFallback` knows to render.
 *
 * In v1 usage where consumers manually show/hide `AvatarFallback`, behaviour is
 * identical to before — the `onError` handler is purely additive.
 *
 * ```jsx
 * // src on AvatarImage (original v1 style)
 * <Avatar>
 *   <AvatarImage src="/avatars/tony.jpg" alt="Tony" />
 *   <AvatarFallback>TK</AvatarFallback>
 * </Avatar>
 *
 * // src on Avatar root (new — AvatarImage inherits it)
 * <Avatar src="/avatars/tony.jpg" name="Tony Stark">
 *   <AvatarImage alt="Tony Stark" />
 *   <AvatarFallback />
 * </Avatar>
 * ```
 *
 * @param {Object} props
 * @param {string} [props.src]       - Image URL. Falls back to `src` passed on the root `<Avatar>`.
 * @param {string} [props.alt]       - Alt text for accessibility.
 * @param {string} [props.className] - Additional Tailwind classes.
 */
const AvatarImage = React.forwardRef(
  ({ className, src: propSrc, alt, ...props }, ref) => {
    const { src: ctxSrc, onImageError } = useContext(AvatarContext);
    const src = propSrc ?? ctxSrc;

    if (!src) return null;

    return (
      <img
        ref={ref}
        src={src}
        alt={alt}
        onError={onImageError}
        className={cn("aspect-square h-full w-full object-cover", className)}
        {...props}
      />
    );
  },
);
AvatarImage.displayName = "AvatarImage";

// ---------------------------------------------------------------------------
// AvatarFallback
// ---------------------------------------------------------------------------

/**
 * `AvatarFallback` — Shown when no image is available or the image fails to load.
 *
 * **Render priority (when `name` was passed to the root `<Avatar>`):**
 * 1. Explicit `children` — rendered as-is (original v1 behaviour preserved).
 * 2. Auto-initials from `name` with a deterministic background colour.
 * 3. Generic `<User>` icon (when no name and no children).
 *
 * When `AvatarImage` is present and loads successfully, `AvatarFallback` hides
 * itself automatically via the shared `imageError` context flag. In v1 usage where
 * `AvatarFallback` is always rendered regardless, passing explicit `children`
 * bypasses the context entirely — no v1 consumer breaks.
 *
 * ```jsx
 * // V1 — explicit fallback content, always visible alongside AvatarImage
 * <Avatar>
 *   <AvatarImage src={url} alt="Tony" />
 *   <AvatarFallback>TK</AvatarFallback>
 * </Avatar>
 *
 * // Auto-initials — AvatarFallback only shows when image is absent or errors
 * <Avatar name="Tony Stark" size="lg">
 *   <AvatarImage src={url} alt="Tony Stark" />
 *   <AvatarFallback />
 * </Avatar>
 *
 * // No image at all — fallback always visible, shows initials or User icon
 * <Avatar name="Kemi Adeyemi" size="md">
 *   <AvatarFallback />
 * </Avatar>
 * ```
 *
 * @param {Object}          props
 * @param {React.ReactNode} [props.children]  - Custom fallback content. Overrides auto-initials.
 * @param {string}          [props.className] - Additional Tailwind classes.
 */
const AvatarFallback = React.forwardRef(
  ({ className, children, ...props }, ref) => {
    const { initials, bgColorClass, imageError, src } =
      useContext(AvatarContext);

    // If an image source exists and it has NOT errored, stay hidden so the image shows.
    // V1 consumers that always render AvatarFallback with explicit children are unaffected
    // because `src` on the context will be undefined in their case (they pass src directly
    // to AvatarImage, not to the Avatar root), so this guard never triggers for them.
    if (src && !imageError) return null;

    const content =
      children ??
      (initials ? (
        <span>{initials}</span>
      ) : (
        <User className="h-5 w-5 opacity-70" />
      ));

    return (
      <div
        ref={ref}
        className={cn(
          "flex h-full w-full items-center justify-center rounded-full font-semibold text-sm",
          // Use deterministic colour when initials are available, otherwise muted surface
          initials && !children
            ? bgColorClass
            : "bg-muted text-muted-foreground",
          className,
        )}
        {...props}
      >
        {content}
      </div>
    );
  },
);
AvatarFallback.displayName = "AvatarFallback";

// ---------------------------------------------------------------------------
// AvatarMain (convenience wrapper — original AvatarMain.jsx API, unchanged)
// ---------------------------------------------------------------------------

/**
 * `AvatarMain` — Self-contained, single-component avatar.
 *
 * A convenience wrapper over the compound system for cases where you just want
 * to pass `name` + `src` and get a fully rendered avatar without composing
 * `AvatarImage` and `AvatarFallback` manually.
 *
 * **Render priority:**
 * 1. `src` image (if provided and loads successfully)
 * 2. Initials derived from `name` with deterministic background colour
 * 3. Generic `<User>` icon (when neither src nor name is provided)
 *
 * Supports a `size` string or responsive array — identical to `<Avatar size={…}>`.
 *
 * ---
 *
 * ### Basic usage
 * ```jsx
 * <AvatarMain name="Tony Stark" src="/avatars/tony.jpg" size="md" />
 * ```
 *
 * ### Initials only (no image)
 * ```jsx
 * <AvatarMain name="Kemi Adeyemi" size="lg" />
 * ```
 *
 * ### Responsive size
 * ```jsx
 * <AvatarMain name="Ade Bello" size={["sm", "sm", "md", "lg"]} />
 * ```
 *
 * ### Generic fallback (no name, no src)
 * ```jsx
 * <AvatarMain size="sm" />
 * ```
 *
 * @param {Object}          props
 * @param {string}          [props.name]      - Display name for initials and bg colour.
 * @param {string}          [props.src]       - Image URL.
 * @param {string|string[]} [props.size="md"] - Size token or responsive array.
 * @param {string}          [props.className] - Additional Tailwind classes.
 */
const AvatarMain = ({ size = "md", name, src, className, ...props }) => {
  const [imageError, setImageError] = useState(false);

  const sizeClass = resolveResponsiveSize(size);
  const initials = getInitials(name);
  const bgColor = getBgColor(name);

  return (
    <div
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full font-semibold items-center justify-center border border-border",
        sizeClass,
        initials ? bgColor : "bg-muted text-muted-foreground",
        className,
      )}
      {...props}
    >
      {src && !imageError ? (
        <img
          src={src}
          alt={name || "avatar"}
          onError={() => setImageError(true)}
          className="h-full w-full object-cover"
        />
      ) : initials ? (
        <span>{initials}</span>
      ) : (
        <User className="h-5 w-5 opacity-70" />
      )}
    </div>
  );
};
AvatarMain.displayName = "AvatarMain";

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export { Avatar, AvatarImage, AvatarFallback, AvatarMain };
