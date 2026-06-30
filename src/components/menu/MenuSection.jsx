import { memo, useState } from 'react';
import { restaurantConfig } from '../../config/restaurant';

// Move static evaluations outside the component scope so they evaluate exactly ONCE on initial module compile
const HAS_HERO = Boolean(restaurantConfig.heroImage);
const STATIC_RATING = restaurantConfig.rating || '0.0';
const STATIC_DELIVERY = restaurantConfig.deliveryTime || '— mins';
const STATIC_LOGO = restaurantConfig.logoUrl;
const FALLBACK_NAME = restaurantConfig.name;

function MenuHeader({ restaurantName = FALLBACK_NAME, tableNumber }) {
  const [logoLoaded, setLogoLoaded] = useState(false);
  const cleanTableNumber = tableNumber ? String(tableNumber) : '—';

  return (
    <header className="bg-beige px-4 pb-4 pt-5 select-none">
      {/* Top bar: logo/name + table badge */}
      <div className="flex h-8 items-center justify-between gap-4">
        <div className="min-w-0 flex items-center">
          {STATIC_LOGO ? (
            <div 
              className={`relative max-h-7 transition-opacity duration-200 ${
                logoLoaded ? 'opacity-100' : 'opacity-0 w-24 bg-near-black/5 animate-pulse h-6 rounded'
              }`}
            >
              <img
                src={STATIC_LOGO}
                alt={`${restaurantName} Logo`}
                className="max-h-7 w-auto object-contain"
                onLoad={() => setLogoLoaded(true)}
              />
            </div>
          ) : (
            <h2 className="font-heading text-[13px] font-bold text-muted uppercase tracking-[1.5px] truncate">
              {restaurantName}
            </h2>
          )}
        </div>

        {/* Dynamic Table Indicator Badge */}
        <div className="shrink-0 rounded-pill bg-near-black px-4 py-[7px] font-heading text-[11px] font-bold text-white shadow-sm">
          Table {cleanTableNumber}
        </div>
      </div>

      {/* Main Title Header */}
      <h1 className="mt-4 font-display text-[42px] font-bold leading-none tracking-[-1.5px] text-near-black">
        Menu
      </h1>

      {/* Hero / Brand Art Banner Box */}
      <div className="relative mt-4 h-[190px] w-full overflow-hidden rounded-hero bg-near-black shadow-inner">
        {/* Background Visual Render Engine */}
        {HAS_HERO ? (
          <img 
            src={restaurantConfig.heroImage} 
            alt="" // Decorative background
            className="absolute inset-0 h-full w-full object-cover object-center"
            loading="eager"
          />
        ) : (
          <div className="absolute inset-0 bg-hero-dark">
            {/* Subtle radial canvas light pattern */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 20% 50%, #E8654A 0%, transparent 50%), radial-gradient(circle at 80% 20%, #C8922A 0%, transparent 50%)',
              }}
            />
            {/* Architectural Grid Mesh Overlay */}
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }}
            />
            {/* Minimal Brand Fallback Display */}
            <div className="flex h-full items-center justify-center px-6">
              <p className="font-display text-[32px] font-bold leading-none text-white tracking-[-0.5px] text-center line-clamp-2">
                {restaurantName}
              </p>
            </div>
          </div>
        )}

        {/* Protective Bottom Gradient Tint Mask */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10 pointer-events-none" />

        {/* Rating & Core Delivery Meta Pill */}
        <div className="absolute bottom-3 left-3 flex items-center gap-[6px] rounded-pill bg-white px-3 py-[6px] shadow-md border border-black/5">
          <span className="text-[11px]" aria-hidden="true">⭐</span>
          <span className="font-heading text-[11px] font-bold text-near-black">
            {STATIC_RATING}
          </span>
          <span className="h-3 w-px bg-near-black/20" aria-hidden="true" />
          <span className="font-body text-[11px] font-medium text-near-black/70">
            {STATIC_DELIVERY}
          </span>
        </div>
      </div>
    </header>
  );
}

export default memo(MenuHeader);
