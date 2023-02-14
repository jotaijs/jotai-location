// TODO consider refactoring without atomWithStorage

import type { WritableAtom } from 'jotai/vanilla';
import {
  atomWithStorage,
  unstable_NO_STORAGE_VALUE as NO_STORAGE_VALUE,
  RESET,
} from 'jotai/vanilla/utils';

type SetStateActionWithReset<Value> =
  | Value
  | typeof RESET
  | ((prev: Value) => Value | typeof RESET);

export function atomWithHash<Value>(
  key: string,
  initialValue: Value,
  options?: {
    serialize?: (val: Value) => string;
    deserialize?: (str: string | null) => Value | typeof NO_STORAGE_VALUE;
    /**
     * @deprecated Use {@link options.setHash} with 'replaceState' instead
     */
    replaceState?: boolean;
    subscribe?: (callback: () => void) => () => void;
    setHash?: 'default' | 'replaceState' | ((searchParams: string) => void);
  },
): WritableAtom<Value, [SetStateActionWithReset<Value>], void> {
  const serialize = options?.serialize || JSON.stringify;

  let cachedStr: string | undefined = serialize(initialValue);
  let cachedValue: any = initialValue;

  const deserialize =
    options?.deserialize ||
    ((str) => {
      str = str || '';
      if (cachedStr !== str) {
        try {
          cachedValue = JSON.parse(str);
        } catch {
          return NO_STORAGE_VALUE;
        }
        cachedStr = str;
      }
      return cachedValue;
    });

  const subscribe =
    options?.subscribe ||
    ((callback) => {
      window.addEventListener('hashchange', callback);
      return () => {
        window.removeEventListener('hashchange', callback);
      };
    });
  if (options?.replaceState) {
    // eslint-disable-next-line no-console
    console.warn('[DEPRECATED] Use setHash=replaceState instead');
  }
  const setHashOption = options?.setHash;
  let setHash = (searchParams: string) => {
    window.location.hash = searchParams;
  };
  if (setHashOption === 'replaceState' || options?.replaceState) {
    setHash = (searchParams) => {
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}${window.location.search}#${searchParams}`,
      );
    };
  }
  if (typeof setHashOption === 'function') {
    setHash = setHashOption;
  }
  const hashStorage = {
    getItem: (k: string) => {
      if (typeof window === 'undefined' || !window.location) {
        return NO_STORAGE_VALUE;
      }
      const searchParams = new URLSearchParams(window.location.hash.slice(1));
      const storedValue = searchParams.get(k);
      return deserialize(storedValue);
    },
    setItem: (k: string, newValue: Value) => {
      const searchParams = new URLSearchParams(window.location.hash.slice(1));
      const serializedParamValue = serialize(newValue);
      searchParams.set(k, serializedParamValue);
      setHash(searchParams.toString());
      // Update local cache when setItem is called directly
      cachedStr = serializedParamValue;
      cachedValue = newValue;
    },
    removeItem: (k: string) => {
      const searchParams = new URLSearchParams(window.location.hash.slice(1));
      searchParams.delete(k);
      setHash(searchParams.toString());
    },
    subscribe: (k: string, setValue: (v: Value) => void) => {
      const callback = () => {
        const searchParams = new URLSearchParams(window.location.hash.slice(1));
        const str = searchParams.get(k);
        if (str !== null) {
          setValue(deserialize(str));
        } else {
          setValue(initialValue);
        }
      };
      return subscribe(callback);
    },
  };

  const establishedValue = hashStorage.getItem(key);

  return atomWithStorage(
    key,
    establishedValue === NO_STORAGE_VALUE ? initialValue : establishedValue,
    hashStorage,
  );
}
