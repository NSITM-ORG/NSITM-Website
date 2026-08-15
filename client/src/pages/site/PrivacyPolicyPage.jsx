/**
 * src/pages/site/PrivacyPolicyPage.jsx
 * Nextserve School of IT & Management - Privacy Policy
 * Now fully data-driven.
 */

import {
  ShieldCheck,
  Lock,
  Eye,
  Database,
  Bell,
  Mail,
  FileText,
} from "lucide-react";
import { Link } from "react-router-dom";

/* ──────────────────────────────────────────────────────────────
   Icon map
   ────────────────────────────────────────────────────────────── */
const ICON_MAP = {
  ShieldCheck,
  Lock,
  Eye,
  Database,
  Bell,
  Mail,
  FileText,
};

/* ──────────────────────────────────────────────────────────────
   Dummy / default data (exactly matches original hardcoded content)
   ────────────────────────────────────────────────────────────── */
// eslint-disable-next-line react-refresh/only-export-components
export const privacyPolicyDefaultData = {
  hero: {
    badgeIcon: "ShieldCheck",
    badgeText: "NEXTSERVE PRIVACY & DATA PROTECTION",
    title: "Privacy Policy",
    description:
      "At Nextserve School of Information Technology and Management (NSITM), we take your privacy seriously. Learn how we collect, protect, and manage your data.",
    lastUpdated: "January 2026",
    version: "2.0",
  },
  sections: [
    {
      id: "collect",
      icon: "Database",
      title: "1. Information We Collect",
      content: [
        {
          type: "paragraph",
          text: "When you enroll in a cohort, create an account, or request information from Nextserve, we collect essential personal and academic data required to process your application and manage your educational journey:",
        },
        {
          type: "list",
          items: [
            {
              label: "Personal Identifiers:",
              text: "Full legal name, email address, phone number, and residential state/country.",
            },
            {
              label: "Enrollment Records:",
              text: "Selected tech/management programmes, preferred learning format (In-Person vs. Online), and cohort schedules.",
            },
            {
              label: "Transaction Metadata:",
              text: "Payment reference numbers, receipt uploads, and installment schedules (financial data processed via certified payment gateways).",
            },
            {
              label: "Academic Progress:",
              text: "Project submissions, attendance records, instructor feedback, and certificate issuance status.",
            },
          ],
        },
      ],
    },
    {
      id: "use",
      icon: "Eye",
      title: "2. How We Use Your Data",
      content: [
        {
          type: "paragraph",
          text: "Nextserve utilizes collected student information strictly for academic, administrative, and verified institutional purposes:",
        },
        {
          type: "list",
          items: [
            {
              text: "To verify your application eligibility and confirm cohort placements.",
            },
            {
              text: "To provide live class access, portal credentials, and learning resources.",
            },
            {
              text: "To generate verifiable digital certificates and transcript credentials upon program completion.",
            },
            {
              text: "To send critical academic updates, timetable changes, and payment deadline reminders via SMS or Email.",
            },
            {
              text: "To connect qualified graduates with industry hiring partners (only with your explicit opt-in consent).",
            },
          ],
        },
      ],
    },
    {
      id: "security",
      icon: "Lock",
      title: "3. Data Security & Storage",
      content: [
        {
          type: "paragraph",
          text: "We implement industry-standard technical and organizational safeguards to ensure your personal information remains confidential and protected against unauthorized access, loss, or misuse:",
        },
        {
          type: "grid",
          items: [
            {
              title: "SSL/TLS Encryption",
              description:
                "All browser-to-server data transmissions are protected by 256-bit SSL encryption protocols.",
            },
            {
              title: "Role-Based Access",
              description:
                "Administrative access to student records is strictly restricted to verified staff on a need-to-know basis.",
            },
          ],
        },
      ],
    },
    {
      id: "rights",
      icon: "Bell",
      title: "4. Your Data Rights & Choices",
      content: [
        {
          type: "paragraph",
          text: "You have full control over your personal data submitted to Nextserve:",
        },
        {
          type: "list",
          items: [
            {
              label: "Right to Access & Rectify:",
              text: "You may review and update your profile details anytime via your student portal dashboard.",
            },
            {
              label: "Right to Deletion:",
              text: "You may request the permanent removal of non-essential profile data upon cohort graduation.",
            },
            {
              label: "Communication Preferences:",
              text: "You can opt out of promotional newsletters while retaining critical cohort notification messages.",
            },
          ],
        },
      ],
    },
  ],
  supportCallout: {
    icon: "Mail",
    title: "Have Questions About Your Privacy?",
    description:
      "Contact our Data Protection Officer for inquiries regarding your student records or data rights.",
    ctaLabel: "Contact DPO",
    ctaIcon: "FileText",
    ctaHref: "mailto:info@nsitm.org.ng", // note: external mailto
  },
  bottomLinks: {
    left: { label: "Read Terms of Service →", to: "/terms-of-service" },
    right: { label: "Back to Home", to: "/" },
  },
};

/* ──────────────────────────────────────────────────────────────
   Component
   ────────────────────────────────────────────────────────────── */
export function PrivacyPolicyPage({ data = privacyPolicyDefaultData }) {
  const { hero, sections, supportCallout, bottomLinks } = data;

  const BadgeIcon = ICON_MAP[hero.badgeIcon] || ShieldCheck;
  const SupportIcon = ICON_MAP[supportCallout.icon] || Mail;
  const CtaIcon = ICON_MAP[supportCallout.ctaIcon] || FileText;

  return (
    <div className="min-h-screen bg-surface text-text-primary pb-20">
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
            const SectionIcon = ICON_MAP[section.icon] || Database;
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
                              {item.label ? (
                                <>
                                  <strong className="text-text-primary">
                                    {item.label}
                                  </strong>{" "}
                                  {item.text}
                                </>
                              ) : (
                                item.text
                              )}
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

          {/* Section - Contact Box */}
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
            <a
              href={supportCallout.ctaHref}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-white shadow-md hover:brightness-110 transition-all text-sm shrink-0"
            >
              {supportCallout.ctaLabel} <CtaIcon size={16} />
            </a>
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

export default PrivacyPolicyPage;