import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';
import CacheItem from './types/CacheItem';
import MemoryStorage from './types/MemoryStorage';

export default class CacheStorage {
  private memoryStorage: MemoryStorage;

  constructor() {
    this.memoryStorage = {};
  }

  async getItem(key: string): Promise<string | null> {
    const item: CacheItem = this.memoryStorage[key];

    if (item) {
      if (this.isItemExpired(item)) {
        await AsyncStorage.removeItem(key);
        return null;
      }

      return item.value;
    }

    const storageItem = await AsyncStorage.getItem(key);

    if (storageItem) {
      const cacheItem: CacheItem = JSON.parse(storageItem);

      if (this.isItemExpired(cacheItem)) {
        await AsyncStorage.removeItem(key);
        return null;
      }

      return cacheItem.value;
    }

    return null;
  }

  async setItem(key: string, value: string, ttl: number = 300): Promise<void> {
    const cacheItem: CacheItem = { value, ttl, createdAt: moment().toDate() };

    const stringifiedCacheItem = JSON.stringify(cacheItem);
    await AsyncStorage.setItem(key, stringifiedCacheItem);

    this.memoryStorage = { ...this.memoryStorage, [key]: cacheItem };
  }

  async clear(): Promise<void> {
    const keys = Object.keys(this.memoryStorage);

    this.memoryStorage = {};

    await Promise.all(keys.map(async key => {
      await AsyncStorage.removeItem(key);
    }));
  }

  private isItemExpired(item: CacheItem): boolean {
    if (item.ttl === 0) return false;

    return moment(item.createdAt).add(item.ttl, 'seconds').isBefore(new Date());
  }
}
