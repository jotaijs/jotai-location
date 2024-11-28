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
    // If the value is null, undefined, or not a string, return the default value.
    if (value === null || value === undefined || typeof value !== 'string') {
      return defaultValue;
    }

    try {
      // Determine the type of the default value and parse accordingly.
      if (typeof defaultValue === 'number') {
        if (value === '') {
          console.warn(
            `Empty string provided for key "${key}". Falling back to default value.`,
          );
          return defaultValue;
        }

        const parsed = Number(value);
        if (!Number.isNaN(parsed)) {
          return parsed as T;
        }

        console.warn(`Expected a number for key "${key}", got "${value}".`);
        return defaultValue;
      }

      // If the default value is a boolean, check if the value is `true` or `false`.
      if (typeof defaultValue === 'boolean') {
        if (value === 'true') return true as T;
        if (value === 'false') return false as T;

        console.warn(`Expected a boolean for key "${key}", got "${value}".`);
        return defaultValue;
      }

      if (typeof defaultValue === 'string') {
        return value as T;
      }

      // Handle object types (assume JSON if defaultValue is an object)
      if (typeof defaultValue === 'object') {
        const parsed = JSON.parse(value);
        if (parsed && typeof parsed === 'object') {
          return parsed as T;
        }
        console.warn(`Expected an object for key "${key}", got "${value}".`);
        return defaultValue;
      }
    } catch (err) {
      console.error(`Failed to resolve value for key "${key}":`, err);
      return defaultValue;
    }

    // Fallback to default value for unsupported types
    console.warn(`Unsupported defaultValue type for key "${key}".`);
    return defaultValue;
  };

  /**
   * Converts the value into a string for use in the URL.
   *
   * Includes runtime type validation to ensure only compatible types are passed.
   *
   * @param value - The value to be serialized.
   * @returns The stringified value.
   */
  const parseValue = (value: T): string => {
    if (
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      typeof value === 'string'
    ) {
      return String(value);
    }

    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch (err) {
        console.error(`Failed to stringify object for key "${key}":`, err);
        throw new Error(`Cannot serialize value for key "${key}".`);
      }
    }

    console.warn(`Unsupported value type for key "${key}":`, typeof value);
    throw new Error(`Unsupported value type for key "${key}".`);
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
