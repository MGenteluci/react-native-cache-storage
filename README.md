# Cache Storage

![coverage](https://codecov.io/gh/MGenteluci/react-native-cache-storage)
![pipeline](https://github.com/mgenteluci/react-native-cache-storage/workflows/deploy/badge.svg)

Cache Storage is a key value storage build on top of AsyncStorage, it uses
a combination of memory and AsyncStorage to provide fast responses.

## Usage

```js
import CacheStorage from 'react-native-cache-storage';

const cacheStorage = new CacheStorage();
```

### setItem

```js
setItem(key: string, value: string, ttl?: number): Promise<void>;
```

* ttl:
  - in seconds
  - default: `300`
  - if `0` is informed item will never expire.

### getItem

```js
getItem(key: string): Promise<string | null>;
```

### multiSet

```js
multiSet(keyValuePairs: string[][], ttl: number = 300): Promise<void>;
```

### clear

Remove all keys saved in CacheStorage.

```js
clear(): Promise<void>;
```

`Only affect keys saved by CacheStorage`
