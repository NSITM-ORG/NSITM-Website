/**
 * CohortCard — used on HomePage's featured-active-cohorts section.
 * Shows programme name, start date, delivery format, and an Enroll Now
 * button carrying the programme identifier per FR-01.1.
 */

import { Link } from 'react-router-dom';
import { Calendar, Globe, Building2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { formatDate } from '../../utils/formatters';
import { DELIVERY_FORMATS } from '../../utils/constants';

export function CohortCard({ cohort }) {
  const isOnline = cohort.deliveryFormat === DELIVERY_FORMATS.ONLINE;

  return (
    <Card className="flex flex-col gap-3">
      <h3 className="font-heading text-base font-semibold text-text-primary">{cohort.programme?.name}</h3>
      <p className="text-sm text-text-secondary">{cohort.name}</p>
      <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
        <span className="flex items-center gap-1.5">
          <Calendar size={15} /> {formatDate(cohort.startDate)}
        </span>
        <span className="flex items-center gap-1.5">
          {isOnline ? <Globe size={15} /> : <Building2 size={15} />}
          {isOnline ? 'Online' : 'In-Person'}
        </span>
      </div>
      <Link
        to={`/enroll?programme=${cohort.programme?.slug}`}
        className="mt-1 inline-flex w-fit items-center justify-center rounded-sm bg-primary px-4 py-2.5 text-sm font-medium text-white transition-all hover:brightness-90 active:scale-[0.98]"
      >
        Enroll Now
      </Link>
    </Card>
  );
}

export default CohortCard;