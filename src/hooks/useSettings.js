import { useEffect, useState } from 'react';
import api from '../config/api';
import { restaurantConfig } from '../config/restaurant';

let settingsCache = null;
let settingsPromise = null;
const listeners = new Set();

const defaultSettings = {
  gstRate: 0,
  serviceChargeRate: 0,
  restaurantName: restaurantConfig.name,
};

const normaliseSettings = (data) => ({
  gstRate: Number(data?.gstRate ?? data?.gst ?? defaultSettings.gstRate),
  serviceChargeRate: Number(data?.serviceChargeRate ?? data?.serviceCharge ?? defaultSettings.serviceChargeRate),
  restaurantName: data?.restaurantName || data?.name || defaultSettings.restaurantName,
});

// Broadcasts changes to all active components using the hook concurrently
const broadcast = () => {
  listeners.forEach((listener) => listener(settingsCache));
};

export function useSettings() {
  const [settings, setSettings] = useState(settingsCache || defaultSettings);
  const [loading, setLoading] = useState(!settingsCache);

  useEffect(() => {
    let isMounted = true;

    // Track this component's local state updater
    const handleUpdate = (newSettings) => {
      if (isMounted) {
        setSettings(newSettings);
        setLoading(false);
      }
    };
    listeners.add(handleUpdate);

    const loadSettings = async () => {
      if (settingsCache) {
        setSettings(settingsCache);
        setLoading(false);
        return;
      }

      try {
        if (!settingsPromise) {
          settingsPromise = api.get('/api/settings/public');
        }

        const response = await settingsPromise;
        settingsCache = normaliseSettings(response.data?.settings || response.data?.data || response.data);
        
        broadcast();
      } catch (error) {
        // Clear both trackers on error so a future mount can attempt auto-recovery
        settingsCache = null;
        settingsPromise = null;
        
        if (isMounted) {
          setSettings(defaultSettings);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadSettings();

    return () => {
      isMounted = false;
      listeners.delete(handleUpdate);
    };
  }, []);

  return {
    ...settings,
    loading,
  };
}
