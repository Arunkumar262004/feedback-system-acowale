import { useEffect, useState, useCallback } from 'react';
import { api } from '../api/client.js';
import FeedbackTable from '../components/dashboard/FeedbackTable.jsx';

export default function FeedbackList() {
  const [feedback, setFeedback] = useState({ data: [], total: 0 });
  const [filters,  setFilters]  = useState({ category: '', search: '' });
  const [initialLoading, setInitialLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error,    setError]    = useState('');

  const loadFeedback = useCallback(async (params) => {
    const res = await api.getFeedback(params);
    setFeedback(res.data);
  }, []);

  // Initial load
  useEffect(() => {
    let active = true;
    loadFeedback()
      .then(() => {
        if (active) setError('');
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.error || 'Failed to load feedback.');
      })
      .finally(() => {
        if (active) setInitialLoading(false);
      });
    return () => {
      active = false;
    };
  }, [loadFeedback]);

  // Update when filters change (after initial load)
  useEffect(() => {
    if (initialLoading) return;

    let active = true;
    setTableLoading(true);

    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v)
    );

    loadFeedback(params)
      .then(() => {
        if (active) setError('');
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.error || 'Failed to update feedback.');
      })
      .finally(() => {
        if (active) setTableLoading(false);
      });

    return () => {
      active = false;
    };
  }, [filters, initialLoading, loadFeedback]);

  const handleFilter = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
  };

  return (
    <>
      <div className="page-header">
        <div className="page-title">Feedback</div>
        <div className="page-subtitle">Browse and filter all submitted feedback</div>
      </div>

      {initialLoading ? (
        <div className="loading-card">
          <div className="skeleton" style={{ height: '24px', width: '40%' }} />
          <div className="skeleton" style={{ height: '200px', width: '100%' }} />
        </div>
      ) : error ? (
        <div className="msg msg-error">✕ {error}</div>
      ) : (
        <FeedbackTable
          data={feedback.data}
          total={feedback.total}
          filters={filters}
          onFilter={handleFilter}
          isSearching={tableLoading}
        />
      )}
    </>
  );
}
