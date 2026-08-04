/**
 * src/pages/site/FaqPage.jsx
 *
 * FaqPage — public FAQ page using the new high-end FaqSection component,
 * seamlessly integrating backend-driven FAQs from faqs.publishedGrouped
 * with institutional fallback questions.
 */

import { useEffect, useMemo } from 'react';
import { useSEO } from '../../hooks/useSEO';
import { useManageState } from '../../hooks/useManageState';
import { FaqSection } from '../../components/site/FaqSection';
import { SkeletonText } from '../../components/ui/Skeleton';

export function FaqPage() {
  const { faqs, actions } = useManageState();

  useSEO({
    title: 'Frequently Asked Questions',
    description: 'Answers to common questions about enrollment, payment, class schedules, and certification at Nextserve.',
  });

  useEffect(() => {
    actions.fetchPublishedFaqs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Flatten published backend FAQs if available
  const flattenedBackendFaqs = useMemo(() => {
    if (!faqs.publishedGrouped) return [];
    return Object.entries(faqs.publishedGrouped).flatMap(([cat, items]) =>
      items.map((item) => ({
        id: item.id || `faq-${Math.random()}`,
        category: cat,
        question: item.question,
        answer: item.answer,
      }))
    );
  }, [faqs.publishedGrouped]);

  return (
    <div className="py-8">
      {faqs.loading ? (
        <div className="mx-auto max-w-3xl px-4 py-16">
          <SkeletonText lines={6} />
        </div>
      ) : (
        <FaqSection customFaqs={flattenedBackendFaqs.length > 0 ? flattenedBackendFaqs : null} />
      )}
    </div>
  );
}

export default FaqPage;