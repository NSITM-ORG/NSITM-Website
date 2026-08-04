/**
 * AnalyticsPage — /superadmin/analytics. Full FRD FR-05.3 metric set +
 * date range filter + the enrollment trend chart.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download } from 'lucide-react';
import { useManageState } from '../../hooks/useManageState';
import { useSEO } from '../../hooks/useSEO';
import { FormField } from '../../components/ui/FormField';
import { Button } from '../../components/ui/Button';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { EnrollmentTrendChart } from '../../components/panel/AnalyticsCharts';
import { formatCurrency } from '../../utils/formatters';

export function AnalyticsPage() {
  const { analytics, actions } = useManageState();
  const [dateRange, setDateRange] = useState({ fromDate: '', toDate: '' });

  useSEO({ title: 'Analytics' });

  useEffect(() => {
    actions.fetchAnalyticsOverview(dateRange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  const m = analytics.metrics;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold text-text-primary">Analytics</h1>
        <Link to="/superadmin/export">
          <Button icon={Download} variant="outline">Export CSV</Button>
        </Link>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 sm:max-w-md">
        <FormField placeholder="From date" value={dateRange.fromDate} onChange={(v) => setDateRange((d) => ({ ...d, fromDate: v }))} />
        <FormField placeholder="To date" value={dateRange.toDate} onChange={(v) => setDateRange((d) => ({ ...d, toDate: v }))} />
      </div>

      {analytics.loading && !m ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatBox label="Pending Payment Value" value={formatCurrency(m?.pendingPaymentValue)} />
            <StatBox label="Pending Payment Count" value={m?.pendingPaymentCount} />
            <StatBox label="Rejected Payments" value={m?.rejectedPaymentCount} />
            <StatBox label="Total Cohorts" value={m?.enrollmentsByCohort?.length} />
          </div>

          <div className="mb-8 rounded-lg border border-border bg-surface-elevated p-5">
            <h2 className="mb-4 font-heading text-lg font-semibold text-text-primary">Enrollment Trend</h2>
            <EnrollmentTrendChart data={m?.enrollmentTrend} />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <TableCard title="Enrollments by Cohort" rows={m?.enrollmentsByCohort} nameKey="cohortName" valueKey="count" />
            <TableCard title="Revenue by Cohort" rows={m?.revenueByCohort} nameKey="cohortName" valueKey="totalRevenue" isCurrency />
            <TableCard title="Not Paid by Programme" rows={m?.notPaidByProgramme} nameKey="programmeName" valueKey="count" />
          </div>
        </>
      )}
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="rounded-md border border-border bg-surface-elevated p-4">
      <p className="mb-1 text-xs text-text-secondary">{label}</p>
      <p className="font-heading text-xl font-bold text-text-primary">{value ?? '—'}</p>
    </div>
  );
}

function TableCard({ title, rows = [], nameKey, valueKey, isCurrency }) {
  return (
    <div className="rounded-lg border border-border bg-surface-elevated p-4">
      <h3 className="mb-3 text-sm font-semibold text-text-primary">{title}</h3>
      {rows?.length > 0 ? (
        <ul className="space-y-1.5 text-sm">
          {rows.map((r, i) => (
            <li key={i} className="flex justify-between">
              <span className="text-text-secondary">{r[nameKey] || 'Unknown'}</span>
              <span className="font-medium text-text-primary">{isCurrency ? formatCurrency(r[valueKey]) : r[valueKey]}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-text-secondary">No data.</p>
      )}
    </div>
  );
}

export default AnalyticsPage;