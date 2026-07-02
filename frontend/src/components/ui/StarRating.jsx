import { useState } from 'react';

/**
 * StarRating — interactive 5-star rating picker
 * Props:
 *   value    — current selected rating (1–5 or null)
 *   onChange — (rating: number|null) => void
 *   readOnly — show only, no interaction
 */
export default function StarRating({ value, onChange, readOnly = false }) {
  const [hovered, setHovered] = useState(null);

  const handleClick = (star) => {
    if (readOnly) return;
    // clicking the same star again clears the rating
    onChange(value === star ? null : star);
  };

  return (
    <div className="star-rating" role="group" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled  = hovered ? star <= hovered : star <= value;
        const isHovered = hovered && star <= hovered;

        return (
          <button
            key={star}
            type="button"
            className={`star-btn ${isFilled ? 'filled' : ''} ${isHovered ? 'hovered' : ''}`}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
            onClick={() => handleClick(star)}
            onMouseEnter={() => !readOnly && setHovered(star)}
            onMouseLeave={() => !readOnly && setHovered(null)}
            disabled={readOnly}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}
