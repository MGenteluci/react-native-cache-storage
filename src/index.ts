import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';
import CacheItem from './types/CacheItem';

export default class CacheStorage {
  private items: string[];

  constructor() {
    this.items = [];
  }

  async getItem(key: string): Promise<string | null> {
    const item = this.items.reduce(
      (acc: CacheItem, current: string) => {
        const cacheItem: CacheItem = JSON.parse(current);

        if (cacheItem.key === key) return { ...acc, ...cacheItem };
        return { ...acc };
      },
      <CacheItem>{}
    );

    if (item.key) {
      const isKeyExpired = moment(item.createdAt)
        .add(item.ttl, 'seconds')
        .isBefore(new Date());

      return isKeyExpired ? null : item.key;
    }

    const storageItem = await AsyncStorage.getItem(key);

    if (storageItem) {
      const parsedItem: CacheItem = JSON.parse(storageItem);

      const isKeyExpired = moment(parsedItem.createdAt)
        .add(parsedItem.ttl, 'seconds')
        .isBefore(new Date());

      return isKeyExpired ? null : parsedItem.key;
    }

    return null;
  }

  async setItem(key: string, ttl: number = 300): Promise<void> {
    const cacheItem: CacheItem = { key, ttl, createdAt: new Date() };

    const stringifiedCacheItem = JSON.stringify(cacheItem);
    await AsyncStorage.setItem(key, stringifiedCacheItem);

    if (this.isKeySaved(key)) this.replaceItem(cacheItem);
    else this.items.push(stringifiedCacheItem);
  }

  private isKeySaved(key: string): boolean {
    return this.items.some(item => {
      const cacheItem: CacheItem = JSON.parse(item);

      return cacheItem.key === key;
    });
  }

  private replaceItem(unsavedItem: CacheItem): void {
    console.log('wont replace item')
    this.items = this.items.map(item => {
      const savedItem: CacheItem = JSON.parse(item);

      if (savedItem.key === unsavedItem.key) return JSON.stringify(unsavedItem);
      return item;
    });
  }

  async clear(): Promise<void> {
    await AsyncStorage.clear();
    this.items = [];
  }
}
