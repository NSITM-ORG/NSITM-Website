import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.css";
import App from "./App.jsx";
// import { SEOProvider } from "./hooks/main-seo";

/**
 * ErrorBoundary — Silent crash catcher
 * ======================================
 * Catches any unhandled render errors in the tree below it and displays
 * them visibly instead of showing a blank screen. Without this, React 19
 * fails silently in production and you have no idea what broke.
 *
 * This wraps the entire app so nothing can slip through unnoticed.
 */
class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <pre style={{ padding: 24, color: "red" }}>
          {String(this.state.error)}
        </pre>
      );
    }
    return this.props.children;
  }
}

/**
 * Application entry point.
 *
 * Mount order matters here:
 *   ErrorBoundary — outermost, catches any crash in the entire tree
 *   SEOProvider   — must be outside BrowserRouter so context is always available
 *   BrowserRouter — must wrap App so useLocation() works everywhere inside it,
 *                   including inside useHeadSEO which is called in App itself
 */
createRoot(document.getElementById("root")).render(
  <ErrorBoundary>
    {/* <SEOProvider> */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    {/* </SEOProvider> */}
  </ErrorBoundary>,
);
