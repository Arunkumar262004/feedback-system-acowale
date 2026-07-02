import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Star, Tag } from 'lucide-react';
import { api } from '../api/client.js';
import StatCard from '../components/dashboard/StatCard.jsx';
import CategoryChart from '../components/dashboard/CategoryChart.jsx';
import TrendChart from '../components/dashboard/TrendChart.jsx';
import FeedbackTable from '../components/dashboard/FeedbackTable.jsx';

export default function Dashboard() {
  const [summary,  setSummary]  = useState(null);
  const [feedback, setFeedback] = useState({ data: [], total: 0 });
  const [filters,  setFilters]  = useState({ category: '', search: '' });
  const [initialLoading, setInitialLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error,    setError]    = useState('');

  const loadSummary = useCallback(async () => {
    const res = await api.getAnalyticsSummary();
    setSummary(res.data.data);
  }, []);

  const loadFeedback = useCallback(async (params) => {
    const res = await api.getFeedback(params);
    setFeedback(res.data);
  }, []);

  // Initial load: fetch both summary and initial feedback once on mount
  useEffect(() => {
    let active = true;

    async function init() {
      try {
        const [sumRes, fbRes] = await Promise.all([
          api.getAnalyticsSummary(),
          api.getFeedback({ limit: 5 })
        ]);
        if (active) {
          setSummary(sumRes.data.data);
          setFeedback(fbRes.data);
          setError('');
        }
      } catch (err) {
        if (active) {
          setError(err.response?.data?.error || 'Failed to load dashboard.');
        }
      } finally {
        if (active) {
          setInitialLoading(false);
        }
      }
    }

    init();

    return () => {
      active = false;
    };
  }, []);

  // Update feedback when filters change (after initial load)
  useEffect(() => {
    if (initialLoading) return;

    let active = true;
    setTableLoading(true);

    const params = {
      limit: 5,
      ...Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v)
      )
    };

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

  // ── Loading State ──────────────────────────────────────────────
  if (initialLoading) {
    return (
      <div className="loading-card">
        <div className="skeleton" style={{ height: '24px', width: '40%' }} />
        <div className="skeleton" style={{ height: '16px', width: '60%' }} />
      </div>
    );
  }

  // ── Error State ────────────────────────────────────────────────
  if (error) {
    return (
      <div className="msg msg-error">✕ {error}</div>
    );
  }

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title">Overview</div>
        <div className="page-subtitle">
          Real-time summary of customer feedback
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <StatCard
          label="Total Feedback"
          value={summary.total.toLocaleString()}
          Icon={ClipboardList}
          iconBg="#eef2ff"
          iconColor="var(--brand-600)"
          trend="All time submissions"
          trendDir="neutral"
        />
        <StatCard
          label="Avg Rating"
          value={summary.avgRating ? `${summary.avgRating} / 5` : '—'}
          Icon={Star}
          iconBg="#fffbeb"
          iconColor="#d97706"
          trend="Based on rated submissions"
          trendDir="up"
        />
        <StatCard
          label="Feedback Categories"
          value={summary.byCategory.length.toString()}
          Icon={Tag}
          iconBg="#fdf2f8"
          iconColor="#db2777"
          trend="Active feedback channels"
          trendDir="neutral"
        />
      </div>

      {/* Charts Row */}
      <div className="dashboard-grid">
        {/* Feedback Trend over Time */}
        <div className="card">
          <div className="card-title">Feedback Trend (Last 30 Days)</div>
          <TrendChart data={summary.trend} />
        </div>

        {/* Category Distribution */}
        <div className="card">
          <div className="card-title">Category Distribution</div>
          <CategoryChart data={summary.byCategory} />
        </div>
      </div>

      {/* Feedback Table */}
      <FeedbackTable
        data={feedback.data}
        total={feedback.total}
        filters={filters}
        onFilter={handleFilter}
        isSearching={tableLoading}
        action={
          <Link
            to="/admin/feedback"
            style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--brand-600)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            View All Feedback →
          </Link>
        }
      />
    </>
  );
}
