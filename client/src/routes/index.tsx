import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-slate-900 text-white font-bold text-xl">
          NS
        </div>
        <h1 className="mt-4 text-3xl font-bold text-slate-900">
          NSITM — Admin Console
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Operations dashboard for Nextserve School of Information Technology and
          Management. Sign in to manage enrollments, payments, programmes, and admins.
        </p>
        <Link
          to="/admin"
          className="mt-6 inline-block px-5 py-2.5 rounded bg-slate-900 text-white font-medium hover:bg-slate-800"
        >
          Open admin dashboard →
        </Link>
        <div className="mt-6 text-xs text-slate-500 border-t pt-4">
          <div>Demo Super Admin: superadmin@nextserve.test / Super123!</div>
          <div>Demo Admin: admin@nextserve.test / Admin123!</div>
        </div>
      </div>
    </div>
  );
}
