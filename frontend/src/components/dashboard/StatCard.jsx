/**
 * StatCard — metric display card with icon, value, label, and trend
 * Props:
 *   label    — string
 *   value    — string | number
 *   Icon     — Lucide icon component (e.g. MessageSquare)
 *   iconBg   — CSS background color for icon circle
 *   iconColor — icon stroke color
 *   trend    — string (optional)
 *   trendDir — 'up' | 'neutral'
 */
export default function StatCard({ label, value, Icon, iconBg = '#eef2ff', iconColor = 'var(--brand-600)', trend, trendDir = 'neutral' }) {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <div>
          <div className="stat-label">{label}</div>
          <div className="stat-value">{value ?? '—'}</div>
        </div>
        {Icon && (
          <div className="stat-icon" style={{ background: iconBg }}>
            <Icon size={20} color={iconColor} strokeWidth={2} />
          </div>
        )}
      </div>
      {trend && (
        <div className={`stat-trend ${trendDir}`}>{trend}</div>
      )}
    </div>
  );
}
