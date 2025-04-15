import { atom } from 'jotai/vanilla';
import type { SetStateAction, WritableAtom } from 'jotai/vanilla';

export type Location = {
  pathname?: string;
  searchParams?: URLSearchParams;
  hash?: string;
};

const getLocation = (): Location => {
  if (typeof window === 'undefined' || !window.location) {
    return {};
  }
  return {
    pathname: window.location.pathname,
    searchParams: new URLSearchParams(window.location.search),
    hash: window.location.hash,
  };
};

const applyLocation = (
  location: Location,
  options?: { replace?: boolean },
): void => {
  const url = new URL(window.location.href);
  if ('pathname' in location) {
    url.pathname = location.pathname;
  }
  if ('searchParams' in location) {
    url.search = location.searchParams.toString();
  }
  if ('hash' in location) {
    url.hash = location.hash;
  }
  if (options?.replace) {
    window.history.replaceState(window.history.state, '', url);
  } else {
    window.history.pushState(null, '', url);
  }
};

const subscribe = (callback: () => void) => {
  window.addEventListener('popstate', callback);
  return () => window.removeEventListener('popstate', callback);
};

export type Options<T> = {
  preloaded?: T;
  replace?: boolean;
  getLocation?: () => T;
  applyLocation?: (location: T, options?: { replace?: boolean }) => void;
  subscribe?: (callback: () => void) => () => void;
};

type RequiredOptions<T> = Omit<Options<T>, 'getLocation' | 'applyLocation'> &
  Required<Pick<Options<T>, 'getLocation' | 'applyLocation'>>;

type AtomOptions<T> = Pick<Options<T>, 'replace'>;

export function atomWithLocation(
  options?: Options<Location>,
): WritableAtom<
  Location,
  [SetStateAction<Location>, AtomOptions<Location>?],
  void
>;

export function atomWithLocation<T>(
  options: RequiredOptions<T>,
): WritableAtom<T, [SetStateAction<T>, AtomOptions<T>?], void>;

export function atomWithLocation<T>(options?: Options<T>) {
  const getL =
    options?.getLocation ||
    (getLocation as unknown as NonNullable<Options<T>['getLocation']>);
  const appL =
    options?.applyLocation ||
    (applyLocation as unknown as NonNullable<Options<T>['applyLocation']>);
  const sub = options?.subscribe || subscribe;
  const baseAtom = atom(options?.preloaded ?? getL());

  if (process.env.NODE_ENV !== 'production') {
    baseAtom.debugPrivate = true;
  }

  baseAtom.onMount = (set) => {
    const callback = () => set(getL());
    const unsub = sub(callback);
    callback();
    return unsub;
  };
  const derivedAtom = atom(
    (get) => get(baseAtom),
    (get, set, arg: SetStateAction<T>, atomOptions: AtomOptions<T> = {}) => {
      set(baseAtom, arg);
      appL(get(baseAtom), { ...options, ...atomOptions });
    },
  );
  return derivedAtom;
}
