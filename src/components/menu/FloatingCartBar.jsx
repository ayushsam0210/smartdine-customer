import { ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const formatMoney = (value) => `₹${Math.round(Number(value || 0)).toLocaleString('en-IN')}`;

export default function FloatingCartBar({ itemCount, subtotal, tableNumber }) {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {itemCount > 0 && (
        <motion.div
          className="fixed inset-x-0 bottom-0 z-50 px-4 pb-[max(20px,env(safe-area-inset-bottom))]"
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 340, damping: 30 }}
        >
          <button
            type="button"
            onClick={() => navigate(`/cart?table=${tableNumber}`)}
            className="mx-auto flex w-full max-w-[480px] items-center justify-between rounded-pill bg-near-black px-5 py-[13px] shadow-float"
          >
            {/* Left: icon + count */}
            <span className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-coral">
                <ShoppingBag size={17} color="white" strokeWidth={2.5} />
              </span>
              <span className="font-heading text-[14px] font-bold text-white">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
            </span>

            {/* Right: price + arrow */}
            <span className="flex items-center gap-2">
              <span className="font-heading text-[14px] font-bold text-coral">
                {formatMoney(subtotal)}
              </span>
              <span className="font-heading text-[14px] font-bold text-white/60">→</span>
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
