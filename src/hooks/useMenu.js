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

const processMenuData = (menuItems, vegOnly) => {
  // 1. Single-pass Filter
  const filtered = vegOnly
    ? menuItems.filter((item) => Boolean(item.isVegetarian ?? item.vegetarian ?? item.isVeg))
    : menuItems;

  // 2. Group items natively
  const grouped = {};
  for (let i = 0; i < filtered.length; i++) {
    const item = filtered[i];
    const category = item.category || 'Specials';
    if (!grouped[category]) grouped[category] = [];
    grouped[category].push(item);
  }

  // 3. Sort Categories and build final output map simultaneously
  const sortedKeys = sortCategories(Object.keys(grouped));
  const groupedItems = {};
  
  for (let i = 0; i < sortedKeys.length; i++) {
    const key = sortedKeys[i];
    groupedItems[key] = grouped[key];
  }

  return {
    items: filtered,
    categories: sortedKeys,
    groupedItems,
  };
};

export function useMenu({ enabled = true } = {}) {
  const [allItems, setAllItems] = useState([]);
  const [vegOnly, setVegOnly] = useState(false);
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
      return menuItems;
    } catch (err) {
      const message = typeof err === 'string' ? err : 'Unable to load menu.';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  // Expose filtering as a controlled dynamic primitive state trigger
  const filterByVeg = useCallback((isVeg) => {
    setVegOnly(Boolean(isVeg));
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    fetchMenu();
  }, [enabled, fetchMenu]);

  // Single cleanly calculated dependency engine
  const pipelineResult = useMemo(() => {
    return processMenuData(allItems, vegOnly);
  }, [allItems, vegOnly]);

  return {
    items: pipelineResult.items,
    categories: pipelineResult.categories,
    groupedItems: pipelineResult.groupedItems,
    loading,
    error,
    fetchMenu,
    filterByVeg,
    isVegFiltered: vegOnly, // Useful extension to check current state
  };
}
