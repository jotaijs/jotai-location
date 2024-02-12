import { useAtom } from 'jotai';
import React, { StrictMode } from 'react';
import { render } from '@testing-library/react';
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

  it('can override atomOptions', async () => {
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
              setLocation(
                {
                  pathname: '/2',
                },
                { replace: true },
              )
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
    expect(window.history.length).toEqual(2);

    await userEvent.click(getByText('back'));

    await findByText('current pathname in atomWithLocation: /1');
    expect(window.location.pathname).toEqual('/1');
    expect(window.history.length).toEqual(2);
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
