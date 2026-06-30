import { memo } from 'react';

// Move static raw arrays completely outside component execution loops
const GUEST_REVIEWS = [
  {
    quote: 'The food was warm, fresh and came so quickly. Loved the smooth ordering experience — no waiting for a waiter!',
    name: 'Aarav Sharma',
    date: '2 days ago',
    rating: 5,
  },
  {
    quote: 'Beautiful presentation and bold flavours. The digital menu was so easy to browse. Felt genuinely premium.',
    name: 'Nisha Mehta',
    date: '1 week ago',
    rating: 5,
  },
  {
    quote: 'Clean, modern dining experience. The biryani was absolutely delicious and the QR ordering is genius.',
    name: 'Kabir Anand',
    date: '3 weeks ago',
    rating: 5,
  },
];

function ReviewsSection() {
  return (
    <section className="pb-4 pt-2 select-none">
      {/* Header Info Block */}
      <div className="mb-3 px-4">
        <h2 className="font-display text-[20px] font-bold text-near-black">
          Guest Reviews
        </h2>
        <p className="mt-[2px] font-body text-[12px] text-muted">What our guests are saying</p>
      </div>

      {/* Horizontal Slider Layout */}
      {/* Swapped container padding to scroll margins to prevent card cutoff clipping */}
      <div 
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 scrollbar-none px-4 [-webkit-overflow-scrolling:touch]"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {GUEST_REVIEWS.map((review) => (
          <article
            key={review.name} // Clean, unique structural identifier
            className="min-w-[260px] max-w-[260px] shrink-0 snap-start rounded-card bg-near-black p-4 shadow-md flex flex-col justify-between"
          >
            <div>
              {/* Star Metrics Render Block */}
              <div className="flex gap-[3px]" aria-label={`Rated ${review.rating} out of 5 stars`}>
                {/* String repeat method cleans up inline map allocations completely */}
                <span className="text-[13px] tracking-[2px] text-amber-400 select-none">
                  {'⭐'.repeat(review.rating)}
                </span>
              </div>

              {/* Guest Quote Layout */}
              <p
                className="mt-3 font-body text-[12px] italic leading-[1.6] text-white/80"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                "{review.quote}"
              </p>
            </div>

            {/* Profile Attribution Footer */}
            <div className="mt-5 flex items-center gap-[10px] pt-1 border-t border-white/5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-coral font-heading text-[11px] font-bold text-white uppercase">
                {review.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="font-heading text-[12px] font-bold text-white truncate">
                  {review.name}
                </p>
                <p className="font-body text-[10px] text-white/40 truncate">
                  via Google · {review.date}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default memo(ReviewsSection);
