/**
 * Root Application Component
 *
 * This is a PLACEHOLDER for Batch F1 — it renders a minimal confirmation
 * screen so the scaffold can be verified end-to-end (npm run dev) before
 * the Redux store, router, and layouts exist.
 *
 * In Batch F5, this file will be replaced with the real composition:
 * RouterProvider (React Router v7 data router built from the centralized
 * route registry) + <ToastContainer/> + <LogoutModal/> + <Preloader/>
 * mounted at this same root level.
 */

function App() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-primary">
      <div className="text-center">
        <h1 className="mb-2 text-2xl font-bold text-green-500">NSITM Frontend Scaffold</h1>
        <p className="text-text-secondary">
          Batch F1 complete. Redux store, router, and pages arrive in later batches.
        </p>
      </div>
    </div>
  );
}

export default App;
