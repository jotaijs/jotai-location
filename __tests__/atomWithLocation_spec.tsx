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

function assertSearchParamAndHistoryLength(
  expectedSearchParams: URLSearchParams,
  expectedHistoryLength: number,
) {
  expect(window.location.search).toEqual(`?${expectedSearchParams.toString()}`);
  expect(window.history.length).toEqual(expectedHistoryLength);
}

async function assertStartState(
  startTestHistoryLength: number,
  findByText: any,
  assert: 'pathname' | 'hash' | 'searchParams' | 'all',
) {
  if (assert === 'pathname' || assert === 'all') {
    await findByText('current pathname in atomWithLocation: /');
    assertPathNameAndHistoryLength('/', startTestHistoryLength);
  }
  if (assert === 'hash' || assert === 'all') {
    await findByText('current hash in atomWithLocation: #');
    assertHashAndHistoryLength('', startTestHistoryLength);
  }
  if (assert === 'searchParams' || assert === 'all') {
    await findByText('current searchParams in atomWithLocation:');
    expect(window.location.search).toEqual('');
    expect(window.history.length).toEqual(startTestHistoryLength);
  }
}

function clickButtonAndAssertTemplate(localFindByText: any) {
  return async function clickButtonAndAssert(
    target: `button${number}` | 'back' | 'buttonWithReplace' | 'buttonWithPush',
    historyLength: number,
    {
      targetPathName,
      targetHash,
      targetSearchParams,
    }: {
      targetPathName?: string;
      targetHash?: string;
      targetSearchParams?: string;
    } = {},
    assert: 'pathname' | 'hash' | 'search' | 'all' = 'pathname',
  ) {
    let expectedPathname: string = '/';
    let expectedHash: string = '';
    let expectedSearchParams = new URLSearchParams();
    if (target === 'buttonWithReplace') {
      expectedPathname = '/123';
      expectedHash = '#tab=1';
      expectedSearchParams.set('tab', '1');
    } else if (target === 'buttonWithPush') {
      expectedPathname = '/234';
      expectedHash = '#tab=2';
      expectedSearchParams.set('tab', '2');
    } else if (target.startsWith('button')) {
      expectedPathname = `/${target.slice(-1)}`;
      expectedHash = `#tab=${target.slice(-1)}`;
      expectedSearchParams.set('tab', target.slice(-1));
    } else if (target === 'back') {
      expectedPathname = targetPathName ?? '';
      expectedHash = `#${targetHash ?? ''}`;
      expectedSearchParams = new URLSearchParams();
      expectedSearchParams.set('tab', targetSearchParams ?? '');
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
      assertHashAndHistoryLength(
        expectedHash === '#' ? '' : expectedHash,
        historyLength,
      );
    }
    if (assert === 'search') {
      await localFindByText(`${expectedSearchParams.toString()}`);
      assertSearchParamAndHistoryLength(expectedSearchParams, historyLength);
    }
    if (assert === 'all') {
      await localFindByText(
        `current pathname in atomWithLocation: ${expectedPathname}`,
      );
      assertPathNameAndHistoryLength(expectedPathname, historyLength);
      await localFindByText(
        `current hash in atomWithLocation: ${expectedHash}`,
      );
      assertHashAndHistoryLength(expectedHash, historyLength);
      await localFindByText(
        `current searchParams in atomWithLocation: ${expectedSearchParams}`,
      );
      assertSearchParamAndHistoryLength(expectedSearchParams, historyLength);
    }
  };
}

const defaultLocation = {
  pathname: '/',
  search: '',
  hash: '',
  state: null,
};

describe('atomWithLocation, pathName', () => {
  beforeEach(() => {
    resetWindow();
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
          <button
            type="button"
            onClick={() => setLocation(defaultLocation, { replace: false })}
          >
            reset-button
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
    await assertStartState(startHistoryLength, findByText, 'pathname');

    await clickButtonAndAssert('button1', startHistoryLength);
    await clickButtonAndAssert('button2', startHistoryLength);

    await userEvent.click(await findByText('reset-button'));
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
          <button
            type="button"
            onClick={() => setLocation(defaultLocation, { replace: false })}
          >
            reset-button
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
    assertStartState(startHistoryLength, findByText, 'pathname');

    await clickButtonAndAssert('button1', startHistoryLength + 1);
    await clickButtonAndAssert('button2', startHistoryLength + 2);
    await clickButtonAndAssert('back', startHistoryLength + 2, {
      targetPathName: '/1',
    });

    await userEvent.click(await findByText('reset-button'));
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
          <button
            type="button"
            onClick={() => setLocation(defaultLocation, { replace: false })}
          >
            reset-button
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

    assertStartState(startHistoryLength, findByText, 'pathname');

    await clickButtonAndAssert('buttonWithPush', startHistoryLength + 1);
    await clickButtonAndAssert('buttonWithReplace', startHistoryLength + 1);
    await clickButtonAndAssert('back', startHistoryLength + 1, {
      targetPathName: '/',
    });

    // This click overwrites the history entry we
    // went back from. The history length remains the same.
    await clickButtonAndAssert('buttonWithPush', startHistoryLength + 1);

    // The second click adds a new history entry, which now increments the history length.
    await clickButtonAndAssert('buttonWithPush', startHistoryLength + 2);

    await userEvent.click(await findByText('reset-button'));
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
          <button
            type="button"
            onClick={() => setLocation(defaultLocation, { replace: false })}
          >
            reset-button
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
    assertStartState(startTestHistoryLength, findByText, 'pathname');

    await clickButtonAndAssert('buttonWithReplace', startTestHistoryLength);
    await clickButtonAndAssert('buttonWithPush', startTestHistoryLength + 1);
    await clickButtonAndAssert('back', startTestHistoryLength + 1, {
      targetPathName: '/123',
    });
    await clickButtonAndAssert('buttonWithReplace', startTestHistoryLength + 1);
    await clickButtonAndAssert('buttonWithPush', startTestHistoryLength + 1);
    await clickButtonAndAssert('buttonWithPush', startTestHistoryLength + 2);

    await userEvent.click(await findByText('reset-button'));
  });
});

describe('atomWithLocation, hash', () => {
  beforeEach(() => {
    resetWindow();
  });

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
          <button
            type="button"
            onClick={() => setLocation(defaultLocation, { replace: false })}
          >
            reset-button
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
    assertStartState(startHistoryLength, findByText, 'hash');

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

    await userEvent.click(await findByText('reset-button'));
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
          <button
            type="button"
            onClick={() => setLocation(defaultLocation, { replace: false })}
          >
            reset-button
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
    assertStartState(startHistoryLength, findByText, 'hash');

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

    await clickButtonAndAssert(
      'back',
      startHistoryLength,
      { targetHash: '' },
      'hash',
    );

    await userEvent.click(await findByText('reset-button'));
  });
});

function resetWindow() {
  window.history.pushState(null, '', '/');
  window.location.search = '';
  window.location.hash = '';
}

describe('atomWithLocation, searchParams', () => {
  beforeEach(() => {
    resetWindow();
  });
  it('can push state with searchParams', async () => {
    const locationAtom = atomWithLocation({ replace: false });

    const Navigation = () => {
      const [location, setLocation] = useAtom(locationAtom);
      const tab1Params = new URLSearchParams();
      tab1Params.set('tab', '1');
      const tab2Params = new URLSearchParams();
      tab2Params.set('tab', '2');

      return (
        <>
          <div>
            current searchParams in atomWithLocation:
            <div>{location.searchParams?.toString()}</div>
          </div>
          <button type="button" onClick={() => window.history.back()}>
            back
          </button>
          <button
            type="button"
            onClick={() => setLocation({ searchParams: tab1Params })}
          >
            button1
          </button>
          <button
            type="button"
            onClick={() => setLocation({ searchParams: tab2Params })}
          >
            button2
          </button>
          <button
            type="button"
            onClick={() => setLocation(defaultLocation, { replace: false })}
          >
            reset-button
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
    await assertStartState(startHistoryLength, findByText, 'searchParams');
    await clickButtonAndAssert(
      'button1',
      startHistoryLength + 1,
      undefined,
      'search',
    );
    await clickButtonAndAssert(
      'button2',
      startHistoryLength + 2,
      undefined,
      'search',
    );

    await userEvent.click(await findByText('reset-button'));
  });

  it('can replace state with searchParams', async () => {
    const locationAtom = atomWithLocation({ replace: true });

    const Navigation = () => {
      const [location, setLocation] = useAtom(locationAtom);
      const tab1Params = new URLSearchParams();
      tab1Params.set('tab', '1');
      const tab2Params = new URLSearchParams();
      tab2Params.set('tab', '2');

      return (
        <>
          <div>current searchParams in atomWithLocation:</div>
          <div>{location.searchParams?.toString()}</div>
          <button type="button" onClick={() => window.history.back()}>
            back
          </button>
          <button
            type="button"
            onClick={() => setLocation({ searchParams: tab1Params })}
          >
            button1
          </button>
          <button
            type="button"
            onClick={() => setLocation({ searchParams: tab2Params })}
          >
            button2
          </button>
          <button
            type="button"
            onClick={() => setLocation(defaultLocation, { replace: false })}
          >
            reset-button
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
    assertStartState(startHistoryLength, findByText, 'searchParams');

    await clickButtonAndAssert(
      'button1',
      startHistoryLength,
      undefined,
      'search',
    );
    await clickButtonAndAssert(
      'button2',
      startHistoryLength,
      undefined,
      'search',
    );

    await clickButtonAndAssert(
      'back',
      startHistoryLength,
      { targetSearchParams: '2' },
      'search',
    );

    await userEvent.click(await findByText('reset-button'));
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
