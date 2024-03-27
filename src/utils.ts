import { RESET } from 'jotai/vanilla/utils';

export type SetStateActionWithReset<Value> =
  | Value
  | typeof RESET
  | ((prev: Value) => Value | typeof RESET);

export const safeJSONParse = (initialValue: unknown) => (str: string) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return initialValue;
  }
};