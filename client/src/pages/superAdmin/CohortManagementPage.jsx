/**
 * CohortManagementPage — /superadmin/cohorts. List + create link + edit/delete.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useManageState } from '../../hooks/useManageState';
import { useSEO } from '../../hooks/useSEO';
import { useToast } from '../../hooks/useToast';
import { usePagination } from '../../hooks/usePagination';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { Pagination } from '../../components/ui/Pagination';
import { EmptyState } from '../../components/ui/EmptyState';
import { SkeletonTableRow } from '../../components/ui/Skeleton';
import { formatDate, humanizeEnum } from '../../utils/formatters';
import { Calendar } from 'lucide-react';
import { BulkSelectAllCheckbox, BulkRowCheckbox, BulkActionBar } from '../../components/panel/BulkSelectionToolbar';
import { BulkActionDialog } from '../../components/panel/BulkActionDialog';
import { DELIVERY_FORMAT_LABELS } from '../../utils/constants';

const STATUS_COLORS = { upcoming: 'blue', active: 'green', completed: 'grey' };

export function CohortManagementPage() {
  const { cohorts, actions } = useManageState();
  const { showSuccess } = useToast();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const pagination = usePagination({ serverPagination: cohorts.pagination });

  const allSelected = cohorts.adminList.length > 0 && selectedIds.length === cohorts.adminList.length;
  const toggleAll = () => setSelectedIds(allSelected ? [] : cohorts.adminList.map((c) => c.id));
  const toggleOne = (id) => setSelectedIds((ids) => (ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]));

  const BULK_FIELDS = [
    { name: 'status', label: 'Status', type: 'select', options: [{ value: 'upcoming', label: 'Upcoming' }, { value: 'active', label: 'Active' }, { value: 'completed', label: 'Completed' }] },
    { name: 'deliveryFormat', label: 'Delivery Format', type: 'select', options: Object.entries(DELIVERY_FORMAT_LABELS).map(([value, label]) => ({ value, label })) },
    { name: 'maxCapacity', label: 'Max Capacity', type: 'number' },
  ];

  const handleBulkUpdate = async (updates) => {
    const result = await actions.bulkUpdateCohorts({ ids: selectedIds, updates });
    showSuccess(`${result.updated.length} fully updated, ${result.partiallyUpdated.length} partially updated, ${result.skipped.length} skipped (active).`);
    setSelectedIds([]);
    actions.fetchAdminCohorts({ page: pagination.page, limit: 25 });
  };
  
  console.log(cohorts);
  const handleBulkDelete = async () => {
    const result = await actions.bulkDeleteCohorts(selectedIds);
    showSuccess(`${result.deleted.length} removed, ${result.skipped.length} skipped (active).`);
    setSelectedIds([]);
    actions.fetchAdminCohorts({ page: pagination.page, limit: 25 });
  };

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

      <BulkActionBar
        selectedCount={selectedIds.length}
        onOpenDialog={() => setBulkDialogOpen(true)}
        onClearSelection={() => setSelectedIds([])}
      />

      {cohorts.loading ? (
        <table className="w-full text-sm"><tbody>{Array.from({ length: 6 }).map((_, i) => <SkeletonTableRow key={i} columns={6} />)}</tbody></table>
      ) : cohorts.adminList.length === 0 ? (
        <EmptyState icon={Calendar} title="No cohorts yet" description="Create your first cohort to begin accepting enrollments." />
      ) : (
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full min-w-190 text-sm">
            <thead className="bg-surface text-left text-text-secondary">
              <tr>
                <th className="px-4 py-3"><BulkSelectAllCheckbox allSelected={allSelected} onToggleAll={toggleAll} /></th>
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
                  <td className="px-4 py-3"><BulkRowCheckbox checked={selectedIds.includes(c.id)} onChange={() => toggleOne(c.id)} /></td>
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

      <BulkActionDialog
        isOpen={bulkDialogOpen}
        onClose={() => setBulkDialogOpen(false)}
        selectedCount={selectedIds.length}
        fields={BULK_FIELDS}
        onSubmitUpdate={handleBulkUpdate}
        onSubmitDelete={handleBulkDelete}
        submitting={cohorts.submitting}
      />

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