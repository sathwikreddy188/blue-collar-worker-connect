import StarRating from './StarRating';

export default function ReviewCard({ review }) {
  return (
    <div className="bg-white rounded-lg border border-concrete-300 p-5">
      <StarRating rating={review.rating} showNumber={false} size={16} />
      <p className="text-sm text-ink/80 mt-3 leading-relaxed">{review.text}</p>
      <p className="text-sm font-semibold text-navy mt-3">— {review.customer}</p>
    </div>
  );
}
