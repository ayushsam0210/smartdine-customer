import { memo } from 'react';

function VegToggle({ vegOnly, onToggle }) {
  return (
    <div className="flex items-center justify-between px-4 py-2 select-none">
      {/* Structural Category Label */}
      <span className="font-body text-[11px] font-semibold uppercase tracking-[1px] text-muted-light">
        Filter
      </span>

      {/* Accessible Filter Button Target */}
      <button
        type="button"
        aria-label="Toggle vegetarian filter"
        aria-pressed={vegOnly}
        onClick={() => onToggle?.(!vegOnly)}
        className={`flex min-h-[44px] items-center gap-[10px] rounded-pill border py-2 pl-3 pr-4 transition-all duration-200 shadow-sm active:scale-[0.98] ${
          vegOnly
            ? 'border-green-600/30 bg-green-50 text-green-700'
            : 'border-border-warm bg-surface text-muted'
        }`}
      >
        {/* Switch Slider Track Block */}
        <span
          className={`relative h-5 w-9 shrink-0 rounded-pill transition-colors duration-200 pointer-events-none ${
            vegOnly ? 'bg-green-600' : 'bg-muted-light/60'
          }`}
        >
          {/* Internal Handle Knob */}
          <span
            className={`absolute top-[3px] h-[14px] w-[14px] rounded-full bg-white shadow-sm transition-transform duration-200 ${
              vegOnly ? 'translate-x-[18px]' : 'translate-x-[3px]'
            }`}
          />
        </span>

        {/* Fixed Width Label Layer to Block Horizontal Layout Shifts */}
        <span className="font-heading text-[12px] font-bold tracking-[0.2px] inline-block text-left min-w-[62px] pointer-events-none">
          {vegOnly ? 'Veg only' : 'All items'}
        </span>
      </button>
    </div>
  );
}

// Wrap inside memo to stop re-render runs when scrolling or clicking dish items
export default memo(VegToggle);
