import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { api } from '../api/client.js';
import StarRating from '../components/ui/StarRating.jsx';

const CATEGORIES = ['Product', 'Support', 'Billing', 'Feature Request', 'UI/UX', 'Other'];

export default function FeedbackForm() {
  const [form, setForm] = useState({
    category: 'Product',
    comment: '',
    email: '',
    rating: null,
  });

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.submitFeedback({
        category: form.category,
        comment:  form.comment,
        email:    form.email   || undefined,
        rating:   form.rating  || undefined,
      });
      toast.success('Thank you! Your feedback has been submitted.');
      setForm({ category: 'Product', comment: '', email: '', rating: null });
    } catch (err) {
      const msg = err.response?.data?.error || 'Something went wrong. Please try again.';
      toast.error(msg);
    }
  };

  const isLoading = false;

  return (
    <div className="feedback-page">
      <div className="feedback-card">
        {/* Hero */}
        <div className="feedback-card-hero">
          <div className="feedback-hero-emoji">
            <MessageCircle size={42} color="white" strokeWidth={1.5} />
          </div>
          <div className="feedback-hero-title">We value your feedback</div>
          <div className="feedback-hero-sub">
            Help us improve by sharing your experience.
          </div>
        </div>

        {/* Body */}
        <form className="feedback-card-body" onSubmit={handleSubmit}>
          {/* Category */}
          <div className="form-group">
            <label className="form-label" htmlFor="category">
              Select a category <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <select
              id="category"
              name="category"
              className="form-control"
              value={form.category}
              onChange={handleChange}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Comment */}
          <div className="form-group">
            <label className="form-label" htmlFor="comment">
              Your feedback <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <textarea
              id="comment"
              name="comment"
              className="form-control"
              placeholder="Share your thoughts, suggestions, or issues…"
              value={form.comment}
              onChange={handleChange}
              required
              minLength={3}
              maxLength={2000}
            />
          </div>

          {/* Star Rating */}
          <div className="form-group">
            <label className="form-label">
              How would you rate your experience?
              <span className="form-hint" style={{ marginLeft: '0.5rem' }}>(optional)</span>
            </label>
            <StarRating
              value={form.rating}
              onChange={(r) => setForm((f) => ({ ...f, rating: r }))}
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Your email
              <span className="form-hint" style={{ marginLeft: '0.5rem' }}>(optional)</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-control"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={isLoading}
          >
            {isLoading ? 'Submitting…' : '✶ Submit Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
}
