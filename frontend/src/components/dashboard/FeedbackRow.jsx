import { Star } from 'lucide-react';
import Badge from '../ui/Badge.jsx';

const CATEGORY_VARIANT = {
  'Product':         'brand',
  'Support':         'info',
  'Billing':         'warning',
  'Feature Request': 'success',
  'UI/UX':           'danger',
  'Other':           'gray',
};

/**
 * FeedbackRow — single table row for the admin feedback table
 */
export default function FeedbackRow({ item }) {
  const dateStr = new Date(item.created_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <tr>
      <td className="td-comment" title={item.comment}>
        {item.comment}
      </td>
      <td>
        <Badge variant={CATEGORY_VARIANT[item.category] || 'gray'}>
          {item.category}
        </Badge>
      </td>
      <td style={{ color: 'var(--gray-500)', fontSize: '0.8125rem' }}>
        {item.email || '—'}
      </td>
      <td>
        {item.rating ? (
          <span style={{ display: 'inline-flex', gap: '1px', alignItems: 'center' }}>
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                size={13}
                fill={i < item.rating ? '#f59e0b' : 'none'}
                color={i < item.rating ? '#f59e0b' : 'var(--gray-300)'}
              />
            ))}
          </span>
        ) : (
          <span style={{ color: 'var(--gray-300)' }}>—</span>
        )}
      </td>
      <td style={{ color: 'var(--gray-500)', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
        {dateStr}
      </td>
    </tr>
  );
}
