const formatMoney = (value) => `₹${Math.round(Number(value || 0)).toLocaleString('en-IN')}`;

export function calculateOrderTotals(subtotal, gstRate = 0, serviceChargeRate = 0) {
  const base = Number(subtotal || 0);
  const gstAmount = (base * Number(gstRate || 0)) / 100;
  const serviceAmount = (base * Number(serviceChargeRate || 0)) / 100;
  return { gstAmount, serviceAmount, total: base + gstAmount + serviceAmount };
}

export default function OrderSummary({ subtotal, gstRate = 0, serviceChargeRate = 0 }) {
  const { gstAmount, serviceAmount, total } = calculateOrderTotals(subtotal, gstRate, serviceChargeRate);
  const hasGst = Number(gstRate || 0) > 0;
  const hasService = Number(serviceChargeRate || 0) > 0;

  return (
    <section className="mx-4 rounded-card bg-surface p-5 shadow-card">
      <h2 className="font-heading text-[11px] font-bold uppercase tracking-[1.2px] text-muted">
        Bill Summary
      </h2>

      <div className="mt-4 space-y-[10px]">
        <div className="flex items-center justify-between gap-4">
          <span className="font-body text-[13px] text-muted">Item total</span>
          <span className="font-body text-[13px] font-medium text-near-black">
            {formatMoney(subtotal)}
          </span>
        </div>

        {hasGst && (
          <div className="flex items-center justify-between gap-4">
            <span className="font-body text-[13px] text-muted">
              GST ({Number(gstRate)}%)
            </span>
            <span className="font-body text-[13px] font-medium text-near-black">
              {formatMoney(gstAmount)}
            </span>
          </div>
        )}

        {hasService && (
          <div className="flex items-center justify-between gap-4">
            <span className="font-body text-[13px] text-muted">
              Service charge ({Number(serviceChargeRate)}%)
            </span>
            <span className="font-body text-[13px] font-medium text-near-black">
              {formatMoney(serviceAmount)}
            </span>
          </div>
        )}
      </div>

      <div className="my-4 h-px w-full bg-border-warm" />

      <div className="flex items-center justify-between gap-4">
        <span className="font-heading text-[15px] font-bold text-near-black">
          To Pay
        </span>
        <span className="font-heading text-[18px] font-extrabold text-coral">
          {formatMoney(total)}
        </span>
      </div>

      {(hasGst || hasService) && (
        <p className="mt-2 font-body text-[11px] text-muted-light">
          Inclusive of all taxes & charges
        </p>
      )}
    </section>
  );
}

export { formatMoney };
