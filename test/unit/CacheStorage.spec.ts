import CacheStorage from '../../src/index';
import AsyncStorage from '@react-native-community/async-storage';

jest.mock('@react-native-community/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn()
}));

describe('CacheStorage', () => {
  let cacheStorage: CacheStorage;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
    jest.clearAllMocks();

    cacheStorage = new CacheStorage();
  });

  describe('getItem', () => {
    it('given: key is myRandomKey; ' +
      'when: key doesnt exists in memory or storage' +
      'then: return null', async () => {
      const result = await cacheStorage.getItem('myRandomKey');
      expect(result).toBeNull();
    });

    it('given: key is myRandomKey; ' +
      'when: key exists in memory' +
      'then: return key', async () => {
      // @ts-ignore
      cacheStorage.items = [
        JSON.stringify({ key: 'myRandomKey', ttl: 100, createdAt: new Date() }),
        JSON.stringify({ key: 'elseKey', ttl: 100, createdAt: new Date() })
      ];

      const result = await cacheStorage.getItem('myRandomKey');
      expect(result).toBe('myRandomKey');
    });

    it('given: key is myRandomKey; ' +
      'when: key exists in memory but is expired' +
      'then: return null', async () => {
      // @ts-ignore
      cacheStorage.items = [
        JSON.stringify({ key: 'myRandomKey', ttl: 100, createdAt: new Date(2018, 8, 10) })
      ];

      const result = await cacheStorage.getItem('myRandomKey');
      expect(result).toBeNull();
    });

    it('given: key is myRandomKey; ' +
      'when: key doesnt exists memory but exists in storage' +
      'then: return key', async () => {
      jest.spyOn(AsyncStorage, 'getItem').mockResolvedValue(
        JSON.stringify({ key: 'myRandomKey', ttl: 100, createdAt: new Date() })
      );

      const result = await cacheStorage.getItem('myRandomKey');
      expect(result).toBe('myRandomKey');
      expect(AsyncStorage.getItem).toBeCalledWith('myRandomKey');
    });

    it('given: key is myRandomKey; ' +
      'when: key doesnt exists memory but exists in storage and is expired' +
      'then: return null', async () => {
      jest.spyOn(AsyncStorage, 'getItem').mockResolvedValue(
        JSON.stringify(
          { key: 'myRandomKey', ttl: 100, createdAt: new Date(2018, 12, 11) }
        )
      );

      const result = await cacheStorage.getItem('myRandomKey');
      expect(result).toBeNull();
      expect(AsyncStorage.getItem).toBeCalledWith('myRandomKey');
    });
  });

  describe('setItem', () => {
    it('given: key is myRandomKey; ' +
      'when: myRandom doesnt exists in memory or storage; ' +
      'then: add key to memory and storage.', async () => {
      const mockDate = new Date(2019, 10, 26, 0, 0, 0, 0);
      // @ts-ignore
      jest.spyOn(Date, 'now').mockReturnValue(mockDate);

      const item = JSON.stringify({ key: 'myRandomKey', ttl: 100, createdAt: mockDate });

      const expectedSetItemParam = item;
      const expectedItems = [item];

      await cacheStorage.setItem('myRandomKey', 100);
      expect(AsyncStorage.setItem).toBeCalledWith('myRandomKey', expectedSetItemParam);
      // @ts-ignore
      expect(cacheStorage.items).toStrictEqual(expectedItems);
    });
  });

  describe('clear', () => {
    it('given: there are two itens in memory; ' +
      'when: clear(); ' +
      'then: remove items from memory and storage.', async() => {
      const item1 = JSON.stringify({ key: 'key1', ttl: 100, createdAt: new Date() });
      const item2 = JSON.stringify({ key: 'key2', ttl: 100, createdAt: new Date() });
      // @ts-ignore
      cacheStorage.items = [item1, item2];

      await cacheStorage.clear();
      expect(AsyncStorage.removeItem).toHaveBeenNthCalledWith(1, 'key1');
      expect(AsyncStorage.removeItem).toHaveBeenNthCalledWith(2, 'key2');
      // @ts-ignore
      expect(cacheStorage.items).toStrictEqual([]);
    });
  });
});
