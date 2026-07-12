import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

// Create an axios instance for settings to avoid circular dependencies
const api = axios.create({
  baseURL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8001/api'
    : 'https://boxxway.onrender.com/api',
});

// Default settings as requested
const defaultSettings = {
  theme: 'light',
  language: 'en',
  currency: 'INR',
  dateFormat: 'DD/MM/YYYY',
};

export const useSettingsStore = create(
  persist(
    (set, get) => ({
      ...defaultSettings,
      
      // Temporary preview state for settings page
      preview: null,
      
      isLoading: false,
      isOffline: false,
      
      // Actions
      setTheme: (theme) => {
        set({ theme });
        get().applyTheme(theme);
      },
      setLanguage: (language) => set({ language }),
      setCurrency: (currency) => set({ currency }),
      setDateFormat: (dateFormat) => set({ dateFormat }),
      
      setPreviewSettings: (preview) => {
        set({ preview });
        if (preview?.theme) get().applyTheme(preview.theme);
      },
      
      applyTheme: (themeStr) => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        
        let activeTheme = themeStr;
        if (themeStr === 'auto') {
          activeTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        
        if (activeTheme === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.add('light');
        }
      },
      
      // Fetch from backend
      fetchSettings: async () => {
        set({ isLoading: true });
        try {
          const res = await api.get('/settings/');
          if (res.data && res.data.data && res.data.data.appearance) {
            const appearance = res.data.data.appearance;
            
            // Map backend values to our system
            const theme = appearance.theme?.toLowerCase() || defaultSettings.theme;
            
            // Map languages
            const langMap = { 'English': 'en', 'Spanish': 'es', 'French': 'fr', 'German': 'de' };
            const language = langMap[appearance.language] || defaultSettings.language;
            
            // Map currency
            let currency = defaultSettings.currency;
            if (appearance.currency?.includes('USD')) currency = 'USD';
            else if (appearance.currency?.includes('EUR')) currency = 'EUR';
            else if (appearance.currency?.includes('GBP')) currency = 'GBP';
            else if (appearance.currency?.includes('INR')) currency = 'INR';
            
            const dateFormat = appearance.dateFormat || defaultSettings.dateFormat;
            
            set({ theme, language, currency, dateFormat, isOffline: false });
            get().applyTheme(theme);
          }
        } catch (error) {
          console.error("Failed to fetch settings, using local storage:", error);
          set({ isOffline: true });
          get().applyTheme(get().theme);
        } finally {
          set({ isLoading: false });
        }
      },
      
      // Save settings
      saveSettings: async (newSettings) => {
        // Map back to backend format
        const langReverseMap = { 'en': 'English', 'es': 'Spanish', 'fr': 'French', 'de': 'German' };
        const currencyReverseMap = { 'USD': 'USD ($)', 'EUR': 'EUR (€)', 'GBP': 'GBP (£)', 'INR': 'INR (₹)' };
        
        // Update local state immediately
        const settingsToApply = { ...newSettings };
        if (settingsToApply.theme) {
            settingsToApply.theme = settingsToApply.theme.toLowerCase();
        }
        
        set({
            ...settingsToApply,
            preview: null
        });
        
        if (settingsToApply.theme) {
            get().applyTheme(settingsToApply.theme);
        }
        
        const appearancePayload = {
            theme: settingsToApply.theme ? settingsToApply.theme.charAt(0).toUpperCase() + settingsToApply.theme.slice(1) : undefined,
            language: langReverseMap[settingsToApply.language] || undefined,
            currency: currencyReverseMap[settingsToApply.currency] || undefined,
            dateFormat: settingsToApply.dateFormat || undefined
        };
        
        // Remove undefined fields
        Object.keys(appearancePayload).forEach(key => appearancePayload[key] === undefined && delete appearancePayload[key]);
        
        try {
            await api.patch('/settings/', { appearance: appearancePayload });
            set({ isOffline: false });
        } catch (error) {
            console.error("Failed to save to backend. Saved locally.", error);
            set({ isOffline: true });
            throw new Error('Network Error'); // Let the UI handle the offline toast
        }
      }
    }),
    {
      name: 'boxway-settings',
    }
  )
);

// Formatters
export const useFormatters = () => {
  const store = useSettingsStore();
  
  // Use preview if available, otherwise actual settings
  const currency = store.preview?.currency || store.currency;
  const dateFormat = store.preview?.dateFormat || store.dateFormat;
  const language = store.preview?.language || store.language;
  
  const formatCurrency = (amount) => {
    const num = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.-]+/g,"")) : amount;
    if (isNaN(num)) return amount;
    
    return new Intl.NumberFormat(language, {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(num);
  };
  
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    
    switch (dateFormat) {
      case 'MM/DD/YYYY': return `${month}/${day}/${year}`;
      case 'YYYY-MM-DD': return `${year}-${month}-${day}`;
      case 'DD/MM/YYYY':
      default: return `${day}/${month}/${year}`;
    }
  };
  
  return { formatCurrency, formatDate };
};

import en from '../i18n/en.json';
import es from '../i18n/es.json';
import fr from '../i18n/fr.json';
import de from '../i18n/de.json';

const translations = { en, es, fr, de };


export const useTranslation = () => {
  const store = useSettingsStore();
  const language = store.preview?.language || store.language;
  
  const t = (key) => {
    if (!key) return '';
    const langDict = translations[language] || translations.en || {};
    return langDict[key] || key;
  };
  
  return { t, language };
};

