import type { SetStateAction, WritableAtom } from 'jotai';
import { atom } from 'jotai';
import { atomWithLocation } from 'jotai-location';

// Create an atom for managing location state, including query parameters.
const locationAtom = atomWithLocation();

/**
 * Creates a writable Jotai atom to manage a query parameter in the URL.
 *
 * @template T - The type of the query parameter value (e.g., string or number).
 * @param key - The name of the query parameter to manage.
 * @param defaultValue - The default value for the query parameter if not present in the URL.
 * @returns A writable atom for reading and updating the query parameter.
 */
export const atomWithQueryParams = <T>(
  key: string,
  defaultValue: T,
): WritableAtom<T, [SetStateAction<T>], void> => {
  /**
   * Resolves the value of a query parameter based on its type.
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
      return (isNaN(parsed) ? defaultValue : parsed) as T;
    }

    // Otherwise, return the value as a string (or other compatible type).
    return value as T;
  };

  return atom<T, [SetStateAction<T>], void>(
    // Read function: retrieves the current value of the query parameter.
    (get) => {
      const searchParams = get(locationAtom).searchParams;
      const paramValue = searchParams?.get(key);

      // Use the resolver function to handle type casting and defaults.
      return resolveDefaultValue(paramValue);
    },
    // Write function: updates the query parameter in the URL.
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
            (value as (prev: T | undefined) => T)(resolvedDefault),
          );
        } else {
          // Otherwise, use the provided value directly.
          nextValue = String(value);
        }

        // Update the query parameter with the computed value.
        newSearchParams.set(key, nextValue);

        // Return a new location state with the updated query parameters.
        return { ...prev, searchParams: newSearchParams };
      });
    },
  );
};

// Usage
// const pageAtom = atomWithQueryParams('page', 1);
// const userIdAtom = atomWithQueryParams('userId', "1");
// const nameAtom = atomWithQueryParams<string>('name', "John");
