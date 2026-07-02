export default function StatCard({ label, value, accent }) {
  return (
    <div className="stat-card" style={{ borderTopColor: accent || '#6d28d9' }}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
