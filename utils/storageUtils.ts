import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys for storage
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  USER_PREFERENCES: 'user_preferences',
  SAVED_ENTRIES: 'saved_entries',
  READING_HISTORY: 'reading_history',
  FAVORITES: 'favorites',
  DRAFT_ENTRIES: 'draft_entries',
  APP_SETTINGS: 'app_settings',
  NOTIFICATION_SETTINGS: 'notification_settings',
  THEME_PREFERENCE: 'theme_preference',
  LAST_SYNC: 'last_sync',
  OFFLINE_DATA: 'offline_data',
};

// Secure storage (for sensitive data like tokens)
export const SecureStorage = {
  async set(key: string, value: string): Promise<boolean> {
    try {
      await SecureStore.setItemAsync(key, value);
      return true;
    } catch (error) {
      console.error('SecureStore set error:', error);
      return false;
    }
  },

  async get(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('SecureStore get error:', error);
      return null;
    }
  },

  async remove(key: string): Promise<boolean> {
    try {
      await SecureStore.deleteItemAsync(key);
      return true;
    } catch (error) {
      console.error('SecureStore remove error:', error);
      return false;
    }
  },
};

// Regular storage (for non-sensitive data)
export const Storage = {
  async set(key: string, value: any): Promise<boolean> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      return true;
    } catch (error) {
      console.error('AsyncStorage set error:', error);
      return false;
    }
  },

  async get<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('AsyncStorage get error:', error);
      return null;
    }
  },

  async remove(key: string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('AsyncStorage remove error:', error);
      return false;
    }
  },

  async clear(): Promise<boolean> {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('AsyncStorage clear error:', error);
      return false;
    }
  },

  async getAllKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return keys as string[];
    } catch (error) {
      console.error('AsyncStorage getAllKeys error:', error);
      return [];
    }
  },

  async multiGet(keys: string[]): Promise<Record<string, any>> {
    try {
      const pairs = await AsyncStorage.multiGet(keys);
      const result: Record<string, any> = {};
      pairs.forEach(([key, value]) => {
        if (value) {
          result[key] = JSON.parse(value);
        }
      });
      return result;
    } catch (error) {
      console.error('AsyncStorage multiGet error:', error);
      return {};
    }
  },

  async multiSet(keyValuePairs: Record<string, any>): Promise<boolean> {
    try {
      const pairs = Object.entries(keyValuePairs).map(([key, value]) => [
        key,
        JSON.stringify(value),
      ]) as [string, string][];
      await AsyncStorage.multiSet(pairs);
      return true;
    } catch (error) {
      console.error('AsyncStorage multiSet error:', error);
      return false;
    }
  },
};

// User data management
export interface UserData {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
  stats: {
    entries: number;
    views: number;
    likes: number;
  };
}

export interface UserPreferences {
  notifications: boolean;
  emailUpdates: boolean;
  darkMode: boolean;
  autoSave: boolean;
  fontSize: 'small' | 'medium' | 'large';
  language: string;
}

export const UserStorage = {
  async saveUserData(userData: UserData): Promise<boolean> {
    return Storage.set(STORAGE_KEYS.USER_DATA, userData);
  },

  async getUserData(): Promise<UserData | null> {
    return Storage.get<UserData>(STORAGE_KEYS.USER_DATA);
  },

  async savePreferences(preferences: UserPreferences): Promise<boolean> {
    return Storage.set(STORAGE_KEYS.USER_PREFERENCES, preferences);
  },

  async getPreferences(): Promise<UserPreferences | null> {
    return Storage.get<UserPreferences>(STORAGE_KEYS.USER_PREFERENCES);
  },

  async clearUserData(): Promise<boolean> {
    const keysToRemove = [
      STORAGE_KEYS.USER_DATA,
      STORAGE_KEYS.USER_PREFERENCES,
      STORAGE_KEYS.SAVED_ENTRIES,
      STORAGE_KEYS.READING_HISTORY,
      STORAGE_KEYS.FAVORITES,
      STORAGE_KEYS.DRAFT_ENTRIES,
    ];
    
    try {
      await Promise.all(keysToRemove.map(key => Storage.remove(key)));
      await SecureStorage.remove(STORAGE_KEYS.AUTH_TOKEN);
      return true;
    } catch (error) {
      console.error('Error clearing user data:', error);
      return false;
    }
  },
};

// Entry management
export interface SavedEntry {
  id: string;
  title: string;
  author: string;
  savedAt: string;
  image?: string;
}

export interface ReadingHistoryItem {
  id: string;
  title: string;
  author: string;
  readAt: string;
  progress: number;
  image?: string;
}

export interface DraftEntry {
  id: string;
  title: string;
  content: string;
  workType: 'original' | 'inspired';
  universe: string;
  createdAt: string;
  updatedAt: string;
}

export const EntryStorage = {
  // Saved entries
  async saveEntry(entry: SavedEntry): Promise<boolean> {
    const entries = await this.getSavedEntries();
    const exists = entries.find(e => e.id === entry.id);
    if (!exists) {
      entries.push(entry);
      return Storage.set(STORAGE_KEYS.SAVED_ENTRIES, entries);
    }
    return true;
  },

  async removeSavedEntry(id: string): Promise<boolean> {
    const entries = await this.getSavedEntries();
    const filtered = entries.filter(e => e.id !== id);
    return Storage.set(STORAGE_KEYS.SAVED_ENTRIES, filtered);
  },

  async getSavedEntries(): Promise<SavedEntry[]> {
    const entries = await Storage.get<SavedEntry[]>(STORAGE_KEYS.SAVED_ENTRIES);
    return entries || [];
  },

  async isEntrySaved(id: string): Promise<boolean> {
    const entries = await this.getSavedEntries();
    return entries.some(e => e.id === id);
  },

  // Reading history
  async addToHistory(item: ReadingHistoryItem): Promise<boolean> {
    const history = await this.getReadingHistory();
    const existingIndex = history.findIndex(h => h.id === item.id);
    
    if (existingIndex >= 0) {
      history[existingIndex] = item;
    } else {
      history.unshift(item);
    }
    
    // Keep only last 50 items
    const trimmed = history.slice(0, 50);
    return Storage.set(STORAGE_KEYS.READING_HISTORY, trimmed);
  },

  async getReadingHistory(): Promise<ReadingHistoryItem[]> {
    const history = await Storage.get<ReadingHistoryItem[]>(STORAGE_KEYS.READING_HISTORY);
    return history || [];
  },

  async clearHistory(): Promise<boolean> {
    return Storage.remove(STORAGE_KEYS.READING_HISTORY);
  },

  // Favorites
  async addToFavorites(id: string): Promise<boolean> {
    const favorites = await this.getFavorites();
    if (!favorites.includes(id)) {
      favorites.push(id);
      return Storage.set(STORAGE_KEYS.FAVORITES, favorites);
    }
    return true;
  },

  async removeFromFavorites(id: string): Promise<boolean> {
    const favorites = await this.getFavorites();
    const filtered = favorites.filter(f => f !== id);
    return Storage.set(STORAGE_KEYS.FAVORITES, filtered);
  },

  async getFavorites(): Promise<string[]> {
    const favorites = await Storage.get<string[]>(STORAGE_KEYS.FAVORITES);
    return favorites || [];
  },

  async isFavorite(id: string): Promise<boolean> {
    const favorites = await this.getFavorites();
    return favorites.includes(id);
  },

  // Drafts
  async saveDraft(draft: DraftEntry): Promise<boolean> {
    const drafts = await this.getDrafts();
    const existingIndex = drafts.findIndex(d => d.id === draft.id);
    
    if (existingIndex >= 0) {
      drafts[existingIndex] = { ...draft, updatedAt: new Date().toISOString() };
    } else {
      drafts.push(draft);
    }
    
    return Storage.set(STORAGE_KEYS.DRAFT_ENTRIES, drafts);
  },

  async getDrafts(): Promise<DraftEntry[]> {
    const drafts = await Storage.get<DraftEntry[]>(STORAGE_KEYS.DRAFT_ENTRIES);
    return drafts || [];
  },

  async getDraft(id: string): Promise<DraftEntry | null> {
    const drafts = await this.getDrafts();
    return drafts.find(d => d.id === id) || null;
  },

  async deleteDraft(id: string): Promise<boolean> {
    const drafts = await this.getDrafts();
    const filtered = drafts.filter(d => d.id !== id);
    return Storage.set(STORAGE_KEYS.DRAFT_ENTRIES, filtered);
  },
};

// App settings
export interface AppSettings {
  version: string;
  lastUpdated: string;
  cacheSize: number;
  offlineMode: boolean;
}

export const AppStorage = {
  async saveSettings(settings: AppSettings): Promise<boolean> {
    return Storage.set(STORAGE_KEYS.APP_SETTINGS, settings);
  },

  async getSettings(): Promise<AppSettings | null> {
    return Storage.get<AppSettings>(STORAGE_KEYS.APP_SETTINGS);
  },

  async setLastSync(timestamp: string): Promise<boolean> {
    return Storage.set(STORAGE_KEYS.LAST_SYNC, timestamp);
  },

  async getLastSync(): Promise<string | null> {
    return Storage.get<string>(STORAGE_KEYS.LAST_SYNC);
  },
};