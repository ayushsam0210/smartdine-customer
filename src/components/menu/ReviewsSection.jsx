const reviews = [
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

export default function ReviewsSection() {
  return (
    <section className="px-4 pb-4 pt-2">
      {/* Header */}
      <div className="mb-3">
        <h2 className="font-display text-[20px] font-bold text-near-black">
          Guest Reviews
        </h2>
        <p className="mt-[2px] font-body text-[12px] text-muted">What our guests are saying</p>
      </div>

      {/* Horizontal scroll cards */}
      <div className="flex snap-x gap-3 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch]">
        {reviews.map((review) => (
          <article
            key={review.name}
            className="min-w-[250px] max-w-[250px] snap-start rounded-card bg-near-black p-[16px]"
          >
            {/* Stars */}
            <div className="flex gap-[2px]">
              {Array.from({ length: review.rating }).map((_, i) => (
                <span key={i} className="text-[13px]">⭐</span>
              ))}
            </div>

            {/* Quote */}
            <p
              className="mt-3 font-body text-[12px] italic leading-[1.65] text-white/80"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 4,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              "{review.quote}"
            </p>

            {/* Attribution */}
            <div className="mt-4 flex items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-coral font-heading text-[11px] font-bold text-white">
                {review.name.charAt(0)}
              </div>
              <div>
                <p className="font-heading text-[12px] font-bold text-white">{review.name}</p>
                <p className="font-body text-[10px] text-white/40">via Google · {review.date}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
