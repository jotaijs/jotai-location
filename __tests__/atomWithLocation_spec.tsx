import { useAtom } from 'jotai';
import React, { StrictMode } from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { atomWithLocation } from '../src/index';

function assertPathNameAndHistoryLength(
  expectedPathname: string,
  expectedHistoryLength: number,
) {
  expect(window.location.pathname).toEqual(expectedPathname);
  expect(window.history.length).toEqual(expectedHistoryLength);
}

function assertHashAndHistoryLength(
  expectedHash: string,
  expectedHistoryLength: number,
) {
  expect(window.location.hash).toEqual(expectedHash);
  expect(window.history.length).toEqual(expectedHistoryLength);
}

async function assertStartState(
  startTestHistoryLength: number,
  findByText: any,
  assert: 'pathname' | 'hash' | 'both' = 'pathname',
) {
  if (assert === 'pathname' || assert === 'both') {
    await findByText('current pathname in atomWithLocation: /');
    assertPathNameAndHistoryLength('/', startTestHistoryLength);
  }
  if (assert === 'hash' || assert === 'both') {
    await findByText('current hash in atomWithLocation: ');
    assertHashAndHistoryLength('', startTestHistoryLength);
  }
}

function clickButtonAndAssertTemplate(localFindByText: any) {
  return async function clickButtonAndAssert(
    target: `button${number}` | 'back' | 'buttonWithReplace' | 'buttonWithPush',
    historyLength: number,
    targetPathName?: string,
    assert: 'pathname' | 'hash' | 'both' = 'pathname',
  ) {
    let expectedPathname: string = '/';
    let expectedHash: string = '';
    if (target === 'buttonWithReplace') {
      expectedPathname = '/123';
      expectedHash = '#tab=1';
    } else if (target === 'buttonWithPush') {
      expectedPathname = '/234';
      expectedHash = '#tab=2';
    } else if (target.startsWith('button')) {
      expectedPathname = `/${target.slice(-1)}`;
      expectedHash = `#tab=${target.slice(-1)}`;
    } else if (target === 'back' && targetPathName) {
      expectedPathname = targetPathName;
    }
    await userEvent.click(await localFindByText(target));
    if (assert === 'pathname') {
      await localFindByText(
        `current pathname in atomWithLocation: ${expectedPathname}`,
      );
      assertPathNameAndHistoryLength(expectedPathname, historyLength);
    }
    if (assert === 'hash') {
      await localFindByText(
        `current hash in atomWithLocation: ${expectedHash}`,
      );
      assertHashAndHistoryLength(expectedHash, historyLength);
    }
    if (assert === 'both') {
      await localFindByText(
        `current pathname in atomWithLocation: ${expectedPathname}`,
      );
      assertPathNameAndHistoryLength(expectedPathname, historyLength);
      await localFindByText(
        `current hash in atomWithLocation: ${expectedHash}`,
      );
      assertHashAndHistoryLength(expectedHash, historyLength);
    }
  };
}

describe('atomWithLocation, pathName', () => {
  beforeEach(() => {
    window.history.pushState(null, '', '/');
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

    const { findByText } = render(
      <StrictMode>
        <Navigation />
      </StrictMode>,
    );

    const clickButtonAndAssert = clickButtonAndAssertTemplate(findByText);
    const startHistoryLength = window.history.length;
    assertStartState(startHistoryLength, findByText);

    await clickButtonAndAssert('button1', startHistoryLength);
    await clickButtonAndAssert('button2', startHistoryLength);
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

    const { findByText } = render(
      <StrictMode>
        <Navigation />
      </StrictMode>,
    );

    const clickButtonAndAssert = clickButtonAndAssertTemplate(findByText);
    const startHistoryLength = window.history.length;
    assertStartState(startHistoryLength, findByText);

    await clickButtonAndAssert('button1', startHistoryLength + 1);
    await clickButtonAndAssert('button2', startHistoryLength + 2);
    await clickButtonAndAssert('back', startHistoryLength + 2, '/1');
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
            onClick={() => setLocation({ pathname: '/234' })}
          >
            buttonWithPush
          </button>
          <button
            type="button"
            onClick={() =>
              setLocation(
                {
                  pathname: '/123',
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

    const { findByText } = render(
      <StrictMode>
        <Navigation />
      </StrictMode>,
    );

    const clickButtonAndAssert = clickButtonAndAssertTemplate(findByText);
    const startHistoryLength = window.history.length;

    assertStartState(startHistoryLength, findByText);

    await clickButtonAndAssert('buttonWithPush', startHistoryLength + 1);
    await clickButtonAndAssert('buttonWithReplace', startHistoryLength + 1);
    await clickButtonAndAssert('back', startHistoryLength + 1, '/');

    // This click overwrites the history entry we
    // went back from. The history length remains the same.
    await clickButtonAndAssert('buttonWithPush', startHistoryLength + 1);

    // The second click adds a new history entry, which now increments the history length.
    await clickButtonAndAssert('buttonWithPush', startHistoryLength + 2);
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

    const { findByText } = render(
      <StrictMode>
        <Navigation />
      </StrictMode>,
    );

    const clickButtonAndAssert = clickButtonAndAssertTemplate(findByText);
    const startTestHistoryLength = window.history.length;
    assertStartState(startTestHistoryLength, findByText);

    await clickButtonAndAssert('buttonWithReplace', startTestHistoryLength);
    await clickButtonAndAssert('buttonWithPush', startTestHistoryLength + 1);
    await clickButtonAndAssert('back', startTestHistoryLength + 1, '/123');
    await clickButtonAndAssert('buttonWithReplace', startTestHistoryLength + 1);
    await clickButtonAndAssert('buttonWithPush', startTestHistoryLength + 1);
    await clickButtonAndAssert('buttonWithPush', startTestHistoryLength + 2);
  });
});

describe('atomWithLocation, hash', () => {
  it('can push state with hash', async () => {
    const locationAtom = atomWithLocation({ replace: false });

    const Navigation = () => {
      const [location, setLocation] = useAtom(locationAtom);
      return (
        <>
          <div> current hash in atomWithLocation: #{location.hash} </div>
          <button type="button" onClick={() => window.history.back()}>
            back
          </button>
          <button type="button" onClick={() => setLocation({ hash: 'tab=1' })}>
            button1
          </button>
          <button
            type="button"
            onClick={() =>
              setLocation({
                hash: 'tab=2',
              })
            }
          >
            button2
          </button>
        </>
      );
    };

    const { findByText } = render(
      <StrictMode>
        <Navigation />
      </StrictMode>,
    );

    const clickButtonAndAssert = clickButtonAndAssertTemplate(findByText);
    const startHistoryLength = window.history.length;
    assertStartState(startHistoryLength, findByText);

    await clickButtonAndAssert(
      'button1',
      startHistoryLength + 1,
      undefined,
      'hash',
    );
    await clickButtonAndAssert(
      'button2',
      startHistoryLength + 2,
      undefined,
      'hash',
    );
  });

  it('can replace state with hash', async () => {
    const locationAtom = atomWithLocation({ replace: true });

    const Navigation = () => {
      const [location, setLocation] = useAtom(locationAtom);
      return (
        <>
          <div> current hash in atomWithLocation: #{location.hash} </div>
          <button type="button" onClick={() => window.history.back()}>
            back
          </button>
          <button type="button" onClick={() => setLocation({ hash: 'tab=1' })}>
            button1
          </button>
          <button
            type="button"
            onClick={() =>
              setLocation({
                hash: 'tab=2',
              })
            }
          >
            button2
          </button>
        </>
      );
    };

    const { findByText } = render(
      <StrictMode>
        <Navigation />
      </StrictMode>,
    );

    const clickButtonAndAssert = clickButtonAndAssertTemplate(findByText);
    const startHistoryLength = window.history.length;
    assertStartState(startHistoryLength, findByText);

    await clickButtonAndAssert(
      'button1',
      startHistoryLength,
      undefined,
      'hash',
    );
    await clickButtonAndAssert(
      'button2',
      startHistoryLength,
      undefined,
      'hash',
    );

    await clickButtonAndAssert('back', startHistoryLength, undefined, 'hash');
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
