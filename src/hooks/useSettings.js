import { useEffect, useState } from 'react';
import api from '../config/api';
import { restaurantConfig } from '../config/restaurant';

let settingsCache = null;
let settingsPromise = null;

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

export function useSettings() {
  const [settings, setSettings] = useState(settingsCache || defaultSettings);
  const [loading, setLoading] = useState(!settingsCache);

  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      if (settingsCache) {
        setSettings(settingsCache);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        if (!settingsPromise) {
          settingsPromise = api.get('/api/settings/public');
        }

        const response = await settingsPromise;
        settingsCache = normaliseSettings(response.data?.settings || response.data?.data || response.data);

        if (isMounted) {
          setSettings(settingsCache);
        }
      } catch {
        settingsCache = defaultSettings;
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
    };
  }, []);

  return {
    ...settings,
    loading,
  };
}
