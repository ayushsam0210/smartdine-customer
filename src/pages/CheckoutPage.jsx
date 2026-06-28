import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronLeft, ChevronUp, Loader2, Lock, ShoppingBag } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../config/api';
import { restaurantConfig } from '../config/restaurant';
import NoTablePage from '../components/ui/NoTablePage';
import { calculateOrderTotals, formatMoney } from '../components/cart/OrderSummary';
import { useCart } from '../context/CartContext';
import { useSettings } from '../hooks/useSettings';

const isValidTableNumber = (value) => {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= 200;
};

const selectOrderPayload = (payload, fallbackOrder) => {
  const candidate = payload?.order || payload?.data?.order || payload?.data;
  const looksLikeOrder =
    candidate && (candidate._id || candidate.id || candidate.orderNumber || candidate.totalAmount || candidate.items);
  return looksLikeOrder ? candidate : fallbackOrder;
};

const loadRazorpaySdk = () => {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const tableParam = new URLSearchParams(location.search).get('table');
  const tableNumber = Number(tableParam);
  const validTable = isValidTableNumber(tableParam);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [razorpayReady, setRazorpayReady] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Online');
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [failedOrderId, setFailedOrderId] = useState(null);
  const [failedRazorpayData, setFailedRazorpayData] = useState(null);
  const [failedOrderSnapshot, setFailedOrderSnapshot] = useState(null);
  const nameInputRef = useRef(null);

  const { items, itemCount, subtotal, clearCart, setTableNumber, specialInstructions } = useCart();
  const { gstRate, serviceChargeRate } = useSettings();

  useEffect(() => {
    if (validTable) setTableNumber(tableNumber);
  }, [setTableNumber, tableNumber, validTable]);

  useEffect(() => {
    let mounted = true;
    loadRazorpaySdk().then((ready) => { if (mounted) setRazorpayReady(ready); });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    nameInputRef.current?.focus();
    try {
      const saved = JSON.parse(window.sessionStorage.getItem('smartdine_customer_details') || '{}');
      if (saved.name) setName(saved.name);
      if (saved.phone) setPhone(saved.phone);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try {
      window.sessionStorage.setItem('smartdine_customer_details', JSON.stringify({ name, phone }));
    } catch { /* ignore */ }
  }, [name, phone]);

  const total = useMemo(
    () => calculateOrderTotals(subtotal, gstRate, serviceChargeRate).total,
    [gstRate, serviceChargeRate, subtotal],
  );

  const validateForm = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Please enter your name';
    else if (name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (!phone) errs.phone = 'Please enter your mobile number';
    else if (!/^[6-9]\d{9}$/.test(phone)) errs.phone = 'Enter a valid 10-digit mobile number';
    if (!items.length) errs.cart = 'Your cart is empty';
    setErrors(errs);
    return errs;
  };

  const verifyPayment = async (razorpayResponse, orderId, orderSnapshot) => {
    try {
      const res = await api.post(`/api/checkout/${orderId}/verify-payment`, {
        razorpayOrderId: razorpayResponse.razorpay_order_id,
        razorpayPaymentId: razorpayResponse.razorpay_payment_id,
        razorpaySignature: razorpayResponse.razorpay_signature,
      });
      const verifiedOrder = selectOrderPayload(
        res.data?.data || res.data,
        orderSnapshot,
      );
      clearCart();
      navigate(`/confirmation/${orderId}?table=${tableNumber}`, {
        replace: true,
        state: { order: verifiedOrder },
      });
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Payment verification failed');
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      toast.error(
        validationErrors.cart || validationErrors.name || validationErrors.phone || 'Please check your details',
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/api/orders', {
        tableNumber: Number(tableNumber),
        customerName: name.trim(),
        customerPhone: phone,
        paymentMethod: selectedPaymentMethod,
        specialInstructions: specialInstructions || '',
        items: items.map((item) => ({ menuItem: item.menuItemId, quantity: item.quantity })),
      });

      const data = response.data?.data || response.data;
      const order = selectOrderPayload(data, data);
      const orderId = order?._id || order?.id;

      if (!orderId) throw new Error('Order could not be created. Please ask staff for help.');

      if (selectedPaymentMethod === 'Cash') {
        clearCart();
        navigate(`/confirmation/${orderId}?table=${tableNumber}`, { replace: true, state: { order } });
        return;
      }

      const sdkLoaded = razorpayReady || (await loadRazorpaySdk());
      if (!sdkLoaded || !window.Razorpay) throw new Error('Unable to load Razorpay. Please try again.');

      const { razorpayOrderId, razorpayKeyId } = data;
      if (!razorpayOrderId || !razorpayKeyId)
        throw new Error('Payment could not be started. Please ask staff for help.');

      const rpAmount = Math.round(Number(order?.totalAmount || total) * 100);

      const razorpay = new window.Razorpay({
        key: razorpayKeyId,
        amount: rpAmount,
        currency: 'INR',
        name: restaurantConfig.name,
        description: order?.orderNumber || `${restaurantConfig.name} Order`,
        order_id: razorpayOrderId,
        prefill: { name: name.trim(), contact: `91${phone}` },
        theme: { color: '#E8654A' },
        handler: (res) => verifyPayment(res, orderId, order),
        modal: {
          ondismiss: () => {
            setIsLoading(false);
            setPaymentFailed(true);
            setFailedOrderId(orderId);
            setFailedOrderSnapshot(order);
            setFailedRazorpayData({ razorpayOrderId, razorpayKeyId, amount: rpAmount });
          },
        },
      });
      razorpay.open();
    } catch (err) {
      toast.error(typeof err === 'string' ? err : err?.message || 'Unable to process payment');
      setIsLoading(false);
    }
  };

  const handlePhoneChange = (e) => {
    setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
    if (errors.phone) setErrors((c) => ({ ...c, phone: '' }));
  };

  if (!validTable) return <NoTablePage />;

  if (!items.length) {
    return (
      <main className="mx-auto min-h-screen max-w-[480px] bg-beige">
        <header className="relative flex h-[60px] items-center px-4">
          <button
            type="button"
            onClick={() => navigate(`/cart?table=${tableNumber}`)}
            aria-label="Back to cart"
            className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface shadow-card text-near-black"
          >
            <ChevronLeft size={20} strokeWidth={2.4} />
          </button>
          <h1 className="absolute inset-x-0 text-center font-display text-[22px] font-bold text-near-black">Checkout</h1>
          <div className="relative z-10 ml-auto shrink-0 rounded-pill bg-near-black px-4 py-[7px] font-heading text-[11px] font-bold text-white">
            Table {tableNumber}
          </div>
        </header>
        <section className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-coral-light">
            <ShoppingBag size={40} color="#E8654A" strokeWidth={1.6} />
          </div>
          <h2 className="mt-5 font-heading text-[18px] font-bold text-near-black">Cart is empty</h2>
          <p className="mt-2 font-body text-[13px] text-muted">Add items before checkout</p>
          <button
            type="button"
            onClick={() => navigate(`/menu?table=${tableNumber}`)}
            className="mt-6 rounded-pill bg-near-black px-7 py-[13px] font-heading text-[13px] font-bold text-white"
          >
            Browse Menu →
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-[480px] bg-beige px-4 pb-10">
      {/* Header */}
      <header className="-mx-4 relative flex h-[60px] items-center px-4">
        <button
          type="button"
          onClick={() => navigate(`/cart?table=${tableNumber}`)}
          aria-label="Back to cart"
          className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface shadow-card text-near-black"
        >
          <ChevronLeft size={20} strokeWidth={2.4} />
        </button>
        <h1 className="absolute inset-x-0 text-center font-display text-[22px] font-bold text-near-black">Checkout</h1>
        <div className="relative z-10 ml-auto shrink-0 rounded-pill bg-near-black px-4 py-[7px] font-heading text-[11px] font-bold text-white">
          Table {tableNumber}
        </div>
      </header>

      {/* Customer details */}
      <section className="pt-2">
        <h2 className="mb-3 font-heading text-[11px] font-bold uppercase tracking-[1.2px] text-coral">
          Your Details
        </h2>

        <div className="space-y-3">
          <div>
            <input
              ref={nameInputRef}
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); if (errors.name) setErrors((c) => ({ ...c, name: '' })); }}
              placeholder="Full Name"
              autoComplete="name"
              className={`w-full rounded-card-sm border bg-surface px-4 py-[14px] font-heading text-[14px] text-near-black shadow-input outline-none transition-colors placeholder:text-muted-light focus:border-coral ${errors.name ? 'border-red-400' : 'border-border-warm'}`}
            />
            {errors.name && <p className="mt-1 font-body text-[11px] text-red-500">{errors.name}</p>}
          </div>

          <div>
            <div
              className={`flex items-center rounded-card-sm border bg-surface shadow-input transition-colors focus-within:border-coral ${errors.phone ? 'border-red-400' : 'border-border-warm'}`}
            >
              <span className="pl-4 pr-2 font-heading text-[14px] font-semibold text-muted">+91</span>
              <input
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={handlePhoneChange}
                maxLength={10}
                placeholder="Mobile Number"
                autoComplete="tel-national"
                className="min-w-0 flex-1 rounded-card-sm bg-transparent py-[14px] pr-4 font-heading text-[14px] text-near-black outline-none placeholder:text-muted-light"
              />
            </div>
            {errors.phone && <p className="mt-1 font-body text-[11px] text-red-500">{errors.phone}</p>}
          </div>
        </div>
      </section>

      {/* Order summary (collapsible) */}
      <section className="mt-4 rounded-card bg-surface p-4 shadow-card">
        <button
          type="button"
          onClick={() => setSummaryOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-4"
        >
          <span className="font-heading text-[12px] font-bold uppercase tracking-[1px] text-muted">
            Order Summary · {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </span>
          <span className="flex items-center gap-2 font-heading text-[14px] font-bold text-coral">
            {formatMoney(total)}
            {summaryOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </button>

        {summaryOpen && (
          <div className="mt-4 space-y-[8px] border-t border-border-warm pt-4">
            {items.map((item) => (
              <div key={item.menuItemId} className="flex items-center justify-between gap-3">
                <span className="min-w-0 flex-1 truncate font-body text-[12px] text-near-black">
                  {item.name} × {item.quantity}
                </span>
                <span className="font-body text-[12px] font-semibold text-muted">
                  ₹{Math.round(item.subtotal).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {errors.cart && (
        <p className="mt-3 text-center font-body text-[12px] text-red-500">{errors.cart}</p>
      )}

      {/* Payment method */}
      <section className="mt-4">
        <h2 className="mb-3 font-heading text-[11px] font-bold uppercase tracking-[1.2px] text-coral">
          Payment Method
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { method: 'Online', emoji: '💳', label: 'Pay Online', sub: 'UPI · Card · Net Banking' },
            { method: 'Cash', emoji: '💵', label: 'Pay Cash', sub: 'Pay at the counter' },
          ].map(({ method, emoji, label, sub }) => (
            <button
              key={method}
              type="button"
              onClick={() => setSelectedPaymentMethod(method)}
              className={`flex flex-col items-center gap-2 rounded-card-sm border-[1.5px] px-3 py-[14px] transition-all duration-150 ${
                selectedPaymentMethod === method
                  ? 'border-coral bg-coral-light shadow-coral-glow'
                  : 'border-border-warm bg-surface shadow-card'
              }`}
            >
              <span className="text-[22px]">{emoji}</span>
              <span
                className={`font-heading text-[12px] font-bold ${
                  selectedPaymentMethod === method ? 'text-coral' : 'text-near-black'
                }`}
              >
                {label}
              </span>
              <span className="font-body text-[10px] text-muted">{sub}</span>
            </button>
          ))}
        </div>
      </section>

      {/* CTA */}
      <button
        type="button"
        onClick={handlePayment}
        disabled={isLoading}
        className="mt-6 flex h-[54px] w-full items-center justify-center gap-2 rounded-pill bg-coral font-heading text-[15px] font-bold text-white shadow-coral-glow transition-colors hover:bg-coral-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Processing…
          </>
        ) : selectedPaymentMethod === 'Cash' ? (
          <>Place Order · {formatMoney(total)} →</>
        ) : (
          <>Pay {formatMoney(total)} →</>
        )}
      </button>

      <p className="mt-3 flex items-center justify-center gap-1 font-body text-[11px] text-muted">
        <Lock size={11} />
        Secure payment powered by Razorpay
      </p>

      {/* Payment failed recovery */}
      {paymentFailed && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 rounded-card border border-red-200 bg-red-50 p-4"
        >
          <div className="flex items-start gap-3">
            <span className="text-[22px]">⚠️</span>
            <div className="min-w-0 flex-1">
              <h3 className="font-heading text-[14px] font-bold text-near-black">
                Payment not completed
              </h3>
              <p className="mt-1 font-body text-[12px] text-muted">
                Your order has been saved. Retry payment or switch to cash.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    setPaymentFailed(false);
                    setIsLoading(true);
                    try {
                      const sdkLoaded = razorpayReady || (await loadRazorpaySdk());
                      if (!sdkLoaded || !window.Razorpay) throw new Error('Unable to load Razorpay');
                      const razorpay = new window.Razorpay({
                        key: failedRazorpayData.razorpayKeyId,
                        amount: failedRazorpayData.amount,
                        currency: 'INR',
                        name: restaurantConfig.name,
                        order_id: failedRazorpayData.razorpayOrderId,
                        prefill: { name: name.trim(), contact: `91${phone}` },
                        theme: { color: '#E8654A' },
                        // BUG FIX: pass failedOrderSnapshot as 3rd arg
                        handler: (res) => verifyPayment(res, failedOrderId, failedOrderSnapshot),
                        modal: {
                          ondismiss: () => {
                            setIsLoading(false);
                            setPaymentFailed(true);
                          },
                        },
                      });
                      razorpay.open();
                    } catch {
                      toast.error('Unable to retry payment');
                      setIsLoading(false);
                      setPaymentFailed(true);
                    }
                  }}
                  className="rounded-card-sm bg-coral px-4 py-[8px] font-heading text-[12px] font-bold text-white"
                >
                  Retry Payment
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await api.patch(`/api/orders/${failedOrderId}/payment`, { paymentMethod: 'Cash' });
                      clearCart();
                      navigate(`/confirmation/${failedOrderId}?table=${tableNumber}`, { replace: true });
                    } catch {
                      toast.error('Could not switch to cash payment');
                    }
                  }}
                  className="rounded-card-sm border border-near-black px-4 py-[8px] font-heading text-[12px] font-bold text-near-black"
                >
                  Pay Cash Instead
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </main>
  );
}
