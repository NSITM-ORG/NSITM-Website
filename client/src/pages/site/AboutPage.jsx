/**
 * AboutPage — story/philosophy/direction content (static — no backend
 * storage per instruction, upgraded copy while preserving original
 * context) + an FAQ TEASER strip (top 3 published FAQs) linking directly
 * to /faq, replacing the old inline accordion per confirmed decision.
 */

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Target, Lightbulb, TrendingUp, HelpCircle, ArrowRight } from 'lucide-react';
import { useManageState } from '../../hooks/useManageState';
import { useSEO } from '../../hooks/useSEO';
import { SkeletonText } from '../../components/ui/Skeleton';

export function AboutPage() {
  const { faqs, actions } = useManageState();

  useSEO({
    title: 'About Us',
    description: 'The story, philosophy, and direction behind Nextserve School of Information Technology and Management.',
  });

  useEffect(() => {
    if (Object.keys(faqs.publishedGrouped).length === 0) actions.fetchPublishedFaqs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Flatten the grouped FAQs and take the first 3 for the teaser.
  const teaserFaqs = Object.values(faqs.publishedGrouped).flat().slice(0, 3);

  return (
    <div className="mx-auto max-w-content px-4 py-14 sm:px-6 lg:px-8">
      <header className="mb-12 text-center">
        <h1 className="font-heading text-3xl font-bold text-text-primary sm:text-4xl">About Nextserve</h1>
        <p className="mx-auto mt-3 max-w-2xl text-text-secondary">
          Fourteen years of hands-on training, built on one simple idea: people learn best by doing.
        </p>
      </header>

      <section className="mb-14 grid gap-8 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="mb-3 font-heading text-2xl font-semibold text-text-primary">Our Story</h2>
          <p className="text-text-secondary leading-relaxed">
            Nextserve was founded in 2012 and has operated for fourteen years as a walk-in training
            centre serving its immediate community. Our founder — trained at Federal Poly Nekede
            (HND Computer Science) and shaped by years at Synergy Systems and Yaba College of
            Technology — built Nextserve around fourteen years of direct, in-person instruction.
            Today, that same foundation is powering a nationwide, cohort-based restructuring: the
            Live Project Model you're seeing in action on this very website.
          </p>
        </div>
        <div className="grid gap-4">
          <PhilosophyBlock
            icon={Target}
            title="Project-Based Learning"
            body="Every programme is built around real deliverables — not slides, not theory-only modules."
          />
          <PhilosophyBlock
            icon={Lightbulb}
            title="Practical Over Theoretical"
            body="Students leave with something they built, not just something they memorized."
          />
          <PhilosophyBlock
            icon={TrendingUp}
            title="Always Restructuring Forward"
            body="From walk-in classes to nationwide cohorts — Nextserve keeps evolving to reach more people."
          />
        </div>
      </section>

      {/* ── FAQ Teaser Strip ────────────────────────────────────── */}
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