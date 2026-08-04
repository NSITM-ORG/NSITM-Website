/**
 * src/pages/site/TermsOfServicePage.jsx
 * Nextserve School of IT & Management - Terms of Service
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

export function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-surface pb-20">
      {/* ── Page Header Hero ────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-surface-elevated border-b border-primary/15 py-16 sm:py-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-75 bg-primary/10 rounded-full blur-3xl pointer-events-none z-0"></div>

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary text-white text-[11px] font-extrabold tracking-wider shadow-sm mb-4">
            <FileText size={14} />
            <span>NEXTSERVE ACADEMY TERMS & CONDITIONS</span>
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-text-primary tracking-tight">
            Terms of Service
          </h1>
          <p className="mt-4 text-base sm:text-lg text-text-secondary max-w-2xl mx-auto font-medium">
            Please read these terms and conditions carefully before enrolling in
            any programme or using the Nextserve School of Information
            Technology and Management (NSITM) learning portal.
          </p>
          <div className="mt-4 text-xs font-semibold text-text-secondary/80">
            <span>Last Updated: January 2026</span> • <span>Version 2.0</span>
          </div>
        </div>
      </section>

      {/* ── Content Container ────────────────────────────────────────── */}
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-12">
        <div className="space-y-12">
          {/* Section 1 */}
          <section className="rounded-2xl border border-primary/15 bg-surface-elevated p-6 sm:p-8 shadow-sm transition-all hover:border-primary/30">
            <div className="flex items-center gap-3 mb-4 text-primary">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <CheckCircle2 size={22} />
              </div>
              <h2 className="font-heading text-2xl font-bold text-text-primary">
                1. Acceptance of Terms
              </h2>
            </div>
            <div className="space-y-3 text-text-secondary leading-relaxed text-sm sm:text-base">
              <p>
                By completing an enrollment application, creating an account, or
                submitting payment for any course or cohort at Nextserve
                Systems, you acknowledge that you have read, understood, and
                agreed to be bound by these Terms of Service.
              </p>
              <p>
                If you are enrolling on behalf of an organization or corporate
                sponsor, you warrant that you possess full authority to bind
                that entity to these institutional terms.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="rounded-2xl border border-primary/15 bg-surface-elevated p-6 sm:p-8 shadow-sm transition-all hover:border-primary/30">
            <div className="flex items-center gap-3 mb-4 text-primary">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <UserCheck size={22} />
              </div>
              <h2 className="font-heading text-2xl font-bold text-text-primary">
                2. Admission & Enrollment Policies
              </h2>
            </div>
            <div className="space-y-3 text-text-secondary leading-relaxed text-sm sm:text-base">
              <ul className="list-disc pl-6 space-y-2 text-text-secondary">
                <li>
                  <strong className="text-text-primary">
                    Accurate Information:
                  </strong>{" "}
                  Applicants must provide accurate, truthful personal details
                  during registration. Misrepresentation may lead to immediate
                  disqualification.
                </li>
                <li>
                  <strong className="text-text-primary">
                    Prerequisites & Equipment:
                  </strong>{" "}
                  Students enrolling in technical programmes (e.g. Software
                  Engineering, Data Science, Cybersecurity) must possess a
                  functional personal computer and reliable internet
                  connectivity.
                </li>
                <li>
                  <strong className="text-text-primary">
                    Seat Confirmation:
                  </strong>{" "}
                  Admission into high-demand cohorts is finalized only upon
                  receipt of initial deposit or full tuition payment.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="rounded-2xl border border-primary/15 bg-surface-elevated p-6 sm:p-8 shadow-sm transition-all hover:border-primary/30">
            <div className="flex items-center gap-3 mb-4 text-primary">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <DollarSign size={22} />
              </div>
              <h2 className="font-heading text-2xl font-bold text-text-primary">
                3. Fees, Payments & Refund Policy
              </h2>
            </div>
            <div className="space-y-3 text-text-secondary leading-relaxed text-sm sm:text-base">
              <p>
                Nextserve offers competitive, transparent tuition pricing with
                structured installment payment options:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-text-secondary">
                <li>
                  <strong className="text-text-primary">
                    Installment Schedules:
                  </strong>{" "}
                  Students choosing installment plans must honor scheduled
                  payment deadlines prior to cohort milestone dates. Failure to
                  settle outstanding installments may result in temporary
                  suspension of portal access.
                </li>
                <li>
                  <strong className="text-text-primary">
                    Refund Eligibility:
                  </strong>{" "}
                  Tuition refund requests must be submitted in writing at least
                  7 days prior to the official cohort start date. A 10%
                  administrative processing fee applies.
                </li>
                <li>
                  <strong className="text-text-primary">
                    Non-Refundable Phase:
                  </strong>{" "}
                  Once classes commence and learning materials have been
                  distributed, tuition payments become non-refundable. However,
                  students in good standing may request a cohort deferral to a
                  subsequent start date.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section className="rounded-2xl border border-primary/15 bg-surface-elevated p-6 sm:p-8 shadow-sm transition-all hover:border-primary/30">
            <div className="flex items-center gap-3 mb-4 text-primary">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <Award size={22} />
              </div>
              <h2 className="font-heading text-2xl font-bold text-text-primary">
                4. Certification & Academic Standards
              </h2>
            </div>
            <div className="space-y-3 text-text-secondary leading-relaxed text-sm sm:text-base">
              <p>
                To qualify for an accredited Nextserve Certificate of
                Completion, students must satisfy all institutional academic
                criteria:
              </p>
              <div className="grid gap-4 sm:grid-cols-2 mt-4">
                <div className="p-4 rounded-xl bg-surface border border-primary/10">
                  <h4 className="font-bold text-text-primary text-sm mb-1">
                    80% Attendance
                  </h4>
                  <p className="text-xs text-text-secondary">
                    Mandatory active participation in live virtual sessions or
                    in-person campus classes.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-primary/10">
                  <h4 className="font-bold text-text-primary text-sm mb-1">
                    Capstone Project Defense
                  </h4>
                  <p className="text-xs text-text-secondary">
                    Successful defense and submission of practical production
                    projects evaluated by instructors.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="rounded-2xl border border-primary/15 bg-surface-elevated p-6 sm:p-8 shadow-sm transition-all hover:border-primary/30">
            <div className="flex items-center gap-3 mb-4 text-primary">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <ShieldAlert size={22} />
              </div>
              <h2 className="font-heading text-2xl font-bold text-text-primary">
                5. Code of Conduct & Intellectual Property
              </h2>
            </div>
            <div className="space-y-3 text-text-secondary leading-relaxed text-sm sm:text-base">
              <p>
                Nextserve maintains a respectful, inclusive learning community.
                Harassment, academic dishonesty, plagiarism, or unauthorized
                redistribution of proprietary curriculum content, lecture
                videos, or codebase templates is strictly prohibited and grounds
                for immediate expulsion.
              </p>
            </div>
          </section>

          {/* Section 6 - Support Callout */}
          <section className="rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h3 className="font-heading text-xl font-bold text-text-primary flex items-center gap-2">
                <HelpCircle className="text-primary" size={20} />
                Need Clarification on Our Terms?
              </h3>
              <p className="mt-1 text-sm text-text-secondary">
                Our student support advisors are here to help answer any
                questions before or after enrollment.
              </p>
            </div>
            <Link
              to="/faq"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-white shadow-md hover:brightness-110 transition-all text-sm shrink-0"
            >
              Visit FAQs <FileText size={16} />
            </Link>
          </section>

          {/* Bottom Nav Links */}
          <div className="pt-6 border-t border-primary/15 flex items-center justify-between text-sm font-semibold">
            <Link to="/privacy-policy" className="text-primary hover:underline">
              &larr; Read Privacy Policy
            </Link>
            <Link to="/" className="text-text-secondary hover:text-primary">
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default TermsOfServicePage;
