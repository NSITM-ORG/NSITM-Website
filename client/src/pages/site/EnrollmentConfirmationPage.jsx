/**
 * EnrollmentConfirmationPage — static success screen shown after Step 4
 * submits successfully. Guards against direct navigation (no
 * partialEnrollmentId in state) by redirecting back to /enroll, per the
 * F1 layout draft's navigation guard note.
 *
 * partialEnrollmentId is cleared here (not in StepReceiptUpload) so this
 * page's guard check still passes on the render that immediately follows
 * a successful submission, then clears for any subsequent direct visit.
 */

import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, MessageCircle } from 'lucide-react';
import { useManageState } from '../../hooks/useManageState';
import { useSEO } from '../../hooks/useSEO';

export function EnrollmentConfirmationPage() {
  const { enrollments, settings, actions } = useManageState();
  const navigate = useNavigate();

  useSEO({ title: 'Enrollment Submitted' });

  useEffect(() => {
    if (!enrollments.partialEnrollmentId) {
      navigate('/enroll', { replace: true });
      return;
    }
    actions.clearPartialEnrollmentId();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const whatsappLink = settings.publicSettings?.whatsapp?.link;

  return (
    <div className="mx-auto flex max-w-content flex-col items-center px-4 py-20 text-center sm:px-6">
      <CheckCircle2 size={56} className="mb-5 text-success" />
      <h1 className="mb-3 font-heading text-2xl font-bold text-text-primary">Enrollment Submitted</h1>
      <p className="mb-2 text-text-secondary">
        We have received your payment receipt and will confirm your payment within 2 to 3 business days.
        Check your email for confirmation.
      </p>
      <p className="mb-8 text-sm text-text-secondary">
        If you chose Instalment payment, you'll be able to submit your remaining payments later via the
        "Submit Instalment Payment" link in our footer — no account or login required.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          to="/programmes"
          className="rounded-sm border border-border px-6 py-2.5 text-sm font-medium text-text-primary hover:bg-surface"
        >
          Browse More Programmes
        </Link>
        {whatsappLink && (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-sm bg-secondary px-6 py-2.5 text-sm font-medium text-white hover:brightness-90"
          >
            <MessageCircle size={16} /> Ask a Question
          </a>
        )}
      </div>
    </div>
  );
}

export default EnrollmentConfirmationPage;