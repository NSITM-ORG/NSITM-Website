import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useManageState } from '../../hooks/useManageState';
import { useSEO } from '../../hooks/useSEO';
import { FileText, Edit2, ExternalLink, Plus } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { FormField } from '../../components/ui/FormField';

const EXPECTED_PAGES = [
  { slug: 'terms-of-service', title: 'Terms of Service' },
  { slug: 'privacy-policy', title: 'Privacy Policy' },
  { slug: 'refund-policy', title: 'Refund Policy' },
  { slug: 'attendance-policy', title: 'Attendance Policy' },
  { slug: 'code-of-conduct', title: 'Code of Conduct' },
  { slug: 'payment-plan', title: 'Payment Plan Terms' }
];

export default function LegalPagesList() {
  useSEO({ title: 'Manage Legal Pages' });
  const navigate = useNavigate();
  const { legalPages, actions } = useManageState();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState('');

  const existingSlugs = new Set(legalPages.list?.map(p => p.slug) || []);
  const availablePages = EXPECTED_PAGES.filter(p => !existingSlugs.has(p.slug));
  const options = availablePages.map(p => ({ label: p.title, value: p.slug }));

  useEffect(() => {
    if (availablePages.length > 0 && !selectedSlug) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedSlug(availablePages[0].slug);
    }
  }, [availablePages, selectedSlug]);

  const handleCreate = async () => {
    try {
      const pageInfo = EXPECTED_PAGES.find(p => p.slug === selectedSlug);
      if (!pageInfo) return;
      await actions.createLegalPage({ slug: pageInfo.slug, title: pageInfo.title });
      actions.addToast({ type: 'success', message: 'Legal page created successfully' });
      setIsCreateModalOpen(false);
      navigate(`/admin/legal-pages/${pageInfo.slug}/edit`);
    } catch (err) {
      // toast shown centrally
      actions.addToast({ type: 'error', message: err?.message || 'Failed to create legal page' });
    }
  };

  useEffect(() => {
    actions.fetchAllLegalPagesAdmin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-text-primary">Legal & Policy Pages</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Manage terms of service, privacy policy, and other institutional policies.
          </p>
        </div>
        <Button icon={Plus} onClick={() => setIsCreateModalOpen(true)}>
          New Legal Page
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-text-secondary">
            <thead className="bg-surface-elevated text-xs uppercase text-text-primary">
              <tr>
                <th className="px-6 py-4 font-semibold">Title</th>
                <th className="px-6 py-4 font-semibold">Slug</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Last Updated</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 bg-surface">
              {legalPages.loading && legalPages.list?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-text-secondary">
                    Loading pages...
                  </td>
                </tr>
              ) : legalPages.list?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-text-secondary">
                    No legal pages found.
                  </td>
                </tr>
              ) : (
                legalPages.list.map((page) => (
                  <tr key={page.slug} className="transition-colors hover:bg-surface-elevated/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-md bg-primary/10 p-2 text-primary">
                          <FileText className="h-4 w-4" />
                        </div>
                        <span className="font-medium text-text-primary">{page.hero?.title || page.slug}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{page.slug}</td>
                    <td className="px-6 py-4">
                      <Badge variant={page.status === 'published' ? 'success' : 'warning'}>
                        {page.status === 'published' ? 'Published' : 'Draft'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {page.hero?.lastUpdated || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/legal-pages/${page.slug}/edit`)}
                          className="text-primary hover:text-primary-focus"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          as="a"
                          href={`/${page.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-text-secondary hover:text-text-primary"
                          title="View Public Page"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Legal Page">
        <div className="space-y-4 pt-4">
          {availablePages.length === 0 ? (
            <p className="text-sm text-text-secondary">All expected legal pages have already been created.</p>
          ) : (
            <>
              <p className="text-sm text-text-secondary">Select one of the standard legal pages to initialize it.</p>
              <FormField 
                type="select" 
                label="Page Type" 
                options={options} 
                value={selectedSlug} 
                onChange={(v) => setSelectedSlug(v)} 
              />
              <div className="flex justify-end gap-3 pt-4 border-t border-border mt-4">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} disabled={legalPages.saving}>Create Page</Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
