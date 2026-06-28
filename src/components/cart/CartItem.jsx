import { motion } from 'framer-motion';

export default function CartItem({ item, onAdd, onRemove }) {
  const imageUrl = item.imageUrl || item.image || '';
  const initial = item.name?.charAt(0)?.toUpperCase() || 'S';
  const subtotal = Number(item.price || 0) * Number(item.quantity || 0);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="mb-2 overflow-hidden rounded-card bg-surface p-[14px] shadow-card"
    >
      <div className="flex items-center gap-3">
        {/* Thumbnail */}
        <div className="h-[68px] w-[68px] shrink-0 overflow-hidden rounded-image bg-near-black">
          {imageUrl ? (
            <img src={imageUrl} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-near-black to-dark-brown font-display text-[26px] font-bold text-white">
              {initial}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-heading text-[14px] font-semibold text-near-black">
            {item.name}
          </h3>
          <p className="mt-[3px] font-body text-[12px] text-muted">
            ₹{Number(item.price || 0).toLocaleString('en-IN')} per item
          </p>

          <div className="mt-[10px] flex items-center justify-between gap-3">
            <p className="font-heading text-[15px] font-bold text-coral">
              ₹{Math.round(subtotal).toLocaleString('en-IN')}
            </p>

            {/* Qty controls */}
            <div className="flex items-center gap-[6px]">
              <button
                type="button"
                aria-label={`Remove one ${item.name}`}
                onClick={() => onRemove?.(item.menuItemId)}
                className="flex h-[28px] w-[28px] items-center justify-center rounded-full border-[1.5px] border-coral bg-transparent font-heading text-[15px] font-bold leading-none text-coral transition-colors hover:bg-coral hover:text-white active:bg-coral-dark active:text-white"
              >
                −
              </button>
              <span className="min-w-[20px] text-center font-heading text-[14px] font-bold text-near-black">
                {item.quantity}
              </span>
              <button
                type="button"
                aria-label={`Add one ${item.name}`}
                onClick={() => onAdd?.(item)}
                className="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-coral font-heading text-[15px] font-bold leading-none text-white transition-colors hover:bg-coral-dark active:bg-coral-dark"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
