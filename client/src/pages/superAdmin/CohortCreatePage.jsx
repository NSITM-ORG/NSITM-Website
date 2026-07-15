/**
 * CohortCreatePage — /superadmin/cohorts/create.
 */

import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useManageState } from '../../hooks/useManageState';
import { useSEO } from '../../hooks/useSEO';
import { useToast } from '../../hooks/useToast';
import { CohortForm } from '../../components/panel/CohortForm';

export function CohortCreatePage() {
  const { cohorts, actions } = useManageState();
  const { showSuccess } = useToast();
  const navigate = useNavigate();

  useSEO({ title: 'Create Cohort' });

  const handleSubmit = async (data) => {
    try {
      const result = await actions.createCohort(data);
      showSuccess(`"${result.cohort.name}" created successfully.`);
      navigate('/superadmin/cohorts');
    } catch {
      // toast already shown centrally
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/superadmin/cohorts" className="mb-5 flex w-fit items-center gap-1.5 text-sm text-text-secondary hover:text-primary">
        <ChevronLeft size={16} /> Cohorts
      </Link>
      <h1 className="mb-6 font-heading text-2xl font-bold text-text-primary">Create Cohort</h1>
      <div className="rounded-lg border border-border bg-surface-elevated p-6">
        <CohortForm onSubmit={handleSubmit} submitting={cohorts.submitting} submitLabel="Create Cohort" />
      </div>
    </div>
  );
}

export default CohortCreatePage;