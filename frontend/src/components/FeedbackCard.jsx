export default function FeedbackCard({ item }) {
  const statusColors = {
    Received: '#2563eb',
    'In Progress': '#d97706',
    Resolved: '#16a34a',
  };

  return (
    <tr>
      <td>{item.comment}</td>
      <td>
        <span className="badge">{item.category}</span>
      </td>
      <td>{item.email || '—'}</td>
      <td>{item.rating ? `${item.rating}/5` : '—'}</td>
      <td>{new Date(item.created_at).toLocaleString()}</td>
      <td>
        <span
          className="status-pill"
          style={{ background: statusColors[item.status] || '#64748b' }}
        >
          {item.status}
        </span>
      </td>
    </tr>
  );
}
