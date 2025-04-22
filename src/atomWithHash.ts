import { atom } from 'jotai/vanilla';
import type { WritableAtom } from 'jotai/vanilla';
import { RESET } from 'jotai/vanilla/utils';

type SetStateActionWithReset<Value> =
  | Value
  | typeof RESET
  | ((prev: Value) => Value | typeof RESET);

const safeJSONParse = (initialValue: unknown) => (str: string) => {
  try {
    return JSON.parse(str);
  } catch {
    return initialValue;
  }
};

export type SetHashOption =
  | 'default'
  | 'replaceState'
  | ((searchParams: string) => void);

export type AtomWithHashSetOptions = {
  setHash?: SetHashOption;
};

export const setHashWithPush = (searchParams: string) => {
  const newUrl = `${window.location.pathname}${window.location.search}${searchParams ? `#${searchParams}` : ''}`;
  window.history.pushState(window.history.state, '', newUrl);
};

export const setHashWithReplace = (searchParams: string): void => {
  const newUrl = `${window.location.pathname}${window.location.search}${searchParams ? `#${searchParams}` : ''}`;
  window.history.replaceState(window.history.state, '', newUrl);
};

function getSetHashFn(setHashOption?: SetHashOption) {
  if (setHashOption === 'replaceState') {
    return setHashWithReplace;
  }
  if (typeof setHashOption === 'function') {
    return setHashOption;
  }
  return setHashWithPush;
}

export function atomWithHash<Value>(
  key: string,
  initialValue: Value,
  options?: {
    serialize?: (val: Value) => string;
    deserialize?: (str: string) => Value;
    subscribe?: (callback: () => void) => () => void;
    setHash?: SetHashOption;
  },
): WritableAtom<
  Value,
  [SetStateActionWithReset<Value>, AtomWithHashSetOptions?],
  void
> {
  const serialize = options?.serialize || JSON.stringify;

  const deserialize = options?.deserialize || safeJSONParse(initialValue);
  const subscribe =
    options?.subscribe ||
    ((callback) => {
      window.addEventListener('hashchange', callback);
      return () => {
        window.removeEventListener('hashchange', callback);
      };
    });

  const isLocationAvailable =
    typeof window !== 'undefined' && !!window.location;

  const strAtom = atom(
    isLocationAvailable
      ? new URLSearchParams(window.location.hash.slice(1)).get(key)
      : null,
  );
  strAtom.onMount = (setAtom) => {
    if (!isLocationAvailable) {
      return undefined;
    }
    const callback = () => {
      setAtom(new URLSearchParams(window.location.hash.slice(1)).get(key));
    };
    const unsubscribe = subscribe(callback);
    callback();
    return unsubscribe;
  };
  const valueAtom = atom((get) => {
    const str = get(strAtom);
    return str === null ? initialValue : deserialize(str);
  });
  return atom(
    (get) => get(valueAtom),
    (
      get,
      set,
      update: SetStateActionWithReset<Value>,
      setOptions?: AtomWithHashSetOptions,
    ) => {
      const nextValue =
        typeof update === 'function'
          ? (update as (prev: Value) => Value | typeof RESET)(get(valueAtom))
          : update;
      const searchParams = new URLSearchParams(window.location.hash.slice(1));
      if (nextValue === RESET) {
        set(strAtom, null);
        searchParams.delete(key);
      } else {
        const str = serialize(nextValue);
        set(strAtom, str);
        searchParams.set(key, str);
      }
      const setHash = getSetHashFn(setOptions?.setHash ?? options?.setHash);
      setHash(searchParams.toString());
    },
  );
}
