import { motion } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import DishCard from './DishCard';

const sectionId = (category) =>
  category.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-&]/g, '');

const isVegItem = (item) => Boolean(item?.isVegetarian ?? item?.vegetarian ?? item?.isVeg);

export { sectionId };

export default function MenuSection({ category, items = [], vegOnly }) {
  const { addItem, removeItem, getItemQuantity } = useCart();
  const visibleItems = vegOnly ? items.filter(isVegItem) : items;

  if (!visibleItems.length) return null;

  return (
    <motion.section
      id={sectionId(category)}
      data-menu-section="true"
      data-category={category}
      className="mb-5 scroll-mt-[96px] px-4"
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Section header */}
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <h2 className="font-display text-[20px] font-bold text-near-black">
          {category}
        </h2>
        <span className="font-body text-[12px] text-muted-light">
          {visibleItems.length} {visibleItems.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Items */}
      <div>
        {visibleItems.map((item) => {
          const id = String(item.menuItemId || item.id || item._id);
          return (
            <DishCard
              key={id}
              item={item}
              quantity={getItemQuantity(id)}
              onAdd={addItem}
              onRemove={removeItem}
            />
          );
        })}
      </div>
    </motion.section>
  );
}
