import type { SetStateAction, WritableAtom } from 'jotai/vanilla';
import { atom } from 'jotai/vanilla';
import {
  atomWithLocation,
  type Options,
  type Location,
} from './atomWithLocation.js';

import { warning } from './utils/logger.js';

const generateApplyLocation =
  (key: string) =>
  (location: Location, options?: { replace?: boolean }): void => {
    const url = new URL(window.location.href);
    if ('pathname' in location) {
      url.pathname = location.pathname;
    }
    if ('searchParams' in location) {
      const existingParams = new URLSearchParams(url.search);
      const newParams = location.searchParams;

      existingParams.set(key, newParams.get(key) ?? '');
      url.search = existingParams.toString();
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

/**
 * Creates an atom that manages a single search parameter.
 *
 * The atom automatically infers the type of the search parameter based on the
 * type of `defaultValue`.
 *
 * The atom's read function returns the current value of the search parameter.
 * The atom's write function updates the search parameter in the URL.
 */

// Function overloads for better type safety
export function atomWithSearchParams(
  key: string,
  defaultValue: string,
  options?: Options<Location>,
): WritableAtom<string, [SetStateAction<string>], void>;

export function atomWithSearchParams(
  key: string,
  defaultValue: number,
  options?: Options<Location>,
): WritableAtom<number, [SetStateAction<number>], void>;

export function atomWithSearchParams(
  key: string,
  defaultValue: boolean,
  options?: Options<Location>,
): WritableAtom<boolean, [SetStateAction<boolean>], void>;

// Implementation
export function atomWithSearchParams<T extends string | number | boolean>(
  key: string,
  defaultValue: T,
  options?: Options<Location>,
): WritableAtom<T, [SetStateAction<T>], void> {
  // Create an atom for managing location state, including search parameters.
  const locationAtom = atomWithLocation({
    ...options,
    applyLocation: options?.applyLocation ?? generateApplyLocation(key),
  });

  /**
   * Resolves the value of a search parameter based on the type of `defaultValue`.
   *
   * @param value - The raw value from the URL (could be `null` or `undefined`).
   * @returns The resolved value matching the type of `defaultValue`.
   */
  const resolveValue = (value: string | null | undefined): T => {
    // If the value is null, undefined, or not a string, return the default value.
    if (value === null || value === undefined) {
      return defaultValue;
    }

    // Determine the type of the default value and parse accordingly.
    if (typeof defaultValue === 'number') {
      if (value === '') {
        warning(
          `Empty string provided for key "${key}". Falling back to default value.`,
        );
        return defaultValue;
      }

      const parsed = Number(value);
      if (!Number.isNaN(parsed)) {
        return parsed as T;
      }

      warning(`Expected a number for key "${key}", got "${value}".`);
      return defaultValue;
    }

    // If the default value is a boolean, check if the value is `true` or `false`.
    if (typeof defaultValue === 'boolean') {
      if (value === 'true') return true as T;
      if (value === 'false') return false as T;

      warning(`Expected a boolean for key "${key}", got "${value}".`);
      return defaultValue;
    }

    if (typeof defaultValue === 'string') {
      return value as T;
    }

    // Fallback to default value for unsupported types
    warning(`Unsupported defaultValue type for key "${key}".`);
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

    warning(`Unsupported value type for key "${key}":`, typeof value);
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

        let nextValue: T;

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
}
