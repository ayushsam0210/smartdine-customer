import { useState, memo } from 'react';
import { motion } from 'framer-motion';

const getItemId = (item) => String(item?.menuItemId || item?.id || item?._id || '');
const isVegItem = (item) => Boolean(item?.isVegetarian ?? item?.vegetarian ?? item?.isVeg);

// Isolated Veg indicator component
function VegDot({ isVegetarian }) {
  const color = isVegetarian ? '#16A34A' : '#DC2626';
  return (
    <div
      title={isVegetarian ? 'Vegetarian' : 'Non-vegetarian'}
      style={{ borderColor: color }}
      className="mt-[4px] h-[14px] w-[14px] shrink-0 rounded-[3px] border-[1.5px] bg-white p-[2px]"
    >
      <div className="h-full w-full rounded-full" style={{ backgroundColor: color }} />
    </div>
  );
}

function DishCard({ item, quantity = 0, onAdd, onRemove }) {
  const itemId = getItemId(item);
  const isVegetarian = isVegItem(item);
  const price = Number(item?.price || 0);
  const imageUrl = item?.imageUrl || item?.image || '';
  const initial = item?.name?.charAt(0)?.toUpperCase() || 'S';

  // React state handles dynamic asset errors predictably
  const [imageError, setImageError] = useState(false);
  const showImage = imageUrl && !imageError;

  return (
    <article className="mb-2 flex items-start gap-3 rounded-card bg-surface p-[14px] shadow-card min-h-[112px]">
      {/* Thumbnail Container */}
      <div className="h-[84px] w-[84px] shrink-0 overflow-hidden rounded-image bg-near-black relative">
        {showImage ? (
          <img
            src={imageUrl}
            alt={item?.name}
            className="h-full w-full object-cover transition-opacity duration-300"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-near-black to-dark-brown font-display text-[30px] font-bold text-white uppercase select-none">
            {initial}
          </div>
        )}
      </div>

      {/* Main Details Wrapper */}
      <div className="flex min-w-0 flex-1 flex-col min-h-[84px] justify-between">
        <div>
          {/* Header Row */}
          <div className="flex items-start gap-2">
            <VegDot isVegetarian={isVegetarian} />
            <h3
              className="font-heading text-[14px] font-semibold leading-[1.3] text-near-black break-words line-clamp-2"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {item?.name}
            </h3>
          </div>

          {/* Item Description */}
          {item?.description && (
            <p className="mt-[4px] font-body text-[12px] leading-[1.4] text-muted line-clamp-1">
              {item.description}
            </p>
          )}
        </div>

        {/* Action Controls Row */}
        <div className="mt-2 flex items-center justify-between gap-2 pt-1">
          <p className="font-heading text-[15px] font-bold text-near-black shrink-0">
            ₹{price.toLocaleString('en-IN')}
          </p>

          {quantity === 0 ? (
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 500, damping: 22 }}
              onClick={() => onAdd?.(item)}
              className="h-[30px] w-[68px] rounded-pill bg-coral font-heading text-[11px] font-bold tracking-[0.3px] text-white shadow-coral-glow transition-colors hover:bg-coral-dark active:bg-coral-dark shrink-0"
            >
              ADD +
            </motion.button>
          ) : (
            <div className="flex items-center gap-[6px] shrink-0">
              <button
                type="button"
                aria-label={`Remove one ${item?.name}`}
                onClick={() => onRemove?.(itemId)}
                className="flex h-[28px] w-[28px] items-center justify-center rounded-full border-[1.5px] border-coral bg-transparent font-heading text-[15px] font-bold leading-none text-coral transition-colors hover:bg-coral hover:text-white active:bg-coral-dark active:text-white"
              >
                −
              </button>

              <span className="min-w-[20px] text-center font-heading text-[14px] font-bold text-near-black select-none">
                {quantity}
              </span>

              <button
                type="button"
                aria-label={`Add one ${item?.name}`}
                onClick={() => onAdd?.(item)}
                className="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-coral font-heading text-[15px] font-bold leading-none text-white transition-colors hover:bg-coral-dark active:bg-coral-dark"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

// Wrap in memo to guarantee list filtering remains lightweight and fast
export default memo(DishCard);
