/**
 * src/pages/site/ActiveCohortsPage.jsx
 *
 * ActiveCohortsPage — /cohorts (SinglePageLayout). Full active-cohort
 * listing, richer than the Home page's teaser strip — every currently
 * enrollment-open cohort, with delivery format and enrollment window
 * shown per card.
 */

// TO BE DELETED
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar as CalendarIcon } from "lucide-react";
import { useManageState } from "../../hooks/useManageState";
import { useSEO } from "../../hooks/useSEO";
import { CohortCard } from "../../components/site/CohortCard";
import { SkeletonCard } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";

export function ActiveCohortsPage() {
  const { cohorts, actions } = useManageState();
  useSEO({
    title: "Active Cohorts",
    description: "Every Nextserve cohort currently open for enrollment.",
  });

  useEffect(() => {
    actions.fetchActiveCohorts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-content px-4 py-14 sm:px-6 lg:px-8">
      <header className="mb-10 text-center">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">
          Enroll Today
        </p>
        <h1 className="font-heading text-3xl font-bold text-text-primary sm:text-4xl">
          Active Cohorts
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-text-secondary">
          Every cohort listed here is currently accepting enrollments — click
          through for full details.
        </p>
      </header>

      {cohorts.loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : cohorts.activeCohorts.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cohorts.activeCohorts.map((c) => (
            <Link key={c.id} to={`/cohorts/${c.id}`}>
              <CohortCard cohort={c} />
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={CalendarIcon}
          title="No cohorts are currently open for enrollment"
          description="Check our programmes page or come back soon — new cohorts open regularly."
          actionLabel="View Programmes"
          onAction={() => (window.location.href = "/programmes")}
        />
      )}
    </div>
  );
}

export default ActiveCohortsPage;
