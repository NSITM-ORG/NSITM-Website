/**
 * src/pages/site/ActiveCohortDetailPage.jsx (REPLACES the F17 version)
 * Matches the Programme Detail page's richness: hero, badges, meta-info
 * card, full description + subDescription + bulletPoints, prerequisites,
 * full 3-instalment breakdown. Completed cohorts show a concluded notice
 * instead of an enroll action.
 */

import { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Calendar, Globe, Building2, Users, MessageCircle, ListChecks, CheckCircle2, Clock, FileQuestion } from 'lucide-react';
import { useManageState } from '../../hooks/useManageState';
import { useSEO } from '../../hooks/useSEO';
import { Badge } from '../../components/ui/Badge';
import { ImageOrPlaceholder } from '../../components/ui/ImageOrPlaceholder';
import { SkeletonText } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { DELIVERY_FORMAT_LABELS, COHORT_STATUS, PROGRAMME_CATEGORY_LABELS } from '../../utils/constants';

export function ActiveCohortDetailPage() {
  const { id } = useParams();
  const { cohorts, settings, actions } = useManageState();

  useEffect(() => {
    actions.fetchCohortById(id);
    if (!settings.publicSettings) actions.fetchPublicSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const cohort = cohorts.currentCohort;
  useSEO({ title: cohort ? `${cohort.programme?.name} — ${cohort.name}` : 'Cohort Details' });

  const instalmentRows = useMemo(() => {
    const breakdown = cohort?.programme?.fees?.instalment?.breakdown;
    if (!breakdown?.length) return [];
    const ordinal = { 1: 'First', 2: 'Second', 3: 'Third' };
    return breakdown.slice().sort((a, b) => a.instalmentNumber - b.instalmentNumber).map((row) => ({
      ...row, label: `${ordinal[row.instalmentNumber]} Payment`,
      dueLabel: row.dueDayOffset === 0 ? 'At enrollment' : `${row.dueDayOffset} days after enrollment`,
    }));
  }, [cohort]);

  if (cohorts.loading) return <div className="mx-auto max-w-3xl px-4 py-14"><SkeletonText lines={8} /></div>;

  if (!cohort) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <EmptyState icon={FileQuestion} title="Cohort not found" description="This cohort may have concluded or the link is incorrect." actionLabel="View All Cohorts" onAction={() => (window.location.href = '/cohorts')} />
      </div>
    );
  }

  const isCompleted = cohort.status === COHORT_STATUS.COMPLETED;
  const whatsappLink = settings.publicSettings?.whatsapp?.link;
  const programme = cohort.programme;

  return (
    <div>
      <ImageOrPlaceholder alt={programme?.name} className="h-56 w-full sm:h-72" placeholderText={programme?.name?.slice(0, 2).toUpperCase()} />

      <div className="mx-auto max-w-content px-4 py-14 sm:px-6">
        <Link to="/cohorts" className="mb-6 flex w-fit items-center gap-1.5 text-sm text-text-secondary hover:text-primary"><ChevronLeft size={16} /> All Cohorts</Link>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          {programme?.category && <Badge color="primary">{PROGRAMME_CATEGORY_LABELS[programme.category]}</Badge>}
          <Badge color={isCompleted ? 'grey' : 'green'}>{isCompleted ? 'Completed' : 'Active'}</Badge>
        </div>
        <p className="mb-1 text-sm font-semibold text-text-secondary">{programme?.name}</p>
        <h1 className="mb-6 font-heading text-3xl font-bold text-text-primary">{cohort.name}</h1>

        <div className="mb-8 grid gap-4 rounded-lg border border-border bg-surface-elevated p-6 sm:grid-cols-2">
          <InfoRow icon={Calendar} label="Runs" value={`${formatDate(cohort.startDate)} – ${formatDate(cohort.endDate)}`} />
          <InfoRow icon={cohort.deliveryFormat === 'in_person' ? Building2 : Globe} label="Delivery Format" value={DELIVERY_FORMAT_LABELS[cohort.deliveryFormat] || cohort.deliveryFormat} />
          {!isCompleted && <InfoRow icon={Calendar} label="Enrollment Window" value={`${formatDate(cohort.enrollmentStartDate)} – ${formatDate(cohort.enrollmentEndDate)}`} />}
          {programme?.duration && <InfoRow icon={Clock} label="Programme Duration" value={programme.duration} />}
          {cohort.maxCapacity && <InfoRow icon={Users} label="Capacity" value={`${cohort.currentEnrollmentCount || 0} / ${cohort.maxCapacity} spots filled`} />}
        </div>

        {programme?.description && (
          <section className="mb-8">
            <h2 className="mb-2 font-heading text-lg font-semibold text-text-primary">About This Programme</h2>
            <p className="leading-relaxed text-text-secondary">{programme.description}</p>
            {programme.subDescription && <p className="mt-3 leading-relaxed text-text-secondary">{programme.subDescription}</p>}
          </section>
        )}

        {programme?.bulletPoints?.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 flex items-center gap-2 font-heading text-lg font-semibold text-text-primary"><ListChecks size={20} className="text-secondary" /> What You'll Learn</h2>
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {programme.bulletPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-text-secondary"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-secondary" /> {point}</li>
              ))}
            </ul>
          </section>
        )}

        {programme?.prerequisites && (
          <section className="mb-8">
            <h2 className="mb-2 font-heading text-lg font-semibold text-text-primary">Prerequisites</h2>
            <p className="text-sm text-text-secondary">{programme.prerequisites}</p>
          </section>
        )}

        {!isCompleted && programme?.fees && (
          <section className="mb-8 rounded-lg border border-border bg-surface-elevated p-6">
            <h2 className="mb-4 font-heading text-lg font-semibold text-text-primary">Payment Options</h2>
            <p className="mb-3 text-sm text-text-secondary">Full Payment: <span className="font-semibold text-primary">{formatCurrency(programme.fees.full)}</span></p>
            {instalmentRows.length > 0 && (
              <div className="space-y-1.5 rounded-md bg-surface p-3">
                {instalmentRows.map((row) => (
                  <div key={row.instalmentNumber} className="flex items-center justify-between text-xs">
                    <span className="text-text-secondary">{row.label} · {row.dueLabel}</span>
                    <span className="font-semibold text-text-primary">{formatCurrency(row.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {isCompleted ? (
          <div className="rounded-md border border-border bg-surface p-5 text-center">
            <p className="mb-3 text-sm text-text-secondary">This cohort has concluded and is no longer accepting enrollments.</p>
            <Link to="/cohorts" className="text-sm font-semibold text-primary hover:underline">Browse other cohorts →</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to={`/enroll?programme=${programme?.slug}&cohort=${cohort.id}`} className="flex-1 rounded-sm bg-primary py-3 text-center font-semibold text-white transition-all hover:brightness-90 active:scale-[0.98]">Enroll Now</Link>
            {whatsappLink && (
              <a href={whatsappLink} target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-2 rounded-sm border border-border py-3 text-sm font-semibold text-text-primary hover:bg-surface"><MessageCircle size={16} /> Ask a Question</a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon size={17} className="mt-0.5 shrink-0 text-primary" />
      <div><p className="text-xs text-text-secondary">{label}</p><p className="text-sm font-medium text-text-primary">{value}</p></div>
    </div>
  );
}
export default ActiveCohortDetailPage;