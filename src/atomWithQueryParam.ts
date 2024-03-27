import { atom } from 'jotai/vanilla';
import { RESET } from 'jotai/vanilla/utils';

import { atomWithLocation } from './atomWithLocation';
import { SetStateActionWithReset, safeJSONParse } from './utils';

/**
 * Creates an atom that syncs its value with a specific query parameter in the URL.
 *
 * @param key The name of the query parameter.
 * @param initialValue The initial value of the atom if the query parameter is not present.
 * @param options Additional options for the atom:
 *  - serialize: A custom function to serialize the atom value to the hash. Defaults to JSON.stringify.
 *  - deserialize: A custom function to deserialize the hash to the atom value. Defaults to JSON.parse.
 *  - subscribe: A custom function to subscribe to location change
 *  - replace: A boolean to indicate to use replaceState instead of pushState. Defaults to false.
 */
export const atomWithQueryParam = <Value>(
  key: string,
  initialValue: Value,
  options?: {
    serialize?: (val: Value) => string;
    deserialize?: (str: string) => Value;
    subscribe?: (callback: () => void) => () => void;
    replace?: boolean;
  },
) => {
  const locationAtom = atomWithLocation(options);

  const serialize = options?.serialize || JSON.stringify;
  const deserialize =
    options?.deserialize ||
    (safeJSONParse(initialValue) as (str: string) => Value);

  const valueAtom = atom((get) => {
    const location = get(locationAtom);
    const value = location.searchParams?.get(key);
    return value == null ? initialValue : deserialize(value);
  });

  // Create a derived atom that focuses on the specific query parameter
  const queryParamAtom = atom(
    (get) => get(valueAtom),
    (get, set, update: SetStateActionWithReset<Value>) => {
      const nextValue =
        typeof update === 'function'
          ? (update as (prev: Value) => Value | typeof RESET)(get(valueAtom))
          : update;
      const location = get(locationAtom);
      const params = new URLSearchParams(location.searchParams);
      if (nextValue === RESET) {
        params.delete(key);
      } else {
        params.set(key, serialize(nextValue));
      }
      set(locationAtom, {
        ...location,
        searchParams: params,
      });
    },
  );

  return queryParamAtom;
};
