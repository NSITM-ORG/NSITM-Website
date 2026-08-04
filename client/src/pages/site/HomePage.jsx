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

import heroTechHubImg from '../../assets/images/hero_nigerian_tech_hub.png';
import aboutAcademyImg from '../../assets/images/about_nigerian_academy.png';
import communityCollabImg from '../../assets/images/community_developers_collaboration.png';

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
      .sort((a, b) => (b.popularityScore || 0) - (a.popularityScore || 0));
  }, [programmes.list]);

  const { columns, limit } = useResponsiveCardLimit(popularProgrammes.length);
  const gridColsClass = { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4' }[columns];

  return (
    <>
      {/* ── Modern Hero Section with Showcase Picture ───────────────────────────── */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        {/* Ambient Radial Glows */}
        <div className="absolute top-1/3 left-1/4 w-162.5 h-95 bg-linear-to-tr from-primary/20 via-secondary/15 to-transparent rounded-full blur-3xl pointer-events-none -z-10"></div>

        <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-12">

            {/* Left Content */}
            <div className="lg:col-span-7 text-center lg:text-left">
              {/* Top Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/25 text-xs font-extrabold tracking-wider text-primary shadow-xs mb-6">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                <span>NEXTSERVE SCHOOL OF IT & MANAGEMENT • EST. 2012</span>
              </div>

              {/* Title */}
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold text-text-primary leading-[0.2] tracking-tight">
                Practical Tech & Management Training, <span className="text-gradient-brand">Built for the Real World</span>
              </h1>

              {/* Subtitle */}
              <span className="mt-6 inline-block">
                <p className="mt-6 text-base sm:text-lg text-center lg:text-left leading-relaxed font-medium max-w-2xl">
                Nextserve has trained hands-on, project-ready professionals across Nigeria since 2012. Learn online or
                in-person with instructors who have real industry experience.
              </p>
              </span>

              {/* Value Highlights Chips */}
              <div className="mt-8 flex lg:hidden flex-wrap justify-center lg:justify-start items-center gap-3 text-xs font-bold text-text-primary">
                <span className="px-4 py-2 rounded-full bg-surface-elevated bg-secondary/10 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span> 100% Practical Projects
                </span>
                <span className="px-4 py-2 rounded-full bg-surface-elevated bg-primary/10 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary"></span> Online & In-Person Cohorts
                </span>
                <span className="px-4 py-2 rounded-full bg-surface-elevated bg-accent/10 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent"></span> Industry Expert Instructors
                </span>
              </div>

              {/* CTAs */}
              <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-4">
                <Link
                  to="/programmes"
                  className="inline-flex items-center justify-center gap-2.5 rounded-full bg-primary px-8 py-3.5 font-bold text-white shadow-lg transition-all duration-300 hover:brightness-110 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  View Programmes <ArrowRight size={18} />
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center justify-center gap-2.5 rounded-full bg-secondary/10 border border-secondary/30 px-8 py-3.5 font-bold text-secondary transition-all duration-300 hover:bg-secondary hover:text-white shadow-xs"
                >
                  About Nextserve
                </Link>
              </div>
            </div>

            {/* Right Hero Image Card Showcase */}
            <div className="lg:col-span-5 relative hidden lg:flex">
              <div className="relative mx-auto max-w-md lg:max-w-none rounded-3xl p-3 overflow-hidden group">
                <div className="relative aspect-3/4 overflow-hidden rounded-2xl">
                  <img
                    src={heroTechHubImg}
                    alt="Nigerian Tech Students Collaborating in Lagos Hub"
                    className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent"></div>

                  {/* Floating Overlay Badge */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-xl bg-black/60 backdrop-blur-md p-3.5 border border-white/20 text-white">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-secondary">Nigeria Innovation Hub</p>
                      <p className="text-sm font-semibold">Hands-on Cohort Experience</p>
                    </div>
                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold">Lagos & Online</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
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
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-secondary bg-secondary/10 px-4 py-1.5 rounded-full inline-block shadow-xs" >Popular Programmes</p>
          <h2 className="font-heading text-3xl font-bold text-text-primary">Choose From Our Top Programmes</h2>
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
            className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-6 py-3 font-bold text-primary hover:bg-primary hover:text-white transition-all duration-700 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]"
          >
            View All Programmes <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── About Teaser ─────────────────────────────── */}
      <section className="bg-surface/60 py-18 sm:py-20 ">
        <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="mb-3.5 inline-block rounded-full bg-secondary/10 px-4 py-1.5 text-xs font-bold text-secondary uppercase tracking-wider">Our Heritage</span>
              <h2 className="mb-4 font-heading text-3xl sm:text-4xl font-extrabold text-text-primary">
                14 Years of Hands-On Training in Nigeria
              </h2>
              <p className="mb-6 text-base leading-relaxed text-text-secondary">
                Founded in 2012, Nextserve has grown from a local walk-in training centre into a
                nationally accessible institution — built on the belief that practical, project-based
                learning is the fastest path to real capability.
              </p>
              <div className="mb-8 grid grid-cols-2 gap-4 border-t border-primary/20 pt-6">
                <div>
                  <p className="font-heading text-2xl font-bold text-primary">10,000+</p>
                  <p className="text-xs font-semibold text-text-secondary mt-0.5">Trained Professionals</p>
                </div>
                <div>
                  <p className="font-heading text-2xl font-bold text-secondary">50+</p>
                  <p className="text-xs font-semibold text-text-secondary mt-0.5">Industry Instructors</p>
                </div>
              </div>
              <Link to="/about" className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-6 py-3 font-bold text-primary hover:bg-primary hover:text-white transition-all duration-700 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]">
                Learn Our Story →
              </Link>
            </div>

            <div className="relative">
              <div className="rounded-3xl p-3 overflow-hidden group">
                <div className="relative aspect-4/3 overflow-hidden rounded-2xl">
                  <img
                    src={aboutAcademyImg}
                    alt="Nextserve Training Workshop in Nigeria"
                    className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-xl bg-black/60 backdrop-blur-md p-3 border border-white/20 text-white">
                    <span className="text-xs font-bold uppercase tracking-wider text-secondary">Lagos Campus & Online</span>
                    <span className="text-xs font-medium text-white/90">Est. 2012</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── NEW: Why Choose Nextserve ─────────────────────────────── */}
      <WhyChooseUsSection />

      {/* ── NEW: Video Section ────────────────────────────────────── */}
      <VideoSection videoUrl={null} />


      {/* ── Join Our Community CTA with Full Background Image ────────────────────── */}
      <section className="relative overflow-hidden py-24 sm:py-32 text-white">
        {/* Full Background Image */}
        <img
          src={communityCollabImg}
          alt="Nigerian Tech Community Collaborating"
          className="absolute inset-0 h-full w-full object-cover object-center filter brightness-[0.3]"
        />

        {/* Gradient Overlays for High Contrast & Brand Blend */}
        <div className="absolute inset-0 bg-linear-to-r " />
        <div className="absolute inset-0 bg-linear-to-t" />

        {/* Ambient Radial Glow */}
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-175 h-100 bg-secondary/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 mx-auto max-w-content px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl text-left">

            {/* Humanized Live Community Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-extrabold tracking-wider text-white shadow-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              <span>JOIN NIGERIA'S THRIVING DEVELOPER COMMUNITY</span>
            </div>

            {/* Headline */}
            <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
              Ready to Build, Grow & Collaborate With Real Developers?
            </h2>

            {/* Humanized Description */}
            <p className="mt-6 text-base sm:text-lg lg:text-xl text-white/90 leading-relaxed font-medium">
              At Nextserve, learning doesn't stop in the classroom. We bring ambitious students and alumni onto real production client projects, pairing you with experienced senior mentors who support your journey every step of the way.
            </p>

            {/* Value Checkmarks */}
            <ul className="mt-8 space-y-3.5">
              <li className="flex items-center gap-3 text-sm sm:text-base font-semibold text-white">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-white font-extrabold shadow-sm">✓</span>
                Work on real client projects & build verifiable portfolio evidence
              </li>
              <li className="flex items-center gap-3 text-sm sm:text-base font-semibold text-white">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-white font-extrabold shadow-sm">✓</span>
                Warm, supportive mentorship & peer code reviews from senior engineers
              </li>
              <li className="flex items-center gap-3 text-sm sm:text-base font-semibold text-white">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-white font-extrabold shadow-sm">✓</span>
                Direct access to exclusive developer hackathons, internships & job roles
              </li>
            </ul>

            {/* CTA Action & Trust Chip */}
            <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-6">
              <Button
                variant="secondary"
                size="lg"
                className="rounded-full px-9 py-4 text-base font-bold text-white shadow-xl hover:shadow-2xl hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                onClick={joinModal.open}
              >
                Join Our Community Today →
              </Button>

              {/* Student Community Avatar Stack */}
              <div className="inline-flex items-center gap-3 rounded-full bg-white/10 backdrop-blur-md px-5 py-2.5 border border-white/20 text-xs font-bold text-white">
                <div className="flex -space-x-2">
                  <div className="w-7 h-7 rounded-full bg-secondary text-white font-extrabold flex items-center justify-center border-2 border-primary text-[10px]">C</div>
                  <div className="w-7 h-7 rounded-full bg-primary text-white font-extrabold flex items-center justify-center border-2 border-primary text-[10px]">T</div>
                  <div className="w-7 h-7 rounded-full bg-accent text-white font-extrabold flex items-center justify-center border-2 border-primary text-[10px]">A</div>
                </div>
                <span>Joined by 1,200+ Nigerian developers & students</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      <JoinCommunityModal isOpen={joinModal.isOpen} onClose={joinModal.close} />

      {/* ── Programme Category Teaser ─────────────────── */}
      <section className="mx-auto max-w-content px-4 py-20 sm:px-6 lg:px-8">
        <header className="mb-12 text-center max-w-2xl mx-auto">
          <p className="mb-2.5 text-xs font-extrabold uppercase tracking-widest text-secondary bg-secondary/10 px-4 py-1.5 rounded-full inline-block">Specialized Pathways</p>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-text-primary mt-2">
            Explore Our Programme Categories
          </h2>
        </header>
        <div className="grid gap-6 sm:grid-cols-3">
          {Object.entries(PROGRAMME_CATEGORY_LABELS).map(([key, label]) => {
            const Icon = CATEGORY_ICONS[key];
            const count = { tech_development: 15, management: 7, short_term: 4 }[key];
            return (
              <Link
                key={key}
                to={`/programmes/category/${key}`}
                className="group flex flex-col items-center gap-4 rounded-2xl border border-primary/30 bg-surface-elevated p-8 text-center shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card-lift hover:border-primary/40"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
                  <Icon size={32} />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-bold text-text-primary group-hover:text-primary transition-colors">{label}</h3>
                  <p className="text-sm font-medium text-text-secondary mt-1">{count} active programmes</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
      
      {/* ── NEW: Testimonials ─────────────────────────────────────── */}
      <TestimonialsCarousel />
    </>
  );
}

export default HomePage;