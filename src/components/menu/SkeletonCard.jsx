import { memo } from 'react';

function SkeletonCard() {
  return (
    <div 
      className="mb-2 flex items-start gap-3 rounded-card bg-surface p-[14px] shadow-card select-none pointer-events-none" 
      aria-hidden="true"
    >
      {/* Thumbnail Image Skeleton Container */}
      <div className="skeleton h-[84px] w-[84px] shrink-0 rounded-image bg-near-black/5 animate-pulse" />

      {/* Details Meta Block Skeleton */}
      <div className="min-w-0 flex-1 flex flex-col justify-between min-h-[84px]">
        <div>
          {/* Top Line: Veg Indicator Box + Dish Title Bar */}
          <div className="flex items-center gap-2">
            <div className="skeleton h-[14px] w-[14px] shrink-0 rounded-[3px] bg-near-black/5 animate-pulse" />
            <div className="skeleton h-[14px] flex-1 max-w-[65%] rounded bg-near-black/5 animate-pulse" />
          </div>
          
          {/* Second Line: Sub-description Bar */}
          <div className="skeleton mt-[10px] h-[12px] w-[45%] rounded bg-near-black/5 animate-pulse" />
        </div>

        {/* Bottom Line: Price Tag Box + Action Button Pill */}
        <div className="mt-4 flex items-center justify-between gap-2">
          <div className="skeleton h-[15px] w-[52px] rounded bg-near-black/5 animate-pulse" />
          <div className="skeleton h-[30px] w-[68px] rounded-pill bg-near-black/5 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// Wrap inside memo to ensure skeleton tracks don't re-compute during list mount transitions
export default memo(SkeletonCard);
