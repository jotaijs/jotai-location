import type { SetStateAction, WritableAtom } from 'jotai/vanilla';
import { atom } from 'jotai/vanilla';
import { atomWithLocation } from './atomWithLocation';

// Create an atom for managing location state, including search parameters.
const locationAtom = atomWithLocation();

/**
 * Creates an atom that manages a single search parameter.
 *
 * The atom automatically infers the type of the search parameter based on the
 * type of `defaultValue`.
 *
 * The atom's read function returns the current value of the search parameter.
 * The atom's write function updates the search parameter in the URL.
 *
 * @param key - The key of the search parameter.
 * @param defaultValue - The default value of the search parameter.
 * @returns A writable atom that manages the search parameter.
 */
export const atomWithSearchParams = <T>(
  key: string,
  defaultValue: T,
): WritableAtom<T, [SetStateAction<T>], void> => {
  /**
   * Resolves the value of a search parameter based on the type of `defaultValue`.
   *
   * @param value - The raw value from the URL (could be `null` or `undefined`).
   * @returns The resolved value matching the type of `defaultValue`.
   */
  const resolveValue = (value: string | null | undefined): T => {
    // If the value is null or undefined, return the default value.
    if (value === null || value === undefined) {
      return defaultValue;
    }

    // Determine the type of the default value and parse accordingly.
    if (typeof defaultValue === 'number') {
      return Number(value) as T;
    }

    if (typeof defaultValue === 'boolean') {
      return (value === 'true') as T;
    }

    if (typeof defaultValue === 'string') {
      return value as T;
    }

    // If the default value is an object, try to parse it as JSON.
    return JSON.parse(value) as T;
  };

  const parseValue = (value: T): string => {
    if (
      typeof value !== 'number' &&
      typeof value !== 'boolean' &&
      typeof value !== 'string'
    ) {
      // If the value is not a basic type, try to stringify it as JSON.
      return JSON.stringify(value);
    }
    return String(value);
  };

  return atom<T, [SetStateAction<T>], void>(
    // Read function: Retrieves the current value of the search parameter.
    (get) => {
      const { searchParams } = get(locationAtom);

      // Resolve the value using the parsing logic.
      return resolveValue(searchParams?.get(key));
    },
    // Write function: Updates the search parameter in the URL.
    (_, set, value) => {
      set(locationAtom, (prev) => {
        // Create a new instance of URLSearchParams to avoid mutating the original.
        const newSearchParams = new URLSearchParams(prev.searchParams);

        let nextValue;

        if (typeof value === 'function') {
          // If the new value is a function, compute it based on the current value.
          const currentValue = resolveValue(newSearchParams.get(key));
          nextValue = (value as (curr: T) => T)(currentValue);
        } else {
          // Otherwise, use the provided value directly.
          nextValue = value;
        }

        // Update the search parameter with the computed value.
        newSearchParams.set(key, parseValue(nextValue));

        // Return the updated location state with new search parameters.
        return { ...prev, searchParams: newSearchParams };
      });
    },
  );
};
