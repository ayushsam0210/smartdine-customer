import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../config/api';

const CATEGORY_ORDER = [
  'Starters',
  'Main Course',
  'Breads',
  'Rice & Biryani',
  'Desserts',
  'Beverages',
  'Specials',
];

const getMenuArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.menu)) return data.menu;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const sortCategories = (categories) => {
  const known = CATEGORY_ORDER.filter((c) => categories.includes(c));
  const custom = categories
    .filter((c) => !CATEGORY_ORDER.includes(c))
    .sort((a, b) => a.localeCompare(b));
  return [...known, ...custom];
};

const groupByCategory = (menuItems) => {
  const grouped = menuItems.reduce((acc, item) => {
    const category = item.category || 'Specials';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  return sortCategories(Object.keys(grouped)).reduce((acc, category) => {
    acc[category] = grouped[category];
    return acc;
  }, {});
};

export function useMenu({ enabled = true } = {}) {
  const [allItems, setAllItems] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(Boolean(enabled));
  const [error, setError] = useState('');

  const fetchMenu = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return [];
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.get('/api/menu?available=true');
      const menuItems = getMenuArray(response.data);
      setAllItems(menuItems);
      setItems(menuItems);
      return menuItems;
    } catch (err) {
      const message = typeof err === 'string' ? err : 'Unable to load menu.';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  const filterByVeg = useCallback(
    (vegOnly) => {
      const filteredItems = vegOnly
        ? allItems.filter((item) => Boolean(item.isVegetarian ?? item.vegetarian ?? item.isVeg))
        : allItems;
      setItems(filteredItems);
      return filteredItems;
    },
    [allItems],
  );

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    fetchMenu();
  }, [enabled, fetchMenu]);

  const groupedItems = useMemo(() => groupByCategory(items), [items]);
  const categories = useMemo(() => sortCategories(Object.keys(groupedItems)), [groupedItems]);

  return { items, categories, groupedItems, loading, error, fetchMenu, filterByVeg };
}
