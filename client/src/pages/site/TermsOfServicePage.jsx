/**
 * src/pages/site/TermsOfServicePage.jsx
 * Nextserve School of IT & Management - Terms of Service
 * Now fully data-driven.
 */

import {
  FileText,
  CheckCircle2,
  DollarSign,
  UserCheck,
  ShieldAlert,
  Award,
  HelpCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

/* ──────────────────────────────────────────────────────────────
   Icon map – keeps lucide icons referenceable from string keys
   ────────────────────────────────────────────────────────────── */
const ICON_MAP = {
  FileText,
  CheckCircle2,
  DollarSign,
  UserCheck,
  ShieldAlert,
  Award,
  HelpCircle,
};

/* ──────────────────────────────────────────────────────────────
   Dummy / default data (exactly matches original hardcoded content)
   ────────────────────────────────────────────────────────────── */
// eslint-disable-next-line react-refresh/only-export-components
export const termsOfServiceDefaultData = {
  hero: {
    badgeIcon: "FileText",
    badgeText: "NEXTSERVE ACADEMY TERMS & CONDITIONS",
    title: "Terms of Service",
    description:
      "Please read these terms and conditions carefully before enrolling in any programme or using the Nextserve School of Information Technology and Management (NSITM) learning portal.",
    lastUpdated: "January 2026",
    version: "2.0",
  },
  sections: [
    {
      id: "acceptance",
      icon: "CheckCircle2",
      title: "1. Acceptance of Terms",
      content: [
        {
          type: "paragraph",
          text: "By completing an enrollment application, creating an account, or submitting payment for any course or cohort at Nextserve Systems, you acknowledge that you have read, understood, and agreed to be bound by these Terms of Service.",
        },
        {
          type: "paragraph",
          text: "If you are enrolling on behalf of an organization or corporate sponsor, you warrant that you possess full authority to bind that entity to these institutional terms.",
        },
      ],
    },
    {
      id: "admission",
      icon: "UserCheck",
      title: "2. Admission & Enrollment Policies",
      content: [
        {
          type: "list",
          items: [
            {
              label: "Accurate Information:",
              text: "Applicants must provide accurate, truthful personal details during registration. Misrepresentation may lead to immediate disqualification.",
            },
            {
              label: "Prerequisites & Equipment:",
              text: "Students enrolling in technical programmes (e.g. Software Engineering, Data Science, Cybersecurity) must possess a functional personal computer and reliable internet connectivity.",
            },
            {
              label: "Seat Confirmation:",
              text: "Admission into high-demand cohorts is finalized only upon receipt of initial deposit or full tuition payment.",
            },
          ],
        },
      ],
    },
    {
      id: "fees",
      icon: "DollarSign",
      title: "3. Fees, Payments & Refund Policy",
      content: [
        {
          type: "paragraph",
          text: "Nextserve offers competitive, transparent tuition pricing with structured installment payment options:",
        },
        {
          type: "list",
          items: [
            {
              label: "Installment Schedules:",
              text: "Students choosing installment plans must honor scheduled payment deadlines prior to cohort milestone dates. Failure to settle outstanding installments may result in temporary suspension of portal access.",
            },
            {
              label: "Refund Eligibility:",
              text: "Tuition refund requests must be submitted in writing at least 7 days prior to the official cohort start date. A 10% administrative processing fee applies.",
            },
            {
              label: "Non-Refundable Phase:",
              text: "Once classes commence and learning materials have been distributed, tuition payments become non-refundable. However, students in good standing may request a cohort deferral to a subsequent start date.",
            },
          ],
        },
      ],
    },
    {
      id: "certification",
      icon: "Award",
      title: "4. Certification & Academic Standards",
      content: [
        {
          type: "paragraph",
          text: "To qualify for an accredited Nextserve Certificate of Completion, students must satisfy all institutional academic criteria:",
        },
        {
          type: "grid",
          items: [
            {
              title: "80% Attendance",
              description:
                "Mandatory active participation in live virtual sessions or in-person campus classes.",
            },
            {
              title: "Capstone Project Defense",
              description:
                "Successful defense and submission of practical production projects evaluated by instructors.",
            },
          ],
        },
      ],
    },
    {
      id: "conduct",
      icon: "ShieldAlert",
      title: "5. Code of Conduct & Intellectual Property",
      content: [
        {
          type: "paragraph",
          text: "Nextserve maintains a respectful, inclusive learning community. Harassment, academic dishonesty, plagiarism, or unauthorized redistribution of proprietary curriculum content, lecture videos, or codebase templates is strictly prohibited and grounds for immediate expulsion.",
        },
      ],
    },
  ],
  supportCallout: {
    icon: "HelpCircle",
    title: "Need Clarification on Our Terms?",
    description:
      "Our student support advisors are here to help answer any questions before or after enrollment.",
    ctaLabel: "Visit FAQs",
    ctaIcon: "FileText",
    ctaTo: "/faq",
  },
  bottomLinks: {
    left: { label: "← Read Privacy Policy", to: "/privacy-policy" },
    right: { label: "Back to Home", to: "/" },
  },
};

/* ──────────────────────────────────────────────────────────────
   Component
   ────────────────────────────────────────────────────────────── */
export function TermsOfServicePage({ data = termsOfServiceDefaultData }) {
  const { hero, sections, supportCallout, bottomLinks } = data;

  const BadgeIcon = ICON_MAP[hero.badgeIcon] || FileText;
  const SupportIcon = ICON_MAP[supportCallout.icon] || HelpCircle;
  const CtaIcon = ICON_MAP[supportCallout.ctaIcon] || FileText;

  return (
    <div className="min-h-screen bg-surface pb-20">
      {/* ── Page Header Hero ────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-surface-elevated border-b border-primary/15 py-16 sm:py-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-75 bg-primary/10 rounded-full blur-3xl pointer-events-none z-0"></div>

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary text-white text-[11px] font-extrabold tracking-wider shadow-sm mb-4">
            <BadgeIcon size={14} />
            <span>{hero.badgeText}</span>
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-text-primary tracking-tight">
            {hero.title}
          </h1>
          <p className="mt-4 text-base sm:text-lg text-text-secondary max-w-2xl mx-auto font-medium">
            {hero.description}
          </p>
          <div className="mt-4 text-xs font-semibold text-text-secondary/80">
            <span>Last Updated: {hero.lastUpdated}</span> •{" "}
            <span>Version {hero.version}</span>
          </div>
        </div>
      </section>

      {/* ── Content Container ────────────────────────────────────────── */}
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-12">
        <div className="space-y-12">
          {sections.map((section) => {
            const SectionIcon = ICON_MAP[section.icon] || CheckCircle2;
            return (
              <section
                key={section.id}
                className="rounded-2xl border border-primary/15 bg-surface-elevated p-6 sm:p-8 shadow-sm transition-all hover:border-primary/30"
              >
                <div className="flex items-center gap-3 mb-4 text-primary">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                    <SectionIcon size={22} />
                  </div>
                  <h2 className="font-heading text-2xl font-bold text-text-primary">
                    {section.title}
                  </h2>
                </div>

                <div className="space-y-3 text-text-secondary leading-relaxed text-sm sm:text-base">
                  {section.content.map((block, idx) => {
                    if (block.type === "paragraph") {
                      return <p key={idx}>{block.text}</p>;
                    }
                    if (block.type === "list") {
                      return (
                        <ul
                          key={idx}
                          className="list-disc pl-6 space-y-2 text-text-secondary"
                        >
                          {block.items.map((item, i) => (
                            <li key={i}>
                              <strong className="text-text-primary">
                                {item.label}
                              </strong>{" "}
                              {item.text}
                            </li>
                          ))}
                        </ul>
                      );
                    }
                    if (block.type === "grid") {
                      return (
                        <div
                          key={idx}
                          className="grid gap-4 sm:grid-cols-2 mt-4"
                        >
                          {block.items.map((card, i) => (
                            <div
                              key={i}
                              className="p-4 rounded-xl bg-surface border border-primary/10"
                            >
                              <h4 className="font-bold text-text-primary text-sm mb-1">
                                {card.title}
                              </h4>
                              <p className="text-xs text-text-secondary">
                                {card.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </section>
            );
          })}

          {/* Section - Support Callout */}
          <section className="rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h3 className="font-heading text-xl font-bold text-text-primary flex items-center gap-2">
                <SupportIcon className="text-primary" size={20} />
                {supportCallout.title}
              </h3>
              <p className="mt-1 text-sm text-text-secondary">
                {supportCallout.description}
              </p>
            </div>
            <Link
              to={supportCallout.ctaTo}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-white shadow-md hover:brightness-110 transition-all text-sm shrink-0"
            >
              {supportCallout.ctaLabel} <CtaIcon size={16} />
            </Link>
          </section>

          {/* Bottom Nav Links */}
          <div className="pt-6 border-t border-primary/15 flex items-center justify-between text-sm font-semibold">
            <Link
              to={bottomLinks.left.to}
              className="text-primary hover:underline"
            >
              {bottomLinks.left.label}
            </Link>
            <Link
              to={bottomLinks.right.to}
              className="text-text-secondary hover:text-primary"
            >
              {bottomLinks.right.label}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default TermsOfServicePage;