/**
 * FaqManagementPage — /superadmin/faqs. Full CRUD for the CMS-lite FAQ
 * system. Category field is a text input with a `<datalist>` of
 * suggestions (DEFAULT_FAQ_CATEGORIES + already-used categories from the
 * backend), per the confirmed "both options" decision — free typing
 * still works for a brand-new category.
 */

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useManageState } from '../../hooks/useManageState.js';
import { useSEO } from '../../hooks/useSEO.js';
import { useToast } from '../../hooks/useToast.js';
import { usePagination } from '../../hooks/usePagination.js';
import { FormField } from '../../components/ui/FormField.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { ConfirmModal } from '../../components/ui/ConfirmModal.jsx';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { SkeletonTableRow } from '../../components/ui/Skeleton.jsx';
import { HelpCircle } from 'lucide-react';

export function FaqManagementPage() {
  const { faqs, actions } = useManageState();
  const { showSuccess } = useToast();
  const [formModal, setFormModal] = useState(null); // null | 'create' | faq object (edit)
  const [deleteTarget, setDeleteTarget] = useState(null);
  const pagination = usePagination({ serverPagination: faqs.pagination });

  useSEO({ title: 'FAQ Management' });

  useEffect(() => {
    actions.fetchAllFaqsAdmin({ page: pagination.page, limit: 25 });
    actions.fetchFaqCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page]);

  const handleDelete = async () => {
    try {
      await actions.deleteFaq(deleteTarget.id);
      showSuccess('FAQ deleted.');
      setDeleteTarget(null);
    } catch {
      setDeleteTarget(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold text-text-primary">FAQ Management</h1>
        <Button icon={Plus} onClick={() => setFormModal('create')}>Add FAQ</Button>
      </div>

      {faqs.loading ? (
        <table className="w-full text-sm"><tbody>{Array.from({ length: 6 }).map((_, i) => <SkeletonTableRow key={i} columns={5} />)}</tbody></table>
      ) : faqs.adminList.length === 0 ? (
        <EmptyState icon={HelpCircle} title="No FAQs yet" description="Add your first FAQ to populate the public /faq page." actionLabel="Add FAQ" onAction={() => setFormModal('create')} />
      ) : (
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-surface text-left text-text-secondary">
              <tr>
                <th className="px-4 py-3">Question</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {faqs.adminList.map((faq) => (
                <tr key={faq.id}>
                  <td className="max-w-xs truncate px-4 py-3 font-medium text-text-primary">{faq.question}</td>
                  <td className="px-4 py-3 text-text-secondary">{faq.category}</td>
                  <td className="px-4 py-3"><Badge color={faq.isPublished ? 'green' : 'grey'}>{faq.isPublished ? 'Published' : 'Draft'}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setFormModal(faq)} className="text-text-secondary hover:text-primary"><Pencil size={16} /></button>
                      <button onClick={() => setDeleteTarget(faq)} className="text-text-secondary hover:text-error"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination {...pagination} onGoToPage={pagination.goToPage} onNext={pagination.nextPage} onPrevious={pagination.previousPage} />

      <FaqFormModal isOpen={!!formModal} data={formModal !== 'create' ? formModal : null} onClose={() => setFormModal(null)} />

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete FAQ"
        message="This permanently removes this FAQ. This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}

function FaqFormModal({ isOpen, data, onClose }) {
  const { faqs, actions } = useManageState();
  const { showSuccess } = useToast();
  const isEdit = !!data;
  const [form, setForm] = useState({ question: '', answer: '', category: '', isPublished: true, sortOrder: 0 });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (data) setForm({ question: data.question, answer: data.answer, category: data.category, isPublished: data.isPublished, sortOrder: data.sortOrder || 0 });
    else setForm({ question: '', answer: '', category: '', isPublished: true, sortOrder: 0 });
  }, [data, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (form.question.length < 5) errs.question = 'Question must be at least 5 characters.';
    if (form.answer.length < 5) errs.answer = 'Answer must be at least 5 characters.';
    if (!form.category.trim()) errs.category = 'Category is required.';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      if (isEdit) {
        await actions.updateFaq({ id: data.id, data: form });
        showSuccess('FAQ updated.');
      } else {
        await actions.createFaq(form);
        showSuccess('FAQ created.');
      }
      onClose();
    } catch {
      // toast already shown centrally
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit FAQ' : 'Add FAQ'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField type="textarea" label="Question" value={form.question} onChange={(v) => setForm((f) => ({ ...f, question: v }))} error={errors.question} rows={2} required />
        <FormField type="textarea" label="Answer" value={form.answer} onChange={(v) => setForm((f) => ({ ...f, answer: v }))} error={errors.answer} rows={4} required />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-primary">Category</label>
          <input
            list="faq-category-suggestions"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            className="w-full rounded-sm border border-border bg-surface-elevated px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Type or select a category"
          />
          <datalist id="faq-category-suggestions">
            {faqs.categories.map((c) => <option key={c} value={c} />)}
          </datalist>
          {errors.category && <p className="mt-1.5 text-sm text-error">{errors.category}</p>}
        </div>

        <FormField type="checkbox" label="Published (visible on public FAQ page)" value={form.isPublished} onChange={(v) => setForm((f) => ({ ...f, isPublished: v }))} />
        <FormField type="number" label="Sort Order" value={form.sortOrder} onChange={(v) => setForm((f) => ({ ...f, sortOrder: v }))} hint="Lower numbers appear first within a category" />

        <Button type="submit" loading={faqs.submitting} fullWidth>{isEdit ? 'Save Changes' : 'Create FAQ'}</Button>
      </form>
    </Modal>
  );
}

export default FaqManagementPage;