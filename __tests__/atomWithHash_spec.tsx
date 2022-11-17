import React, { StrictMode } from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { useAtom } from 'jotai';
import { RESET } from 'jotai/utils';
import { atomWithHash } from '../src/index';

describe('atomWithHash', () => {
  it('simple count', async () => {
    const countAtom = atomWithHash('count', 1);

    const Counter = () => {
      const [count, setCount] = useAtom(countAtom);
      return (
        <>
          <div>count: {count}</div>
          <button type="button" onClick={() => setCount((c) => c + 1)}>
            button
          </button>
          <button type="button" onClick={() => setCount(RESET)}>
            reset
          </button>
        </>
      );
    };

    const { findByText, getByText } = render(
      <StrictMode>
        <Counter />
      </StrictMode>,
    );

    await findByText('count: 1');

    fireEvent.click(getByText('button'));
    await findByText('count: 2');
    expect(window.location.hash).toEqual('#count=2');

    window.location.hash = 'count=3';
    await findByText('count: 3');

    fireEvent.click(getByText('reset'));
    await findByText('count: 1');
    expect(window.location.hash).toEqual('');
  });

  it('returning reset from state dispatcher', async () => {
    const isVisibleAtom = atomWithHash('isVisible', true);

    const Counter = () => {
      const [isVisible, setIsVisible] = useAtom(isVisibleAtom);
      return (
        <>
          {isVisible && <div id="visible">visible</div>}
          <button type="button" onClick={() => setIsVisible((prev) => !prev)}>
            button
          </button>
          <button type="button" onClick={() => setIsVisible(RESET)}>
            reset
          </button>
        </>
      );
    };

    const { findByText, getByText, queryByText } = render(
      <StrictMode>
        <Counter />
      </StrictMode>,
    );

    await findByText('visible');

    fireEvent.click(getByText('button'));

    await waitFor(() => {
      expect(queryByText('visible')).toBeNull();
    });

    expect(window.location.hash).toEqual('#isVisible=false');

    fireEvent.click(getByText('button'));
    await findByText('visible');
    expect(window.location.hash).toEqual('#isVisible=true');

    fireEvent.click(getByText('button'));

    fireEvent.click(getByText('reset'));
    await findByText('visible');
    expect(window.location.hash).toEqual('');
  });

  it('keeping current path', async () => {
    const countAtom = atomWithHash('count', 1, { replaceState: true });

    const Counter = () => {
      const [count, setCount] = useAtom(countAtom);
      return (
        <>
          <div>count: {count}</div>
          <button type="button" onClick={() => setCount((c) => c + 1)}>
            button
          </button>
        </>
      );
    };

    const { findByText, getByText } = render(
      <StrictMode>
        <Counter />
      </StrictMode>,
    );

    window.history.pushState(null, '', '/?q=foo');

    fireEvent.click(getByText('button'));
    await findByText('count: 2');
    expect(window.location.pathname).toEqual('/');
    expect(window.location.search).toEqual('?q=foo');
    expect(window.location.hash).toEqual('#count=2');

    window.history.pushState(null, '', '/another');
    await waitFor(() => {
      expect(window.location.pathname).toEqual('/another');
    });

    window.history.back();
    await waitFor(() => {
      expect(window.location.pathname).toEqual('/');
      expect(window.location.search).toEqual('?q=foo');
      expect(window.location.hash).toEqual('#count=2');
    });
  });
});
