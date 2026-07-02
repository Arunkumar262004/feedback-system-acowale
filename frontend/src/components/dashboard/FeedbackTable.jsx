import { useState, useEffect } from 'react';
import { FolderOpen } from 'lucide-react';
import FeedbackRow from './FeedbackRow.jsx';

const CATEGORIES = ['', 'Product', 'Support', 'Billing', 'Feature Request', 'UI/UX', 'Other'];

/**
 * FeedbackTable — filterable feedback table for the admin dashboard
 * Props:
 *   data       — array of feedback items
 *   total      — total count (for header)
 *   filters    — { category, search }
 *   onFilter   — (key, value) => void
 *   isSearching — boolean, show animated search indicator
 */
export default function FeedbackTable({ data = [], total = 0, filters, onFilter, isSearching = false, action }) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  // Keep local search term in sync with filter search (if updated from parent)
  useEffect(() => {
    setSearchTerm(filters.search || '');
  }, [filters.search]);

  // Debounce the onFilter call
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== (filters.search || '')) {
        onFilter('search', searchTerm);
      }
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, onFilter, filters.search]);

  return (
    <div className="table-card">
      {/* Header */}
      <div className="table-header">
        <div>
          <div className="card-title" style={{ marginBottom: 0 }}>
            Recent Feedback
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginTop: '2px' }}>
            {total} submission{total !== 1 ? 's' : ''} total
          </div>
        </div>
        {action}
      </div>

      {/* Filters */}
      <div className="table-filters">
        <select
          className="form-control form-control-sm"
          style={{ width: 'auto' }}
          value={filters.category}
          onChange={(e) => onFilter('category', e.target.value)}
        >
          {CATEGORIES.map((c) => (
            <option key={c || 'all'} value={c}>{c || 'All Categories'}</option>
          ))}
        </select>

        <input
          type="text"
          className="form-control form-control-sm"
          placeholder="Search comments…"
          style={{ flex: 1, minWidth: '160px' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Animated Searching Banner */}
      {isSearching && (
        <div className="search-banner">
          <span className="search-banner-dots">
            <span />
            <span />
            <span />
          </span>
          <span className="search-banner-text">Searching…</span>
        </div>
      )}

      {/* Table */}
      <div className="table-wrap" style={{ opacity: isSearching ? 0.45 : 1, transition: 'opacity 0.25s ease' }}>
        <table>
          <thead>
            <tr>
              <th>Feedback</th>
              <th>Category</th>
              <th>Email</th>
              <th>Rating</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <FeedbackRow key={item.id} item={item} />
            ))}
          </tbody>
        </table>

        {data.length === 0 && !isSearching && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <FolderOpen size={40} color="var(--gray-300)" strokeWidth={1.5} />
            </div>
            No feedback found matching your filters.
          </div>
        )}
      </div>
    </div>
  );
}
