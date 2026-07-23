/**
 * src/pages/site/AboutPage.jsx (REPLACES the F6 version)
 *
 * AboutPage — full rebuild, structured across the seven content areas
 * from the original site material: Story, Founder, What Makes Us
 * Different, Programmes teaser (1/2/3/4 responsive grid), How We
 * Deliver, Community, Where We're Going, plus the existing FAQ teaser
 * strip preserved from F6 (unchanged — still links to /faq).
 *
 * Nothing from the F6 version is removed; every section is additive
 * or a content/structure upgrade of what existed. Image references use
 * ImageOrPlaceholder throughout — founder portrait, story imagery, etc.
 * all gracefully degrade to branded placeholder blocks since no image
 * upload system exists in current scope.
 */

import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Target, Lightbulb, TrendingUp, HelpCircle, ArrowRight, GraduationCap,
  Users2, Compass, Rocket, Handshake, MapPin,
} from 'lucide-react';
import { useManageState } from '../../hooks/useManageState';
import { useSEO } from '../../hooks/useSEO';
import { ProgrammeCard } from '../../components/site/ProgrammeCard';
import { ImageOrPlaceholder } from '../../components/ui/ImageOrPlaceholder';
import { SkeletonText, SkeletonCard } from '../../components/ui/Skeleton';

// ── About-page-specific responsive grid rule (distinct from Home's
// 1/2/3/4→3/4/6/8 rule): 1 card <640px, 2 cards from 640px, 3 cards
// from 768px, 4 cards from 1280px, per client spec. Implemented inline
// via Tailwind responsive grid classes rather than a JS hook, since the
// column count IS the card count here (no separate cap/column split
// needed like Home's showcase grid).
const ABOUT_PROGRAMME_GRID = 'grid-cols-1 min-[640px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4';

export function AboutPage() {
  const { faqs, programmes, actions } = useManageState();

  useSEO({
    title: 'About Us',
    description: 'The story, philosophy, and direction behind Nextserve School of Information Technology and Management.',
  });

  useEffect(() => {
    if (Object.keys(faqs.publishedGrouped).length === 0) actions.fetchPublishedFaqs();
    if (Object.keys(programmes.list).length === 0) actions.fetchAllProgrammes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const teaserFaqs = Object.values(faqs.publishedGrouped).flat().slice(0, 3);

  // Top 4 most popular active programmes for the "Our Programmes" teaser grid
  const teaserProgrammes = useMemo(() => {
    return Object.values(programmes.list)
      .flat()
      .filter((p) => p.status === 'active')
      .sort((a, b) => (b.enrollmentCount || 0) - (a.enrollmentCount || 0))
      .slice(0, 4);
  }, [programmes.list]);

  return (
    <div>
      {/* ── Page Hero ────────────────────────────────────────────── */}
      <header className="bg-surface py-16 text-center">
        <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">About Nextserve</p>
          <h1 className="font-heading text-3xl font-bold text-text-primary sm:text-4xl">
            Fourteen Years of Hands-On Training
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-text-secondary">
            Built on one simple idea: people learn best by doing.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-content px-4 py-14 sm:px-6 lg:px-8">
        {/* ── 1. Our Story ──────────────────────────────────────── */}
        <section className="mb-16 grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="mb-3 font-heading text-2xl font-semibold text-text-primary">Our Story</h2>
            <p className="leading-relaxed text-text-secondary">
              Nextserve was founded in 2012 and has operated for fourteen years as a walk-in training
              centre serving its immediate community. What began as a single-room operation grew,
              class by class, into a training institution shaped entirely by what actually helped
              students land real work — not by what looked good on a syllabus.
            </p>
          </div>
          <ImageOrPlaceholder
            alt="Nextserve training session"
            className="h-64 w-full rounded-lg lg:h-80"
            icon={GraduationCap}
          />
        </section>

        {/* ── 2. Founder Background ────────────────────────────── */}
        <section className="mb-16 grid gap-8 lg:grid-cols-2 lg:items-center">
          <ImageOrPlaceholder
            alt="Nextserve founder"
            className="order-2 h-64 w-full rounded-lg lg:order-1 lg:h-80"
            placeholderText="ND"
          />
          <div className="order-1 lg:order-2">
            <h2 className="mb-3 font-heading text-2xl font-semibold text-text-primary">Our Founder</h2>
            <p className="leading-relaxed text-text-secondary">
              Our founder — trained at Federal Poly Nekede (HND Computer Science) and shaped by years
              at Synergy Systems and Yaba College of Technology — built Nextserve around fourteen
              years of direct, in-person instruction. That grounding in real institutional teaching,
              not just industry practice, is what still shapes how every Nextserve programme is
              structured today.
            </p>
          </div>
        </section>

        {/* ── 3. What Makes Us Different ───────────────────────── */}
        <section className="mb-16">
          <h2 className="mb-8 text-center font-heading text-2xl font-semibold text-text-primary">
            What Makes Us Different
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <PhilosophyBlock icon={Target} title="Project-Based Learning" body="Every programme is built around real deliverables — not slides, not theory-only modules." />
            <PhilosophyBlock icon={Lightbulb} title="Practical Over Theoretical" body="Students leave with something they built, not just something they memorized." />
            <PhilosophyBlock icon={TrendingUp} title="Always Restructuring Forward" body="From walk-in classes to nationwide cohorts — Nextserve keeps evolving to reach more people." />
          </div>
        </section>

        {/* ── 4. Our Programmes Teaser ──────────────────────────── */}
        <section className="mb-16">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-heading text-2xl font-semibold text-text-primary">Our Programmes</h2>
            <Link to="/programmes" className="link-underline flex items-center gap-1 text-sm font-medium text-primary">
              View all <ArrowRight size={15} />
            </Link>
          </div>
          {programmes.loading ? (
            <div className={`grid gap-4 ${ABOUT_PROGRAMME_GRID}`}>
              {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : teaserProgrammes.length > 0 ? (
            <div className={`grid gap-4 ${ABOUT_PROGRAMME_GRID}`}>
              {teaserProgrammes.map((p) => <ProgrammeCard key={p.id} programme={p} />)}
            </div>
          ) : (
            <p className="text-sm text-text-secondary">Programmes will appear here shortly.</p>
          )}
        </section>

        {/* ── 5. How We Deliver ─────────────────────────────────── */}
        <section className="mb-16 rounded-lg border border-border bg-surface-elevated p-8">
          <div className="mb-8 flex items-center gap-3">
            <Compass size={26} className="text-primary" />
            <h2 className="font-heading text-2xl font-semibold text-text-primary">How We Deliver</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <p className="text-text-secondary leading-relaxed">
              Every cohort runs on a fixed schedule with a defined start and end, whether delivered
              online or in-person. Our restructuring toward the Live Project Model means later-stage
              students work on real deliverables under instructor supervision — turning classroom
              learning into portfolio-ready experience before graduation.
            </p>
            <p className="text-text-secondary leading-relaxed">
              We deliberately keep cohort sizes small. Instructors know their students by name, not
              by roster number — and that's a constraint we protect even as we scale to reach more
              cities and more students online.
            </p>
          </div>
        </section>

        {/* ── 6. Our Community ──────────────────────────────────── */}
        <section className="mb-16 grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <Handshake size={26} className="text-secondary" />
              <h2 className="font-heading text-2xl font-semibold text-text-primary">Our Community</h2>
            </div>
            <p className="leading-relaxed text-text-secondary">
              Nextserve is more than a school. It's a community of practitioners, alumni, instructors,
              and supporters who believe in what technology education can do for Nigeria's workforce
              and for individual lives. We occasionally bring developers into our community for
              future Live Projects — if you're interested, you'll find that option on our homepage.
            </p>
          </div>
          <div className="flex items-center justify-center gap-6 rounded-lg bg-secondary/10 p-8">
            <Users2 size={48} className="text-secondary" />
            <div>
              <p className="font-heading text-2xl font-bold text-text-primary">1000+</p>
              <p className="text-sm text-text-secondary">Students trained since 2012</p>
            </div>
          </div>
        </section>

        {/* ── 7. Where We're Going ──────────────────────────────── */}
        <section className="mb-16">
          <div className="mb-3 flex items-center gap-3">
            <Rocket size={26} className="text-accent" />
            <h2 className="font-heading text-2xl font-semibold text-text-primary">Where We're Going</h2>
          </div>
          <p className="max-w-3xl leading-relaxed text-text-secondary">
            We're in the middle of a deliberate national restructuring — moving from a single
            walk-in centre into a nationwide, cohort-based institution accessible to students
            regardless of location. This website, and the enrollment system behind it, is the
            infrastructure for that next chapter.
          </p>
          <p className="mt-3 flex items-center gap-1.5 text-sm text-text-secondary">
            <MapPin size={15} /> Currently expanding delivery across Nigeria — online-first, in-person where it counts.
          </p>
        </section>

        {/* ── FAQ Teaser Strip (unchanged from F6) ─────────────── */}
        <section className="rounded-lg border border-border bg-surface-elevated p-6 sm:p-8">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-heading text-xl font-semibold text-text-primary">
              <HelpCircle size={22} className="text-primary" /> Common Questions
            </h2>
            <Link to="/faq" className="link-underline flex items-center gap-1 text-sm font-medium text-primary">
              View all FAQs <ArrowRight size={15} />
            </Link>
          </div>

          {faqs.loading ? (
            <SkeletonText lines={3} />
          ) : teaserFaqs.length > 0 ? (
            <div className="space-y-4">
              {teaserFaqs.map((faq) => (
                <div key={faq.id} className="border-b border-border pb-3 last:border-0">
                  <p className="font-medium text-text-primary">{faq.question}</p>
                  <p className="mt-1 text-sm text-text-secondary line-clamp-2">{faq.answer}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-secondary">FAQs will appear here shortly.</p>
          )}
        </section>
      </div>
    </div>
  );
}

function PhilosophyBlock({ icon: Icon, title, body }) {
  return (
    <div className="flex gap-3 rounded-md border border-border bg-surface-elevated p-4">
      <Icon size={22} className="mt-0.5 shrink-0 text-primary" />
      <div>
        <h3 className="font-medium text-text-primary">{title}</h3>
        <p className="text-sm text-text-secondary">{body}</p>
      </div>
    </div>
  );
}

export default AboutPage;