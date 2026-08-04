/**
 * FaqPage — backend-driven, category-tabbed accordion. Categories are
 * derived live from whatever GET /public/faqs actually returns (free-text
 * categories per the confirmed decision — no hardcoded category list on
 * the frontend either).
 */

import { useEffect, useState } from 'react';
import { useSEO } from '../../hooks/useSEO';
import { useManageState } from '../../hooks/useManageState';
import { Tabs } from '../../components/ui/Tabs';
import { Accordion } from '../../components/ui/Accordion';
import { SkeletonText } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { HelpCircle, MessageCircle, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export function FaqPage() {
  const { faqs, actions } = useManageState();
  const [activeCategory, setActiveCategory] = useState(null);

  useSEO({ title: 'Frequently Asked Questions', description: 'Answers to common questions about enrollment, payment, and our programmes.' });

  useEffect(() => {
    actions.fetchPublishedFaqs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categories = Object.keys(faqs.publishedGrouped);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (categories.length > 0 && !activeCategory) setActiveCategory(categories[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories.join(',')]);

  
  const tabs = categories.map((c) => ({ value: c, label: c }));
  const items = (faqs.publishedGrouped[activeCategory] || []).map((f) => ({
    id: f._id,
    question: f.question,
    answer: f.answer,
  }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="mb-12 text-center max-w-2xl mx-auto">
        <p className="mb-2.5 text-xs font-extrabold uppercase tracking-widest text-white bg-primary px-4 py-1.5 rounded-full inline-block shadow-xs">
          Frequently Asked Questions
        </p>
        <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-text-primary mt-2">
          Everything You Need To Know
        </h2>
        <p className="mt-3 text-base font-medium text-text-secondary">
          Find answers to common questions about enrollment, class schedules,
          fees, and certification.
        </p>
      </header>

      {faqs.loading ? (
        <SkeletonText lines={5} />
      ) : categories.length === 0 ? (
        <EmptyState icon={HelpCircle} title="No FAQs available yet" description="Please check back soon, or reach out to us directly." />
      ) : (
        <>
          <Tabs tabs={tabs} activeTab={activeCategory} onChange={setActiveCategory} />
          <div className="mt-6">
            <Accordion items={items} />
          </div>
        </>
      )}

      {/* Still Have Questions Box */}
      <div className="mx-auto mt-14 max-w-2xl rounded-3xl border border-primary/20 bg-linear-to-br from-primary/5 via-surface-elevated to-secondary/5 p-8 text-center shadow-md">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-md">
          <HelpCircle size={28} />
        </div>
        <h3 className="font-heading text-xl font-bold text-text-primary">
          Still have questions?
        </h3>
        <p className="mt-2 text-sm text-text-secondary font-medium">
          Can't find the answer you're looking for? Talk directly with our
          admissions team on WhatsApp.
        </p>
        <div className="mt-6 flex flex-wrap justify-center items-center gap-4">
          <a
            href="https://wa.me/2348093344991"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 font-bold text-white shadow-md hover:brightness-110 transition-all duration-500 active:scale-95"
          >
            <MessageCircle size={18} /> Chat On WhatsApp
          </a>
          <Link
            to="/faq"
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-surface-elevated px-7 py-3 font-bold text-primary bg-primary/10 hover:bg-primary hover:text-white transition-all duration-500 shadow-xs"
          >
            <Sparkles size={16} /> View All FAQs Page
          </Link>
        </div>
      </div>
    </div>
  );
}

export default FaqPage;