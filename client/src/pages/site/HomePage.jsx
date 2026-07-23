/**
 * src/pages/site/HomePage.jsx (REPLACES the F6 version)
 *
 * HomePage — original section structure PRESERVED (Hero, Featured
 * Active Cohorts, About Teaser, Programme Category Teaser, Join
 * Community CTA), with four NEW sections inserted per client
 * instruction (additive, not replacing anything):
 *
 *   Popular Programmes grid (new hover-slide ProgrammeCard, responsive
 *     1/2/3/4-column, 3/4/6/8-card client-specified grid rule)
 *   → Counter Section (live numbers)
 *   → Why Choose Nextserve (feature cards)
 *   → Video Section (shell)
 *   → Testimonials Carousel
 *
 * Popular Programmes pulls from the now-popularity-sorted
 * getGroupedByCategory response (F13) — top N active programmes across
 * all categories, flattened and re-sorted client-side by enrollmentCount
 * to guarantee true cross-category "most popular" ordering (the backend
 * sort is popularity-within-category-group; this flattens and re-ranks
 * globally for the homepage showcase specifically).
 */

import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowRight, Laptop2, Briefcase, Wrench } from 'lucide-react';
import { useManageState } from '../../hooks/useManageState';
import { useSEO } from '../../hooks/useSEO';
import { useModal } from '../../hooks/useModal';
import { useResponsiveCardLimit } from '../../hooks/useResponsiveCardLimit';
import { CohortCard } from '../../components/site/CohortCard';
import { ProgrammeCard } from '../../components/site/ProgrammeCard';
import { JoinCommunityModal } from '../../components/site/JoinCommunityModal';
import { CounterSection } from '../../components/site/CounterSection';
import { WhyChooseUsSection } from '../../components/site/WhyChooseUsSection';
import { VideoSection } from '../../components/site/VideoSection';
import { TestimonialsCarousel } from '../../components/site/TestimonialsCarousel';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { PROGRAMME_CATEGORY_LABELS } from '../../utils/constants';

const CATEGORY_ICONS = { tech_development: Laptop2, management: Briefcase, short_term: Wrench };

export function HomePage() {
  const { cohorts, programmes, actions } = useManageState();
  const joinModal = useModal('confirm');

  useSEO({
    title: 'Home',
    description:
      'Nextserve School of Information Technology and Management — hands-on, cohort-based tech and management training in Nigeria. Enroll online or in person.',
    jsonLd: {
      '@type': 'Organization',
      name: 'Nextserve School of Information Technology and Management',
      description: 'Cohort-based tech and management training institution founded in 2012.',
    },
  });

  useEffect(() => {
    actions.fetchActiveCohorts();
    if (Object.keys(programmes.list).length === 0) actions.fetchAllProgrammes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Global cross-category popularity ranking, active-only, for the
  // "Popular Programmes" showcase grid.
  const popularProgrammes = useMemo(() => {
    return Object.values(programmes.list)
      .flat()
      .filter((p) => p.status === 'active')
      .sort((a, b) => (b.enrollmentCount || 0) - (a.enrollmentCount || 0));
  }, [programmes.list]);

  const { columns, limit } = useResponsiveCardLimit(popularProgrammes.length);
  const gridColsClass = { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4' }[columns];

  return (
    <>
      {/* ── Hero (unchanged structure) ───────────────────────────── */}
      <section className="mx-auto max-w-content px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-24">
        <h1 className="mx-auto max-w-3xl font-heading text-4xl font-extrabold text-text-primary sm:text-5xl">
          Practical Tech & Management Training, Built for the Real World
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-text-secondary">
          Nextserve has trained hands-on, project-ready professionals since 2012. Learn online or
          in-person, at your pace, with instructors who've done the work.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/programmes"
            className="inline-flex items-center justify-center gap-2 rounded-sm bg-primary px-6 py-3 font-semibold text-white transition-all hover:brightness-90 active:scale-[0.98]"
          >
            View Programmes <ArrowRight size={18} />
          </Link>
          <Link
            to="/about"
            className="inline-flex items-center justify-center gap-2 rounded-sm border border-border px-6 py-3 font-semibold text-text-primary transition-colors hover:bg-surface"
          >
            About Nextserve
          </Link>
        </div>
      </section>

      {/* ── Counter Section (new — overlaps hero via negative margin) ── */}
      <CounterSection />

      {/* ── Featured Active Cohorts (unchanged) ─────────────────── */}
      <section className="mx-auto max-w-content px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="mb-6 font-heading text-2xl font-bold text-text-primary">Active Cohorts</h2>
        {cohorts.loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : cohorts.activeCohorts.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cohorts.activeCohorts.map((c) => <CohortCard key={c.id} cohort={c} />)}
          </div>
        ) : (
          <EmptyState
            icon={GraduationCap}
            title="No cohorts are currently active"
            description="Check our programmes page for upcoming cohort dates."
            actionLabel="View Programmes"
            onAction={() => (window.location.href = '/programmes')}
          />
        )}
      </section>

      {/* ── NEW: Popular Programmes (hover-slide card grid) ──────── */}
      <section className="mx-auto max-w-content px-4 py-16 sm:px-6 lg:px-8">
        <header className="mb-10 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">Popular Programmes</p>
          <h2 className="font-heading text-3xl font-bold text-text-primary">Choose Our Top Programmes</h2>
        </header>

        {programmes.loading ? (
          <div className={`grid gap-6 ${gridColsClass}`}>
            {Array.from({ length: limit || 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : popularProgrammes.length > 0 ? (
          <div className={`grid gap-6 ${gridColsClass}`}>
            {popularProgrammes.slice(0, limit).map((p) => (
              <ProgrammeCard key={p.id} programme={p} />
            ))}
          </div>
        ) : (
          <EmptyState icon={GraduationCap} title="No active programmes yet" description="Please check back soon." />
        )}

        <div className="mt-10 text-center">
          <Link
            to="/programmes"
            className="inline-flex items-center gap-2 rounded-sm border border-border px-6 py-3 font-semibold text-text-primary transition-colors hover:bg-surface"
          >
            View All Programmes <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── About Teaser (unchanged) ─────────────────────────────── */}
      <section className="bg-surface py-14">
        <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <h2 className="mb-3 font-heading text-2xl font-bold text-text-primary">
                14 Years of Hands-On Training
              </h2>
              <p className="mb-5 text-text-secondary">
                Founded in 2012, Nextserve has grown from a local walk-in training centre into a
                nationally accessible institution — built on the belief that practical, project-based
                learning is the fastest path to real capability.
              </p>
              <Link to="/about" className="link-underline font-medium text-primary">
                Learn our story →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── NEW: Why Choose Nextserve ─────────────────────────────── */}
      <WhyChooseUsSection />

      {/* ── NEW: Video Section ────────────────────────────────────── */}
      <VideoSection videoUrl={null} />

      {/* ── NEW: Testimonials ─────────────────────────────────────── */}
      <TestimonialsCarousel />

      {/* ── Programme Category Teaser (unchanged) ─────────────────── */}
      <section className="mx-auto max-w-content px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-center font-heading text-2xl font-bold text-text-primary">
          Explore Our Programme Categories
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {Object.entries(PROGRAMME_CATEGORY_LABELS).map(([key, label]) => {
            const Icon = CATEGORY_ICONS[key];
            const count = { tech_development: 15, management: 7, short_term: 4 }[key];
            return (
              <Link
                key={key}
                to={`/programmes/category/${key}`}
                className="flex flex-col items-center gap-3 rounded-md border border-border bg-surface-elevated p-8 text-center shadow-card transition-all hover:-translate-y-1 hover:shadow-card-lift"
              >
                <Icon size={32} className="text-primary" />
                <h3 className="font-heading font-semibold text-text-primary">{label}</h3>
                <p className="text-sm text-text-secondary">{count} programmes</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Join Our Community CTA (unchanged) ────────────────────── */}
      <section className="bg-primary py-14 text-center text-white">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="mb-3 font-heading text-2xl font-bold">Want to Build With Us?</h2>
          <p className="mb-6 text-white/85">
            We occasionally bring on developers for future Live Projects. Join our community to be
            considered for upcoming opportunities.
          </p>
          <Button variant="secondary" onClick={joinModal.open}>
            Join Our Community
          </Button>
        </div>
      </section>

      <JoinCommunityModal isOpen={joinModal.isOpen} onClose={joinModal.close} />
    </>
  );
}

export default HomePage;