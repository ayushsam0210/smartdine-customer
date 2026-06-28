import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../config/api';
import LoadingScreen from '../components/ui/LoadingScreen';
import NoTablePage from '../components/ui/NoTablePage';
import { formatMoney } from '../components/cart/OrderSummary';

const isValidTableNumber = (value) => {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= 200;
};

const getOrderFromResponse = (data) => data?.order || data?.data?.order || data?.data || data;
const getItemName     = (item) => item?.name || item?.menuItem?.name || item?.menuItemName || 'Item';
const getItemQuantity = (item) => Number(item?.quantity || item?.qty || 0);
const getItemSubtotal = (item) => {
  const direct = item?.subtotal ?? item?.total ?? item?.amount;
  if (direct !== undefined) return Number(direct || 0);
  return Number(item?.price ?? item?.menuItem?.price ?? 0) * getItemQuantity(item);
};

const STATUS_CONFIG = {
  Pending:    { emoji: '⏳', label: 'Waiting for kitchen',       sub: 'Your order has been received',          color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-200' },
  Preparing:  { emoji: '👨‍🍳', label: 'Being prepared',           sub: 'Our kitchen is cooking your order',     color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200'  },
  Ready:      { emoji: '✅', label: 'Ready to collect!',          sub: 'Please go to the counter',              color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-200' },
  Completed:  { emoji: '🎉', label: 'Enjoy your meal!',           sub: 'Thank you for dining with us',          color: 'text-coral',      bg: 'bg-coral-light', border: 'border-coral/20' },
};

function WhatsAppIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="16" fill="#22C55E" />
      <path
        d="M22.62 18.86c-.36-.18-2.12-1.04-2.45-1.16-.33-.12-.57-.18-.81.18-.24.36-.93 1.16-1.14 1.4-.21.24-.42.27-.78.09-.36-.18-1.52-.56-2.9-1.79-1.07-.95-1.79-2.13-2-2.49-.21-.36-.02-.55.16-.73.16-.16.36-.42.54-.63.18-.21.24-.36.36-.6.12-.24.06-.45-.03-.63-.09-.18-.81-1.95-1.11-2.67-.29-.7-.59-.6-.81-.61h-.69c-.24 0-.63.09-.96.45-.33.36-1.26 1.23-1.26 3s1.29 3.48 1.47 3.72c.18.24 2.54 3.88 6.15 5.44.86.37 1.53.59 2.05.76.86.27 1.65.23 2.27.14.69-.1 2.12-.87 2.42-1.71.3-.84.3-1.56.21-1.71-.09-.15-.33-.24-.69-.42Z"
        fill="white"
      />
    </svg>
  );
}

/* Progress stepper — shows where in the order lifecycle we are */
function StatusStepper({ status }) {
  const steps = ['Pending', 'Preparing', 'Ready', 'Completed'];
  const idx = steps.indexOf(status);
  const labels = { Pending: 'Received', Preparing: 'Cooking', Ready: 'Ready', Completed: 'Done' };

  return (
    <div className="flex">
      {steps.map((step, i) => {
        const done    = i < idx;
        const current = i === idx;

        // Left connector: colored if this step or a previous step is/was active
        const leftColor = (done || current) ? 'bg-coral' : 'bg-border-warm';
        // Right connector: colored only if this step is done
        const rightColor = done ? 'bg-coral' : 'bg-border-warm';

        return (
          <div key={step} className="flex flex-1 flex-col items-center">
            {/* Connector + dot row */}
            <div className="flex w-full items-center">
              {/* Left connector — always render, invisible for step 0 so dot stays centered */}
              <div
                className={`h-[2px] flex-1 transition-colors duration-500 ${
                  i === 0 ? 'invisible' : leftColor
                }`}
              />
              {/* Dot */}
              <div
                className={`flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-bold transition-all duration-500 ${
                  current
                    ? 'border-coral bg-coral text-white shadow-coral-glow'
                    : done
                    ? 'border-coral bg-coral text-white'
                    : 'border-border-warm bg-surface text-muted-light'
                }`}
              >
                {done ? '✓' : i + 1}
              </div>
              {/* Right connector — always render, invisible for last step */}
              <div
                className={`h-[2px] flex-1 transition-colors duration-500 ${
                  i === steps.length - 1 ? 'invisible' : rightColor
                }`}
              />
            </div>
            {/* Label — now always centered under dot */}
            <span
              className={`mt-[5px] text-center font-body text-[9px] leading-tight ${
                current ? 'font-bold text-coral' : done ? 'text-coral' : 'text-muted-light'
              }`}
            >
              {labels[step]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function ConfirmationPage() {
  const { orderId } = useParams();
  const location    = useLocation();
  const navigate    = useNavigate();
  const tableParam  = new URLSearchParams(location.search).get('table');

  const [order,       setOrder]       = useState(() => location.state?.order || null);
  const [loading,     setLoading]     = useState(!location.state?.order);
  const [error,       setError]       = useState('');
  const [itemsOpen,   setItemsOpen]   = useState(false);
  const [orderStatus, setOrderStatus] = useState(order?.status || 'Pending');

  /* Keep local status in sync if order prop updates */
  useEffect(() => {
    if (order?.status && order.status !== orderStatus) setOrderStatus(order.status);
  }, [order?.status, orderStatus]);

  /* Fetch order if not provided via route state */
  useEffect(() => {
    let mounted = true;
    const fetchOrder = async () => {
      if (order || !orderId) { setLoading(false); return; }
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/api/orders/${orderId}`);
        if (mounted) setOrder(getOrderFromResponse(res.data));
      } catch (err) {
        if (mounted) setError(typeof err === 'string' ? err : 'Unable to load order details');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchOrder();
    return () => { mounted = false; };
  }, [order, orderId]);

  /* Socket.IO real-time status updates */
  useEffect(() => {
    if (!orderId) return;
    const socketUrl =
      import.meta.env.VITE_API_URL ||
      (import.meta.env.DEV ? window.location.origin : 'http://localhost:4000');
    const socket = io(socketUrl, { transports: ['websocket', 'polling'] });
    socket.on('order:updated', (event) => {
      const data = event?.data || event;
      if (data?._id === orderId || data?.id === orderId) setOrderStatus(data.status);
    });
    return () => { socket.disconnect(); };
  }, [orderId]);

  const tableNumber = useMemo(() => {
    if (isValidTableNumber(tableParam)) return Number(tableParam);
    return Number(order?.tableNumber || order?.table || order?.tableNo || 0);
  }, [order, tableParam]);

  const validTable  = isValidTableNumber(tableNumber);
  const items       = Array.isArray(order?.items) ? order.items : [];
  const itemCount   = items.reduce((t, i) => t + getItemQuantity(i), 0);
  const orderNumber = order?.orderNumber || order?.number || orderId;
  const totalAmount = Number(order?.totalAmount ?? order?.total ?? order?.amount ?? 0);
  const customerPhone = String(order?.customerPhone || order?.phone || '');
  const phoneLast4    = customerPhone.slice(-4);

  const etaLabel = useMemo(() => {
    if (!items.length) return '20–30 min';
    const hasPrepTime = items.some((i) => i.preparationTime != null && i.preparationTime > 0);
    if (!hasPrepTime) return '20–30 min';
    const base  = Math.max(...items.map((i) => i.preparationTime || 15));
    const extra = items.length > 3 ? 10 : 0;
    return `${Math.round((base + extra) / 5) * 5} min`;
  }, [items]);

  const statusCfg = STATUS_CONFIG[orderStatus] || STATUS_CONFIG.Pending;

  if (loading) return <LoadingScreen />;
  if (!validTable && !order) return <NoTablePage />;
  if (error && !order) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-beige px-6 text-center">
        <section>
          <h1 className="font-heading text-[20px] font-bold text-near-black">Order not found</h1>
          <p className="mt-2 font-body text-[13px] text-muted">{error}</p>
          <button
            type="button"
            onClick={() => navigate(`/menu${validTable ? `?table=${tableNumber}` : ''}`)}
            className="mt-6 rounded-pill border border-near-black px-6 py-[12px] font-heading text-[13px] font-bold text-near-black"
          >
            ← Back to Menu
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-[480px] flex-col bg-beige">

      {/* ── Dark hero top section ───────────────────────────────────────── */}
      <section className="relative flex min-h-[220px] flex-col items-center justify-center overflow-hidden bg-near-black px-5 py-10 text-center">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #E8654A 0%, transparent 70%)' }}
          />
        </div>

        {/* Pulse ring */}
        <motion.div
          className="absolute h-[110px] w-[110px] rounded-full border border-coral/25"
          animate={{ scale: [0.85, 1.35, 0.85], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Check icon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 18, delay: 0.05 }}
          className="relative flex h-[72px] w-[72px] items-center justify-center rounded-full border-[2.5px] border-coral bg-coral/15"
        >
          <CheckCircle2 size={40} color="#E8654A" strokeWidth={2} />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.3 }}
          className="mt-4 font-display text-[28px] font-bold leading-tight text-white"
        >
          Order Placed!
        </motion.h1>

        {/* Order number */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.28 }}
          className="mt-1 font-heading text-[13px] font-bold text-coral"
        >
          #{orderNumber}
        </motion.p>

        {/* Table badge */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.36 }}
          className="mt-3 flex items-center gap-1 rounded-pill bg-white/10 px-3 py-[5px]"
        >
          <MapPin size={11} color="rgba(255,255,255,0.6)" />
          <span className="font-body text-[11px] text-white/70">Table {tableNumber}</span>
        </motion.div>
      </section>

      {/* ── White content sheet ──────────────────────────────────────────── */}
      <section className="flex flex-1 flex-col rounded-t-[24px] bg-beige -mt-4 px-4 py-6">

        {/* Status stepper */}
        <div className="rounded-card bg-surface p-4 shadow-card">
          <StatusStepper status={orderStatus} />

          <AnimatePresence mode="wait">
            <motion.div
              key={orderStatus}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.28 }}
              className={`mt-4 rounded-card-sm border p-3 ${statusCfg.bg} ${statusCfg.border}`}
            >
              <p className={`font-heading text-[13px] font-bold ${statusCfg.color}`}>
                {statusCfg.emoji} {statusCfg.label}
              </p>
              <p className="mt-[2px] font-body text-[12px] text-muted">
                {statusCfg.sub}
                {orderStatus === 'Preparing' && ` · Ready in ~${etaLabel}`}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Order summary */}
        <div className="mt-3 rounded-card bg-surface p-4 shadow-card">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-heading text-[12px] font-bold uppercase tracking-[1px] text-muted">
              Order Summary
            </h2>
            <span className="font-heading text-[18px] font-extrabold text-coral">
              {formatMoney(totalAmount)}
            </span>
          </div>

          {/* Items collapsible */}
          <button
            type="button"
            onClick={() => setItemsOpen((o) => !o)}
            className="mt-3 flex w-full items-center justify-between gap-3 rounded-card-sm bg-beige px-3 py-[10px]"
          >
            <span className="font-body text-[12px] text-near-black">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </span>
            {itemsOpen
              ? <ChevronUp size={16} color="#84766D" />
              : <ChevronDown size={16} color="#84766D" />
            }
          </button>

          {itemsOpen && (
            <div className="mt-2 space-y-[8px] border-t border-border-warm pt-3">
              {items.map((item, i) => (
                <div
                  key={`${getItemName(item)}-${i}`}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="min-w-0 flex-1 truncate font-body text-[12px] text-muted">
                    {getItemName(item)} × {getItemQuantity(item)}
                  </span>
                  <span className="font-heading text-[12px] font-semibold text-near-black">
                    {formatMoney(getItemSubtotal(item))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment / Invoice notification */}
        <div className="mt-3">
          {order?.paymentMethod === 'Online' ? (
            <div className="flex items-start gap-3 rounded-card bg-surface p-4 shadow-card">
              <WhatsAppIcon />
              <div className="min-w-0 flex-1">
                <h3 className="font-heading text-[13px] font-bold text-near-black">
                  Invoice sent to WhatsApp
                </h3>
                <p className="mt-[3px] font-body text-[12px] text-muted">
                  {phoneLast4 ? `+91 ••••• ${phoneLast4}` : 'your registered number'}
                </p>
                <p className="mt-[6px] font-body text-[11px] leading-5 text-muted-light">
                  Check WhatsApp for detailed invoice & receipt
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-card border border-amber-200 bg-amber-50 p-4">
              <span className="text-[24px] leading-none">🧾</span>
              <div className="min-w-0 flex-1">
                <h3 className="font-heading text-[13px] font-bold text-near-black">
                  Pay at the counter
                </h3>
                <p className="mt-[6px] font-body text-[12px] leading-5 text-muted">
                  Show this screen to your server. Invoice will be sent to WhatsApp after payment.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Back to menu */}
        <button
          type="button"
          onClick={() => navigate(`/menu?table=${tableNumber}`)}
          className="mt-4 flex h-[50px] w-full items-center justify-center rounded-pill border-[1.5px] border-near-black bg-transparent font-heading text-[14px] font-bold text-near-black transition-colors hover:bg-near-black hover:text-white"
        >
          ← Back to Menu
        </button>

        {/* Footer spacer */}
        <div className="h-6" />
      </section>
    </main>
  );
}
