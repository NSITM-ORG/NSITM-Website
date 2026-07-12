/**
 * JoinRequestsPage — /superadmin/join-requests. "Join Our Community"
 * submissions, fixed 100/page per confirmed decision (usePagination
 * simply reflects whatever the backend's fixed pagination.limit already is).
 */

import { useEffect } from 'react';
import { useManageState } from '../../hooks/useManageState.js';
import { useSEO } from '../../hooks/useSEO.js';
import { useToast } from '../../hooks/useToast.js';
import { usePagination } from '../../hooks/usePagination.js';
import { FormField } from '../../components/ui/FormField.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { SkeletonTableRow } from '../../components/ui/Skeleton.jsx';
import { formatDateTime } from '../../utils/formatters.js';
import { JOIN_COMMUNITY_ROLE_LABELS } from '../../utils/constants.js';
import { useState } from 'react';
import { Users } from 'lucide-react';

const STATUS_OPTIONS = [{ value: '', label: 'All' }, { value: 'new', label: 'New' }, { value: 'reviewed', label: 'Reviewed' }, { value: 'archived', label: 'Archived' }];
const STATUS_COLORS = { new: 'blue', reviewed: 'green', archived: 'grey' };

export function JoinRequestsPage() {
  const { joinRequests, actions } = useManageState();
  const { showSuccess } = useToast();
  const [statusFilter, setStatusFilter] = useState('');
  const pagination = usePagination({ serverPagination: joinRequests.pagination });

  useSEO({ title: 'Join Community Requests' });

  useEffect(() => {
    actions.fetchJoinRequests({ status: statusFilter || undefined, page: pagination.page });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, pagination.page]);

  const handleStatusChange = async (id, status) => {
    try {
      await actions.updateJoinRequestStatus({ id, status });
      showSuccess(`Marked as ${status}.`);
    } catch {
      // toast already shown centrally
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-text-primary">Join Community Requests</h1>
        <p className="mt-1 text-sm text-text-secondary">Developers who submitted interest via the Home page dialog.</p>
      </div>

      <div className="mb-5 w-48">
        <FormField type="select" options={STATUS_OPTIONS} value={statusFilter} onChange={setStatusFilter} />
      </div>

      {joinRequests.loading ? (
        <table className="w-full text-sm"><tbody>{Array.from({ length: 6 }).map((_, i) => <SkeletonTableRow key={i} columns={4} />)}</tbody></table>
      ) : joinRequests.list.length === 0 ? (
        <EmptyState icon={Users} title="No submissions yet" />
      ) : (
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full min-w-[600px] text-sm">
            <thead className="bg-surface text-left text-text-secondary">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {joinRequests.list.map((req) => (
                <tr key={req.id}>
                  <td className="px-4 py-3 font-medium text-text-primary">{req.email}</td>
                  <td className="px-4 py-3 text-text-secondary">{JOIN_COMMUNITY_ROLE_LABELS[req.role]}</td>
                  <td className="px-4 py-3 text-text-secondary">{formatDateTime(req.createdAt)}</td>
                  <td className="px-4 py-3">
                    <select
                      value={req.status}
                      onChange={(e) => handleStatusChange(req.id, e.target.value)}
                      className="rounded-sm border border-border bg-surface-elevated px-2 py-1 text-xs"
                    >
                      <option value="new">New</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="archived">Archived</option>
                    </select>
                    <Badge color={STATUS_COLORS[req.status]} className="ml-2">{req.status}</Badge>
                  </td>
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

export default JoinRequestsPage;