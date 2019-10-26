# Cache Storage

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

### clear

Remove all keys saved in CacheStorage.

```js
clear(): Promise<void>;
```

`Does not affect other keys saved in AsyncStorage`
