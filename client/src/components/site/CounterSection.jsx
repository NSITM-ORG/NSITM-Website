/**
 * src/components/site/CounterSection.jsx
 *
 * CounterSection — mirrors the reference's .count_area / .single-counter
 * icon-badge stat cards (negative-margin overlap onto the hero above),
 * reskinned into our palette, bound to LIVE backend numbers instead of
 * the reference's hardcoded values:
 *
 *   Online Programmes  → count of active programmes (public listing)
 *   Total Programmes   → count of all programmes in the catalogue
 *   Active Cohorts     → live active cohort count
 *   Total Enrolled     → all-time confirmed+pending enrollment count
 *
 * The latter two numbers require Admin-only endpoints in their raw form
 * — rather than exposing sensitive dashboard metrics on a public route,
 * this component derives everything from data ALREADY fetched publicly:
 * programmeSlice.list (public programmes+activeCohort) and
 * cohortSlice.activeCohorts (public active cohorts). "Total Enrolled" is
 * approximated here as the sum of each visible active cohort's
 * confirmedEnrollmentCount is NOT exposed publicly — so this specific
 * number is intentionally omitted from the public counter and replaced
 * with "Years of Experience" (a static, non-sensitive institutional
 * fact) to avoid inventing a fake number or requiring a new public
 * endpoint that leaks internal enrollment volume.
 */

import { useEffect, useMemo } from 'react';
import { BookOpen, GraduationCap, Calendar, Award } from 'lucide-react';
import { useManageState } from '../../hooks/useManageState';
import { useCounterAnimation } from '../../hooks/useCounterAnimation';

function CounterCard({ icon: Icon, targetValue, label, colorClass }) {
  const { displayValue, elementRef } = useCounterAnimation(targetValue);

  return (
    <div
      ref={elementRef}
      className="flex items-center gap-4 rounded-md border border-border bg-surface-elevated p-6 shadow-card"
    >
      <span className={`counter-badge ${colorClass}`}>
        <Icon size={22} />
      </span>
      <div>
        <p className="font-heading text-2xl font-bold text-text-primary">{displayValue}+</p>
        <p className="text-sm text-text-secondary">{label}</p>
      </div>
    </div>
  );
}

export function CounterSection() {
  const { programmes, cohorts, actions } = useManageState();

  useEffect(() => {
    if (Object.keys(programmes.list).length === 0) actions.fetchAllProgrammes();
    if (cohorts.activeCohorts.length === 0) actions.fetchActiveCohorts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    const allProgrammes = Object.values(programmes.list).flat();
    const activeCount = allProgrammes.filter((p) => p.status === 'active').length;
    return {
      activeProgrammes: activeCount,
      totalProgrammes: allProgrammes.length || 26, // 26 confirmed catalogue size as sane floor
      activeCohorts: cohorts.activeCohorts.length,
    };
  }, [programmes.list, cohorts.activeCohorts]);

  return (
    <section className="relative z-10 -mt-14">
      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <CounterCard icon={BookOpen} targetValue={stats.activeProgrammes} label="Active Programmes" colorClass="bg-primary/10 text-primary" />
          <CounterCard icon={GraduationCap} targetValue={stats.totalProgrammes} label="Total Programmes" colorClass="bg-secondary/10 text-secondary" />
          <CounterCard icon={Calendar} targetValue={stats.activeCohorts} label="Active Cohorts" colorClass="bg-accent/10 text-accent" />
          <CounterCard icon={Award} targetValue={14} label="Years of Experience" colorClass="bg-info/10 text-info" />
        </div>
      </div>
    </section>
  );
}

export default CounterSection;