/**
 * AuditUnauthorizedPage — /superadmin/audit/unauthorized-access. Closes
 * the FRD FR-06.4 gap identified in the backend hardening pass —
 * Super-Admin-only visibility into 403 attempts.
 */

import { useEffect } from 'react';
import { useManageState } from '../../hooks/useManageState.js';
import { useSEO } from '../../hooks/useSEO.js';
import { usePagination } from '../../hooks/usePagination.js';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { SkeletonText } from '../../components/ui/Skeleton.jsx';
import { formatDateTime } from '../../utils/formatters.js';
import { ShieldAlert } from 'lucide-react';

export function AuditUnauthorizedPage() {
  const { audit, actions } = useManageState();
  const pagination = usePagination({ serverPagination: audit.unauthorizedPagination });

  useSEO({ title: 'Unauthorized Access Audit' });

  useEffect(() => {
    actions.fetchUnauthorizedAccessTrail(pagination.page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-text-primary">Unauthorized Access Attempts</h1>
        <p className="mt-1 text-sm text-text-secondary">Every 403 triggered by a role mismatch, per FRD FR-06.4.</p>
      </div>

      {audit.loading ? (
        <SkeletonText lines={5} />
      ) : audit.unauthorizedAccess.length === 0 ? (
        <EmptyState icon={ShieldAlert} title="No unauthorized access attempts" description="This is a good sign." />
      ) : (
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-surface text-left text-text-secondary">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Actor</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Endpoint</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {audit.unauthorizedAccess.map((log) => (
                <tr key={log.id}>
                  <td className="px-4 py-3 text-text-secondary">{formatDateTime(log.createdAt)}</td>
                  <td className="px-4 py-3 text-text-primary">{log.actorEmail}</td>
                  <td className="px-4 py-3 text-text-secondary">{log.actorRole}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-text-secondary" title={log.endpoint}>{log.endpoint}</td>
                  <td className="px-4 py-3 text-text-secondary">{log.method}</td>
                  <td className="px-4 py-3 text-text-secondary">{log.ipAddress}</td>
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

export default AuditUnauthorizedPage;