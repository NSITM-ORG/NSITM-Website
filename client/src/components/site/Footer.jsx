/**
 * src/components/site/Footer.jsx
 *
 * Footer — updated to match the structural layout, sub-columns, featured links arrow markers,
 * Information HQ contact styling, and square social icon bar from the reference design,
 * seamlessly styled with Nextserve's palette and branding.
 */

import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, Navigation } from "lucide-react";
import { useManageState } from "../../hooks/useManageState";
import { InstagramIcon } from "../icons/Instagram";
import { LinkedinIcon } from "../icons/Linkedin";
import { FacebookIcon } from "../icons/Facebook";
import { TwitterIcon } from "../icons/Twitter";
import SiteLogo from "../assets/SiteLogo";

export function Footer() {
  const { settings, actions } = useManageState();

  useEffect(() => {
    if (!settings.publicSettings) actions.fetchPublicSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const institution = settings.publicSettings?.institution;
  console.log(settings);

  const phoneDisplay = institution?.phone || "+2349035007621, +2348037248978";
  const emailDisplay = institution?.email || "nsitmonline@gmail.com";
  const addressDisplay =
    institution?.address ||
    "Plot 3, Owolabi Street, Lord Bus Stop, Ago Palace Way, Okota, Lagos State, Nigeria";

  return (
    <footer className="mt-5 bg-surface-elevated ">
      <div className="mx-auto max-w-content px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* ── Left Column: Brand & Description & Square Socials (5 cols) ── */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <div className="mb-4">
                <SiteLogo />
              </div>
              <p className="mb-6 text-sm leading-relaxed text-text-secondary max-w-md">
                Nextserve Systems is a leading hands-on ICT and Management
                training institution in Nigeria, built on fourteen years of
                practical, project-based excellence to empower individuals and
                corporate workforces.
              </p>
            </div>

            {/* Square Social Buttons */}
            <div>
              <p className="mb-2.5 text-xs font-extrabold uppercase tracking-wider text-text-primary">
                Follow Our Handles
              </p>
              <div className="flex items-center gap-2.5">
                <SquareSocialIcon
                  href={institution?.facebook || "https://facebook.com"}
                  icon={FacebookIcon}
                  label="Facebook"
                />
                <SquareSocialIcon
                  href={institution?.twitter || "https://twitter.com"}
                  icon={TwitterIcon}
                  label="Twitter"
                />
                <SquareSocialIcon
                  href={institution?.linkedin || "https://linkedin.com"}
                  icon={LinkedinIcon}
                  label="LinkedIn"
                />
                <SquareSocialIcon
                  href={institution?.instagram || "https://instagram.com"}
                  icon={InstagramIcon}
                  label="Instagram"
                />
              </div>
            </div>
          </div>

          {/* ── Middle Column: Featured Links (4 cols) ────────────────────── */}
          <div className="lg:col-span-4">
            <h4 className="mb-6 font-heading text-lg font-extrabold text-primary tracking-wide">
              Quick Links
            </h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 text-sm font-medium">
              {/* Column 1 */}
              <div className="space-y-3">
                <FooterArrowLink to="/cohorts" label="Cohorts" />
                <FooterArrowLink to="/enroll" label="Admissions" />
                <FooterArrowLink to="/faq" label="FAQs" />
              </div>
              {/* Column 2 */}
              <div className="space-y-3">
                <FooterArrowLink to="/programmes" label="Courses" />
                <FooterArrowLink to="/about" label="About Us" />
                <FooterArrowLink to="/my-payment" label="Payments" />
              </div>
            </div>
          </div>

          {/* ── Right Column: Information HQ (3 cols) ─────────────────────── */}
          <div className="lg:col-span-3">
            <h4 className="mb-6 font-heading text-lg font-extrabold text-primary tracking-wide">
              Information HQ
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary/15 text-secondary mt-0.5 shadow-xs">
                  <Navigation size={16} className="rotate-45" />
                </div>
                <span className="text-sm font-medium leading-snug text-text-secondary">
                  {addressDisplay}
                </span>
              </li>

              <li className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary/15 text-secondary shadow-xs">
                  <Phone size={16} />
                </div>
                <a
                  href={`tel:${phoneDisplay}`}
                  className="text-sm font-semibold text-text-primary hover:text-primary transition-colors"
                >
                  {phoneDisplay}
                </a>
              </li>

              <li className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary/15 text-secondary shadow-xs">
                  <Mail size={16} />
                </div>
                <a
                  href={`mailto:${emailDisplay}`}
                  className="text-sm font-semibold text-text-primary hover:text-primary transition-colors break-all"
                >
                  {emailDisplay}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* ── Bottom Copyright Bar ────────────────────────────────────────── */}
      <div className="border-t border-primary/10 bg-primary py-8 text-center text-sm font-semibold text-white/90">
        <div className="mx-auto flex max-w-content flex-col items-center justify-between gap-2 px-4 lg:flex-row sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()}{" "}
            {institution?.name ||
              "Nextserve School of Information Technology and Management"}
            . All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-white/80 text-[11px]">
            <Link
              to="/privacy-policy"
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <span>•</span>
            <Link to="/terms-of-service" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterArrowLink({ to, label }) {
  return (
    <div>
      <Link
        to={to}
        className="group inline-flex items-center text-text-secondary hover:text-primary transition-colors"
      >
        <span className="mr-1.5 font-extrabold text-secondary group-hover:translate-x-0.5 transition-transform">
          &gt;
        </span>
        <span>{label}</span>
      </Link>
    </div>
  );
}

function SquareSocialIcon({ href, icon: Icon, label }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-surface text-text-secondary shadow-xs transition-all duration-200 hover:text-white hover:border-primary active:scale-95"
    >
      <Icon size={16} />
    </a>
  );
}

export default Footer;
