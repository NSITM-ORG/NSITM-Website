/**
 * ContactMessagesPage — /admin/contact-messages. Admin + Super Admin
 * inbox for the footer's "Send Us a Message" form submissions (Batch 10
 * backend addition). Click-to-mark-as-read, archive action available.
 */

import { useEffect, useState } from 'react';
import { useManageState } from '../../hooks/useManageState';
import { useSEO } from '../../hooks/useSEO';
import { useToast } from '../../hooks/useToast';
import { usePagination } from '../../hooks/usePagination';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { FormField } from '../../components/ui/FormField';
import { Pagination } from '../../components/ui/Pagination';
import { EmptyState } from '../../components/ui/EmptyState';
import { SkeletonText } from '../../components/ui/Skeleton';
import { formatRelativeTime } from '../../utils/formatters';
import { MailOpen, Mail, Archive } from 'lucide-react';

const STATUS_COLORS = { new: 'blue', read: 'grey', archived: 'grey' };
const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'read', label: 'Read' },
  { value: 'archived', label: 'Archived' },
];

export function ContactMessagesPage() {
  const { contactMessages, actions } = useManageState();
  const { showSuccess } = useToast();
  const [statusFilter, setStatusFilter] = useState('');
  const pagination = usePagination({ serverPagination: contactMessages.pagination });

  useSEO({ title: 'Contact Messages' });

  useEffect(() => {
    actions.fetchContactMessages({ status: statusFilter || undefined, page: pagination.page, limit: 25 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, pagination.page]);

  const handleStatusChange = async (id, status) => {
    try {
      await actions.updateContactMessageStatus({ id, status });
      showSuccess(`Marked as ${status}.`);
    } catch {
      // toast already shown centrally
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold text-text-primary">Contact Messages</h1>
        <div className="w-48">
          <FormField type="select" options={STATUS_OPTIONS} value={statusFilter} onChange={setStatusFilter} />
        </div>
      </div>

      {contactMessages.loading ? (
        <SkeletonText lines={5} />
      ) : contactMessages.list.length === 0 ? (
        <EmptyState icon={Mail} title="No messages" description="Contact form submissions will appear here." />
      ) : (
        <div className="space-y-3">
          {contactMessages.list.map((msg) => (
            <div key={msg.id} className="rounded-md border border-border bg-surface-elevated p-4">
              <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-text-primary">{msg.name}</p>
                  <a href={`mailto:${msg.email}`} className="text-sm text-primary hover:underline">
                    {msg.email}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Badge color={STATUS_COLORS[msg.status]}>{msg.status}</Badge>
                  <span className="text-xs text-text-secondary">{formatRelativeTime(msg.createdAt)}</span>
                </div>
              </div>
              <p className="mb-3 text-sm text-text-secondary">{msg.message}</p>
              <div className="flex gap-2">
                {msg.status === 'new' && (
                  <Button size="sm" variant="outline" icon={MailOpen} onClick={() => handleStatusChange(msg.id, 'read')}>
                    Mark as Read
                  </Button>
                )}
                {msg.status !== 'archived' && (
                  <Button size="sm" variant="ghost" icon={Archive} onClick={() => handleStatusChange(msg.id, 'archived')}>
                    Archive
                  </Button>
                )}
              </div>
            </div>
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
    </div>
  );
}

export default ContactMessagesPage;