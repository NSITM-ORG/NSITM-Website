/**
 * ProgrammeEditPage — /superadmin/programmes/:id/edit. Pre-populates via
 * the backend's single-resource GET (Batch 12 fix), then saves with a
 * confirmation that the change is live immediately, per FRD FR-05.2.
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useManageState } from '../../hooks/useManageState.js';
import { useSEO } from '../../hooks/useSEO.js';
import { useToast } from '../../hooks/useToast.js';
import { ProgrammeForm } from '../../components/panel/ProgrammeForm.jsx';
import { ConfirmModal } from '../../components/ui/ConfirmModal.jsx';
import { RouteFallback } from '../../components/ui/Preloader.jsx';

export function ProgrammeEditPage() {
  const { id } = useParams();
  const { programmes, actions } = useManageState();
  const { showSuccess } = useToast();
  const navigate = useNavigate();
  const [pendingData, setPendingData] = useState(null);

  useSEO({ title: 'Edit Programme' });

  useEffect(() => {
    actions.fetchProgrammeByIdAdmin(id);
    return () => actions.clearCurrentProgramme();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSave = async () => {
    try {
      const result = await actions.updateProgramme({ id, data: pendingData });
      showSuccess(`"${result.programme.name}" updated. Changes are live on the public website.`);
      setPendingData(null);
      navigate('/superadmin/programmes');
    } catch {
      setPendingData(null);
    }
  };

  if (!programmes.currentProgramme) return <RouteFallback />;

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/superadmin/programmes" className="mb-5 flex w-fit items-center gap-1.5 text-sm text-text-secondary hover:text-primary">
        <ChevronLeft size={16} /> Programmes
      </Link>
      <h1 className="mb-6 font-heading text-2xl font-bold text-text-primary">Edit Programme</h1>
      <div className="rounded-lg border border-border bg-surface-elevated p-6">
        <ProgrammeForm
          initialData={programmes.currentProgramme}
          onSubmit={setPendingData}
          submitting={programmes.submitting}
          submitLabel="Save Changes"
        />
      </div>

      <ConfirmModal
        isOpen={!!pendingData}
        onClose={() => setPendingData(null)}
        onConfirm={handleSave}
        title="Update Public Website"
        message="This change will update the public-facing website immediately. Confirm?"
        confirmLabel="Save Changes"
        loading={programmes.submitting}
      />
    </div>
  );
}

export default ProgrammeEditPage;