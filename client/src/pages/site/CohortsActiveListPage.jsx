import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Calendar as CalendarIcon } from 'lucide-react';
import { useManageState } from '../../hooks/useManageState';
import { useSEO } from '../../hooks/useSEO';
import { CohortCard } from '../../components/site/CohortCard';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';

export function CohortsActiveListPage() {
  const { cohorts, actions } = useManageState();
  useSEO({ title: 'Active Cohorts' });
  useEffect(() => { actions.fetchActiveCohorts(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  return (
    <div className="mx-auto max-w-content px-4 py-14 sm:px-6 lg:px-8">
      <Link to="/cohorts" className="mb-6 flex w-fit items-center gap-1.5 text-sm text-text-secondary hover:text-primary"><ChevronLeft size={16} /> All Cohorts</Link>
      <h1 className="mb-8 font-heading text-3xl font-bold text-text-primary">Active Cohorts</h1>
      {cohorts.loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : cohorts.activeCohorts.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{cohorts.activeCohorts.map((c) => <CohortCard key={c.id} cohort={c} />)}</div>
      ) : (
        <EmptyState icon={CalendarIcon} title="No cohorts are currently open for enrollment." />
      )}
    </div>
  );
}
export default CohortsActiveListPage;