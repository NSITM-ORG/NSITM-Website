/**
 * ProgrammeCreatePage — /superadmin/programmes/create.
 */

import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useManageState } from '../../hooks/useManageState';
import { useSEO } from '../../hooks/useSEO';
import { useToast } from '../../hooks/useToast';
import { ProgrammeForm } from '../../components/panel/ProgrammeForm';

export function ProgrammeCreatePage() {
  const { programmes, actions } = useManageState();
  const { showSuccess } = useToast();
  const navigate = useNavigate();

  useSEO({ title: 'Create Programme' });

  const handleSubmit = async (data) => {
    try {
      const result = await actions.createProgramme(data);
      showSuccess(`"${result.programme.name}" created successfully.`);
      navigate('/superadmin/programmes');
    } catch {
      // toast already shown centrally
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/superadmin/programmes" className="mb-5 flex w-fit items-center gap-1.5 text-sm text-text-secondary hover:text-primary">
        <ChevronLeft size={16} /> Programmes
      </Link>
      <h1 className="mb-6 font-heading text-2xl font-bold text-text-primary">Create Programme</h1>
      <div className="rounded-lg border border-border bg-surface-elevated p-6">
        <ProgrammeForm onSubmit={handleSubmit} submitting={programmes.submitting} submitLabel="Create Programme" />
      </div>
    </div>
  );
}

export default ProgrammeCreatePage;