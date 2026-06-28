import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { restaurantConfig } from '../config/restaurant';
import { useCart } from '../context/CartContext';
import { useMenu } from '../hooks/useMenu';
import { useSettings } from '../hooks/useSettings';
import NoTablePage from '../components/ui/NoTablePage';
import MenuHeader from '../components/menu/MenuHeader';
import CategoryTabs from '../components/menu/CategoryTabs';
import VegToggle from '../components/menu/VegToggle';
import SkeletonCard from '../components/menu/SkeletonCard';
import MenuSection, { sectionId } from '../components/menu/MenuSection';
import ReviewsSection from '../components/menu/ReviewsSection';
import FloatingCartBar from '../components/menu/FloatingCartBar';

const isValidTableNumber = (value) => {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= 200;
};

export default function MenuPage() {
  const location = useLocation();
  const tableParam = new URLSearchParams(location.search).get('table');
  const tableNumber = Number(tableParam);
  const validTable = isValidTableNumber(tableParam);

  const [vegOnly, setVegOnly] = useState(false);
  const [activeCategory, setActiveCategory] = useState('');

  const { itemCount, subtotal, setTableNumber } = useCart();
  const { categories, groupedItems, loading, error, fetchMenu, filterByVeg } = useMenu({ enabled: validTable });
  const settings = useSettings();

  const restaurantName = settings.restaurantName || restaurantConfig.name;

  const categoryImages = useMemo(() => {
    return categories.reduce((acc, category) => {
      const first = (groupedItems[category] || []).find((item) => item.imageUrl || item.image);
      if (first) acc[category] = first.imageUrl || first.image;
      return acc;
    }, {});
  }, [categories, groupedItems]);

  useEffect(() => {
    if (validTable) setTableNumber(tableNumber);
  }, [setTableNumber, tableNumber, validTable]);

  useEffect(() => {
    filterByVeg(vegOnly);
  }, [filterByVeg, vegOnly]);

  useEffect(() => {
    if (!activeCategory && categories.length) {
      setActiveCategory(categories[0]);
    }
    if (activeCategory && categories.length && !categories.includes(activeCategory)) {
      setActiveCategory(categories[0]);
    }
  }, [activeCategory, categories]);

  useEffect(() => {
    if (!categories.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.dataset?.category) {
          setActiveCategory(visible.target.dataset.category);
        }
      },
      { root: null, threshold: 0.3, rootMargin: '-110px 0px -45% 0px' },
    );

    categories
      .map((c) => document.getElementById(sectionId(c)))
      .filter(Boolean)
      .forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, [categories, groupedItems, vegOnly]);

  const handleCategoryChange = useCallback((category) => {
    setActiveCategory(category);
    const node = document.getElementById(sectionId(category));
    if (!node) return;
    const y = node.getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }, []);

  const skeletons = useMemo(() => Array.from({ length: 5 }, (_, i) => i), []);

  if (!validTable) return <NoTablePage />;

  if (error && !loading) {
    return (
      <main className="mx-auto min-h-screen max-w-[480px] bg-beige pb-28">
        <MenuHeader restaurantName={restaurantName} tableNumber={tableNumber} />
        <section className="flex min-h-[45vh] flex-col items-center justify-center px-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-coral-light">
            <AlertCircle size={32} color="#E8654A" strokeWidth={1.8} />
          </div>
          <h2 className="mt-4 font-heading text-[18px] font-bold text-near-black">
            Couldn't load menu
          </h2>
          <p className="mt-2 font-body text-[13px] text-muted">Check your connection and try again</p>
          <button
            type="button"
            onClick={fetchMenu}
            className="mt-6 flex items-center gap-2 rounded-pill bg-near-black px-6 py-[12px] font-heading text-[13px] font-bold text-white transition-opacity hover:opacity-80"
          >
            <RefreshCw size={14} />
            Try Again
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-[480px] bg-beige pb-[100px]">
      <MenuHeader restaurantName={restaurantName} tableNumber={tableNumber} />

      <CategoryTabs
        categories={categories}
        active={activeCategory}
        onChange={handleCategoryChange}
        categoryImages={categoryImages}
      />

      <VegToggle vegOnly={vegOnly} onToggle={setVegOnly} />

      {loading ? (
        <section className="px-4 pt-2">
          {skeletons.map((key) => <SkeletonCard key={key} />)}
        </section>
      ) : categories.length === 0 ? (
        <section className="flex min-h-[40vh] flex-col items-center justify-center px-6 py-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-coral-light">
            <AlertCircle size={32} color="#E8654A" strokeWidth={1.8} />
          </div>
          <h2 className="mt-4 font-heading text-[18px] font-bold text-near-black">
            No dishes available yet
          </h2>
          <p className="mt-2 font-body text-[13px] text-muted">
            The kitchen is updating the menu. Please check back shortly.
          </p>
          <button
            type="button"
            onClick={fetchMenu}
            className="mt-5 rounded-pill bg-near-black px-6 py-[12px] font-heading text-[13px] font-bold text-white transition-opacity hover:opacity-80"
          >
            Refresh Menu
          </button>
        </section>
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
        >
          {categories.map((category) => (
            <MenuSection
              key={category}
              category={category}
              items={groupedItems[category] || []}
              vegOnly={vegOnly}
            />
          ))}
        </motion.div>
      )}

      <ReviewsSection />

      <FloatingCartBar itemCount={itemCount} subtotal={subtotal} tableNumber={tableNumber} />
    </main>
  );
}
