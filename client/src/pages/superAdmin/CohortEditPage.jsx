/**
 * CohortEditPage — /superadmin/cohorts/:id/edit.
 */

import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useManageState } from '../../hooks/useManageState';
import { useSEO } from '../../hooks/useSEO';
import { useToast } from '../../hooks/useToast';
import { CohortForm } from '../../components/panel/CohortForm';
import { RouteFallback } from '../../components/ui/Preloader';

export function CohortEditPage() {
  const { id } = useParams();
  const { cohorts, actions } = useManageState();
  const { showSuccess } = useToast();
  const navigate = useNavigate();

  useSEO({ title: 'Edit Cohort' });

  useEffect(() => {
    actions.fetchCohortByIdAdmin(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async (data) => {
    try {
      const result = await actions.updateCohort({ id, data });
      showSuccess(`"${result.cohort.name}" updated successfully.`);
      navigate('/superadmin/cohorts');
    } catch {
      // toast already shown centrally
    }
  };

  if (!cohorts.currentCohort) return <RouteFallback />;

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/superadmin/cohorts" className="mb-5 flex w-fit items-center gap-1.5 text-sm text-text-secondary hover:text-primary">
        <ChevronLeft size={16} /> Cohorts
      </Link>
      <h1 className="mb-6 font-heading text-2xl font-bold text-text-primary">Edit Cohort</h1>
      <div className="rounded-lg border border-border bg-surface-elevated p-6">
        <CohortForm initialData={cohorts.currentCohort} onSubmit={handleSubmit} submitting={cohorts.submitting} submitLabel="Save Changes" isEdit />
      </div>
    </div>
  );
}

export default CohortEditPage;