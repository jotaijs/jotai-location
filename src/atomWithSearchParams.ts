import type { SetStateAction, WritableAtom } from 'jotai/vanilla';
import { atom } from 'jotai/vanilla';
import { atomWithLocation } from './atomWithLocation';

// Create an atom for managing location state, including search parameters.
const locationAtom = atomWithLocation();

/**
 * Creates a writable Jotai atom to manage a search parameter in the URL.
 *
 * @template T - The type of the s parameter value (e.g., string or number).
 * @param key - The name of the search parameter to manage.
 * @param defaultValue - The default value for the search parameter if not present in the URL.
 * @returns A writable atom for reading and updating the search parameter.
 */
export const atomWithSearchParams = <T>(
  key: string,
  defaultValue: T,
): WritableAtom<T, [SetStateAction<T>], void> => {
  /**
   * Resolves the value of a search parameter based on its type.
   *
   * @param value - The raw string value from the URL (or `null` if absent).
   * @returns The resolved value cast to type `T`.
   */
  const resolveDefaultValue = (value: string | null | undefined): T => {
    // If the value is null or undefined, return the default value.
    if (value === null || value === undefined) {
      return defaultValue;
    }

    // If the default value is a number, attempt to parse the value as a number.
    if (typeof defaultValue === 'number') {
      const parsed = Number(value);
      return (Number.isNaN(parsed) ? defaultValue : parsed) as T;
    }

    // Otherwise, return the value as a string (or other compatible type).
    return value as T;
  };

  return atom<T, [SetStateAction<T>], void>(
    // Read function: retrieves the current value of the search parameter.
    (get) => {
      const { searchParams } = get(locationAtom);
      const paramValue = searchParams?.get(key);

      // Use the resolver function to handle type casting and defaults.
      return resolveDefaultValue(paramValue);
    },
    // Write function: updates the search parameter in the URL.
    (_, set, value) => {
      set(locationAtom, (prev) => {
        // Clone the current search parameters to avoid mutating the original object.
        const newSearchParams = new URLSearchParams(prev.searchParams);
        const currentValue = newSearchParams.get(key);

        let nextValue: string;

        if (typeof value === 'function') {
          // If the new value is a function, compute it based on the current value.
          const resolvedDefault = resolveDefaultValue(currentValue);

          nextValue = String(
            (value as (curr: T | undefined) => T)(resolvedDefault),
          );
        } else {
          // Otherwise, use the provided value directly.
          nextValue = String(value);
        }

        // Update the search parameter with the computed value.
        newSearchParams.set(key, nextValue);

        // Return a new location state with the updated search parameters.
        return { ...prev, searchParams: newSearchParams };
      });
    },
  );
};
