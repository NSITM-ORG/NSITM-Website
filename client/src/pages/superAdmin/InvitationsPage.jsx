/**
 * InvitationsPage — /superadmin/invitations. Send new invitations
 * (email-only, per the confirmed decision) and manage the list —
 * resend a fresh code+token, or revoke.
 */

import { useEffect, useState } from 'react';
import { Send, RefreshCcw, Ban } from 'lucide-react';
import { useManageState } from '../../hooks/useManageState.js';
import { useSEO } from '../../hooks/useSEO.js';
import { useToast } from '../../hooks/useToast.js';
import { usePagination } from '../../hooks/usePagination.js';
import { FormField } from '../../components/ui/FormField.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { ConfirmModal } from '../../components/ui/ConfirmModal.jsx';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { SkeletonTableRow } from '../../components/ui/Skeleton.jsx';
import { formatDateTime } from '../../utils/formatters.js';
import { validators, validateForm } from '../../utils/validation.js';
import { UserPlus } from 'lucide-react';

const STATUS_MAP = (inv) => {
  if (inv.isUsed) return { label: 'Used', color: 'green' };
  if (inv.isInvalidated) return { label: 'Invalidated', color: 'grey' };
  if (inv.isCodeExpired) return { label: 'Code Expired', color: 'yellow' };
  return { label: 'Pending', color: 'blue' };
};

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'used', label: 'Used' },
  { value: 'invalidated', label: 'Invalidated' },
];

export function InvitationsPage() {
  const { invitations, actions } = useManageState();
  const { showSuccess } = useToast();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(null);
  const [inviting, setInviting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [revokeTarget, setRevokeTarget] = useState(null);
  const pagination = usePagination({ serverPagination: invitations.pagination });

  useSEO({ title: 'Admin Invitations' });

  useEffect(() => {
    actions.fetchInvitations({ status: statusFilter || undefined, page: pagination.page, limit: 25 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, pagination.page]);

  const handleInvite = async (e) => {
    e.preventDefault();
    const { errors, isValid } = validateForm({ email }, { email: [validators.required(), validators.email()] });
    setEmailError(errors.email);
    if (!isValid) return;

    setInviting(true);
    try {
      const message = await actions.createInvitation({ email });
      showSuccess(message);
      setEmail('');
      actions.fetchInvitations({ status: statusFilter || undefined, page: pagination.page, limit: 25 });
    } catch {
      // toast already shown centrally
    } finally {
      setInviting(false);
    }
  };

  const handleResend = async (id) => {
    try {
      const message = await actions.resendInvitationCode(id);
      showSuccess(message);
      actions.fetchInvitations({ status: statusFilter || undefined, page: pagination.page, limit: 25 });
    } catch {
      // toast already shown centrally
    }
  };

  const handleRevoke = async () => {
    try {
      await actions.revokeInvitation(revokeTarget);
      showSuccess('Invitation revoked.');
      setRevokeTarget(null);
    } catch {
      setRevokeTarget(null);
    }
  };

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-bold text-text-primary">Admin Invitations</h1>

      <form onSubmit={handleInvite} className="mb-8 flex flex-col gap-3 rounded-md border border-border bg-surface-elevated p-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <FormField type="email" label="Invite by Email" value={email} onChange={setEmail} error={emailError} placeholder="newadmin@example.com" />
        </div>
        <Button type="submit" icon={Send} loading={inviting}>Send Invitation</Button>
      </form>

      <div className="mb-5 w-48">
        <FormField type="select" options={STATUS_FILTER_OPTIONS} value={statusFilter} onChange={setStatusFilter} />
      </div>

      {invitations.loading ? (
        <table className="w-full text-sm"><tbody>{Array.from({ length: 5 }).map((_, i) => <SkeletonTableRow key={i} columns={5} />)}</tbody></table>
      ) : invitations.list.length === 0 ? (
        <EmptyState icon={UserPlus} title="No invitations yet" description="Send your first invitation above." />
      ) : (
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full min-w-[680px] text-sm">
            <thead className="bg-surface text-left text-text-secondary">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Sent</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invitations.list.map((inv) => {
                const status = STATUS_MAP(inv);
                const isActive = !inv.isUsed && !inv.isInvalidated;
                return (
                  <tr key={inv.id}>
                    <td className="px-4 py-3 font-medium text-text-primary">{inv.email}</td>
                    <td className="px-4 py-3 text-text-secondary">{formatDateTime(inv.createdAt)}</td>
                    <td className="px-4 py-3"><Badge color={status.color}>{status.label}</Badge></td>
                    <td className="px-4 py-3">
                      {isActive && (
                        <div className="flex gap-2">
                          <button onClick={() => handleResend(inv.id)} className="text-text-secondary hover:text-primary" title="Resend"><RefreshCcw size={16} /></button>
                          <button onClick={() => setRevokeTarget(inv.id)} className="text-text-secondary hover:text-error" title="Revoke"><Ban size={16} /></button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Pagination {...pagination} onGoToPage={pagination.goToPage} onNext={pagination.nextPage} onPrevious={pagination.previousPage} />

      <ConfirmModal
        isOpen={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        onConfirm={handleRevoke}
        title="Revoke Invitation"
        message="The invitation link will no longer work. Confirm?"
        confirmLabel="Revoke"
        variant="danger"
      />
    </div>
  );
}

export default InvitationsPage;