/**
 * src/components/site/CohortCard.jsx (REPLACES the F17 version)
 * Same whole-card-is-a-link pattern as ProgrammeCard. Completed cohorts
 * show a "Concluded" badge instead of Enroll Now.
 */

import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Globe, Building2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { formatDate } from '../../utils/formatters';
import { DELIVERY_FORMATS, COHORT_STATUS } from '../../utils/constants';

export function CohortCard({ cohort }) {
  const navigate = useNavigate();
  const isOnline = cohort.deliveryFormat === DELIVERY_FORMATS.ONLINE;
  const isCompleted = cohort.status === COHORT_STATUS.COMPLETED;

  const handleEnrollClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/enroll?programme=${cohort.programme?.slug}&cohort=${cohort.id}`);
  };

  return (
    <Link to={`/cohorts/${cohort.id}`} className="block h-full group">
      <Card className="flex h-full flex-col justify-between gap-6 shadow-sm rounded-2xl bg-surface-elevated glass-panel hover:shadow-card-lift  transition-all duration-700 hover:border-primary/30">
        <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span
              className={`mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${isOnline ? "bg-secondary/10 text-secondary" : "bg-primary/10 text-primary"}`}
            >
              {isOnline ? <Globe size={13} /> : <Building2 size={13} />}{" "}
              {isOnline ? "Online" : "In-Person"}
            </span>
            {isCompleted && (
              <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-text-secondary border border-border/60">
                Concluded
              </span>
            )}
          </div>
          <h3 className="font-heading text-lg font-bold text-text-primary group-hover:text-primary transition-colors">
            {cohort.programme?.name}
          </h3>
          <p className="text-sm font-medium text-text-secondary">
            {cohort.name}
          </p>
        </div>

        <div className="space-y-4 pt-6 border-t border-primary/20 ">
          <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-text-secondary">
            <Calendar size={14} className="text-primary/70" />
            <span>Starts: {formatDate(cohort.startDate)}</span>
          </div>

          {isCompleted && (
            <button
              // onClick={handleEnrollClick}
              disabled
              className="inline-flex w-full items-center justify-center rounded-full bg-secondary/30  px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-110 hover:shadow-md active:scale-[0.98] cursor-pointer"
            >
              Completed
            </button>
          )}

          {!isCompleted && (
            <button
              onClick={handleEnrollClick}
              className="inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-110 hover:shadow-md active:scale-[0.98] cursor-pointer"
            >
              Enroll Now
            </button>
          )}
        </div>
      </Card>
    </Link>
  );
}

export default CohortCard;