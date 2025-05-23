import { StrictMode, useEffect, useMemo, useState } from 'react';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { useAtom } from 'jotai/react';
import { RESET } from 'jotai/vanilla/utils';
import { atomWithHash } from '../src/index.js';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

function resetWindow() {
  window.history.pushState(null, '', '/');
  window.location.search = '';
  window.location.hash = '';
}

afterEach(cleanup);

describe('atomWithHash', () => {
  beforeEach(() => {
    resetWindow();
  });

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

    render(
      <StrictMode>
        <Counter />
      </StrictMode>,
    );

    await screen.findByText('count: 1');

    fireEvent.click(screen.getByText('button'));
    await screen.findByText('count: 2');
    expect(window.location.hash).toEqual('#count=2');

    window.location.hash = 'count=3';
    await screen.findByText('count: 3');

    fireEvent.click(screen.getByText('reset'));
    await screen.findByText('count: 1');
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

    render(
      <StrictMode>
        <Counter />
      </StrictMode>,
    );

    await screen.findByText('visible');

    fireEvent.click(screen.getByText('button'));

    await waitFor(() => {
      expect(screen.queryByText('visible')).toBeNull();
    });

    expect(window.location.hash).toEqual('#isVisible=false');

    fireEvent.click(screen.getByText('button'));
    await screen.findByText('visible');
    expect(window.location.hash).toEqual('#isVisible=true');

    fireEvent.click(screen.getByText('button'));

    fireEvent.click(screen.getByText('reset'));
    await screen.findByText('visible');
    expect(window.location.hash).toEqual('');
  });

  it('keeping current path', async () => {
    const countAtom = atomWithHash('count', 1, { setHash: 'replaceState' });

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

    render(
      <StrictMode>
        <Counter />
      </StrictMode>,
    );

    window.history.pushState(null, '', '/?q=foo');

    fireEvent.click(screen.getByText('button'));
    await screen.findByText('count: 2');
    await waitFor(() => {
      expect(window.location.pathname).toEqual('/');
      expect(window.location.search).toEqual('?q=foo');
      expect(window.location.hash).toEqual('#count=2');
    });

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
    window.history.back();
    await waitFor(() => {
      expect(window.location.pathname).toEqual('/');
      expect(window.location.search).toEqual('');
      expect(window.location.hash).toEqual('');
    });
  });

  it('keeping current path only for one set', async () => {
    const countAtom = atomWithHash('count', 0);

    const Counter = () => {
      const [count, setCount] = useAtom(countAtom);
      useEffect(() => {
        setCount(1, { setHash: 'replaceState' });
      }, []);
      return (
        <>
          <div>count: {count}</div>
          <button type="button" onClick={() => setCount((c) => c + 1)}>
            button
          </button>
        </>
      );
    };

    window.history.pushState(null, '', '/?q=foo');
    render(
      <StrictMode>
        <Counter />
      </StrictMode>,
    );

    await screen.findByText('count: 1');
    await waitFor(() => {
      expect(window.location.pathname).toEqual('/');
      expect(window.location.search).toEqual('?q=foo');
      expect(window.location.hash).toEqual('#count=1');
    });
    fireEvent.click(screen.getByText('button'));
    await screen.findByText('count: 2');
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
    window.history.back();
    await waitFor(() => {
      expect(window.location.pathname).toEqual('/');
      expect(window.location.search).toEqual('?q=foo');
      expect(window.location.hash).toEqual('#count=1');
    });
    window.history.back();
    await waitFor(() => {
      expect(window.location.pathname).toEqual('/');
      expect(window.location.search).toEqual('');
      expect(window.location.hash).toEqual('');
    });
  });

  it('should optimize value to prevent unnecessary re-renders', async () => {
    const paramAHashAtom = atomWithHash('paramA', ['paramA']);
    const paramBHashAtom = atomWithHash('paramB', ['paramB']);
    const ParamInput = ({
      paramAMockFn,
      paramBMockFn,
    }: {
      paramAMockFn: ReturnType<typeof vi.fn>;
      paramBMockFn: ReturnType<typeof vi.fn>;
    }) => {
      const [paramA, setParamA] = useAtom(paramAHashAtom);
      const [paramB, setParamB] = useAtom(paramBHashAtom);

      useMemo(() => paramAMockFn(), [paramA]);
      useMemo(() => paramBMockFn(), [paramB]);

      return (
        <>
          <input
            value={paramA[0]}
            onChange={(e) => setParamA([e.target.value])}
            aria-label="a"
          />
          <input
            value={paramB[0]}
            onChange={(e) => setParamB([e.target.value])}
            aria-label="b"
          />
        </>
      );
    };

    const paramAMockFn = vi.fn();
    const paramBMockFn = vi.fn();
    const user = userEvent.setup();

    render(
      <StrictMode>
        <ParamInput paramAMockFn={paramAMockFn} paramBMockFn={paramBMockFn} />
      </StrictMode>,
    );

    await user.type(screen.getByLabelText('a'), '1');

    // StrictMode in React 18 calls useMemo twice, so we're accounting for 2 extra useMemo calls
    await waitFor(() => expect(paramAMockFn).toHaveBeenCalledTimes(4));
    expect(paramBMockFn).toHaveBeenCalledTimes(2);

    await user.type(screen.getByLabelText('b'), '1');
    await waitFor(() => expect(paramBMockFn).toHaveBeenCalledTimes(4));
  });

  it('sets initial value from hash', async () => {
    window.location.hash = '#count=2';
    const countAtom = atomWithHash('count', 0);

    const Counter = () => {
      const [count] = useAtom(countAtom);
      const [countWasZero, setCountWasZero] = useState(false);

      useEffect(() => {
        if (count === 0) {
          setCountWasZero(true);
        }
      }, [count]);
      return (
        <>
          <div>count: {count}</div>
          <div>count was zero: {countWasZero.toString()}</div>
        </>
      );
    };

    const { findByText } = render(
      <StrictMode>
        <Counter />
      </StrictMode>,
    );

    await findByText('count: 2');
    await findByText('count was zero: false');
  });
});

describe('atomWithHash without window', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let savedWindow: any;
  beforeEach(() => {
    savedWindow = global.window;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (global as any).window;
  });
  afterEach(() => {
    global.window = savedWindow;
  });

  it('define atomWithHash', async () => {
    atomWithHash('count', 1);
  });
});
