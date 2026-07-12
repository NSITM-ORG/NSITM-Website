/**
 * FaqPage — backend-driven, category-tabbed accordion. Categories are
 * derived live from whatever GET /public/faqs actually returns (free-text
 * categories per the confirmed decision — no hardcoded category list on
 * the frontend either).
 */

import { useEffect, useState } from 'react';
import { useSEO } from '../../hooks/useSEO.js';
import { useManageState } from '../../hooks/useManageState.js';
import { Tabs } from '../../components/ui/Tabs.jsx';
import { Accordion } from '../../components/ui/Accordion.jsx';
import { SkeletonText } from '../../components/ui/Skeleton.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { HelpCircle } from 'lucide-react';

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
    if (categories.length > 0 && !activeCategory) setActiveCategory(categories[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories.join(',')]);

  const tabs = categories.map((c) => ({ value: c, label: c }));
  const items = (faqs.publishedGrouped[activeCategory] || []).map((f) => ({
    id: f.id,
    question: f.question,
    answer: f.answer,
  }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="mb-8 text-center">
        <h1 className="font-heading text-3xl font-bold text-text-primary">Frequently Asked Questions</h1>
        <p className="mt-2 text-text-secondary">Everything you need to know before you enroll.</p>
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
    </div>
  );
}

export default FaqPage;