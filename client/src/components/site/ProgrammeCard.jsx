/**
 * src/components/site/ProgrammeCard.jsx (REPLACES the F15 version)
 *
 * Client Issue 2: the ENTIRE card is now a link to the programme's
 * detail page — for Active AND Coming Soon alike, not just via the
 * title or the Enroll Now button. Visual UI is untouched (identical
 * markup/classes throughout) — only the click-target model changed.
 *
 * "Enroll Now" inside the hover panel can no longer be a nested <Link>
 * (invalid HTML — an <a> inside an <a>), so it's now a <button> that
 * stops propagation and navigates imperatively straight to the
 * enrollment form, bypassing the detail page entirely as before.
 *
 * The old touch-device-only corner icon is removed — redundant now
 * that the whole card is tappable on every device.
 */

import { Link, useNavigate } from 'react-router-dom';
import { Clock, Star, ArrowUpRight, Users } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { formatCurrency } from '../../utils/formatters';
import { PROGRAMME_STATUS, PROGRAMME_CATEGORY_LABELS } from '../../utils/constants';

const CATEGORY_GRADIENTS = {
  tech_development: 'from-primary/90 to-primary/50',
  management: 'from-secondary/90 to-secondary/50',
  short_term: 'from-accent/90 to-accent/50',
};

export function ProgrammeCard({ programme }) {
  const navigate = useNavigate();
  const isActive = programme.status === PROGRAMME_STATUS.ACTIVE;
  const gradient = CATEGORY_GRADIENTS[programme.category] || CATEGORY_GRADIENTS.tech_development;

  const handleEnrollClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/enroll?programme=${programme.slug}`);
  };

  return (
    <Link to={`/programmes/${programme.slug}`} className="block h-full group">
      <div className={` programme-card group h-full border border-border/80 bg-surface-elevated rounded-2xl overflow-hidden shadow-card transition-all duration-300 hover:shadow-card-lift hover:border-primary/30`}>
        <div className={`relative flex h-44 items-center justify-center bg-linear-to-br ${gradient} text-white overflow-hidden`}>
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]"></div>
          <span className="font-heading text-4xl font-extrabold tracking-wider opacity-90 drop-shadow-sm relative z-10">{programme.name.slice(0, 2).toUpperCase()}</span>
          <span className={`absolute right-3 top-3 rounded-full ${!isActive ? "bg-primary/90" : "bg-secondary/50"} backdrop-blur-md px-3.5 py-1.5 text-xs font-bold text-white shadow-sm z-10 border border-white/20`}>
            {isActive ? formatCurrency(programme.fees?.full) : 'Coming Soon'}
          </span>
        </div>

        <div className="p-6 flex flex-col justify-around items-start h-[calc(100%-11rem)] ">
          <span className={`mb-2.5 inline-block rounded-full ${isActive ? "bg-primary/10 text-primary" : "bg-primary/10 text-primary/50"} px-3.5 py-1 text-xs font-bold tracking-wide`}>
            {PROGRAMME_CATEGORY_LABELS[programme.category]}
          </span>
          <h3 className={`mb-3 font-heading text-xl font-bold leading-snug ${isActive ? " text-black/80 group-hover:text-primary" : 'text-black/50 group-hover:text-primary'} transition-colors whitespace text-nowrap truncate `}>{programme.name}</h3>
          <div className="flex items-center gap-1 text-xs text-warning">
            {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={13} fill="currentColor" />)}
            <span className="ml-1.5 font-semibold text-text-secondary">5.0</span>
          </div>
          <div className="w-full mt-5 flex items-center justify-between border-t border-primary/20 pt-3.5 text-xs font-medium text-text-secondary">
            <span className={`flex items-center gap-1.5 ${!isActive && " text-primary/50 "}`}><Clock size={14} className={`${isActive ? "text-primary/70" : "text-primary/50"}`} /> {programme.duration}</span>
            <span className={`flex items-center gap-1.5 ${!isActive && " text-primary/50 "}`}><Users size={14} className={`${isActive ? "text-secondary/80" : "text-primary/50"}`} /> {programme.enrollmentCount || 0} enrolled</span>
          </div>
        </div>

        <div className="programme-card-hover-panel hidden md:flex rounded-2xl">
          <div className="w-full">
            <span className="mb-2 inline-block rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
              {PROGRAMME_CATEGORY_LABELS[programme.category]}
            </span>
            <h3 className="mb-3 font-heading text-xl font-extrabold leading-snug text-text-primary">{programme.name}</h3>
            {isActive && <p className="mb-2 font-heading text-2xl font-black text-primary">{formatCurrency(programme.fees?.full)}</p>}
            <p className="mb-5 line-clamp-3 text-sm leading-relaxed text-text-secondary">{programme.description}</p>
            <div className="flex items-center gap-1 text-xs text-warning">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={13} fill="currentColor" />)}
              <span className="ml-1 text-text-secondary font-medium">5.0 ({programme.enrollmentCount || 0} enrolled)</span>
            </div>
            {isActive ? (
              <button
                onClick={handleEnrollClick}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:brightness-110 hover:shadow-lg active:scale-[0.98] cursor-pointer"
              >
                Enroll Now <ArrowUpRight size={16} />
              </button>
            ) : (
              <Badge color="grey" className="mt-6">Coming Soon</Badge>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default ProgrammeCard;