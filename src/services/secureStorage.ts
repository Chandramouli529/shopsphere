import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage Keys
const TOKEN_KEY = 'shopsphere_auth_token';
const REFRESH_TOKEN_KEY = 'shopsphere_refresh_token';
const USER_DATA_KEY = 'shopsphere_user_data';
const REMEMBER_ME_KEY = 'shopsphere_remember_me';
const DEVICE_ID_KEY = 'shopsphere_device_id';

// SecureStore requires a real native module to be linked — in some
// environments (Expo Go/SDK version mismatches, certain web previews)
// that module is missing, and every SecureStore call throws
// "getValueWithKeyAsync is not a function" instead of actually failing
// per-key. Rather than losing the token entirely in that case, these
// wrappers fall back to plain AsyncStorage — less secure, but the app
// (and, importantly, "stay logged in") keeps working everywhere.
export async function safeSetItem(key: string, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    await AsyncStorage.setItem(`securestore_fallback_${key}`, value);
  }
}
export async function safeGetItem(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return AsyncStorage.getItem(`securestore_fallback_${key}`);
  }
}
export async function safeDeleteItem(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    await AsyncStorage.removeItem(`securestore_fallback_${key}`);
  }
}

// Token Data Interface
export interface TokenData {
  token: string;
  refreshToken?: string;
  expiresAt?: number;
}

// User Data Interface
export interface UserData {
  _id: string;
  name: string;
  email: string;
  mobile?: string;
  role: string;
  avatar?: string;
}

export const secureStorage = {
  // ==================== TOKEN MANAGEMENT ====================
  
  /**
   * Save authentication token securely
   */
  saveToken: async (token: string): Promise<void> => {
    try {
      await safeSetItem(TOKEN_KEY, token);
      console.log('✅ Token saved successfully');
    } catch (error) {
      console.error('❌ Error saving token:', error);
      throw error;
    }
  },

  /**
   * Get authentication token
   */
  getToken: async (): Promise<string | null> => {
    try {
      const token = await safeGetItem(TOKEN_KEY);
      return token;
    } catch (error) {
      console.error('❌ Error getting token:', error);
      return null;
    }
  },

  /**
   * Remove authentication token
   */
  removeToken: async (): Promise<void> => {
    try {
      await safeDeleteItem(TOKEN_KEY);
      console.log('✅ Token removed successfully');
    } catch (error) {
      console.error('❌ Error removing token:', error);
    }
  },

  // ==================== REFRESH TOKEN MANAGEMENT ====================
  
  /**
   * Save refresh token securely
   */
  saveRefreshToken: async (refreshToken: string): Promise<void> => {
    try {
      await safeSetItem(REFRESH_TOKEN_KEY, refreshToken);
      console.log('✅ Refresh token saved successfully');
    } catch (error) {
      console.error('❌ Error saving refresh token:', error);
      throw error;
    }
  },

  /**
   * Get refresh token
   */
  getRefreshToken: async (): Promise<string | null> => {
    try {
      const refreshToken = await safeGetItem(REFRESH_TOKEN_KEY);
      return refreshToken;
    } catch (error) {
      console.error('❌ Error getting refresh token:', error);
      return null;
    }
  },

  /**
   * Remove refresh token
   */
  removeRefreshToken: async (): Promise<void> => {
    try {
      await safeDeleteItem(REFRESH_TOKEN_KEY);
      console.log('✅ Refresh token removed successfully');
    } catch (error) {
      console.error('❌ Error removing refresh token:', error);
    }
  },

  // ==================== USER DATA MANAGEMENT ====================
  
  /**
   * Save user data
   */
  saveUserData: async (userData: UserData): Promise<void> => {
    try {
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
      console.log('✅ User data saved successfully');
    } catch (error) {
      console.error('❌ Error saving user data:', error);
      throw error;
    }
  },

  /**
   * Get user data
   */
  getUserData: async (): Promise<UserData | null> => {
    try {
      const data = await AsyncStorage.getItem(USER_DATA_KEY);
      if (data) {
        return JSON.parse(data) as UserData;
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting user data:', error);
      return null;
    }
  },

  /**
   * Remove user data
   */
  removeUserData: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(USER_DATA_KEY);
      console.log('✅ User data removed successfully');
    } catch (error) {
      console.error('❌ Error removing user data:', error);
    }
  },

  // ==================== REMEMBER ME MANAGEMENT ====================
  
  /**
   * Save remember me preference
   */
  saveRememberMe: async (value: boolean): Promise<void> => {
    try {
      await AsyncStorage.setItem(REMEMBER_ME_KEY, value.toString());
      console.log('✅ Remember me preference saved');
    } catch (error) {
      console.error('❌ Error saving remember me:', error);
    }
  },

  /**
   * Get remember me preference
   */
  getRememberMe: async (): Promise<boolean> => {
    try {
      const value = await AsyncStorage.getItem(REMEMBER_ME_KEY);
      return value === 'true';
    } catch (error) {
      console.error('❌ Error getting remember me:', error);
      return false;
    }
  },

  /**
   * Remove remember me preference
   */
  removeRememberMe: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(REMEMBER_ME_KEY);
    } catch (error) {
      console.error('❌ Error removing remember me:', error);
    }
  },

  // ==================== DEVICE ID MANAGEMENT ====================
  
  /**
   * Save device ID
   */
  saveDeviceId: async (deviceId: string): Promise<void> => {
    try {
      await safeSetItem(DEVICE_ID_KEY, deviceId);
      console.log('✅ Device ID saved successfully');
    } catch (error) {
      console.error('❌ Error saving device ID:', error);
      throw error;
    }
  },

  /**
   * Get device ID
   */
  getDeviceId: async (): Promise<string | null> => {
    try {
      const deviceId = await safeGetItem(DEVICE_ID_KEY);
      return deviceId;
    } catch (error) {
      console.error('❌ Error getting device ID:', error);
      return null;
    }
  },

  // ==================== COMPLETE AUTH STATE ====================
  
  /**
   * Save complete auth state (token + user data)
   */
  saveAuthState: async (token: string, userData: UserData, refreshToken?: string): Promise<void> => {
    try {
      await Promise.all([
        secureStorage.saveToken(token),
        secureStorage.saveUserData(userData),
        refreshToken ? secureStorage.saveRefreshToken(refreshToken) : Promise.resolve(),
      ]);
      console.log('✅ Complete auth state saved');
    } catch (error) {
      console.error('❌ Error saving auth state:', error);
      throw error;
    }
  },

  /**
   * Get complete auth state
   */
  getAuthState: async (): Promise<{ token: string | null; userData: UserData | null; refreshToken: string | null }> => {
    try {
      const [token, userData, refreshToken] = await Promise.all([
        secureStorage.getToken(),
        secureStorage.getUserData(),
        secureStorage.getRefreshToken(),
      ]);
      return { token, userData, refreshToken };
    } catch (error) {
      console.error('❌ Error getting auth state:', error);
      return { token: null, userData: null, refreshToken: null };
    }
  },

  /**
   * Clear all authentication data
   */
  clearAllAuth: async (): Promise<void> => {
    try {
      await Promise.all([
        secureStorage.removeToken(),
        secureStorage.removeRefreshToken(),
        secureStorage.removeUserData(),
        secureStorage.removeRememberMe(),
      ]);
      console.log('✅ All auth data cleared');
    } catch (error) {
      console.error('❌ Error clearing auth data:', error);
      throw error;
    }
  },

  // ==================== TOKEN VALIDATION ====================
  
  /**
   * Check if user is authenticated
   */
  isAuthenticated: async (): Promise<boolean> => {
    try {
      const token = await secureStorage.getToken();
      const userData = await secureStorage.getUserData();
      return !!(token && userData);
    } catch (error) {
      console.error('❌ Error checking authentication:', error);
      return false;
    }
  },

  /**
   * Check if token is expired (if expiration is stored)
   */
  isTokenExpired: async (): Promise<boolean> => {
    try {
      const userData = await secureStorage.getUserData();
      if (!userData) return true;
      
      // You can add token expiration logic here if your API returns expiresAt
      return false;
    } catch (error) {
      console.error('❌ Error checking token expiration:', error);
      return true;
    }
  },

  // ==================== MIGRATION & UTILS ====================
  
  /**
   * Migrate from old storage format (if needed)
   */
  migrateFromOldStorage: async (): Promise<void> => {
    try {
      // Check for old storage keys and migrate
      const oldToken = await AsyncStorage.getItem('auth_token');
      if (oldToken) {
        await secureStorage.saveToken(oldToken);
        await AsyncStorage.removeItem('auth_token');
        console.log('✅ Migrated token from old storage');
      }
      
      const oldUserData = await AsyncStorage.getItem('user_data');
      if (oldUserData) {
        await AsyncStorage.setItem(USER_DATA_KEY, oldUserData);
        await AsyncStorage.removeItem('user_data');
        console.log('✅ Migrated user data from old storage');
      }
    } catch (error) {
      console.error('❌ Error migrating storage:', error);
    }
  },

  /**
   * Get all storage keys (for debugging)
   */
  getAllKeys: async (): Promise<string[]> => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return keys.filter(key => key.startsWith('shopsphere_'));
    } catch (error) {
      console.error('❌ Error getting storage keys:', error);
      return [];
    }
  },

  /**
   * Clear all ShopSphere storage (for testing/logout)
   */
  clearAllStorage: async (): Promise<void> => {
    try {
      const keys = await secureStorage.getAllKeys();
      await Promise.all(keys.map(key => AsyncStorage.removeItem(key)));
      await Promise.all([
        safeDeleteItem(TOKEN_KEY),
        safeDeleteItem(REFRESH_TOKEN_KEY),
        safeDeleteItem(DEVICE_ID_KEY),
      ]);
      console.log('✅ All ShopSphere storage cleared');
    } catch (error) {
      console.error('❌ Error clearing all storage:', error);
    }
  },
};

export default secureStorage;