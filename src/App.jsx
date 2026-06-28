import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './context/CartContext';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import ConfirmationPage from './pages/ConfirmationPage';

function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

function RedirectToMenu() {
  const location = useLocation();
  return <Navigate to={`/menu${location.search}`} replace />;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<RedirectToMenu />} />
        <Route
          path="/menu"
          element={(
            <PageTransition>
              <MenuPage />
            </PageTransition>
          )}
        />
        <Route
          path="/cart"
          element={(
            <PageTransition>
              <CartPage />
            </PageTransition>
          )}
        />
        <Route
          path="/checkout"
          element={(
            <PageTransition>
              <CheckoutPage />
            </PageTransition>
          )}
        />
        <Route
          path="/confirmation/:orderId"
          element={(
            <PageTransition>
              <ConfirmationPage />
            </PageTransition>
          )}
        />
        <Route path="*" element={<RedirectToMenu />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '999px',
              background: '#1A1512',
              color: '#FAF8F5',
              fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
              fontSize: '13px',
              fontWeight: '600',
              padding: '10px 18px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
            },
          }}
        />
        <AnimatedRoutes />
      </CartProvider>
    </BrowserRouter>
  );
}
