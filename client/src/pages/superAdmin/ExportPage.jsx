/**
 * ExportPage — /superadmin/export. Filter form + CSV download trigger,
 * per FRD FR-05.4. Column preview matches the exact backend field list.
 */

import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { useManageState } from '../../hooks/useManageState.js';
import { useSEO } from '../../hooks/useSEO.js';
import { useToast } from '../../hooks/useToast.js';
import { FormField } from '../../components/ui/FormField.jsx';
import { Button } from '../../components/ui/Button.jsx';

const STATUS_OPTIONS = [{ value: '', label: 'All' }, { value: 'not_paid', label: 'Not Paid' }, { value: 'pending', label: 'Pending' }, { value: 'confirmed', label: 'Confirmed' }, { value: 'rejected', label: 'Rejected' }];

const CSV_COLUMNS = [
  'Full Name', 'Phone Number', 'WhatsApp Number', 'Email Address', 'Programme', 'Cohort',
  'Delivery Format', 'Payment Type', 'Deposit Amount', 'Payment Status', 'Referred By Code',
  'Enrollment Date', 'Receipt File Reference', 'Admin Who Actioned', 'Action Date',
  'Rejection Reason', 'Partial Enrollment Flag',
];

export function ExportPage() {
  const { cohorts, analytics, actions } = useManageState();
  const { showSuccess } = useToast();
  const [filters, setFilters] = useState({ cohort: '', status: '', fromDate: '', toDate: '' });

  useSEO({ title: 'Export Students' });

  useEffect(() => {
    if (cohorts.adminList.length === 0) actions.fetchAdminCohorts({ limit: 100 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cohortOptions = [{ value: '', label: 'All Cohorts' }, ...cohorts.adminList.map((c) => ({ value: c.id, label: c.name }))];

  const handleExport = async () => {
    try {
      await actions.exportStudentsCsv(filters);
      showSuccess('Export downloaded successfully.');
    } catch {
      // toast already shown centrally
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 font-heading text-2xl font-bold text-text-primary">Export Students</h1>

      <div className="rounded-lg border border-border bg-surface-elevated p-6">
        <div className="mb-5 grid gap-4 sm:grid-cols-2">
          <FormField type="select" label="Cohort" options={cohortOptions} value={filters.cohort} onChange={(v) => setFilters((f) => ({ ...f, cohort: v }))} />
          <FormField type="select" label="Payment Status" options={STATUS_OPTIONS} value={filters.status} onChange={(v) => setFilters((f) => ({ ...f, status: v }))} />
          <FormField label="From Date" value={filters.fromDate} onChange={(v) => setFilters((f) => ({ ...f, fromDate: v }))} placeholder="YYYY-MM-DD" />
          <FormField label="To Date" value={filters.toDate} onChange={(v) => setFilters((f) => ({ ...f, toDate: v }))} placeholder="YYYY-MM-DD" />
        </div>

        <Button icon={Download} onClick={handleExport} loading={analytics.exporting} fullWidth>
          Export CSV
        </Button>

        <div className="mt-6 rounded-md border border-border bg-surface p-4">
          <p className="mb-2 text-xs font-medium text-text-secondary">The export will include these columns:</p>
          <p className="text-xs text-text-secondary">{CSV_COLUMNS.join(', ')}</p>
        </div>
      </div>
    </div>
  );
}

export default ExportPage;