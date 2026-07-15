/**
 * ProgrammeManagementPage — /superadmin/programmes. Full programme list
 * with search/category/status filters, links to Create/Edit, soft-delete
 * with confirmation.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useManageState } from '../../hooks/useManageState';
import { useSEO } from '../../hooks/useSEO';
import { useToast } from '../../hooks/useToast';
import { usePagination } from '../../hooks/usePagination';
import { FormField } from '../../components/ui/FormField';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { Pagination } from '../../components/ui/Pagination';
import { EmptyState } from '../../components/ui/EmptyState';
import { SkeletonTableRow } from '../../components/ui/Skeleton';
import { formatCurrency } from '../../utils/formatters';
import { PROGRAMME_CATEGORY_LABELS } from '../../utils/constants';
import { BookOpen } from 'lucide-react';

const CATEGORY_OPTIONS = [{ value: '', label: 'All Categories' }, ...Object.entries(PROGRAMME_CATEGORY_LABELS).map(([value, label]) => ({ value, label }))];
const STATUS_OPTIONS = [{ value: '', label: 'All Statuses' }, { value: 'active', label: 'Active' }, { value: 'coming_soon', label: 'Coming Soon' }];

export function ProgrammeManagementPage() {
  const { programmes, actions } = useManageState();
  const { showSuccess } = useToast();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const pagination = usePagination({ serverPagination: programmes.pagination });

  useSEO({ title: 'Programme Management' });

  useEffect(() => {
    actions.fetchAdminProgrammes({ search, category, status, page: pagination.page, limit: 25 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, status, pagination.page]);

  const handleDelete = async () => {
    try {
      await actions.deleteProgramme(deleteTarget.id);
      showSuccess(`"${deleteTarget.name}" has been removed.`);
      setDeleteTarget(null);
    } catch {
      // toast already shown centrally
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold text-text-primary">Programmes</h1>
        <Link to="/superadmin/programmes/create">
          <Button icon={Plus}>Create Programme</Button>
        </Link>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <FormField placeholder="Search programmes" value={search} onChange={setSearch} />
        <FormField type="select" options={CATEGORY_OPTIONS} value={category} onChange={setCategory} />
        <FormField type="select" options={STATUS_OPTIONS} value={status} onChange={setStatus} />
      </div>

      {programmes.loading ? (
        <table className="w-full text-sm"><tbody>{Array.from({ length: 6 }).map((_, i) => <SkeletonTableRow key={i} columns={6} />)}</tbody></table>
      ) : programmes.adminList.length === 0 ? (
        <EmptyState icon={BookOpen} title="No programmes found" description="Adjust your filters or create a new programme." />
      ) : (
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-surface text-left text-text-secondary">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Fee</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {programmes.adminList.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-medium text-text-primary">{p.name}</td>
                  <td className="px-4 py-3 text-text-secondary">{PROGRAMME_CATEGORY_LABELS[p.category]}</td>
                  <td className="px-4 py-3 text-text-secondary">{p.duration}</td>
                  <td className="px-4 py-3 text-text-secondary">{formatCurrency(p.fees?.full)}</td>
                  <td className="px-4 py-3"><Badge color={p.status === 'active' ? 'green' : 'grey'}>{p.status === 'active' ? 'Active' : 'Coming Soon'}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link to={`/superadmin/programmes/${p.id}/edit`} className="text-text-secondary hover:text-primary"><Pencil size={16} /></Link>
                      <button onClick={() => setDeleteTarget(p)} className="text-text-secondary hover:text-error"><Trash2 size={16} /></button>
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
        title="Remove Programme"
        message={`This will remove "${deleteTarget?.name}" from the public website. Confirm?`}
        confirmLabel="Remove"
        variant="danger"
      />
    </div>
  );
}

export default ProgrammeManagementPage;