/**
 * src/pages/site/ProgrammesPage.jsx (REPLACES the F6 version)
 *
 * ProgrammesPage — Stack i. Structurally unchanged from F6 (grouped-by-
 * category preview + "See all" per category), but now renders the F15
 * hover-slide ProgrammeCard instead of the old flat card, and each
 * category's preview slice is already popularity-sorted server-side
 * (F13), so no client re-sort is needed here — order is authoritative
 * from the API response.
 */

import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen } from "lucide-react";
import { useManageState } from "../../hooks/useManageState";
import { useSEO } from "../../hooks/useSEO";
import { useResponsiveLimit } from "../../hooks/useResponsiveLimit";
import { ProgrammeCard } from "../../components/site/ProgrammeCard";
import { SkeletonCard } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { PROGRAMME_CATEGORY_LABELS } from "../../utils/constants";

export function ProgrammesPage() {
  const { programmes, actions } = useManageState();
  const limit = useResponsiveLimit();

  useSEO({
    title: "Our Programmes",
    description:
      "Explore Nextserve's 26 Tech Development, Management, and Short Term programmes.",
  });

  useEffect(() => {
    actions.fetchAllProgrammes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categories = Object.keys(PROGRAMME_CATEGORY_LABELS);
  const hasAnyProgrammes = Object.values(programmes.list).some(
    (arr) => arr?.length > 0,
  );

  return (
    <div className="mx-auto max-w-content px-4 py-32 sm:px-6 lg:px-8">
      <header className="mb-10 text-center">
        <p className="mb-2.5 text-xs font-extrabold uppercase tracking-widest text-white bg-primary px-4 py-1.5 rounded-full inline-block shadow-xs">
          Programmes
        </p>
        <h1 className="font-heading text-3xl font-bold text-text-primary sm:text-4xl">
          Our Programmes
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-text-secondary">
          26 hands-on programmes across Tech Development, Management, and Short
          Term categories, ordered by what students are enrolling in most.
        </p>
      </header>

      {programmes.loading ? (
        <div className="space-y-12">
          {categories.map((cat, idx) => (
            <div key={idx}>
              <div className="mb-4 h-6 w-48 skeleton-shimmer rounded-sm" />
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: limit }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : !hasAnyProgrammes ? (
        <EmptyState
          icon={BookOpen}
          title="No programmes available yet"
          description="Please check back soon."
        />
      ) : (
        <div className="space-y-14">
          {categories.map((category, idx) => {
            const items = (programmes.list[category] || []).slice(0, limit);
            if (items.length === 0) return null;

            return (
              <section key={idx}>
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="font-heading text-xl font-bold sm:text-2xl">
                    {PROGRAMME_CATEGORY_LABELS[category]}
                  </h2>
                  <Link
                    to={`/programmes/category/${category}`}
                    className="link-underline flex items-center gap-1 text-lg font-medium text-primary"
                  >
                    See all <ArrowRight size={15} />
                  </Link>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {items.map((programme, idx) => (
                    <ProgrammeCard key={idx} programme={programme} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ProgrammesPage;
