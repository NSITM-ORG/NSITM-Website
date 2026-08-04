/**
 * EnrollmentDetailPage — /admin/enrollments/:id. The most complex Admin
 * page: full field display, receipt viewer, email-delivery-failure
 * banners, Confirm/Reject/Reset-to-Pending action buttons (role- and
 * status-conditional per FRD FR-04.5), and the instalment progress
 * table for instalment students.
 */

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useManageState } from '../../hooks/useManageState';
import { useSEO } from '../../hooks/useSEO';
import { useToast } from '../../hooks/useToast';
import { StatusBadge } from '../../components/panel/StatusBadge';
import { ReceiptViewer } from '../../components/panel/ReceiptViewer';
import { InstalmentProgressTable } from '../../components/panel/InstalmentProgressTable';
import { Button } from '../../components/ui/Button';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { RouteFallback } from '../../components/ui/Preloader';
import { formatDate, formatCurrency, humanizeEnum } from '../../utils/formatters';

export function EnrollmentDetailPage() {
  const { id } = useParams();
  const { isSuperAdmin } = useAuth();
  const { enrollments, payments, actions } = useManageState();
  const { showSuccess } = useToast();
  const [actionType, setActionType] = useState(null); // 'confirmed' | 'rejected' | 'reverse'

  useSEO({ title: 'Enrollment Detail' });

  const loadRecord = () => actions.fetchEnrollmentById(id);

  useEffect(() => {
    loadRecord();
    return () => actions.clearCurrentEnrollment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const enrollment = enrollments.currentEnrollment;

  if (enrollments.loading && !enrollment) return <RouteFallback />;
  if (!enrollment) return null;

  const handleAction = async (reason) => {
    try {
      if (actionType === 'reverse') {
        await actions.reversePaymentStatus({ id, reversalReason: reason });
        showSuccess('Payment reversed to Pending.');
      } else {
        await actions.updatePaymentStatus({ id, paymentStatus: actionType, rejectionReason: reason });
        showSuccess(`Payment ${actionType} successfully.`);
      }
      setActionType(null);
      loadRecord();
    } catch {
      // toast already shown centrally
    }
  };

  const emailFailures = Object.entries(enrollment.emailDeliveryStatus || {}).filter(([, v]) => v?.failed);

  return (
    <div>
      <Link to="/admin/enrollments" className="mb-5 flex w-fit items-center gap-1.5 text-sm text-text-secondary hover:text-primary">
        <ChevronLeft size={16} /> All Enrollments
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-text-primary">{enrollment.profile?.fullName}</h1>
          <p className="text-sm text-text-secondary">{enrollment.profile?.email}</p>
        </div>
        <StatusBadge status={enrollment.paymentStatus} isPartialEnrollment={enrollment.isPartialEnrollment} />
      </div>

      {emailFailures.length > 0 && (
        <div className="mb-6 flex items-center gap-2 rounded-md border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
          <AlertTriangle size={18} /> A confirmation/rejection email failed to deliver to this student. Contact
          them via WhatsApp.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <DetailCard title="Student Information">
            <DetailRow label="Full Name" value={enrollment.profile?.fullName} />
            <DetailRow label="Phone" value={enrollment.profile?.phone} link={`tel:${enrollment.profile?.phone}`} />
            <DetailRow label="WhatsApp" value={enrollment.profile?.whatsappNumber || 'Not provided'} />
            <DetailRow label="Email" value={enrollment.profile?.email} />
          </DetailCard>

          <DetailCard title="Enrollment Details">
            <DetailRow label="Programme" value={enrollment.programme?.name} />
            <DetailRow label="Cohort" value={enrollment.cohort?.name || 'Not provided'} />
            <DetailRow label="Delivery Format" value={humanizeEnum(enrollment.deliveryFormat) || 'Not provided'} />
            <DetailRow label="Payment Type" value={enrollment.paymentType ? humanizeEnum(enrollment.paymentType) : 'Not provided'} />
            <DetailRow label="Deposit Amount" value={enrollment.depositAmount ? formatCurrency(enrollment.depositAmount) : 'Not provided'} />
            <DetailRow label="Referred By Code" value={enrollment.referralCode || 'None'} />
            <DetailRow label="Enrollment Date" value={formatDate(enrollment.createdAt)} />
          </DetailCard>

          {enrollment.paymentStatus === 'rejected' && (
            <DetailCard title="Rejection Reason">
              <p className="text-sm text-text-secondary">{enrollment.rejectionReason}</p>
            </DetailCard>
          )}

          <DetailCard title="Payment Receipt">
            <ReceiptViewer receipt={enrollment.receipt} />
          </DetailCard>

          {enrollments.instalmentSummary && (
            <InstalmentProgressTable instalmentSummary={enrollments.instalmentSummary} onUpdated={loadRecord} />
          )}
        </div>

        <aside className="space-y-3">
          <DetailCard title="Actions">
            {enrollment.paymentStatus === 'pending' && (
              <div className="space-y-2">
                <Button variant="secondary" fullWidth onClick={() => setActionType('confirmed')}>
                  Confirm Payment
                </Button>
                <Button variant="danger" fullWidth onClick={() => setActionType('rejected')}>
                  Reject Payment
                </Button>
              </div>
            )}
            {enrollment.paymentStatus === 'confirmed' && isSuperAdmin && (
              <Button variant="outline" fullWidth onClick={() => setActionType('reverse')}>
                Reset to Pending
              </Button>
            )}
            {enrollment.paymentStatus === 'not_paid' && (
              <p className="text-sm text-text-secondary">No receipt submitted yet — no actions available.</p>
            )}
            {enrollment.paymentStatus === 'rejected' && (
              <p className="text-sm text-text-secondary">This record was rejected. No further action needed unless the student resubmits.</p>
            )}
          </DetailCard>

          {(enrollment.actionedBy || enrollment.reversedBy) && (
            <DetailCard title="Audit">
              {enrollment.actionedBy && <DetailRow label="Actioned By" value={enrollment.actionedBy.email} />}
              {enrollment.actionedAt && <DetailRow label="Action Date" value={formatDate(enrollment.actionedAt)} />}
              {enrollment.reversedBy && <DetailRow label="Reversed By" value={enrollment.reversedBy.email} />}
              {enrollment.reversalReason && <DetailRow label="Reversal Reason" value={enrollment.reversalReason} />}
            </DetailCard>
          )}
        </aside>
      </div>

      <ConfirmModal
        isOpen={!!actionType}
        onClose={() => setActionType(null)}
        onConfirm={handleAction}
        title={
          actionType === 'confirmed' ? 'Confirm Payment' : actionType === 'rejected' ? 'Reject Payment' : 'Reverse to Pending'
        }
        message={
          actionType === 'confirmed'
            ? 'This confirms the payment and sends a confirmation email to the student.'
            : actionType === 'rejected'
            ? 'Please provide a reason. The student will be notified by email.'
            : 'This reverses the confirmed status back to Pending for re-review. No email is sent to the student.'
        }
        confirmLabel={actionType === 'confirmed' ? 'Confirm' : actionType === 'rejected' ? 'Reject' : 'Reverse'}
        variant={actionType === 'confirmed' ? 'primary' : 'danger'}
        requireReason={actionType === 'rejected' || actionType === 'reverse'}
        reasonLabel={actionType === 'reverse' ? 'Reversal Reason' : 'Rejection Reason'}
        loading={payments.updating}
      />
    </div>
  );
}

function DetailCard({ title, children }) {
  return (
    <div className="rounded-lg border border-border bg-surface-elevated p-5">
      <h3 className="mb-3 font-heading text-base font-semibold text-text-primary">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function DetailRow({ label, value, link }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-text-secondary">{label}</span>
      {link ? (
        <a href={link} className="font-medium text-primary hover:underline">
          {value}
        </a>
      ) : (
        <span className="text-right font-medium text-text-primary">{value}</span>
      )}
    </div>
  );
}

export default EnrollmentDetailPage;