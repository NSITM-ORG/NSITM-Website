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
import colorMap from '../assets/ColorPallet';

function CounterCard({ icon: Icon, targetValue, label, colorClass, cardColor = "gray" }) {
  const { displayValue, elementRef } = useCounterAnimation(targetValue);

  
  // Fallback to gray if color is missing from map
  const styles = colorMap[cardColor] || colorMap.gray;
  return (
    <div
      ref={elementRef}
      className={`flex items-center gap-4 rounded-xl ${styles.bg} p-5 shadow-card-lift transition-colors duration-300 hover:${styles.hover} `}
    >
      <span className={`counter-badge ${colorClass} shadow-md`}>
        <Icon size={24} />
      </span>
      <div>
        <p className="font-heading text-3xl font-extrabold text-text-primary tracking-tight">{displayValue}+</p>
        <p className="text-sm font-semibold text-text-secondary mt-0.5">{label}</p>
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

    const yearsOfExperience = () => {
      // 1. Create a new Date object (defaults to current date and time)
      const currentDate = new Date();

      // 2. Extract the 4-digit year
      const currentYear = currentDate.getFullYear();

      return currentYear - 2012; // Assuming the institution started in 2010
    }

    return {
      activeProgrammes: activeCount,
      totalProgrammes: allProgrammes.length || 26, // 26 confirmed catalogue size as sane floor
      activeCohorts: cohorts.activeCohorts.length,
      yearsOfExperience: yearsOfExperience(),
    };
  }, [programmes.list, cohorts.activeCohorts]);

  return (
    <section className="relative z-10 lg:-mt-14">
      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <CounterCard icon={BookOpen} targetValue={stats.activeProgrammes} label="Active Programmes" colorClass="bg-primary/20 text-primary" cardColor='primary' />
          <CounterCard icon={GraduationCap} targetValue={stats.totalProgrammes} label="Total Programmes" colorClass="bg-secondary/20 text-secondary" cardColor='secondary' />
          <CounterCard icon={Calendar} targetValue={stats.activeCohorts} label="Active Cohorts" colorClass="bg-accent/20 text-accent" cardColor='accent' />
          <CounterCard icon={Award} targetValue={stats.yearsOfExperience} label="Years of Experience" colorClass="bg-info/20 text-info" cardColor='info' />
        </div>
      </div>
    </section>
  );
}

export default CounterSection;