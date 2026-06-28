import { restaurantConfig } from '../../config/restaurant';

export default function MenuHeader({ restaurantName = restaurantConfig.name, tableNumber }) {
  const hasHero = Boolean(restaurantConfig.heroImage);

  return (
    <header className="bg-beige px-4 pb-4 pt-5">
      {/* Top bar: logo/name + table badge */}
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          {restaurantConfig.logoUrl ? (
            <img
              src={restaurantConfig.logoUrl}
              alt={restaurantName}
              className="max-h-7 w-auto object-contain"
            />
          ) : (
            <span className="font-heading text-[13px] font-bold text-muted uppercase tracking-[1.5px]">
              {restaurantName}
            </span>
          )}
        </div>

        <div className="shrink-0 rounded-pill bg-near-black px-4 py-[7px] font-heading text-[11px] font-bold text-white">
          Table {tableNumber}
        </div>
      </div>

      {/* Title */}
      <h1 className="mt-4 font-display text-[42px] font-bold leading-none tracking-[-1.5px] text-near-black">
        Menu
      </h1>

      {/* Hero banner */}
      <div className="relative mt-4 h-[190px] w-full overflow-hidden rounded-hero">
        {/* Background */}
        {hasHero ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${restaurantConfig.heroImage})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-hero-dark">
            {/* Subtle geometric pattern */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 20% 50%, #E8654A 0%, transparent 50%), radial-gradient(circle at 80% 20%, #C8922A 0%, transparent 50%)',
              }}
            />
            {/* Grid lines */}
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }}
            />
            {/* Centered restaurant name */}
            <div className="flex h-full items-center justify-center px-6">
              <p className="font-display text-[32px] font-bold leading-none text-white tracking-[-0.5px] text-center">
                {restaurantName}
              </p>
            </div>
          </div>
        )}

        {/* Gradient overlay for hero images */}
        {hasHero && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        )}

        {/* Rating pill */}
        <div className="absolute bottom-3 left-3 flex items-center gap-[6px] rounded-pill bg-white/95 px-3 py-[6px] backdrop-blur-sm">
          <span className="text-[11px]">⭐</span>
          <span className="font-heading text-[11px] font-bold text-near-black">
            {restaurantConfig.rating}
          </span>
          <span className="h-3 w-px bg-near-black/20" />
          <span className="font-body text-[11px] text-muted">
            {restaurantConfig.deliveryTime}
          </span>
        </div>
      </div>
    </header>
  );
}
