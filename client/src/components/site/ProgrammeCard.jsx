/**
 * src/components/site/ProgrammeCard.jsx (REPLACES the F6 version)
 *
 * ProgrammeCard — full structural rebuild mirroring the reference's
 * .course-item / .course-hover / .chover_content pattern: the visible
 * face shows image + price badge + category chip + title + meta row;
 * on hover, a secondary panel slides in from the left (translateX(-100%)
 * → translateX(0)) completely covering the face, revealing an expanded
 * description + Enroll Now CTA.
 *
 * Reskinned into our fixed primary/secondary palette via the
 * .programme-card / .programme-card-hover-panel utility classes added
 * in F14's index.css — no reference-CSS colors carried over.
 *
 * Since our Programme model has no dedicated "hero image" field (out of
 * original scope), the image face uses a deterministic category-based
 * placeholder graphic rather than a broken <img>. If a future image
 * field is added to Programme, swapping the `src` here is the only
 * change needed — the card structure already accounts for it.
 *
 * Touch-device fallback: hover states don't fire on touch, so the CTA
 * ("Enroll Now") is ALSO present as a small persistent icon-button on
 * the visible face (top-right, over the image) — ensures the card is
 * fully usable on mobile without relying on a hover state that will
 * never trigger there.
 */

import { Link } from 'react-router-dom';
import { Clock, Star, ArrowUpRight, Users } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { formatCurrency } from '../../utils/formatters';
import { PROGRAMME_STATUS, PROGRAMME_CATEGORY_LABELS } from '../../utils/constants';

// Deterministic placeholder gradient per category — avoids a blank/broken
// image state while no dedicated programme image field exists yet.
const CATEGORY_GRADIENTS = {
  tech_development: 'from-primary/90 to-primary/50',
  management: 'from-secondary/90 to-secondary/50',
  short_term: 'from-accent/90 to-accent/50',
};

export function ProgrammeCard({ programme }) {
  const isActive = programme.status === PROGRAMME_STATUS.ACTIVE;
  const gradient = CATEGORY_GRADIENTS[programme.category] || CATEGORY_GRADIENTS.tech_development;

  const cardInner = (
    <div className="programme-card group h-full border border-border bg-surface-elevated shadow-card transition-shadow duration-300 hover:shadow-card-lift">
      {/* ── Visible Face ─────────────────────────────────────────── */}
      <div className={`relative flex h-40 items-center justify-center bg-gradient-to-br ${gradient} text-white`}>
        <span className="font-heading text-3xl font-bold opacity-90">
          {programme.name.slice(0, 2).toUpperCase()}
        </span>

        {/* Price/status badge, top-right of image (reference: .course-price) */}
        <span className="absolute right-0 top-0 rounded-bl-md bg-primary px-3 py-1.5 text-xs font-bold text-white">
          {isActive ? formatCurrency(programme.fees?.full) : 'Coming Soon'}
        </span>

        {/* Touch-device persistent CTA icon (hover panel doesn't fire on touch) */}
        {isActive && (
          <Link
            to={`/programmes/${programme.slug}`}
            className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-primary shadow-card md:hidden"
            aria-label={`View ${programme.name}`}
          >
            <ArrowUpRight size={16} />
          </Link>
        )}
      </div>

      <div className="p-6">
        <span className="mb-2 inline-block rounded-sm bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          {PROGRAMME_CATEGORY_LABELS[programme.category]}
        </span>

        <h3 className="mb-3 font-heading text-base font-bold leading-snug text-text-primary">
          {isActive ? (
            <Link to={`/programmes/${programme.slug}`} className="hover:text-primary">
              {programme.name}
            </Link>
          ) : (
            programme.name
          )}
        </h3>

        <div className="flex items-center gap-1 text-xs text-warning">
          {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
          <span className="ml-1 text-text-secondary">5.0</span>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs font-medium text-text-secondary">
          <span className="flex items-center gap-1.5">
            <Clock size={14} /> {programme.duration}
          </span>
          <span className="flex items-center gap-1.5">
            <Users size={14} /> {programme.enrollmentCount || 0} enrolled
          </span>
        </div>
      </div>

      {/* ── Hover Panel (desktop only — slides in from left) ────── */}
      <div className="programme-card-hover-panel hidden md:flex">
        <div className="w-full">
          <span className="mb-2 inline-block rounded-sm bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {PROGRAMME_CATEGORY_LABELS[programme.category]}
          </span>
          <h3 className="mb-3 font-heading text-lg font-bold leading-snug text-text-primary">
            {programme.name}
          </h3>
          {isActive && (
            <p className="mb-2 font-heading text-2xl font-bold text-primary">
              {formatCurrency(programme.fees?.full)}
            </p>
          )}
          <p className="mb-5 line-clamp-3 text-sm text-text-secondary">
            {programme.description}
          </p>
          <div className="flex items-center gap-1 text-xs text-warning">
            {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
            <span className="ml-1 text-text-secondary">5.0 ({programme.enrollmentCount || 0} enrolled)</span>
          </div>
          {isActive ? (
            <Link
              to={`/programmes/${programme.slug}`}
              className="mt-5 inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-90 active:scale-[0.98]"
            >
              Enroll Now <ArrowUpRight size={15} />
            </Link>
          ) : (
            <Badge color="grey" className="mt-5">Coming Soon</Badge>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProgrammeCard;