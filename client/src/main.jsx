import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.css";
import App from "./App.jsx";
import { ToastProvider } from "./context/useToasterContext.jsx";
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
  state = { error: null, errorInfo: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  
  componentDidCatch(error, errorInfo) {
    // Capture the component stack trace where the error originated
    this.setState({ errorInfo });
    
    // Optional: Log the error to an external analytics service here (e.g., Sentry)
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, fontFamily: "monospace", backgroundColor: "#fff5f5", color: "#c53030", border: "1px solid #feb2b2", borderRadius: 8, margin: 16 }}>
          <h2 style={{ marginTop: 0 }}>🚨 Something went wrong</h2>
          
          <h3 style={{ marginBottom: 4 }}>Error Message:</h3>
          <pre style={{ whiteSpace: "pre-wrap", background: "#fff", padding: 12, borderRadius: 4, border: "1px solid #fed7d7" }}>
            {this.state.error.toString()}
          </pre>
          
          {this.state.errorInfo && (
            <>
              <h3 style={{ marginBottom: 4, marginTop: 16 }}>Component Stack Trace:</h3>
              <pre style={{ whiteSpace: "pre-wrap", background: "#fff", padding: 12, borderRadius: 4, border: "1px solid #fed7d7", fontSize: "0.9rem", color: "#4a5568" }}>
                {this.state.errorInfo.componentStack}
              </pre>
            </>
          )}
        </div>
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
    <ToastProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ToastProvider>
    {/* </SEOProvider> */}
  </ErrorBoundary>,
);
