import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar as CalendarIcon, Maximize2 } from 'lucide-react';
import { useManageState } from '../../hooks/useManageState';
import { useSEO } from '../../hooks/useSEO';
import { CohortCarousel } from '../../components/site/CohortCarousel';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';

export function CohortsHubPage() {
  const { cohorts, actions } = useManageState();
  useSEO({ title: 'Cohorts', description: 'Every Nextserve cohort — active and completed.' });

  useEffect(() => {
    actions.fetchActiveCohorts();
    actions.fetchCompletedCohorts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-content px-4 py-14 sm:px-6 lg:px-8">
      <header className="mb-10 text-center">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">Cohorts</p>
        <h1 className="font-heading text-3xl font-bold text-text-primary sm:text-4xl">Our Cohorts</h1>
      </header>

      <CohortSection title="Active Cohorts" description="Currently accepting enrollments." cohorts={cohorts.activeCohorts} loading={cohorts.loading} expandTo="/cohorts/active" emptyMessage="No cohorts are currently open for enrollment." />

      <div className="my-14 border-t border-border" />

      <CohortSection title="Completed Cohorts" description="A look at cohorts that have concluded." cohorts={cohorts.completedCohorts} loading={cohorts.loading} expandTo="/cohorts/completed" emptyMessage="No cohorts have concluded yet." />
    </div>
  );
}

function CohortSection({ title, description, cohorts, loading, expandTo, emptyMessage }) {
  return (
    <section>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-text-primary">{title}</h2>
          <p className="text-sm text-text-secondary">{description}</p>
        </div>
        <Link to={expandTo} className="flex shrink-0 items-center gap-1.5 rounded-sm border border-border px-3 py-2 text-xs font-semibold text-text-primary hover:bg-surface">
          <Maximize2 size={14} /> View All
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : cohorts.length > 0 ? (
        <CohortCarousel cohorts={cohorts} />
      ) : (
        <EmptyState icon={CalendarIcon} title={emptyMessage} />
      )}
    </section>
  );
}

export default CohortsHubPage;