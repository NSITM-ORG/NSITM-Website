/**
 * AccountManagementPage — /superadmin/accounts. Lists Admin + Super
 * Admin accounts, with role filter, edit-in-modal, deactivate/
 * reactivate, delete (self-protected — no Delete button on own row,
 * mirroring the backend's BR06 check), and reset-password trigger.
 * "Invite New Admin" links to the Invitations page rather than creating
 * inline, since account creation now exclusively flows through the
 * invitation system.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Pencil, Ban, RotateCcw, Trash2, KeyRound } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useManageState } from '../../hooks/useManageState';
import { useSEO } from '../../hooks/useSEO';
import { useToast } from '../../hooks/useToast';
import { usePagination } from '../../hooks/usePagination';
import { FormField } from '../../components/ui/FormField';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { Pagination } from '../../components/ui/Pagination';
import { EmptyState } from '../../components/ui/EmptyState';
import { SkeletonTableRow } from '../../components/ui/Skeleton';
import { formatDate } from '../../utils/formatters';
import { ShieldCheck } from 'lucide-react';

const ROLE_OPTIONS = [{ value: '', label: 'All Roles' }, { value: 'admin', label: 'Admin' }, { value: 'super_admin', label: 'Super Admin' }];

export function AccountManagementPage() {
  const { user: currentUser } = useAuth();
  const { accounts, actions } = useManageState();
  const { showSuccess } = useToast();
  const [roleFilter, setRoleFilter] = useState('');
  const [editTarget, setEditTarget] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null); // { type, account }
  const pagination = usePagination({ serverPagination: accounts.pagination });

  useSEO({ title: 'Admin Accounts' });

  useEffect(() => {
    actions.fetchAllAccounts({ role: roleFilter || undefined, page: pagination.page, limit: 25 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter, pagination.page]);

  const runAction = async (type, account) => {
    try {
      if (type === 'deactivate') {
        await actions.deactivateAccount(account.id);
        showSuccess(`${account.email} has been deactivated.`);
      } else if (type === 'reactivate') {
        await actions.reactivateAccount(account.id);
        showSuccess(`${account.email} has been reactivated.`);
      } else if (type === 'delete') {
        await actions.deleteAccount(account.id);
        showSuccess(`${account.email} has been permanently deleted.`);
      } else if (type === 'reset-password') {
        const message = await actions.resetAccountPassword(account.id);
        showSuccess(message);
      }
      setConfirmAction(null);
    } catch {
      setConfirmAction(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold text-text-primary">Admin Accounts</h1>
        <Link to="/superadmin/invitations">
          <Button icon={UserPlus}>Invite New Admin</Button>
        </Link>
      </div>

      <div className="mb-5 w-48">
        <FormField type="select" options={ROLE_OPTIONS} value={roleFilter} onChange={setRoleFilter} />
      </div>

      {accounts.loading ? (
        <table className="w-full text-sm"><tbody>{Array.from({ length: 6 }).map((_, i) => <SkeletonTableRow key={i} columns={6} />)}</tbody></table>
      ) : accounts.list.length === 0 ? (
        <EmptyState icon={ShieldCheck} title="No accounts found" />
      ) : (
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-surface text-left text-text-secondary">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Last Login</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {accounts.list.map((acc) => {
                const isSelf = acc.id === currentUser?.id;
                return (
                  <tr key={acc.id}>
                    <td className="px-4 py-3 font-medium text-text-primary">{acc.profile?.fullName}</td>
                    <td className="px-4 py-3 text-text-secondary">{acc.email}</td>
                    <td className="px-4 py-3"><Badge color={acc.role === 'super_admin' ? 'primary' : 'grey'}>{acc.role === 'super_admin' ? 'Super Admin' : 'Admin'}</Badge></td>
                    <td className="px-4 py-3"><Badge color={acc.isActive ? 'green' : 'red'}>{acc.isActive ? 'Active' : 'Inactive'}</Badge></td>
                    <td className="px-4 py-3 text-text-secondary">{acc.lastLogin ? formatDate(acc.lastLogin) : 'Never'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => setEditTarget(acc)} className="text-text-secondary hover:text-primary" title="Edit"><Pencil size={16} /></button>
                        <button onClick={() => setConfirmAction({ type: 'reset-password', account: acc })} className="text-text-secondary hover:text-primary" title="Reset Password"><KeyRound size={16} /></button>
                        {acc.isActive ? (
                          !isSelf && <button onClick={() => setConfirmAction({ type: 'deactivate', account: acc })} className="text-text-secondary hover:text-warning" title="Deactivate"><Ban size={16} /></button>
                        ) : (
                          <button onClick={() => setConfirmAction({ type: 'reactivate', account: acc })} className="text-text-secondary hover:text-secondary" title="Reactivate"><RotateCcw size={16} /></button>
                        )}
                        {!isSelf && <button onClick={() => setConfirmAction({ type: 'delete', account: acc })} className="text-text-secondary hover:text-error" title="Delete"><Trash2 size={16} /></button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Pagination {...pagination} onGoToPage={pagination.goToPage} onNext={pagination.nextPage} onPrevious={pagination.previousPage} />

      <EditAccountModal account={editTarget} onClose={() => setEditTarget(null)} />

      <ConfirmModal
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => runAction(confirmAction.type, confirmAction.account)}
        title={{ deactivate: 'Deactivate Account', reactivate: 'Reactivate Account', delete: 'Delete Account', 'reset-password': 'Reset Password' }[confirmAction?.type]}
        message={
          confirmAction?.type === 'delete'
            ? `This permanently deletes ${confirmAction.account?.email}'s account. This action cannot be undone.`
            : confirmAction?.type === 'reset-password'
            ? `A password reset link will be sent to ${confirmAction.account?.email}.`
            : `Confirm this action for ${confirmAction?.account?.email}?`
        }
        confirmLabel="Confirm"
        variant={confirmAction?.type === 'delete' ? 'danger' : 'primary'}
        loading={accounts.submitting}
      />
    </div>
  );
}

function EditAccountModal({ account, onClose }) {
  const { accounts, actions } = useManageState();
  const { showSuccess } = useToast();
  const [form, setForm] = useState({ name: '', email: '', phone: '' });

  useEffect(() => {
    if (account) setForm({ name: account.profile?.fullName || '', email: account.email || '', phone: account.profile?.phone || '' });
  }, [account]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await actions.updateAccount({ id: account.id, data: form });
      showSuccess('Account updated successfully.');
      onClose();
    } catch {
      // toast already shown centrally
    }
  };

  return (
    <Modal isOpen={!!account} onClose={onClose} title="Edit Account" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Full Name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} />
        <FormField type="email" label="Email" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} />
        <FormField type="tel" label="Phone" value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} />
        <Button type="submit" loading={accounts.submitting} fullWidth>Save Changes</Button>
      </form>
    </Modal>
  );
}

export default AccountManagementPage;