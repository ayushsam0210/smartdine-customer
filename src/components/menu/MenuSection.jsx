import { memo } from 'react';
import { useCart } from '../../context/CartContext';
import DishCard from './DishCard';

// Build a stable, DOM-safe id for a category so it can be used for
// scroll-spy (IntersectionObserver) and smooth-scroll targeting.
export function sectionId(category) {
  return `menu-section-${String(category || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')}`;
}

function MenuSection({ category, items = [], vegOnly }) {
  const { addItem, removeItem, getItemQuantity } = useCart();

  if (!items.length) return null;

  return (
    <section
      id={sectionId(category)}
      data-category={category}
      className="px-4 pt-4"
    >
      <h2 className="mb-3 font-heading text-[16px] font-bold text-near-black">
        {category}
      </h2>

      <div>
        {items.map((item) => {
          const itemId = String(item?.menuItemId || item?.id || item?._id || '');
          return (
            <DishCard
              key={itemId}
              item={item}
              quantity={getItemQuantity(itemId)}
              onAdd={addItem}
              onRemove={removeItem}
            />
          );
        })}
      </div>
    </section>
  );
}

export default memo(MenuSection);
