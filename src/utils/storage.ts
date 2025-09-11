// Local JSON Storage Utilities for Health App

import { UserProfile, ChatMessage, DietPlan, HealthMetrics, FormData } from '@/types/health';

// Storage keys
const STORAGE_KEYS = {
  USER_PROFILE: 'healthapp_user_profile',
  CHAT_HISTORY: 'healthapp_chat_history',
  DIET_PLANS: 'healthapp_diet_plans',
  HEALTH_METRICS: 'healthapp_health_metrics',
  FORM_DATA: 'healthapp_form_data',
  PREFERENCES: 'healthapp_preferences',
} as const;

// Generic storage functions
const getFromStorage = <T>(key: string): T | null => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error getting ${key} from storage:`, error);
    return null;
  }
};

const setToStorage = <T>(key: string, data: T): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error setting ${key} to storage:`, error);
    return false;
  }
};

const removeFromStorage = (key: string): boolean => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing ${key} from storage:`, error);
    return false;
  }
};

// User Profile Storage
export const userProfileStorage = {
  get: (): UserProfile | null => {
    return getFromStorage<UserProfile>(STORAGE_KEYS.USER_PROFILE);
  },

  set: (profile: UserProfile): boolean => {
    const updatedProfile = {
      ...profile,
      updatedAt: new Date().toISOString(),
    };
    return setToStorage(STORAGE_KEYS.USER_PROFILE, updatedProfile);
  },

  update: (updates: Partial<UserProfile>): boolean => {
    const currentProfile = userProfileStorage.get();
    if (!currentProfile) return false;

    const updatedProfile = {
      ...currentProfile,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return setToStorage(STORAGE_KEYS.USER_PROFILE, updatedProfile);
  },

  remove: (): boolean => {
    return removeFromStorage(STORAGE_KEYS.USER_PROFILE);
  },
};

// Chat History Storage
export const chatStorage = {
  get: (): ChatMessage[] => {
    return getFromStorage<ChatMessage[]>(STORAGE_KEYS.CHAT_HISTORY) || [];
  },

  add: (message: ChatMessage): boolean => {
    const messages = chatStorage.get();
    messages.push(message);
    return setToStorage(STORAGE_KEYS.CHAT_HISTORY, messages);
  },

  clear: (): boolean => {
    return setToStorage(STORAGE_KEYS.CHAT_HISTORY, []);
  },

  getLastN: (n: number): ChatMessage[] => {
    const messages = chatStorage.get();
    return messages.slice(-n);
  },
};

// Diet Plans Storage
export const dietPlansStorage = {
  getAll: (): DietPlan[] => {
    return getFromStorage<DietPlan[]>(STORAGE_KEYS.DIET_PLANS) || [];
  },

  get: (id: string): DietPlan | null => {
    const plans = dietPlansStorage.getAll();
    return plans.find(plan => plan.id === id) || null;
  },

  add: (plan: DietPlan): boolean => {
    const plans = dietPlansStorage.getAll();
    plans.push(plan);
    return setToStorage(STORAGE_KEYS.DIET_PLANS, plans);
  },

  update: (id: string, updates: Partial<DietPlan>): boolean => {
    const plans = dietPlansStorage.getAll();
    const planIndex = plans.findIndex(plan => plan.id === id);
    
    if (planIndex === -1) return false;

    plans[planIndex] = { ...plans[planIndex], ...updates };
    return setToStorage(STORAGE_KEYS.DIET_PLANS, plans);
  },

  remove: (id: string): boolean => {
    const plans = dietPlansStorage.getAll();
    const filteredPlans = plans.filter(plan => plan.id !== id);
    return setToStorage(STORAGE_KEYS.DIET_PLANS, filteredPlans);
  },
};

// Health Metrics Storage
export const healthMetricsStorage = {
  getAll: (): HealthMetrics[] => {
    return getFromStorage<HealthMetrics[]>(STORAGE_KEYS.HEALTH_METRICS) || [];
  },

  getByDateRange: (startDate: string, endDate: string): HealthMetrics[] => {
    const metrics = healthMetricsStorage.getAll();
    return metrics.filter(metric => 
      metric.date >= startDate && metric.date <= endDate
    );
  },

  add: (metrics: HealthMetrics): boolean => {
    const allMetrics = healthMetricsStorage.getAll();
    // Remove existing entry for the same date
    const filteredMetrics = allMetrics.filter(m => m.date !== metrics.date);
    filteredMetrics.push(metrics);
    return setToStorage(STORAGE_KEYS.HEALTH_METRICS, filteredMetrics);
  },

  getLatest: (): HealthMetrics | null => {
    const metrics = healthMetricsStorage.getAll();
    if (metrics.length === 0) return null;
    
    return metrics.reduce((latest, current) => 
      new Date(current.date) > new Date(latest.date) ? current : latest
    );
  },
};

// Form Data Storage (for multi-step forms)
export const formDataStorage = {
  get: (): FormData | null => {
    return getFromStorage<FormData>(STORAGE_KEYS.FORM_DATA);
  },

  set: (formData: FormData): boolean => {
    return setToStorage(STORAGE_KEYS.FORM_DATA, formData);
  },

  updateStep: (step: number, stepData: any): boolean => {
    const currentData = formDataStorage.get() || {
      step: 0,
      completed: false,
      data: {}
    };

    const updatedData = {
      ...currentData,
      step,
      data: {
        ...currentData.data,
        ...stepData,
      },
    };

    return setToStorage(STORAGE_KEYS.FORM_DATA, updatedData);
  },

  markCompleted: (): boolean => {
    const currentData = formDataStorage.get();
    if (!currentData) return false;

    return setToStorage(STORAGE_KEYS.FORM_DATA, {
      ...currentData,
      completed: true,
    });
  },

  clear: (): boolean => {
    return removeFromStorage(STORAGE_KEYS.FORM_DATA);
  },
};

// User Preferences Storage
export const preferencesStorage = {
  get: (): any => {
    return getFromStorage(STORAGE_KEYS.PREFERENCES) || {
      notifications: true,
      units: 'metric',
      theme: 'light',
      language: 'en',
    };
  },

  set: (preferences: any): boolean => {
    return setToStorage(STORAGE_KEYS.PREFERENCES, preferences);
  },

  update: (updates: any): boolean => {
    const current = preferencesStorage.get();
    return setToStorage(STORAGE_KEYS.PREFERENCES, { ...current, ...updates });
  },
};

// Utility functions for data migration and cleanup
export const storageUtils = {
  exportAllData: () => {
    const data = {
      userProfile: userProfileStorage.get(),
      chatHistory: chatStorage.get(),
      dietPlans: dietPlansStorage.getAll(),
      healthMetrics: healthMetricsStorage.getAll(),
      preferences: preferencesStorage.get(),
      exportDate: new Date().toISOString(),
    };
    return data;
  },

  importData: (data: any): boolean => {
    try {
      if (data.userProfile) userProfileStorage.set(data.userProfile);
      if (data.chatHistory) setToStorage(STORAGE_KEYS.CHAT_HISTORY, data.chatHistory);
      if (data.dietPlans) setToStorage(STORAGE_KEYS.DIET_PLANS, data.dietPlans);
      if (data.healthMetrics) setToStorage(STORAGE_KEYS.HEALTH_METRICS, data.healthMetrics);
      if (data.preferences) preferencesStorage.set(data.preferences);
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  },

  clearAllData: (): boolean => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        removeFromStorage(key);
      });
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      return false;
    }
  },

  getStorageSize: (): string => {
    let totalSize = 0;
    Object.values(STORAGE_KEYS).forEach(key => {
      const item = localStorage.getItem(key);
      if (item) {
        totalSize += item.length;
      }
    });
    return `${(totalSize / 1024).toFixed(2)} KB`;
  },
};