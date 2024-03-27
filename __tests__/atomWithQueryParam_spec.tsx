import { act, renderHook } from '@testing-library/react';
import { Provider, useAtom } from 'jotai';
import { RESET } from 'jotai/utils';

import { atomWithQueryParam } from '../src/atomWithQueryParam';

let pushStateSpy: jest.SpyInstance;
let replaceStateSpy: jest.SpyInstance;

beforeEach(() => {
  pushStateSpy = jest.spyOn(window.history, 'pushState');
  replaceStateSpy = jest.spyOn(window.history, 'replaceState');
});

afterEach(() => {
  pushStateSpy.mockRestore();
  replaceStateSpy.mockRestore();
});

describe('atomWithQueryParam', () => {
  it('should return a default value for the atom if the query parameter is not present', () => {
    const queryParamAtom = atomWithQueryParam('test', 'default');
    const { result } = renderHook(() => useAtom(queryParamAtom), {
      // the provider scopes the atoms to a store so their values dont persist between tests
      wrapper: Provider,
    });
    expect(result.current[0]).toEqual('default');
  });

  it('should sync an atom to a query parameter', () => {
    const queryParamAtom = atomWithQueryParam('test', {
      value: 'default',
    });
    const { result } = renderHook(() => useAtom(queryParamAtom), {
      // the provider scopes the atoms to a store so their values dont persist between tests
      wrapper: Provider,
    });

    act(() => {
      result.current[1]({ value: 'test value' });
    });

    expect(result.current[0]).toEqual({ value: 'test value' });
    expect(
      (window.history.pushState as jest.Mock).mock.calls[0][2].toString(),
    ).toEqual(
      expect.stringContaining('?test=%7B%22value%22%3A%22test+value%22%7D'),
    );
  });

  it('should read an atom from a query parameter', () => {
    const queryParamAtom = atomWithQueryParam('test', {
      value: 'default',
    });
    act(() => {
      window.history.pushState(
        null,
        '',
        '?test=%7B%22value%22%3A%22test+value%22%7D',
      );
    });
    const { result } = renderHook(() => useAtom(queryParamAtom), {
      // the provider scopes the atoms to a store so their values dont persist between tests
      wrapper: Provider,
    });
    expect(result.current[0]).toEqual({ value: 'test value' });
  });

  it('should allow passing custom serialization and deserialization functions', () => {
    const queryParamAtom = atomWithQueryParam('test', 'default', {
      serialize: (val) => val.toUpperCase(),
      deserialize: (str) => str.toLowerCase(),
    });
    const { result } = renderHook(() => useAtom(queryParamAtom), {
      // the provider scopes the atoms to a store so their values dont persist between tests
      wrapper: Provider,
    });

    act(() => {
      result.current[1]('new value');
    });

    expect(result.current[0]).toEqual('new value');
    expect(
      (window.history.pushState as jest.Mock).mock.calls[0][2].toString(),
    ).toEqual(expect.stringContaining('?test=NEW+VALUE'));
  });

  it('should allow resetting the query parameter', () => {
    const queryParamAtom = atomWithQueryParam('test', 'default');
    const { result } = renderHook(() => useAtom(queryParamAtom), {
      // the provider scopes the atoms to a store so their values dont persist between tests
      wrapper: Provider,
    });
    act(() => {
      result.current[1]('new value');
    });
    expect(result.current[0]).toEqual('new value');
    act(() => {
      result.current[1](RESET);
    });
    expect(result.current[0]).toEqual('default');
  });

  it('should allow replacing the search params instead of pushing', () => {
    const queryParamAtom = atomWithQueryParam('test', 'default', {
      replace: true,
    });
    const { result } = renderHook(() => useAtom(queryParamAtom), {
      // the provider scopes the atoms to a store so their values dont persist between tests
      wrapper: Provider,
    });
    act(() => {
      result.current[1]('new value');
    });
    expect(
      // replaceState instead of pushState
      (window.history.replaceState as jest.Mock).mock.calls[0][2].toString(),
    ).toEqual(expect.stringContaining('?test=%22new+value%22'));
  });
});
