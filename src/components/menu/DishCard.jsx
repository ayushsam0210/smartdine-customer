import { motion } from 'framer-motion';

const getItemId = (item) => String(item?.menuItemId || item?.id || item?._id || '');
const isVegItem = (item) => Boolean(item?.isVegetarian ?? item?.vegetarian ?? item?.isVeg);

function VegDot({ isVegetarian }) {
  const color = isVegetarian ? '#16A34A' : '#DC2626';
  return (
    <div
      title={isVegetarian ? 'Vegetarian' : 'Non-vegetarian'}
      style={{ borderColor: color }}
      className="mt-[1px] h-[14px] w-[14px] shrink-0 rounded-[3px] border-[1.5px] bg-white p-[2px]"
    >
      <div className="h-full w-full rounded-full" style={{ backgroundColor: color }} />
    </div>
  );
}

export default function DishCard({ item, quantity = 0, onAdd, onRemove }) {
  const itemId = getItemId(item);
  const isVegetarian = isVegItem(item);
  const price = Number(item?.price || 0);
  const imageUrl = item?.imageUrl || item?.image || '';
  const initial = item?.name?.charAt(0)?.toUpperCase() || 'S';

  return (
    <article className="mb-2 flex items-start gap-3 rounded-card bg-surface p-[14px] shadow-card">
      {/* Dish image */}
      <div className="h-[84px] w-[84px] shrink-0 overflow-hidden rounded-image bg-near-black">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item?.name}
            className="h-full w-full object-cover transition-opacity duration-300"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none';
              if (e.target.nextElementSibling) {
                e.target.nextElementSibling.style.display = 'flex';
              }
            }}
          />
        ) : null}
        <div
          className="h-full w-full items-center justify-center bg-gradient-to-br from-near-black to-dark-brown font-display text-[30px] font-bold text-white"
          style={{ display: imageUrl ? 'none' : 'flex' }}
        >
          {initial}
        </div>
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Name row with veg indicator */}
        <div className="flex items-start gap-2">
          <VegDot isVegetarian={isVegetarian} />
          <h3
            className="font-heading text-[14px] font-semibold leading-[1.4] text-near-black"
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

        {/* Description */}
        {item?.description && (
          <p className="mt-[5px] truncate font-body text-[12px] leading-[1.5] text-muted">
            {item.description}
          </p>
        )}

        {/* Price + Controls */}
        <div className="mt-[10px] flex items-center justify-between gap-2">
          <p className="font-heading text-[15px] font-bold text-near-black">
            ₹{price.toLocaleString('en-IN')}
          </p>

          {quantity === 0 ? (
            <motion.button
              type="button"
              whileTap={{ scale: 0.91 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              onClick={() => onAdd?.(item)}
              className="h-[30px] w-[68px] rounded-pill bg-coral font-heading text-[11px] font-bold tracking-[0.3px] text-white shadow-coral-glow transition-colors hover:bg-coral-dark active:bg-coral-dark"
            >
              ADD +
            </motion.button>
          ) : (
            <div className="flex items-center gap-[6px]">
              <button
                type="button"
                aria-label={`Remove one ${item?.name}`}
                onClick={() => onRemove?.(itemId)}
                className="flex h-[28px] w-[28px] items-center justify-center rounded-full border-[1.5px] border-coral bg-transparent font-heading text-[15px] font-bold leading-none text-coral transition-colors hover:bg-coral hover:text-white active:bg-coral-dark active:text-white"
              >
                −
              </button>

              <span className="min-w-[20px] text-center font-heading text-[14px] font-bold text-near-black">
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
