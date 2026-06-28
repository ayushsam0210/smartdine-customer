import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'smartdine_cart';

const defaultCartState = {
  items: [],
  tableNumber: null,
  specialInstructions: '',
};

const calculateSubtotal = (item) => Number(item.price || 0) * Number(item.quantity || 0);

const normaliseCartItem = (menuItem, quantity = 1) => ({
  menuItemId: String(menuItem.menuItemId || menuItem.id || menuItem._id),
  name: menuItem.name,
  price: Number(menuItem.price || 0),
  quantity,
  imageUrl: menuItem.imageUrl || menuItem.image || '',
  isVegetarian: Boolean(menuItem.isVegetarian ?? menuItem.vegetarian ?? menuItem.isVeg),
  subtotal: Number(menuItem.price || 0) * quantity,
});

const loadInitialState = () => {
  if (typeof window === 'undefined') return defaultCartState;

  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultCartState;

    const parsed = JSON.parse(stored);
    return {
      ...defaultCartState,
      ...parsed,
      items: Array.isArray(parsed.items)
        ? parsed.items.map((item) => ({
            ...item,
            quantity: Number(item.quantity || 0),
            price: Number(item.price || 0),
            subtotal: calculateSubtotal(item),
          })).filter((item) => item.quantity > 0)
        : [],
    };
  } catch {
    return defaultCartState;
  }
};

export function CartProvider({ children }) {
  const [cart, setCart] = useState(loadInitialState);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Ignore storage errors so ordering still works in restrictive/private browsers.
    }
  }, [cart]);

  const addItem = useCallback((menuItem) => {
    if (!menuItem || !(menuItem.menuItemId || menuItem.id || menuItem._id)) return;

    setCart((current) => {
      const menuItemId = String(menuItem.menuItemId || menuItem.id || menuItem._id);
      const existingItem = current.items.find((item) => item.menuItemId === menuItemId);

      if (existingItem) {
        return {
          ...current,
          items: current.items.map((item) => {
            if (item.menuItemId !== menuItemId) return item;
            const quantity = item.quantity + 1;
            return { ...item, quantity, subtotal: item.price * quantity };
          }),
        };
      }

      return {
        ...current,
        items: [...current.items, normaliseCartItem(menuItem, 1)],
      };
    });
  }, []);

  const removeItem = useCallback((menuItemId) => {
    setCart((current) => ({
      ...current,
      items: current.items
        .map((item) => {
          if (item.menuItemId !== String(menuItemId)) return item;
          const quantity = item.quantity - 1;
          return { ...item, quantity, subtotal: item.price * quantity };
        })
        .filter((item) => item.quantity > 0),
    }));
  }, []);

  const updateQuantity = useCallback((menuItemId, qty) => {
    setCart((current) => {
      const quantity = Number(qty);

      if (quantity <= 0) {
        return {
          ...current,
          items: current.items.filter((item) => item.menuItemId !== String(menuItemId)),
        };
      }

      return {
        ...current,
        items: current.items.map((item) =>
          item.menuItemId === String(menuItemId)
            ? { ...item, quantity, subtotal: item.price * quantity }
            : item,
        ),
      };
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart((current) => ({ ...current, items: [] }));
  }, []);

  const setTableNumber = useCallback((n) => {
    setCart((current) => {
      // If table number changes, clear cart items to prevent cross-table contamination
      if (current.tableNumber !== null && current.tableNumber !== n) {
        return { ...defaultCartState, tableNumber: n };
      }
      return { ...current, tableNumber: n };
    });
  }, []);

  const setSpecialInstructions = useCallback((t) => {
    setCart((current) => ({ ...current, specialInstructions: t }));
  }, []);

  const getItemQuantity = useCallback(
    (id) => cart.items.find((item) => item.menuItemId === String(id))?.quantity || 0,
    [cart.items],
  );

  const value = useMemo(() => {
    const itemCount = cart.items.reduce((total, item) => total + item.quantity, 0);
    const subtotal = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);

    return {
      ...cart,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      setTableNumber,
      setSpecialInstructions,
      itemCount,
      subtotal,
      getItemQuantity,
    };
  }, [addItem, cart, clearCart, getItemQuantity, removeItem, setSpecialInstructions, setTableNumber, updateQuantity]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return context;
}
