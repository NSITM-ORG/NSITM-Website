/**
 * AnalyticsCharts — the Recharts line chart for enrollmentTrend
 * (12-week window, or the date range Super Admin selects), used both
 * for the Super Admin shortcut analytics view and satisfies the build
 * instruction's "chart for enrollment between a period" requirement.
 */

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function EnrollmentTrendChart({ data = [] }) {
  const chartData = data.map((d) => ({
    week: `Wk ${d._id?.week}`,
    count: d.count,
  }));

  if (chartData.length === 0) {
    return <p className="py-8 text-center text-sm text-text-secondary">No enrollment activity in this period.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis dataKey="week" stroke="var(--color-text-secondary)" fontSize={12} />
        <YAxis stroke="var(--color-text-secondary)" fontSize={12} allowDecimals={false} />
        <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', borderRadius: 8 }} />
        <Line type="monotone" dataKey="count" stroke="var(--color-primary)" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default EnrollmentTrendChart;