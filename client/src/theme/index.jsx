// src/components/ThemeToggle.jsx
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    // 1. Check local storage preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) return savedTheme;

    // 2. Fall back to system preferences
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    return prefersDark ? "dark" : "light";
  });

  useEffect(() => {
    // Apply changes smoothly to the top-level HTML element
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <button
      onClick={toggleTheme}
      style={{
        padding: "6px 10px",
        cursor: "pointer",
        borderRadius: "50%",
        border: "1px solid var(--border)",
        background: "var(--code-bg)",
        color: "var(--text-h)",
        fontFamily: "var(--mono)",
        fontSize: "20px",
        marginTop: "16px",
        transition: "all 0.2s ease",
      }}
    >
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
}
