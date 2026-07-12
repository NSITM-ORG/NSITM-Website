/**
 * NotPaidPage — /admin/enrollments/not-paid. Pre-filtered, phone/WhatsApp
 * visible directly in the list (FRD FR-04.4), oldest-first. Super Admin
 * additionally sees a Delete button per row to permanently archive
 * genuinely stale records (FRD FR-08.4) — gated by role, since the
 * backend endpoint itself is Super-Admin-only.
 */

import { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { useManageState } from '../../hooks/useManageState.js';
import { useSEO } from '../../hooks/useSEO.js';
import { useToast } from '../../hooks/useToast.js';
import { usePagination } from '../../hooks/usePagination.js';
import { StudentTable } from '../../components/panel/StudentTable.jsx';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { ConfirmModal } from '../../components/ui/ConfirmModal.jsx';
import { useState } from 'react';

export function NotPaidPage() {
  const { isSuperAdmin } = useAuth();
  const { enrollments, actions } = useManageState();
  const { showSuccess } = useToast();
  const pagination = usePagination({ serverPagination: enrollments.pagination });
  const [archiveTarget, setArchiveTarget] = useState(null);

  useSEO({ title: 'Not Paid Follow-Up' });

  useEffect(() => {
    actions.fetchAllEnrollments({ status: 'not_paid', page: pagination.page, limit: 25 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page]);

  const handleArchive = async () => {
    try {
      await actions.archivePartialEnrollment(archiveTarget);
      showSuccess('Record permanently deleted.');
      setArchiveTarget(null);
    } catch {
      // toast already shown centrally
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-text-primary">Not Paid — Follow-Up Required</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Students who started enrollment but never submitted a payment receipt. Sorted oldest first.
        </p>
      </div>

      <StudentTable records={enrollments.list} loading={enrollments.loading} variant="notPaid" />

      {isSuperAdmin && enrollments.list?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {enrollments.list.map((r) => (
            <button
              key={r.id}
              onClick={() => setArchiveTarget(r.id)}
              className="rounded-sm border border-error/30 px-3 py-1 text-xs text-error hover:bg-error/10"
            >
              Delete: {r.profile?.fullName}
            </button>
          ))}
        </div>
      )}

      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        pageNumbers={pagination.pageNumbers}
        canGoNext={pagination.canGoNext}
        canGoPrevious={pagination.canGoPrevious}
        onGoToPage={pagination.goToPage}
        onNext={pagination.nextPage}
        onPrevious={pagination.previousPage}
      />

      <ConfirmModal
        isOpen={!!archiveTarget}
        onClose={() => setArchiveTarget(null)}
        onConfirm={handleArchive}
        title="Delete Partial Record"
        message="This permanently deletes this Not Paid record. This action cannot be undone."
        confirmLabel="Delete Permanently"
        variant="danger"
      />
    </div>
  );
}

export default NotPaidPage;