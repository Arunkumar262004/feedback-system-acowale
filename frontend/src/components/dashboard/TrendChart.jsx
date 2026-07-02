import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

/**
 * TrendChart — Area chart showing feedback submissions over time (last 30 days)
 * Props:
 *   data — array of { day: string, count: number }
 */
export default function TrendChart({ data = [] }) {
  if (!data.length) {
    return (
      <div className="empty-state" style={{ height: '260px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="empty-state-icon">📈</div>
        No timeline trend data yet.
      </div>
    );
  }

  // Format date labels nicely: e.g. "Jul 2"
  const chartData = data.map((d) => {
    const date = new Date(d.day);
    const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
    return {
      day: label,
      submissions: d.count,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--brand-500)" stopOpacity={0.2}/>
            <stop offset="95%" stopColor="var(--brand-500)" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--gray-100)" />
        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          tick={{ fill: 'var(--gray-400)', fontSize: 11 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: 'var(--gray-400)', fontSize: 11 }}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            borderRadius: '12px',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-md)',
            fontSize: '0.8125rem',
            fontFamily: 'inherit',
          }}
          labelStyle={{ fontWeight: 600, color: 'var(--gray-700)' }}
        />
        <Area
          type="monotone"
          dataKey="submissions"
          stroke="var(--brand-600)"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorSubmissions)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
