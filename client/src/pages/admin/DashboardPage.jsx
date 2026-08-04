/**
 * DashboardPage — /admin/dashboard. Six metric cards (per FRD FR-04.2)
 * plus `totalRecordedStudents` (the Super Admin shortcut card from the
 * build instructions — shown here too since Admin also benefits from
 * an at-a-glance total) and the recent activity feed.
 */

import { useEffect } from 'react';
import { Users, Clock, CheckCircle2, XCircle, UserX, Calendar, Database } from 'lucide-react';
import { useManageState } from '../../hooks/useManageState';
import { useSEO } from '../../hooks/useSEO';
import { MetricCard } from '../../components/panel/MetricCard';
import { StatusBadge } from '../../components/panel/StatusBadge';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatRelativeTime } from '../../utils/formatters';
import { Activity } from 'lucide-react';

export function DashboardPage() {
  const { enrollments, actions } = useManageState();
  useSEO({ title: 'Dashboard' });

  useEffect(() => {
    actions.fetchDashboardOverview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const m = enrollments.dashboardMetrics;

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-bold text-text-primary">Dashboard Overview</h1>

      {enrollments.loading && !m ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 7 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Total Enrolled" value={m?.totalEnrolled} icon={Users} to="/admin/enrollments" color="primary" />
          <MetricCard label="Pending Reviews" value={m?.pendingReviews} icon={Clock} to="/admin/enrollments/pending" color="warning" />
          <MetricCard label="Confirmed Payments" value={m?.confirmedPayments} icon={CheckCircle2} to="/admin/enrollments?status=confirmed" color="secondary" />
          <MetricCard label="Rejected Payments" value={m?.rejectedPayments} icon={XCircle} to="/admin/enrollments?status=rejected" color="error" />
          <MetricCard label="Not Paid (Follow-Up)" value={m?.notPaid} icon={UserX} to="/admin/enrollments/not-paid" color="grey" />
          <MetricCard label="Active Cohorts" value={m?.activeCohorts} icon={Calendar} color="primary" />
          <MetricCard label="Total Recorded Students" value={m?.totalRecordedStudents} icon={Database} color="secondary" />
        </div>
      )}

      <section className="mt-8">
        <h2 className="mb-4 font-heading text-lg font-semibold text-text-primary">Recent Activity</h2>
        <div className="rounded-md border border-border bg-surface-elevated">
          {enrollments.recentActivity?.length > 0 ? (
            <ul className="divide-y divide-border">
              {enrollments.recentActivity.map((log) => (
                <li key={log.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                  <div>
                    <p className="text-text-primary">{log.description}</p>
                    <p className="text-xs text-text-secondary">by {log.actor?.email || 'System'}</p>
                  </div>
                  <span className="shrink-0 text-xs text-text-secondary">{formatRelativeTime(log.createdAt)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={Activity} title="No recent activity" description="Payment status changes will appear here." />
          )}
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;