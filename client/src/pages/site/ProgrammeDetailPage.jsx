/**
 * src/pages/site/ProgrammeDetailPage.jsx (REPLACES the F6 version)
 *
 * ProgrammeDetailPage — Stack iii. Adds rendering for subDescription
 * and bulletPoints (F13 backend fields), and expands the sidebar's
 * payment preview to show the FULL 3-instalment breakdown up front
 * (mirroring Issue 5's Step 3 fix — a prospective student browsing the
 * detail page sees the same complete payment picture they'll see once
 * they start enrolling, not just a single "starting from" figure).
 *
 * Image handling: hero banner now uses ImageOrPlaceholder (F16) instead
 * of no image at all — category-tinted gradient placeholder with the
 * programme's initials, matching the ProgrammeCard's visual language.
 */

import { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {  Clock, CheckCircle2, MessageCircle, ListChecks, FileQuestion } from 'lucide-react';
import { useManageState } from '../../hooks/useManageState';
import { useSEO } from '../../hooks/useSEO';
import { Badge } from '../../components/ui/Badge';
import { ImageOrPlaceholder } from '../../components/ui/ImageOrPlaceholder';
import { SkeletonText } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatCurrency } from '../../utils/formatters';
import { PROGRAMME_STATUS, PROGRAMME_CATEGORY_LABELS } from '../../utils/constants';

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

  const instalmentRows = useMemo(() => {
    const breakdown = programme?.fees?.instalment?.breakdown;
    if (!breakdown?.length) return [];
    const ordinal = { 1: 'First', 2: 'Second', 3: 'Third' };
    return breakdown
      .slice()
      .sort((a, b) => a.instalmentNumber - b.instalmentNumber)
      .map((row) => ({
        ...row,
        label: `${ordinal[row.instalmentNumber] || row.instalmentNumber} Payment`,
        dueLabel: row.dueDayOffset === 0 ? 'At enrollment' : `${row.dueDayOffset} days after enrollment`,
      }));
  }, [programme]);

  if (programmes.loading) {
    return (
      <div className="mx-auto max-w-content px-4 py-14 sm:px-6 lg:px-8">
        <SkeletonText lines={6} />
      </div>
    );
  };

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
  };

  const isActive = programme.status === PROGRAMME_STATUS.ACTIVE;
  const whatsappLink = settings.publicSettings?.whatsapp?.link;

  return (
    <div>
      {/* ── Hero banner ─────────────────────────────────────────── */}
      <ImageOrPlaceholder
        alt={programme.name}
        className="h-56 w-full sm:h-72"
        placeholderText={programme.name.slice(0, 2).toUpperCase()}
      />

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
              {programme.enrollmentCount > 0 && <Badge color="blue">{programme.enrollmentCount} enrolled</Badge>}
            </div>
            <h1 className="mb-4 font-heading text-3xl font-bold text-text-primary">{programme.name}</h1>
            <p className="leading-relaxed text-text-secondary">{programme.description}</p>

            {programme.subDescription && (
              <p className="mt-4 leading-relaxed text-text-secondary">{programme.subDescription}</p>
            )}

            {programme.bulletPoints?.length > 0 && (
              <div className="mt-8">
                <h2 className="mb-3 flex items-center gap-2 font-heading text-lg font-semibold text-text-primary">
                  <ListChecks size={20} className="text-secondary" /> What You'll Learn
                </h2>
                <ul className="grid gap-2.5 sm:grid-cols-2">
                  {programme.bulletPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                      <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-secondary" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {programme.prerequisites && (
              <div className="mt-8">
                <h2 className="mb-2 font-heading text-lg font-semibold text-text-primary">Prerequisites</h2>
                <p className="flex items-start gap-2 text-sm text-text-secondary">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-secondary" /> {programme.prerequisites}
                </p>
              </div>
            )}
          </div>

          {/* ── Sidebar: expanded payment preview ────────────────── */}
          <aside className="h-fit rounded-lg border border-border bg-surface-elevated p-6 sticky top-24">
            <p className="mb-4 flex items-center gap-2 text-sm text-text-secondary">
              <Clock size={16} /> {programme.duration}
            </p>

            {isActive && (
              <div className="mb-5 space-y-3 border-b border-border pb-5">
                <div>
                  <p className="text-xs text-text-secondary">Full Payment</p>
                  <p className="font-heading text-2xl font-bold text-primary">{formatCurrency(programme.fees?.full)}</p>
                </div>

                {instalmentRows.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium text-text-secondary">
                      Or pay in 3 instalments — {formatCurrency(programme.fees.instalment.total)} total
                    </p>
                    <div className="space-y-1.5 rounded-md bg-surface p-3">
                      {instalmentRows.map((row) => (
                        <div key={row.instalmentNumber} className="flex items-center justify-between text-xs">
                          <span className="text-text-secondary">{row.label} · {row.dueLabel}</span>
                          <span className="font-semibold text-text-primary">{formatCurrency(row.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {isActive ? (
              <Link
                to={`/enroll?programme=${programme.slug}`}
                className="block w-full rounded-sm bg-primary py-3 text-center font-semibold text-white transition-all hover:brightness-90 active:scale-[0.98]"
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
                    className="flex w-full items-center justify-center gap-2 rounded-sm bg-secondary py-3 font-semibold text-white transition-all hover:brightness-90"
                  >
                    <MessageCircle size={18} /> Ask on WhatsApp
                  </a>
                )}
              </>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

export default ProgrammeDetailPage;