// src/components/ui/SearchBar.jsx
import React from "react";
import { Search } from "lucide-react";
import { Input } from "./input";

/**
 * SearchBar — controlled search input.
 *
 * Supports two layouts:
 *   "left"  — Search icon inside the input field (default)
 *   "right" — Search icon outside the input field
 *
 * @param {"left"|"right"} [iconDirection="left"]
 * @param {string}  [iconColor="gray"]        — Tailwind colour name (gray, green, blue…)
 * @param {string}  searchTerm                — Controlled value (parent manages state)
 * @param {function} handleSearch             — Called as handleSearch(value, ...handlerArgs)
 * @param {string}  [placeholder]
 * @param {any[]}   [handlerArgs=[]]          — Extra args forwarded to handleSearch
 * @param {string}  [className]               — Applied to the root wrapper
 */
export const SearchBar = ({
  iconDirection = "left",
  iconColor = "gray",
  searchTerm,
  handleSearch,
  placeholder = "Search for items...",
  handlerArgs = [],
  className = "",
  ...props
}) => {
  const onSearchChange = (e) => {
    const value = e.target.value;
    if (typeof handleSearch === "function") {
      handleSearch(value, ...handlerArgs);
    }
  };

  return (
    <div className={`flex-1 relative ${className}`} {...props}>
      {/* ── Left layout: icon inside Input ─────────────────────────────── */}
      {iconDirection === "left" && (
        <div className="relative flex-1">
          <Search
            className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-${iconColor}-500 pointer-events-none`}
          />
          <Input
            placeholder={placeholder}
            value={searchTerm}
            onChange={onSearchChange}
            className="pl-9 h-10 bg-background border-border focus-visible:ring-primary/40"
          />
        </div>
      )}

      {/* ── Right layout: icon beside input ────────────────────────────── */}
      {iconDirection === "right" && (
        <div className="flex w-full items-center gap-2">
          <input
            type="search"
            placeholder={placeholder}
            value={searchTerm}
            onChange={onSearchChange}
            className={`
              flex-1 h-10 px-4 rounded-lg
              bg-background border border-border
              text-sm text-foreground placeholder:text-muted-foreground
              focus:outline-none focus:ring-2 focus:ring-primary/40
              transition-colors duration-200
            `}
          />
          <div
            className={`shrink-0 text-${iconColor}-500 transition-opacity duration-200 ${searchTerm ? "opacity-0 pointer-events-none" : "opacity-100"}`}
          >
            <Search className="h-4 w-4" />
          </div>
        </div>
      )}
    </div>
  );
};
