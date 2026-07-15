/**
 * ProgrammeCard — used on HomePage (teaser), ProgrammesPage, and
 * ProgrammeCategoryPage. Shows name, category chip, duration, and a
 * status-conditional footer: Active programmes are clickable links to
 * the detail page; Coming Soon programmes show a dimmed badge instead.
 */

import { Link } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { PROGRAMME_STATUS } from '../../utils/constants';

export function ProgrammeCard({ programme }) {
  const isActive = programme.status === PROGRAMME_STATUS.ACTIVE;

  const content = (
    <Card hoverable={isActive} className={`h-full ${!isActive ? 'opacity-70' : ''}`}>
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="font-heading text-base font-semibold text-text-primary truncate">{programme.name}</h3>
        <Badge color={isActive ? 'green' : 'grey'}>{isActive ? 'Active' : 'Coming Soon'}</Badge>
      </div>
      <p className="mb-4 flex items-center gap-1.5 text-sm text-text-secondary">
        <Clock size={15} /> {programme.duration}
      </p>
      {isActive && (
        <span className="flex items-center gap-1 text-sm font-medium text-primary">
          View Details <ArrowRight size={15} />
        </span>
      )}
    </Card>
  );

  return isActive ? <Link to={`/programmes/${programme.slug}`}>{content}</Link> : content;
}

export default ProgrammeCard;