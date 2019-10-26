import CacheItem from "./CacheItem";

type MemoryStorage = {
  [key: string]: CacheItem;
};

export default MemoryStorage;
