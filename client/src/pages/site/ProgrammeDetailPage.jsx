/**
 * ProgrammeDetailPage — Stack iii: full programme detail (name,
 * description, duration, fees, prerequisites, cohort status). Active
 * programmes show Enroll Now → /enroll?programme=SLUG (backend resolves
 * the slug's Mongo _id server-side via the existing enrollment Step 1
 * flow's programme dropdown pre-fill — see EnrollmentPage in Batch F7).
 * Coming Soon programmes show a WhatsApp contact prompt instead.
 */

import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Clock, CheckCircle2, MessageCircle } from 'lucide-react';
import { useManageState } from '../../hooks/useManageState';
import { useSEO } from '../../hooks/useSEO';
import { Badge } from '../../components/ui/Badge';
import { SkeletonText } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatCurrency } from '../../utils/formatters';
import { PROGRAMME_STATUS, PROGRAMME_CATEGORY_LABELS } from '../../utils/constants';
import { FileQuestion } from 'lucide-react';

export function ProgrammeDetailPage() {
  const { slug } = useParams();
  const { programmes, settings, actions } = useManageState();

  useEffect(() => {
    actions.fetchProgrammeBySlug(slug);
    if (!settings.publicSettings) actions.fetchPublicSettings();
    return () => actions.clearCurrentProgramme();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const programme = programmes.currentProgramme;

  useSEO({
    title: programme?.name || 'Programme Details',
    description: programme?.description?.slice(0, 155),
    jsonLd: programme
      ? {
          '@type': 'Course',
          name: programme.name,
          description: programme.description,
          provider: { '@type': 'Organization', name: 'Nextserve School of Information Technology and Management' },
        }
      : undefined,
  });

  if (programmes.loading) {
    return (
      <div className="mx-auto max-w-content px-4 py-14 sm:px-6 lg:px-8">
        <SkeletonText lines={6} />
      </div>
    );
  }

  if (!programme) {
    return (
      <div className="mx-auto max-w-content px-4 py-20 sm:px-6 lg:px-8">
        <EmptyState
          icon={FileQuestion}
          title="Programme not found"
          description="This programme may have been removed or the link is incorrect."
          actionLabel="Browse All Programmes"
          onAction={() => (window.location.href = '/programmes')}
        />
      </div>
    );
  }

  const isActive = programme.status === PROGRAMME_STATUS.ACTIVE;
  const whatsappLink = settings.publicSettings?.whatsapp?.link;

  return (
    <div className="mx-auto max-w-content px-4 py-14 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-text-secondary">
        <Link to="/" className="hover:text-primary">Home</Link> {' > '}
        <Link to="/programmes" className="hover:text-primary">Programmes</Link> {' > '}
        <span className="text-text-primary">{programme.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-3">
        {/* ── Main content ─────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge color="primary">{PROGRAMME_CATEGORY_LABELS[programme.category]}</Badge>
            <Badge color={isActive ? 'green' : 'grey'}>{isActive ? 'Active' : 'Coming Soon'}</Badge>
          </div>
          <h1 className="mb-4 font-heading text-3xl font-bold text-text-primary">{programme.name}</h1>
          <p className="leading-relaxed text-text-secondary">{programme.description}</p>

          {programme.prerequisites && (
            <div className="mt-6">
              <h2 className="mb-2 font-heading text-lg font-semibold text-text-primary">Prerequisites</h2>
              <p className="flex items-start gap-2 text-sm text-text-secondary">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-secondary" /> {programme.prerequisites}
              </p>
            </div>
          )}
        </div>

        {/* ── Sidebar ──────────────────────────────────────────── */}
        <aside className="rounded-lg border border-border bg-surface-elevated p-6 h-fit sticky top-24">
          <p className="mb-4 flex items-center gap-2 text-sm text-text-secondary">
            <Clock size={16} /> {programme.duration}
          </p>

          {isActive && (
            <div className="mb-4 space-y-1 border-b border-border pb-4">
              <p className="text-xs text-text-secondary">Full Payment</p>
              <p className="font-heading text-2xl font-bold text-primary">{formatCurrency(programme.fees?.full)}</p>
              {programme.fees?.instalment?.total && (
                <p className="text-xs text-text-secondary">
                  Or {formatCurrency(programme.fees.instalment.total)} in 3 instalments
                </p>
              )}
            </div>
          )}

          {isActive ? (
            <Link
              to={`/enroll?programme=${programme.slug}`}
              className="block w-full rounded-sm bg-primary py-3 text-center font-medium text-white transition-all hover:brightness-90 active:scale-[0.98]"
            >
              Enroll Now
            </Link>
          ) : (
            <>
              <p className="mb-3 text-sm text-text-secondary">
                This programme isn't open for enrollment yet. Reach out and we'll notify you when it launches.
              </p>
              {whatsappLink && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-sm bg-secondary py-3 font-medium text-white transition-all hover:brightness-90"
                >
                  <MessageCircle size={18} /> Ask on WhatsApp
                </a>
              )}
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

export default ProgrammeDetailPage;