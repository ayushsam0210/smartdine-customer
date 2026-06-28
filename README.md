# SmartDine — Customer App

React PWA for customer-facing QR ordering.

---

## Quick Start

```bash
cp .env.example .env
# Set VITE_API_URL to your backend URL
npm install
npm run dev      # development
npm run build    # production build
```

---

## Environment Variables

```env
VITE_API_URL=https://api.yourrestaurant.com
VITE_APP_NAME=SmartDine
```

---

## Customise Restaurant Branding

Edit `src/config/restaurant.js`:

```js
export const restaurantConfig = {
  name: "Your Restaurant Name",
  tagline: "Your tagline here",
  address: "Full address",
  phone: "+91 XXXXX XXXXX",
  primaryColor: "#E8654A",   // brand colour
};
```

---

## Customer Flow

1. Customer scans table QR code → lands on `/menu?table=N`
2. Browses menu, adds items to cart
3. Goes to checkout → enters name + phone
4. Selects **Online** (Razorpay) or **Cash** payment
5. Online: Razorpay payment → confirmation page with ETA
6. Cash: Order placed → show screen to waiter → pay at counter
7. WhatsApp invoice sent after payment confirmed

---

## Build for Production

```bash
npm run build
```

Output in `dist/` — deploy to Vercel, Netlify, or Nginx.
