/**
 * CohortManagementPage — /superadmin/cohorts. List + create link + edit/delete.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useManageState } from '../../hooks/useManageState.js';
import { useSEO } from '../../hooks/useSEO.js';
import { useToast } from '../../hooks/useToast.js';
import { usePagination } from '../../hooks/usePagination.js';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { ConfirmModal } from '../../components/ui/ConfirmModal.jsx';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { SkeletonTableRow } from '../../components/ui/Skeleton.jsx';
import { formatDate, humanizeEnum } from '../../utils/formatters.js';
import { Calendar } from 'lucide-react';

const STATUS_COLORS = { upcoming: 'blue', active: 'green', completed: 'grey' };

export function CohortManagementPage() {
  const { cohorts, actions } = useManageState();
  const { showSuccess } = useToast();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const pagination = usePagination({ serverPagination: cohorts.pagination });

  useSEO({ title: 'Cohorts' });

  useEffect(() => {
    actions.fetchAdminCohorts({ page: pagination.page, limit: 25 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page]);

  const handleDelete = async () => {
    try {
      await actions.deleteCohort(deleteTarget.id);
      showSuccess(`"${deleteTarget.name}" has been removed.`);
      setDeleteTarget(null);
    } catch {
      // toast already shown centrally
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold text-text-primary">Cohorts</h1>
        <Link to="/superadmin/cohorts/create">
          <Button icon={Plus}>Create Cohort</Button>
        </Link>
      </div>

      {cohorts.loading ? (
        <table className="w-full text-sm"><tbody>{Array.from({ length: 6 }).map((_, i) => <SkeletonTableRow key={i} columns={6} />)}</tbody></table>
      ) : cohorts.adminList.length === 0 ? (
        <EmptyState icon={Calendar} title="No cohorts yet" description="Create your first cohort to begin accepting enrollments." />
      ) : (
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-surface text-left text-text-secondary">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Programme</th>
                <th className="px-4 py-3">Start</th>
                <th className="px-4 py-3">Format</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {cohorts.adminList.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-medium text-text-primary">{c.name}</td>
                  <td className="px-4 py-3 text-text-secondary">{c.programme?.name}</td>
                  <td className="px-4 py-3 text-text-secondary">{formatDate(c.startDate)}</td>
                  <td className="px-4 py-3 text-text-secondary">{humanizeEnum(c.deliveryFormat)}</td>
                  <td className="px-4 py-3"><Badge color={STATUS_COLORS[c.status]}>{humanizeEnum(c.status)}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link to={`/superadmin/cohorts/${c.id}/edit`} className="text-text-secondary hover:text-primary"><Pencil size={16} /></Link>
                      <button onClick={() => setDeleteTarget(c)} className="text-text-secondary hover:text-error"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination {...pagination} onGoToPage={pagination.goToPage} onNext={pagination.nextPage} onPrevious={pagination.previousPage} />

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Remove Cohort"
        message={`This will remove "${deleteTarget?.name}" from the active cohorts page. Confirm?`}
        confirmLabel="Remove"
        variant="danger"
      />
    </div>
  );
}

export default CohortManagementPage;