import { QrCode } from 'lucide-react';
import { motion } from 'framer-motion';
import { restaurantConfig } from '../../config/restaurant';

export default function NoTablePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-beige px-6">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex max-w-[280px] flex-col items-center text-center"
      >
        {/* Icon */}
        <div className="relative mb-6">
          <div className="flex h-[100px] w-[100px] items-center justify-center rounded-[28px] bg-near-black shadow-float">
            <QrCode size={48} strokeWidth={1.6} color="#E8654A" />
          </div>
          <motion.div
            className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-coral"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* Brand */}
        <p className="font-display text-sm font-bold tracking-[2px] uppercase text-coral">
          {restaurantConfig.name}
        </p>

        {/* Headline */}
        <h1 className="mt-2 font-heading text-[22px] font-extrabold leading-tight text-near-black">
          Scan your table's QR code
        </h1>

        <p className="mt-3 font-body text-[13px] leading-[1.7] text-muted">
          Look for the QR code on your table card or ask your server for assistance.
        </p>

        {/* Step hint */}
        <div className="mt-6 flex items-center gap-2 rounded-card-sm bg-coral-light px-4 py-3">
          <span className="text-lg">📱</span>
          <p className="font-body text-[12px] text-coral-dark font-medium">
            Point your camera at the QR code to start ordering
          </p>
        </div>
      </motion.section>
    </main>
  );
}
