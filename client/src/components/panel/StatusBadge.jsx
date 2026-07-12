/**
 * StatusBadge — resolves a raw payment/instalment status string into
 * the correctly-coloured Badge, per FRD FR-03.2's colour mapping
 * (grey/yellow/green/red). Single source of truth for this mapping so
 * every list/table/detail view renders statuses identically.
 */

import { Badge } from '../ui/Badge.jsx';
import { PAYMENT_STATUS_LABELS, PAYMENT_STATUS_COLORS } from '../../utils/constants.js';

const INSTALMENT_LABELS = {
  not_submitted: 'Outstanding',
  pending: 'Pending Review',
  confirmed: 'Confirmed',
  rejected: 'Rejected',
};
const INSTALMENT_COLORS = { not_submitted: 'grey', pending: 'yellow', confirmed: 'green', rejected: 'red' };

export function StatusBadge({ status, isPartialEnrollment, isOverdue, kind = 'payment' }) {
  if (isOverdue) return <Badge color="red">Overdue</Badge>;

  if (kind === 'instalment') {
    return <Badge color={INSTALMENT_COLORS[status] || 'grey'}>{INSTALMENT_LABELS[status] || status}</Badge>;
  }

  // Payment status: Not Paid partials get the distinguishing label per FR-04.4
  const label =
    status === 'not_paid' && isPartialEnrollment
      ? 'Not Paid — No Receipt'
      : PAYMENT_STATUS_LABELS[status] || status;

  return <Badge color={PAYMENT_STATUS_COLORS[status] || 'grey'}>{label}</Badge>;
}

export default StatusBadge;