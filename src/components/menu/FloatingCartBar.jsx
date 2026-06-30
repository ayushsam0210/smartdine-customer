import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const formatMoney = (value) => `₹${Math.round(Number(value || 0)).toLocaleString('en-IN')}`;

export default function FloatingCartBar({ itemCount = 0, subtotal = 0, tableNumber }) {
  const navigate = useNavigate();

  // Guard clause against running animation engines if metrics aren't active yet
  const isVisible = itemCount > 0;

  const handleNavigation = () => {
    // Fallback block prevents component from firing broken navigation loops
    const cleanTable = tableNumber ? String(tableNumber) : '';
    navigate(`/cart?table=${cleanTable}`);
  };

  return (
    // Keep AnimatePresence open at root so exit bindings survive parent rendering sweeps
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          className="fixed inset-x-0 bottom-0 z-50 px-4 pb-[max(20px,env(safe-area-inset-bottom))]"
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        >
          <button
            type="button"
            onClick={handleNavigation}
            aria-label={`View your cart containing ${itemCount} items for ${formatMoney(subtotal)}`}
            className="mx-auto flex w-full max-w-[480px] items-center justify-between rounded-pill bg-near-black px-5 py-[13px] shadow-float transition-transform active:scale-[0.98] duration-150"
          >
            {/* Left Portion: Icon + Badge Count Layout */}
            <span className="flex items-center gap-3 pointer-events-none">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-coral">
                <ShoppingBag size={17} color="white" strokeWidth={2.5} />
              </span>
              <span className="font-heading text-[14px] font-bold text-white">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
            </span>

            {/* Right Portion: Computed Cash Totals + Link Indicator */}
            <span className="flex items-center gap-2 pointer-events-none">
              <span className="font-heading text-[14px] font-bold text-coral">
                {formatMoney(subtotal)}
              </span>
              <span className="font-heading text-[14px] font-bold text-white/60" aria-hidden="true">
                →
              </span>
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
