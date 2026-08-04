/**
 * src/components/site/FaqSection.jsx
 *
 * FAQ Section — interactive, category-filterable accordion section for the homepage.
 * Pulls from backend faqs if available, with rich fallback institutional FAQs
 * covering Admissions, Class Formats, Payments, and Certification.
 */

import { useState, useMemo } from "react";
import { ChevronDown, HelpCircle, MessageCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const DEFAULT_FAQS = [
  {
    id: "f1",
    category: "Admissions",
    question: "How do I enroll for a programme at Nextserve?",
    answer:
      "You can enroll online in under 3 minutes by selecting your preferred programme and active cohort on our website. Alternatively, you can visit our physical campus in Lagos for walk-in enrollment.",
  },
  {
    id: "f2",
    category: "Admissions",
    question: "Are there prerequisites for joining technical programmes?",
    answer:
      "Beginner-level programmes require no prior technical background. For intermediate and advanced cohorts, a basic assessment or prerequisite check ensures you are placed in the right track.",
  },
  {
    id: "f3",
    category: "Class Formats",
    question: "Can I attend classes online if I live outside Lagos?",
    answer:
      "Yes! We offer 100% online live interactive cohorts with real-time screen-share workshops, dedicated instructor Q&A sessions, and recorded class archives accessible 24/7.",
  },
  {
    id: "f4",
    category: "Class Formats",
    question: "What is the schedule for physical campus training?",
    answer:
      "Physical cohorts run at our Lagos campus with flexible morning, afternoon, and weekend tracks designed to fit the schedules of both working professionals and full-time students.",
  },
  {
    id: "f5",
    category: "Payments & Fees",
    question: "Can I pay for my programme in instalments?",
    answer:
      "Yes! Nextserve offers flexible instalment plans. You can pay an initial deposit to lock in your cohort seat and complete the balance in structured monthly instalments.",
  },
  {
    id: "f6",
    category: "Payments & Fees",
    question: "What payment methods are accepted?",
    answer:
      "We accept instant bank transfers, debit/credit cards via Paystack, and direct bank deposits. An instant official receipt is generated for your student portal.",
  },
  {
    id: "f7",
    category: "Certification",
    question: "Will I receive an accredited certificate upon completion?",
    answer:
      "Yes, every graduate receives an official Nextserve School of IT & Management Certificate of Completion with digital verification and portfolio project proof.",
  },
  {
    id: "f8",
    category: "Certification",
    question:
      "Does Nextserve offer career support and job placement assistance?",
    answer:
      "Yes. Our career assistance team provides resume reviews, mock technical interviews, and direct job referrals to our partner companies across Nigeria.",
  },
];

const CATEGORIES = [
  "All",
  "Admissions",
  "Class Formats",
  "Payments & Fees",
  "Certification",
];

export function FaqSection({ customFaqs }) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [openId, setOpenId] = useState("f1");

  const faqList =
    customFaqs && customFaqs.length > 0 ? customFaqs : DEFAULT_FAQS;

  const filteredFaqs = useMemo(() => {
    if (selectedCategory === "All") return faqList;
    return faqList.filter((item) => item.category === selectedCategory);
  }, [faqList, selectedCategory]);

  const toggleAccordion = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="mx-auto max-w-content px-4 py-20 sm:px-6 lg:px-8">
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

      {/* Category Pills Filter */}
      <div className="mb-10 flex flex-wrap items-center justify-center gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-full px-5 py-2 text-xs font-extrabold transition-all duration-200 cursor-pointer ${
              selectedCategory === cat
                ? "bg-primary text-white shadow-md scale-105"
                : "bg-surface-elevated text-text-secondary hover:text-text-primary hover:bg-primary/10 border border-primary/10"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Accordion List */}
      <div className="mx-auto max-w-3xl space-y-4">
        {filteredFaqs.map((faq) => {
          const isOpen = openId === faq.id;
          return (
            <div
              key={faq.id}
              className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                isOpen
                  ? "border-primary/40 bg-surface-elevated shadow-md"
                  : "border-primary/15 bg-surface-elevated/70 hover:border-primary/30 shadow-xs"
              }`}
            >
              <button
                onClick={() => toggleAccordion(faq.id)}
                className="flex w-full items-center justify-between gap-4 p-5 sm:p-6 text-left font-heading text-base sm:text-lg font-bold text-text-primary transition-colors hover:text-primary cursor-pointer"
              >
                <span className="flex items-center gap-3">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black ${isOpen ? "bg-primary text-white" : "bg-primary/10 text-primary"}`}
                  >
                    Q
                  </span>
                  <span>{faq.question}</span>
                </span>
                <ChevronDown
                  size={20}
                  className={`shrink-0 text-primary transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isOpen && (
                <div className="px-6 pb-6 pt-1 text-sm sm:text-base leading-relaxed text-text-secondary border-t border-primary/10 bg-surface/50">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Still Have Questions Box */}
      <div className="mx-auto mt-14 max-w-2xl rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-surface-elevated to-secondary/5 p-8 text-center shadow-md">
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
            className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 font-bold text-white shadow-md hover:brightness-110 transition-all active:scale-95"
          >
            <MessageCircle size={18} /> Chat On WhatsApp
          </a>
          <Link
            to="/faq"
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-surface-elevated px-7 py-3 font-bold text-primary hover:bg-primary hover:text-white transition-all shadow-xs"
          >
            <Sparkles size={16} /> View All FAQs Page
          </Link>
        </div>
      </div>
    </section>
  );
}

export default FaqSection;
