/**
 * HomePage — Hero, featured active cohorts (live), about teaser,
 * programmes teaser, WhyChooseUs, "Join Our Community" CTA + modal.
 * Blog section removed (v2 scope) and Contact-Us section removed
 * entirely (merged into Footer), per confirmed decisions.
 */

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Users, Award, ArrowRight, Laptop2, Briefcase, Wrench } from 'lucide-react';
import { useManageState } from '../../hooks/useManageState.js';
import { useSEO } from '../../hooks/useSEO.js';
import { useModal } from '../../hooks/useModal.js';
import { CohortCard } from '../../components/site/CohortCard.jsx';
import { JoinCommunityModal } from '../../components/site/JoinCommunityModal.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { SkeletonCard } from '../../components/ui/Skeleton.jsx';
import { PROGRAMME_CATEGORY_LABELS } from '../../utils/constants.js';

const CATEGORY_ICONS = { tech_development: Laptop2, management: Briefcase, short_term: Wrench };

export function HomePage() {
  const { cohorts, actions } = useManageState();
  const joinModal = useModal('confirm'); // reuse the generic confirm modal slot for the join dialog trigger flag

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
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
            className="inline-flex items-center justify-center gap-2 rounded-sm bg-primary px-6 py-3 font-medium text-white transition-all hover:brightness-90 active:scale-[0.98]"
          >
            View Programmes <ArrowRight size={18} />
          </Link>
          <Link
            to="/about"
            className="inline-flex items-center justify-center gap-2 rounded-sm border border-border px-6 py-3 font-medium text-text-primary transition-colors hover:bg-surface"
          >
            About Nextserve
          </Link>
        </div>
      </section>

      {/* ── Featured Active Cohorts (live data) ─────────────────── */}
      <section className="mx-auto max-w-content px-4 py-12 sm:px-6 lg:px-8">
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

      {/* ── About Teaser ─────────────────────────────────────────── */}
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
            <div className="grid grid-cols-3 gap-4 text-center">
              <StatBlock icon={Award} value="14+" label="Years Training" />
              <StatBlock icon={Users} value="26" label="Programmes" />
              <StatBlock icon={GraduationCap} value="1000+" label="Students Trained" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Programmes Teaser ────────────────────────────────────── */}
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
                className="flex flex-col items-center gap-3 rounded-md border border-border bg-surface-elevated p-8 text-center shadow-card transition-all hover:-translate-y-1 hover:shadow-elevated"
              >
                <Icon size={32} className="text-primary" />
                <h3 className="font-heading font-semibold text-text-primary">{label}</h3>
                <p className="text-sm text-text-secondary">{count} programmes</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Join Our Community CTA ───────────────────────────────── */}
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

function StatBlock({ icon: Icon, value, label }) {
  return (
    <div className="rounded-md border border-border bg-surface-elevated p-4">
      <Icon size={22} className="mx-auto mb-2 text-primary" />
      <p className="font-heading text-xl font-bold text-text-primary">{value}</p>
      <p className="text-xs text-text-secondary">{label}</p>
    </div>
  );
}

export default HomePage;