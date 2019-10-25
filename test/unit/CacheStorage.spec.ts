import CacheStorage from '../../src/index';
import AsyncStorage from '@react-native-community/async-storage';

jest.mock('@react-native-community/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn()
}));

describe('CacheStorage', () => {
  let cacheStorage: CacheStorage;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
    jest.clearAllMocks();

    cacheStorage = new CacheStorage();
  });

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
    cacheStorage.items = [JSON.stringify({ key: 'myRandomKey', ttl: 100, createdAt: new Date() })];

    const result = await cacheStorage.getItem('myRandomKey');
    expect(result).toBe('myRandomKey');
  });

  it('given: key is myRandomKey; ' +
    'when: key doesnt exists memory but exists in storage' +
    'then: return key', async () => {
    jest.spyOn(AsyncStorage, 'getItem').mockResolvedValue(
      JSON.stringify({ key: 'myRandomKey', ttl: 100, createdAt: new Date() })
    );

    const result = await cacheStorage.getItem('myRandomKey');
    expect(result).toBe('myRandomKey');
  });

  it('given: key is myRandomKey; ' +
    'when: myRandom doesnt exists in memory or storage' +
    'then: returns key', async () => {
    const key = 'myRandomKey';

    await cacheStorage.setItem(key);
    const retrievedKey = await cacheStorage.getItem(key);
    expect(retrievedKey).toBe('myRandomKey');
  });
});
