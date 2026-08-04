/**
 * AuditPasswordResetsPage — /superadmin/audit/password-resets. Covers
 * self + all Admins + all Super Admins, per the auth overhaul's point 8.
 */

import { useEffect, useState } from 'react';
import { useManageState } from '../../hooks/useManageState';
import { useSEO } from '../../hooks/useSEO';
import { usePagination } from '../../hooks/usePagination';
import { FormField } from '../../components/ui/FormField';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { EmptyState } from '../../components/ui/EmptyState';
import { SkeletonText } from '../../components/ui/Skeleton';
import { formatDateTime } from '../../utils/formatters';
import { FileText } from 'lucide-react';

const ACTION_LABELS = {
  PASSWORD_RESET_REQUEST: 'Reset requested',
  PASSWORD_RESET_COMPLETE: 'Reset completed',
  ADMIN_PASSWORD_RESET_BY_SUPER: 'Reset by Super Admin',
};
const ROLE_OPTIONS = [{ value: '', label: 'All Roles' }, { value: 'admin', label: 'Admin' }, { value: 'super_admin', label: 'Super Admin' }];

export function AuditPasswordResetsPage() {
  const { audit, actions } = useManageState();
  const [roleFilter, setRoleFilter] = useState('');
  const pagination = usePagination({ serverPagination: audit.passwordResetsPagination });

  useSEO({ title: 'Password Reset Audit' });

  useEffect(() => {
    actions.fetchPasswordResetTrail({ role: roleFilter || undefined, page: pagination.page, limit: 25 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter, pagination.page]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-text-primary">Password Reset Audit</h1>
        <p className="mt-1 text-sm text-text-secondary">Covers self, all Admins, and all Super Admins.</p>
      </div>

      <div className="mb-5 w-48">
        <FormField type="select" options={ROLE_OPTIONS} value={roleFilter} onChange={setRoleFilter} />
      </div>

      {audit.loading ? (
        <SkeletonText lines={5} />
      ) : audit.passwordResets.length === 0 ? (
        <EmptyState icon={FileText} title="No password reset activity" />
      ) : (
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-surface text-left text-text-secondary">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Target</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Initiated By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {audit.passwordResets.map((log) => (
                <tr key={log.id}>
                  <td className="px-4 py-3 text-text-secondary">{formatDateTime(log.createdAt)}</td>
                  <td className="px-4 py-3">{ACTION_LABELS[log.action] || log.action}</td>
                  <td className="px-4 py-3 text-text-primary">{log.metadata?.targetEmail || '—'}</td>
                  <td className="px-4 py-3"><Badge color={log.metadata?.targetRole === 'super_admin' ? 'primary' : 'grey'}>{log.metadata?.targetRole || '—'}</Badge></td>
                  <td className="px-4 py-3 text-text-secondary">{log.metadata?.initiatedBy === 'super_admin' ? 'Super Admin' : 'Self'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination {...pagination} onGoToPage={pagination.goToPage} onNext={pagination.nextPage} onPrevious={pagination.previousPage} />
    </div>
  );
}

export default AuditPasswordResetsPage;