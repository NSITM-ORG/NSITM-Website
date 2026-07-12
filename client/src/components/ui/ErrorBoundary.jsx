/**
 * ErrorBoundary — class component (React error boundaries cannot be
 * hooks, per React's API — this is the one deliberate exception to the
 * "function components only" pattern used everywhere else in this app).
 *
 * Catches any render-time error in its subtree and shows a recoverable
 * fallback UI instead of a blank white screen. Logs the error to
 * console in development for debugging; in production this is the
 * natural place to wire a real error-reporting service later (Sentry,
 * etc.) without touching any other file.
 */

import { Component } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (import.meta.env.VITE_APP_ENV !== 'production') {
      console.error('ErrorBoundary caught:', error, errorInfo);
    }
    // Production hook point: send `error` + `errorInfo` to an error-tracking
    // service here if one is added later.
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
        <AlertTriangle size={48} className="text-error" />
        <h1 className="font-heading text-xl font-semibold text-text-primary">Something went wrong</h1>
        <p className="max-w-sm text-sm text-text-secondary">
          An unexpected error occurred. Please try reloading the page — if this keeps happening,
          contact us on WhatsApp.
        </p>
        <button
          onClick={this.handleReload}
          className="flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5 text-sm font-medium text-white hover:brightness-90"
        >
          <RotateCcw size={16} /> Reload App
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;