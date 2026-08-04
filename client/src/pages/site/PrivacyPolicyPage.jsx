/**
 * src/pages/site/PrivacyPolicyPage.jsx
 * Nextserve School of IT & Management - Privacy Policy
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

export function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-surface text-text-primary pb-20">
      {/* ── Page Header Hero ────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-surface-elevated border-b border-primary/15 py-16 sm:py-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-75 bg-primary/10 rounded-full blur-3xl pointer-events-none z-0"></div>

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary text-white text-[11px] font-extrabold tracking-wider shadow-sm mb-4">
            <ShieldCheck size={14} />
            <span>NEXTSERVE PRIVACY & DATA PROTECTION</span>
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-text-primary tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-4 text-base sm:text-lg text-text-secondary max-w-2xl mx-auto font-medium">
            At Nextserve School of Information Technology and Management
            (NSITM), we take your privacy seriously. Learn how we collect,
            protect, and manage your data.
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
                <Database size={22} />
              </div>
              <h2 className="font-heading text-2xl font-bold text-text-primary">
                1. Information We Collect
              </h2>
            </div>
            <div className="space-y-3 text-text-secondary leading-relaxed text-sm sm:text-base">
              <p>
                When you enroll in a cohort, create an account, or request
                information from Nextserve, we collect essential personal and
                academic data required to process your application and manage
                your educational journey:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-text-secondary">
                <li>
                  <strong className="text-text-primary">
                    Personal Identifiers:
                  </strong>{" "}
                  Full legal name, email address, phone number, and residential
                  state/country.
                </li>
                <li>
                  <strong className="text-text-primary">
                    Enrollment Records:
                  </strong>{" "}
                  Selected tech/management programmes, preferred learning format
                  (In-Person vs. Online), and cohort schedules.
                </li>
                <li>
                  <strong className="text-text-primary">
                    Transaction Metadata:
                  </strong>{" "}
                  Payment reference numbers, receipt uploads, and installment
                  schedules (financial data processed via certified payment
                  gateways).
                </li>
                <li>
                  <strong className="text-text-primary">
                    Academic Progress:
                  </strong>{" "}
                  Project submissions, attendance records, instructor feedback,
                  and certificate issuance status.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 2 */}
          <section className="rounded-2xl border border-primary/15 bg-surface-elevated p-6 sm:p-8 shadow-sm transition-all hover:border-primary/30">
            <div className="flex items-center gap-3 mb-4 text-primary">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <Eye size={22} />
              </div>
              <h2 className="font-heading text-2xl font-bold text-text-primary">
                2. How We Use Your Data
              </h2>
            </div>
            <div className="space-y-3 text-text-secondary leading-relaxed text-sm sm:text-base">
              <p>
                Nextserve utilizes collected student information strictly for
                academic, administrative, and verified institutional purposes:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-text-secondary">
                <li>
                  To verify your application eligibility and confirm cohort
                  placements.
                </li>
                <li>
                  To provide live class access, portal credentials, and learning
                  resources.
                </li>
                <li>
                  To generate verifiable digital certificates and transcript
                  credentials upon program completion.
                </li>
                <li>
                  To send critical academic updates, timetable changes, and
                  payment deadline reminders via SMS or Email.
                </li>
                <li>
                  To connect qualified graduates with industry hiring partners
                  (only with your explicit opt-in consent).
                </li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="rounded-2xl border border-primary/15 bg-surface-elevated p-6 sm:p-8 shadow-sm transition-all hover:border-primary/30">
            <div className="flex items-center gap-3 mb-4 text-primary">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <Lock size={22} />
              </div>
              <h2 className="font-heading text-2xl font-bold text-text-primary">
                3. Data Security & Storage
              </h2>
            </div>
            <div className="space-y-3 text-text-secondary leading-relaxed text-sm sm:text-base">
              <p>
                We implement industry-standard technical and organizational
                safeguards to ensure your personal information remains
                confidential and protected against unauthorized access, loss, or
                misuse:
              </p>
              <div className="grid gap-4 sm:grid-cols-2 mt-4">
                <div className="p-4 rounded-xl bg-surface border border-primary/10">
                  <h4 className="font-bold text-text-primary text-sm mb-1">
                    SSL/TLS Encryption
                  </h4>
                  <p className="text-xs text-text-secondary">
                    All browser-to-server data transmissions are protected by
                    256-bit SSL encryption protocols.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-primary/10">
                  <h4 className="font-bold text-text-primary text-sm mb-1">
                    Role-Based Access
                  </h4>
                  <p className="text-xs text-text-secondary">
                    Administrative access to student records is strictly
                    restricted to verified staff on a need-to-know basis.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="rounded-2xl border border-primary/15 bg-surface-elevated p-6 sm:p-8 shadow-sm transition-all hover:border-primary/30">
            <div className="flex items-center gap-3 mb-4 text-primary">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <Bell size={22} />
              </div>
              <h2 className="font-heading text-2xl font-bold text-text-primary">
                4. Your Data Rights & Choices
              </h2>
            </div>
            <div className="space-y-3 text-text-secondary leading-relaxed text-sm sm:text-base">
              <p>
                You have full control over your personal data submitted to
                Nextserve:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-text-secondary">
                <li>
                  <strong className="text-text-primary">
                    Right to Access & Rectify:
                  </strong>{" "}
                  You may review and update your profile details anytime via
                  your student portal dashboard.
                </li>
                <li>
                  <strong className="text-text-primary">
                    Right to Deletion:
                  </strong>{" "}
                  You may request the permanent removal of non-essential profile
                  data upon cohort graduation.
                </li>
                <li>
                  <strong className="text-text-primary">
                    Communication Preferences:
                  </strong>{" "}
                  You can opt out of promotional newsletters while retaining
                  critical cohort notification messages.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 5 - Contact Box */}
          <section className="rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h3 className="font-heading text-xl font-bold text-text-primary flex items-center gap-2">
                <Mail className="text-primary" size={20} />
                Have Questions About Your Privacy?
              </h3>
              <p className="mt-1 text-sm text-text-secondary">
                Contact our Data Protection Officer for inquiries regarding your
                student records or data rights.
              </p>
            </div>
            <a
              href="mailto:info@nsitm.org.ng"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-white shadow-md hover:brightness-110 transition-all text-sm shrink-0"
            >
              Contact DPO <FileText size={16} />
            </a>
          </section>

          {/* Bottom Nav Links */}
          <div className="pt-6 border-t border-primary/15 flex items-center justify-between text-sm font-semibold">
            <Link
              to="/terms-of-service"
              className="text-primary hover:underline"
            >
              Read Terms of Service &rarr;
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

export default PrivacyPolicyPage;
