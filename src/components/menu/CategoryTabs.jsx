import { useEffect, useRef } from 'react';

export default function CategoryTabs({ categories = [], active, onChange, categoryImages = {} }) {
  const pillRefs = useRef({});
  const scrollRef = useRef(null);
  const isAutoScrolling = useRef(false);

  useEffect(() => {
    const activePill = pillRefs.current[active];
    if (activePill) {
      // Prevent running if the user is actively touch-dragging the element list
      activePill.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [active]);

  if (!categories.length) return null;

  return (
    <nav className="sticky top-0 z-30 bg-beige/95 backdrop-blur-sm">
      <div
        ref={scrollRef}
        // Custom Tailwind utilities hidden scrollbar tracks natively
        className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-none [-webkit-overflow-scrolling:touch]"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((category) => {
          const isActive = category === active;
          const img = categoryImages[category];

          return (
            <button
              key={category}
              // Functional ref handler ensures dead elements wipe automatically on component mount updates
              ref={(node) => {
                if (node) {
                  pillRefs.current[category] = node;
                } else {
                  delete pillRefs.current[category];
                }
              }}
              type="button"
              onClick={() => onChange?.(category)}
              className={
                isActive
                  ? 'flex shrink-0 items-center gap-[7px] rounded-pill bg-near-black py-[9px] pl-[14px] pr-3 font-heading text-[13px] font-bold text-white transition-all duration-200'
                  : 'shrink-0 rounded-pill border border-border-warm bg-surface px-[14px] py-[9px] font-heading text-[13px] font-medium text-muted shadow-card transition-all duration-200 hover:border-near-black/30 hover:text-near-black'
              }
            >
              <span>{category}</span>
              {isActive && (
                <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/15 text-[11px] leading-none">
                  {img ? (
                    <img src={img} alt="" className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <span className="text-[12px]">
                      {category === 'Starters' ? '🥗'
                        : category === 'Main Course' ? '🍛'
                        : category === 'Breads' ? '🫓'
                        : category === 'Rice & Biryani' ? '🍚'
                        : category === 'Desserts' ? '🍰'
                        : category === 'Beverages' ? '🥤'
                        : category === 'Specials' ? '✨'
                        : '🍽️'}
                    </span>
                  )}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {/* Subtle division border line */}
      <div className="h-px w-full bg-border-warm" />
    </nav>
  );
}
