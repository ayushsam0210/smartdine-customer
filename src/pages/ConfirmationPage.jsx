import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronDown, ChevronUp, MapPin, AlertCircle } from 'lucide-react';
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
  Pending:   { emoji: '⏳', label: 'Waiting for kitchen',       sub: 'Your order has been received',          color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-200' },
  Preparing: { emoji: '👨‍🍳', label: 'Being prepared',            sub: 'Our kitchen is cooking your order',     color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200'  },
  Ready:     { emoji: '✅', label: 'Ready to collect!',          sub: 'Please go to the counter',              color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-200' },
  Completed: { emoji: '🎉', label: 'Enjoy your meal!',           sub: 'Thank you for dining with us',          color: 'text-coral',      bg: 'bg-coral/10', border: 'border-coral/20' },
};

function WhatsAppIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
      <circle cx="16" cy="16" r="16" fill="#22C55E" />
      <path
        d="M22.62 18.86c-.36-.18-2.12-1.04-2.45-1.16-.33-.12-.57-.18-.81.18-.24.36-.93 1.16-1.14 1.4-.21.24-.42.27-.78.09-.36-.18-1.52-.56-2.9-1.79-1.07-.95-1.79-2.13-2-2.49-.21-.36-.02-.55.16-.73.16-.16.36-.42.54-.63.18-.21.24-.36.36-.6.12-.24.06-.45-.03-.63-.09-.18-.81-1.95-1.11-2.67-.29-.7-.59-.6-.81-.61h-.69c-.24 0-.63.09-.96.45-.33.36-1.26 1.23-1.26 3s1.29 3.48 1.47 3.72c.18.24 2.54 3.88 6.15 5.44.86.37 1.53.59 2.05.76.86.27 1.65.23 2.27.14.69-.1 2.12-.87 2.42-1.71.3-.84.3-1.56.21-1.71-.09-.15-.33-.24-.69-.42Z"
        fill="white"
      />
    </svg>
  );
}

function StatusStepper({ status }) {
  const steps = ['Pending', 'Preparing', 'Ready', 'Completed'];
  const idx = steps.indexOf(status);
  const labels = { Pending: 'Received', Preparing: 'Cooking', Ready: 'Ready', Completed: 'Done' };

  return (
    <div className="flex">
      {steps.map((step, i) => {
        const done    = i < idx;
        const current = i === idx;
        const leftColor = (done || current) ? 'bg-coral' : 'bg-warm-border';
        const rightColor = done ? 'bg-coral' : 'bg-warm-border';

        return (
          <div key={step} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              <div className={`h-[2px] flex-1 transition-colors duration-500 ${i === 0 ? 'invisible' : leftColor}`} />
              <div
                className={`flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-bold transition-all duration-500 ${
                  current
                    ? 'border-coral bg-coral text-white shadow-md'
                    : done
                    ? 'border-coral bg-coral text-white'
                    : 'border-warm-border bg-surface text-muted/60'
                }`}
              >
                {done ? '✓' : i + 1}
              </div>
              <div className={`h-[2px] flex-1 transition-colors duration-500 ${i === steps.length - 1 ? 'invisible' : rightColor}`} />
            </div>
            <span className={`mt-[5px] text-center font-body text-[10px] leading-tight ${current || done ? 'font-bold text-coral' : 'text-muted/60'}`}>
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

  const [order, setOrder] = useState(() => location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);
  const [error, setError] = useState('');
  const [itemsOpen, setItemsOpen] = useState(false);
  const [orderStatus, setOrderStatus] = useState(() => location.state?.order?.status || 'Pending');

  const orderStateStatus = order?.status;
  useEffect(() => {
    if (orderStateStatus) setOrderStatus(orderStateStatus);
  }, [orderStateStatus]);

  // Clean layout fetch execution
  useEffect(() => {
    if (order || !orderId) { setLoading(false); return; }
    let mounted = true;
    
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/orders/${orderId}`);
        if (mounted) setOrder(getOrderFromResponse(res.data));
      } catch (err) {
        if (mounted) setError(err?.response?.data?.message || 'Unable to load order details');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    
    fetchOrder();
    return () => { mounted = false; };
  }, [orderId, order]);

  // Streamlined and secure Socket gateway configuration
  useEffect(() => {
    if (!orderId) return undefined;
    
    const socketUrl = import.meta.env.VITE_API_URL || window.location.origin;
    const socket = io(socketUrl, { 
      transports: ['websocket'],
      upgrade: false 
    });

    socket.on('connect', () => {
      socket.emit('order:join', orderId); // Optimizes backend pipeline traffic allocation
    });

    socket.on('order:updated', (event) => {
      const data = event?.data || event;
      if (data?._id === orderId || data?.id === orderId) {
        setOrderStatus(data.status);
      }
    });

    return () => { socket.disconnect(); };
  }, [orderId]);

  const tableNumber = useMemo(() => {
    if (isValidTableNumber(tableParam)) return Number(tableParam);
    return Number(order?.tableNumber || order?.table || order?.tableNo || 0);
  }, [order, tableParam]);

  const validTable  = isValidTableNumber(tableNumber);
  const items       = useMemo(() => (Array.isArray(order?.items) ? order.items : []), [order?.items]);
  const itemCount   = useMemo(() => items.reduce((t, i) => t + getItemQuantity(i), 0), [items]);
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
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500 mb-4">
            <AlertCircle size={28} />
          </div>
          <h1 className="font-heading text-[20px] font-bold text-near-black">Order Not Found</h1>
          <p className="mt-2 font-body text-[13px] text-muted max-w-xs">{error}</p>
          <button
            type="button"
            onClick={() => navigate(`/menu${validTable ? `?table=${tableNumber}` : ''}`)}
            className="mt-6 rounded-full bg-near-black px-6 py-[12px] font-heading text-[13px] font-bold text-white shadow-sm"
          >
            ← Back to Menu
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-[480px] flex-col bg-beige">
      
      {/* ── Dark Hero Banner ────────────────────────────────────────────── */}
      <section className="relative flex min-h-[240px] flex-col items-center justify-center overflow-hidden bg-near-black px-5 pt-8 pb-12 text-center">
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.15]"
            style={{ background: 'radial-gradient(circle, #E8654A 0%, transparent 70%)' }}
          />
        </div>

        <motion.div
          className="absolute h-[100px] w-[100px] rounded-full border border-coral/20"
          animate={{ scale: [0.9, 1.4, 0.9], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="relative flex h-[64px] w-[64px] items-center justify-center rounded-full border-2 border-coral bg-coral/10"
        >
          <CheckCircle2 size={36} className="text-coral" strokeWidth={2} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="mt-4 font-display text-[26px] font-bold leading-tight text-white"
        >
          Order Placed!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mt-1 font-heading text-[14px] font-bold text-coral"
        >
          #{orderNumber}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-3 flex items-center gap-1 rounded-full bg-white/10 px-3 py-[4px]"
        >
          <MapPin size={12} className="text-white/60" />
          <span className="font-body text-[12px] font-medium text-white/80">Table {tableNumber}</span>
        </motion.div>
      </section>

      {/* ── Content Card Deck ───────────────────────────────────────────── */}
      <section className="flex flex-1 flex-col rounded-t-[24px] bg-beige -mt-5 px-4 pt-5 pb-8 z-10">
        
        {/* Live Tracking Progress Layout */}
        <div className="rounded-card bg-surface p-4 shadow-card">
          <StatusStepper status={orderStatus} />

          <AnimatePresence mode="wait">
            <motion.div
              key={orderStatus}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className={`mt-4 rounded-xl border p-3.5 ${statusCfg.bg} ${statusCfg.border}`}
            >
              <p className={`font-heading text-[14px] font-bold ${statusCfg.color}`}>
                {statusCfg.emoji} {statusCfg.label}
              </p>
              <p className="mt-[3px] font-body text-[12px] text-muted">
                {statusCfg.sub}
                {orderStatus === 'Preparing' && ` · Ready in ~${etaLabel}`}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Breakdown Collapsible Panel */}
        <div className="mt-3 rounded-card bg-surface p-4 shadow-card">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-heading text-[11px] font-bold uppercase tracking-wider text-muted">
              Order Details
            </h2>
            <span className="font-heading text-[18px] font-black text-near-black">
              {formatMoney(totalAmount)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setItemsOpen((o) => !o)}
            className="mt-3 flex w-full items-center justify-between gap-3 rounded-xl bg-beige px-3 py-2.5 transition-colors active:bg-neutral-200"
          >
            <span className="font-body text-[13px] font-medium text-near-black">
              {itemCount} {itemCount === 1 ? 'item' : 'items'} purchased
            </span>
            {itemsOpen ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
          </button>

          <AnimatePresence initial={false}>
            {itemsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="mt-2 space-y-2 border-t border-neutral-200/60 pt-3">
                  {items.map((item, i) => (
                    <div key={`${getItemName(item)}-${i}`} className="flex items-center justify-between gap-3 py-0.5">
                      <span className="min-w-0 flex-1 truncate font-body text-[13px] text-muted">
                        {getItemName(item)} <span className="font-bold text-near-black/70">× {getItemQuantity(item)}</span>
                      </span>
                      <span className="font-heading text-[13px] font-semibold text-near-black">
                        {formatMoney(getItemSubtotal(item))}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dynamic Billing Layout Route */}
        <div className="mt-3">
          {order?.paymentMethod === 'Online' ? (
            <div className="flex items-start gap-3 rounded-card bg-surface p-4 shadow-card">
              <WhatsAppIcon />
              <div className="min-w-0 flex-1">
                <h3 className="font-heading text-[14px] font-bold text-near-black">
                  Invoice Sent to WhatsApp
                </h3>
                <p className="mt-[2px] font-body text-[12px] text-muted">
                  {phoneLast4 ? `+91 ••••• ${phoneLast4}` : 'your registered number'}
                </p>
                <p className="mt-1.5 font-body text-[11px] leading-relaxed text-muted/80">
                  Check WhatsApp for your digital receipt and transaction history statements.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-card border border-amber-200 bg-amber-50 p-4">
              <span className="text-[22px] leading-none shrink-0">🧾</span>
              <div className="min-w-0 flex-1">
                <h3 className="font-heading text-[14px] font-bold text-near-black">
                  Pay At Counter
                </h3>
                <p className="mt-1 font-body text-[12px] leading-relaxed text-muted">
                  Show this live dashboard to your server. Your formal digital invoice will route directly over WhatsApp as soon as payment settles.
                </p>
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => navigate(`/menu?table=${tableNumber}`)}
          className="mt-5 flex h-[48px] w-full items-center justify-center rounded-full bg-near-black font-heading text-[14px] font-bold text-white shadow-sm transition-opacity active:opacity-90"
        >
          Return to Menu
        </button>
      </section>
    </main>
  );
}
