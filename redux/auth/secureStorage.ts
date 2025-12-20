import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

// Storage keys
export const STORAGE_KEYS = {
  REFRESH_TOKEN: "refresh_token",
  ACCESS_TOKEN: "access_token",
  LOCALE: "locale",
} as const;

/**
 * Saves a value to SecureStore
 */
export const saveSecure = async (key: string, value: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.error(`Failed to save to SecureStore (${key}):`, error);
    throw error;
  }
};

/**
 * Retrieves a value from SecureStore
 */
export const getSecure = async (key: string): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.error(`Failed to get from SecureStore (${key}):`, error);
    return null;
  }
};

/**
 * Removes a value from SecureStore
 */
export const removeSecure = async (key: string): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error(`Failed to remove from SecureStore (${key}):`, error);
  }
};

/**
 * Saves a value to AsyncStorage
 */
export const save = async (key: string, value: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.error(`Failed to save to AsyncStorage (${key}):`, error);
    throw error;
  }
};

/**
 * Retrieves a value from AsyncStorage
 */
export const get = async (key: string): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    console.error(`Failed to get from AsyncStorage (${key}):`, error);
    return null;
  }
};

/**
 * Removes a value from AsyncStorage
 */
export const remove = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove from AsyncStorage (${key}):`, error);
  }
};

/**
 * Clears all auth data from storage
 */
export const clearAllAuthData = async (): Promise<void> => {
  try {
    await Promise.all([
      removeSecure(STORAGE_KEYS.REFRESH_TOKEN),
      remove(STORAGE_KEYS.ACCESS_TOKEN),
    ]);
  } catch (error) {
    console.error("Failed to clear auth data:", error);
  }
};
