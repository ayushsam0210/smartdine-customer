import { useEffect, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ChevronLeft, ShoppingBag } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import NoTablePage from '../components/ui/NoTablePage';
import CartItem from '../components/cart/CartItem';
import OrderSummary, { calculateOrderTotals, formatMoney } from '../components/cart/OrderSummary';
import { useCart } from '../context/CartContext';
import { useSettings } from '../hooks/useSettings';

const isValidTableNumber = (value) => {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= 200;
};

export default function CartPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const tableParam = new URLSearchParams(location.search).get('table');
  const tableNumber = Number(tableParam);
  const validTable = isValidTableNumber(tableParam);

  const {
    items = [], 
    itemCount = 0, 
    subtotal = 0,
    addItem, 
    removeItem, 
    setTableNumber,
    specialInstructions = '', // Fallback at context destructure level to prevent input type switching
    setSpecialInstructions,
  } = useCart();
  
  const { gstRate = 0, serviceChargeRate = 0 } = useSettings();

  useEffect(() => {
    if (validTable) setTableNumber(tableNumber);
  }, [setTableNumber, tableNumber, validTable]);

  // Safely compute the total breakdown
  const total = useMemo(
    () => calculateOrderTotals(subtotal, gstRate, serviceChargeRate).total,
    [gstRate, serviceChargeRate, subtotal],
  );

  if (!validTable) return <NoTablePage />;

  const goToMenu = () => navigate(`/menu?table=${tableNumber}`);

  return (
    <main className="mx-auto min-h-screen max-w-[480px] bg-beige pb-28">
      {/* Header */}
      <header className="relative flex h-[60px] items-center px-4">
        <button
          type="button"
          onClick={goToMenu}
          aria-label="Back to menu"
          className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface shadow-card text-near-black"
        >
          <ChevronLeft size={20} strokeWidth={2.4} />
        </button>

        <h1 className="absolute inset-x-0 text-center font-display text-[22px] font-bold text-near-black">
          Your Order
        </h1>

        <div className="relative z-10 ml-auto shrink-0 rounded-pill bg-near-black px-4 py-[7px] font-heading text-[11px] font-bold text-white">
          Table {tableNumber}
        </div>
      </header>

      {items.length === 0 ? (
        /* Empty state view */
        <section className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-coral-light">
            <ShoppingBag size={40} color="#E8654A" strokeWidth={1.6} />
          </div>
          <h2 className="mt-5 font-heading text-[18px] font-bold text-near-black">
            Your cart is empty
          </h2>
          <p className="mt-2 font-body text-[13px] text-muted">
            Add something delicious from the menu
          </p>
          <button
            type="button"
            onClick={goToMenu}
            className="mt-6 rounded-pill bg-near-black px-7 py-[13px] font-heading text-[13px] font-bold text-white transition-opacity hover:opacity-80"
          >
            Browse Menu →
          </button>
        </section>
      ) : (
        <>
          {/* Items list */}
          <section className="px-4 pt-2">
            <p className="mb-3 font-body text-[12px] text-muted">
              {itemCount} {itemCount === 1 ? 'item' : 'items'} in your order
            </p>
            <div className="relative space-y-2">
              <AnimatePresence initial={false} mode="popLayout">
                {items.map((item) => (
                  <CartItem 
                    key={item.menuItemId} 
                    item={item} 
                    onAdd={addItem} 
                    onRemove={removeItem} 
                  />
                ))}
              </AnimatePresence>
            </div>
          </section>

          {/* Special instructions */}
          <section className="px-4 pb-2 pt-3">
            <h2 className="mb-2 font-heading text-[11px] font-bold uppercase tracking-[1.2px] text-muted">
              Special Instructions
            </h2>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Any special requests? (e.g. less spicy, no onion, allergy notes)"
              className="w-full resize-none rounded-card-sm border border-border-warm bg-surface px-4 py-3 font-body text-[13px] text-near-black shadow-input outline-none transition-colors placeholder:text-muted-light focus:border-coral"
              rows={2}
            />
          </section>

          {/* Bill summary */}
          <OrderSummary subtotal={subtotal} gstRate={gstRate} serviceChargeRate={serviceChargeRate} />

          {/* Checkout Action Bar */}
          <div className="fixed inset-x-0 bottom-0 z-50 bg-beige/90 px-4 pb-[max(20px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-sm">
            <button
              type="button"
              onClick={() => navigate(`/checkout?table=${tableNumber}`)}
              className="mx-auto flex h-[54px] w-full max-w-[480px] items-center justify-between rounded-pill bg-coral px-6 font-heading text-[15px] font-bold text-white shadow-coral-glow transition-colors hover:bg-coral-dark active:bg-coral-dark"
            >
              <span>Proceed to Checkout</span>
              <span className="font-heading text-[15px] font-bold text-white/80">
                {formatMoney(total)} →
              </span>
            </button>
          </div>
        </>
      )}
    </main>
  );
}
