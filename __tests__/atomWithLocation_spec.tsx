import { useAtom } from 'jotai';
import React, { StrictMode } from 'react';
import { act, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { atomWithLocation } from '../src/index';

describe('atomWithLocation', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
  });

  it('can replace state', async () => {
    const locationAtom = atomWithLocation({ replace: true });

    const Navigation = () => {
      const [location, setLocation] = useAtom(locationAtom);
      return (
        <>
          <div> current pathname in atomWithLocation: {location.pathname} </div>
          <button type="button" onClick={() => window.history.back()}>
            back
          </button>
          <button type="button" onClick={() => setLocation({ pathname: '/1' })}>
            button1
          </button>
          <button
            type="button"
            onClick={() =>
              setLocation({
                pathname: '/2',
              })
            }
          >
            button2
          </button>
        </>
      );
    };

    const { findByText, getByText } = render(
      <StrictMode>
        <Navigation />
      </StrictMode>,
    );

    await findByText('current pathname in atomWithLocation: /');
    expect(window.location.pathname).toEqual('/');
    expect(window.history.length).toEqual(1);

    await userEvent.click(getByText('button1'));

    await findByText('current pathname in atomWithLocation: /1');
    expect(window.location.pathname).toEqual('/1');
    expect(window.history.length).toEqual(1);

    await userEvent.click(getByText('button2'));
    expect(window.location.pathname).toEqual('/2');
    expect(window.history.length).toEqual(1);
  });

  it('can push state', async () => {
    const locationAtom = atomWithLocation({ replace: false });

    const Navigation = () => {
      const [location, setLocation] = useAtom(locationAtom);
      return (
        <>
          <div> current pathname in atomWithLocation: {location.pathname} </div>
          <button type="button" onClick={() => window.history.back()}>
            back
          </button>
          <button type="button" onClick={() => setLocation({ pathname: '/1' })}>
            button1
          </button>
          <button
            type="button"
            onClick={() =>
              setLocation({
                pathname: '/2',
              })
            }
          >
            button2
          </button>
        </>
      );
    };

    const { findByText, getByText } = render(
      <StrictMode>
        <Navigation />
      </StrictMode>,
    );

    await findByText('current pathname in atomWithLocation: /');
    expect(window.location.pathname).toEqual('/');
    expect(window.history.length).toEqual(1);

    await userEvent.click(getByText('button1'));

    await findByText('current pathname in atomWithLocation: /1');
    expect(window.location.pathname).toEqual('/1');
    expect(window.history.length).toEqual(2);

    await userEvent.click(getByText('button2'));

    await findByText('current pathname in atomWithLocation: /2');
    expect(window.location.pathname).toEqual('/2');
    expect(window.history.length).toEqual(3);

    await userEvent.click(getByText('back'));

    await findByText('current pathname in atomWithLocation: /1');
    expect(window.location.pathname).toEqual('/1');
    expect(window.history.length).toEqual(3);
  });

  it('can override atomOptions, from replace=false to replace=true', async () => {
    const locationAtom = atomWithLocation({ replace: false });

    const Navigation = () => {
      const [location, setLocation] = useAtom(locationAtom);
      return (
        <>
          <div> current pathname in atomWithLocation: {location.pathname} </div>
          <button type="button" onClick={() => window.history.back()}>
            back
          </button>
          <button
            type="button"
            onClick={() => setLocation({ pathname: '/123' })}
          >
            buttonWithPush
          </button>
          <button
            type="button"
            onClick={() =>
              setLocation(
                {
                  pathname: '/234',
                },
                { replace: true },
              )
            }
          >
            buttonWithReplace
          </button>
        </>
      );
    };

    const { findByText, getByText } = render(
      <StrictMode>
        <Navigation />
      </StrictMode>,
    );

    const previousTestHistoryLength = 3;

    await act(async () => {
      window.history.pushState(null, '', '/');
    });

    await findByText('current pathname in atomWithLocation: /');
    expect(window.location.pathname).toEqual('/');
    expect(window.history.length).toEqual(previousTestHistoryLength);

    await userEvent.click(getByText('buttonWithPush'));

    await findByText('current pathname in atomWithLocation: /123');
    expect(window.location.pathname).toEqual('/123');
    expect(window.history.length).toEqual(previousTestHistoryLength + 1);

    await userEvent.click(getByText('buttonWithReplace'));

    await findByText('current pathname in atomWithLocation: /234');
    expect(window.location.pathname).toEqual('/234');
    expect(window.history.length).toEqual(previousTestHistoryLength + 1);

    await userEvent.click(getByText('back'));

    await findByText('current pathname in atomWithLocation: /');
    expect(window.location.pathname).toEqual('/');
    expect(window.history.length).toEqual(previousTestHistoryLength + 1);

    // The first click overwrites the history entry we
    // went back from. The history length remains the same.
    await userEvent.click(getByText('buttonWithPush'));

    // The second click adds a new history entry, which now increments the history length.
    await userEvent.click(getByText('buttonWithPush'));

    await findByText('current pathname in atomWithLocation: /123');
    expect(window.location.pathname).toEqual('/123');
    expect(window.history.length).toEqual(previousTestHistoryLength + 2);
  });

  it('can override atomOptions, from replace=true to replace=false', async () => {
    const locationAtom = atomWithLocation({ replace: true });

    const Navigation = () => {
      const [location, setLocation] = useAtom(locationAtom);
      return (
        <>
          <div> current pathname in atomWithLocation: {location.pathname} </div>
          <button type="button" onClick={() => window.history.back()}>
            back
          </button>
          <button
            type="button"
            onClick={() => setLocation({ pathname: '/123' })}
          >
            buttonWithReplace
          </button>
          <button
            type="button"
            onClick={() =>
              setLocation(
                {
                  pathname: '/234',
                },
                { replace: false },
              )
            }
          >
            buttonWithPush
          </button>
        </>
      );
    };

    const { findByText, getByText } = render(
      <StrictMode>
        <Navigation />
      </StrictMode>,
    );

    const previousTestHistoryLength = window.history.length;

    await act(async () => {
      window.history.replaceState(null, '', '/');
    });

    await findByText('current pathname in atomWithLocation: /');
    expect(window.location.pathname).toEqual('/');
    expect(window.history.length).toEqual(previousTestHistoryLength);

    await userEvent.click(getByText('buttonWithReplace'));

    await findByText('current pathname in atomWithLocation: /123');
    expect(window.location.pathname).toEqual('/123');
    expect(window.history.length).toEqual(previousTestHistoryLength);

    await userEvent.click(getByText('buttonWithPush'));

    await findByText('current pathname in atomWithLocation: /234');
    expect(window.location.pathname).toEqual('/234');
    expect(window.history.length).toEqual(previousTestHistoryLength + 1);

    await userEvent.click(getByText('back'));

    await findByText('current pathname in atomWithLocation: /123');
    expect(window.location.pathname).toEqual('/123');
    expect(window.history.length).toEqual(previousTestHistoryLength + 1);

    await userEvent.click(getByText('buttonWithReplace'));

    await findByText('current pathname in atomWithLocation: /123');
    expect(window.location.pathname).toEqual('/123');
    expect(window.history.length).toEqual(previousTestHistoryLength + 1);

    // same replace and push behaviour
    await userEvent.click(getByText('buttonWithPush'));

    await findByText('current pathname in atomWithLocation: /234');
    expect(window.location.pathname).toEqual('/234');
    expect(window.history.length).toEqual(previousTestHistoryLength + 1);

    await userEvent.click(getByText('buttonWithPush'));

    await findByText('current pathname in atomWithLocation: /234');
    expect(window.location.pathname).toEqual('/234');
    expect(window.history.length).toEqual(previousTestHistoryLength + 2);
  });
});

describe('atomWithLocation without window', () => {
  let savedWindow: any;
  beforeEach(() => {
    savedWindow = global.window;
    delete (global as any).window;
  });
  afterEach(() => {
    global.window = savedWindow;
  });

  it('define atomWithLocation', async () => {
    atomWithLocation();
  });
});
