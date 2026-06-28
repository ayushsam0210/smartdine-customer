export default function SkeletonCard() {
  return (
    <div className="card-dish mb-2" aria-hidden="true">
      {/* Image skeleton */}
      <div className="skeleton h-[84px] w-[84px] shrink-0 rounded-image" />

      {/* Content skeleton */}
      <div className="min-w-0 flex-1">
        {/* Name line */}
        <div className="flex items-center gap-2">
          <div className="skeleton h-[14px] w-[14px] shrink-0 rounded-[3px]" />
          <div className="skeleton h-[14px] flex-1 max-w-[60%] rounded-md" />
        </div>
        {/* Description line */}
        <div className="skeleton mt-[8px] h-[12px] w-[45%] rounded-md" />
        {/* Price + button row */}
        <div className="mt-[14px] flex items-center justify-between">
          <div className="skeleton h-[15px] w-[52px] rounded-md" />
          <div className="skeleton h-[30px] w-[68px] rounded-pill" />
        </div>
      </div>
    </div>
  );
}
