export default function VegToggle({ vegOnly, onToggle }) {
  return (
    <div className="flex items-center justify-between px-4 py-2">
      <span className="font-body text-[11px] font-semibold uppercase tracking-[1px] text-muted-light">
        Filter
      </span>

      <button
        type="button"
        aria-label="Toggle vegetarian filter"
        aria-pressed={vegOnly}
        onClick={() => onToggle?.(!vegOnly)}
        className={`flex min-h-[44px] items-center gap-[10px] rounded-pill border px-4 transition-all duration-200 ${
          vegOnly
            ? 'border-green-600/30 bg-green-50 text-green-700'
            : 'border-border-warm bg-surface text-muted'
        }`}
      >
        {/* Toggle track */}
        <span
          className={`relative h-5 w-9 shrink-0 rounded-pill transition-colors duration-200 ${
            vegOnly ? 'bg-green-600' : 'bg-muted-light'
          }`}
        >
          <span
            className={`absolute top-[3px] h-[14px] w-[14px] rounded-full bg-white shadow-sm transition-transform duration-200 ${
              vegOnly ? 'translate-x-[18px]' : 'translate-x-[3px]'
            }`}
          />
        </span>

        {/* Label */}
        <span className="font-heading text-[12px] font-semibold">
          {vegOnly ? '🥦 Veg only' : 'All items'}
        </span>
      </button>
    </div>
  );
}
