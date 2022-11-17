// TODO consider refactoring without atomWithStorage

import type { WritableAtom } from 'jotai';
import {
  atomWithStorage,
  unstable_NO_STORAGE_VALUE as NO_STORAGE_VALUE,
  RESET,
} from 'jotai/utils';

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
    delayInit?: boolean;
    replaceState?: boolean;
    subscribe?: (callback: () => void) => () => void;
  },
): WritableAtom<Value, SetStateActionWithReset<Value>> {
  const serialize = options?.serialize || JSON.stringify;
  const deserialize =
    options?.deserialize ||
    ((str) => {
      try {
        return JSON.parse(str || '');
      } catch {
        return NO_STORAGE_VALUE;
      }
    });
  const subscribe =
    options?.subscribe ||
    ((callback) => {
      window.addEventListener('hashchange', callback);
      return () => {
        window.removeEventListener('hashchange', callback);
      };
    });
  const setHash = (searchParams: URLSearchParams) => {
    if (options?.replaceState) {
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}${
          window.location.search
        }#${searchParams.toString()}`,
      );
    } else {
      window.location.hash = searchParams.toString();
    }
  };
  const hashStorage = {
    getItem: (k: string) => {
      if (typeof window.location === 'undefined') {
        return NO_STORAGE_VALUE;
      }
      const searchParams = new URLSearchParams(window.location.hash.slice(1));
      const storedValue = searchParams.get(k);
      return deserialize(storedValue);
    },
    setItem: (k: string, newValue: Value) => {
      const searchParams = new URLSearchParams(window.location.hash.slice(1));
      searchParams.set(k, serialize(newValue));
      setHash(searchParams);
    },
    removeItem: (k: string) => {
      const searchParams = new URLSearchParams(window.location.hash.slice(1));
      searchParams.delete(k);
      setHash(searchParams);
    },
    ...(options?.delayInit && { delayInit: true }),
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

  return atomWithStorage(key, initialValue, hashStorage);
}
