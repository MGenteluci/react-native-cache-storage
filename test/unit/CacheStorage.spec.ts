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
      'when: key doesnt exists in memory or storage; ' +
      'then: return null', async () => {
      const result = await cacheStorage.getItem('myRandomKey');
      expect(result).toBeNull();
    });

    it('given: key is myRandomKey; ' +
      'when: key exists in memory; ' +
      'then: return key', async () => {
      // @ts-ignore
      cacheStorage.memoryStorage = {
        myRandomKey: { value: 'random', ttl: 100, createdAt: new Date() },
        elseKey: { value: 'else', ttl: 100, createdAt: new Date() }
      };

      const result = await cacheStorage.getItem('myRandomKey');
      expect(result).toBe('random');
    });

    it('given: key is myRandomKey; ' +
      'when: key exists in memory but is expired; ' +
      'then: remove key from storage and return null', async () => {
      // @ts-ignore
      cacheStorage.memoryStorage = {
        myRandomKey: { value: 'random', ttl: 100, createdAt: new Date(2018, 8, 10) }
      };

      const result = await cacheStorage.getItem('myRandomKey');
      expect(result).toBeNull();
      expect(AsyncStorage.removeItem).toBeCalledWith('myRandomKey');
    });

    it('given: key is myRandomKey; ' +
      'when: key exist in memory and is old but ttl is 0; ' +
      'then: return value', async () => {
      // @ts-ignore
      cacheStorage.memoryStorage = {
        myRandomKey: { value: 'notExpired', ttl: 0, createdAt: new Date(2018, 8, 10) }
      };

      const result = await cacheStorage.getItem('myRandomKey');
      expect(result).toBe('notExpired');
      expect(AsyncStorage.removeItem).not.toBeCalled();
    });

    it('given: key is myRandomKey; ' +
      'when: key doesnt exist in memory but exists in storage; ' +
      'then: return key', async () => {
      jest.spyOn(AsyncStorage, 'getItem').mockResolvedValue(
        JSON.stringify({ value: 'random', ttl: 100, createdAt: new Date() })
      );

      const result = await cacheStorage.getItem('myRandomKey');
      expect(result).toBe('random');
      expect(AsyncStorage.getItem).toBeCalledWith('myRandomKey');
    });

    it('given: key is myRandomKey; ' +
      'when: key doesnt exist in memory but exist in storage and is expired' +
      'then: remove key from AsyncStorage and return null', async () => {
      jest.spyOn(AsyncStorage, 'getItem').mockResolvedValue(
        JSON.stringify(
          { value: 'random', ttl: 100, createdAt: new Date(2018, 12, 11) }
        )
      );

      const result = await cacheStorage.getItem('myRandomKey');
      expect(result).toBeNull();
      expect(AsyncStorage.getItem).toBeCalledWith('myRandomKey');
      expect(AsyncStorage.removeItem).toBeCalledWith('myRandomKey');
    });

    it('given: key is myRandomKey; ' +
      'when: key exist in storage and is old but ttl is 0; ' +
      'then: return value', async () => {
      jest.spyOn(AsyncStorage, 'getItem').mockResolvedValue(
        JSON.stringify(
          { value: 'notExpired', ttl: 0, createdAt: new Date(2018, 12, 11) }
        )
      );

      const result = await cacheStorage.getItem('myRandomKey');
      expect(result).toBe('notExpired');
      expect(AsyncStorage.getItem).toBeCalledWith('myRandomKey');
      expect(AsyncStorage.removeItem).not.toBeCalled();
    });
  });

  describe('setItem', () => {
    it('given: key is myRandomKey; ' +
      'when: myRandom doesnt exists in memory or storage; ' +
      'then: add key to memory and storage.', async () => {
      const mockDate = new Date(2019, 10, 26, 0, 0, 0, 0);
      // @ts-ignore
      jest.spyOn(Date, 'now').mockReturnValue(mockDate);

      const item = { value: 'valueTest', ttl: 100, createdAt: mockDate };
      const expectedSetItemParam = JSON.stringify(item);
      const expectedMemoryStorage = { myRandomKey: item };

      await cacheStorage.setItem('myRandomKey', 'valueTest', 100);
      expect(AsyncStorage.setItem).toBeCalledWith('myRandomKey', expectedSetItemParam);
      // @ts-ignore
      expect(cacheStorage.memoryStorage).toStrictEqual(expectedMemoryStorage);
    });
  });

  describe('clear', () => {
    it('given: there are two itens in memory; ' +
      'when: clear(); ' +
      'then: remove items from memory and storage.', async() => {
      // @ts-ignore
      cacheStorage.memoryStorage = {
        key1: { value: 'value1', ttl: 100, createdAt: new Date() },
        key2: { value: 'value2', ttl: 100, createdAt: new Date() }
      };

      await cacheStorage.clear();
      expect(AsyncStorage.removeItem).toHaveBeenNthCalledWith(1, 'key1');
      expect(AsyncStorage.removeItem).toHaveBeenNthCalledWith(2, 'key2');
      // @ts-ignore
      expect(cacheStorage.memoryStorage).toStrictEqual({});
    });
  });

  describe('multiSet', () => {
    it('given: keyValuePairs is [["key1", "value1"], ["key2", "value2"]]; ' +
      'when: multiSet(keyValuePairs, 700); ' +
      'then: add pairs to memory and storage with ttl 700.', async () => {
      const mockDate = new Date(2019, 10, 26, 0, 0, 0, 0);
      // @ts-ignore
      jest.spyOn(Date, 'now').mockReturnValue(mockDate);

      const item1 = { value: 'value1', ttl: 700, createdAt: mockDate };
      const item2 = { value: 'value2', ttl: 700, createdAt: mockDate };
      const expectedMemoryStorage = {
        key1: item1,
        key2: item2
      };

      const keyValuePairs = [['key1', 'value1'], ['key2', 'value2']];
      await cacheStorage.multiSet(keyValuePairs, 700);
      expect(AsyncStorage.setItem).toHaveBeenNthCalledWith(1, 'key1', JSON.stringify(item1));
      expect(AsyncStorage.setItem).toHaveBeenNthCalledWith(2, 'key2', JSON.stringify(item2));
      // @ts-ignore
      expect(cacheStorage.memoryStorage).toStrictEqual(expectedMemoryStorage);
    });
  });
});
