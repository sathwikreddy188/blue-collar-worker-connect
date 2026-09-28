import { Star } from 'lucide-react';

export default function StarRating({ rating, size = 14, showNumber = true }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="inline-flex">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            size={size}
            className={n <= Math.round(rating) ? 'fill-amber text-amber' : 'fill-concrete-300 text-concrete-300'}
          />
        ))}
      </span>
      {showNumber && <span className="text-sm font-semibold text-ink">{rating.toFixed(1)}</span>}
    </span>
  );
}
