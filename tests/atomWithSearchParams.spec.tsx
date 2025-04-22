import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { useAtom } from 'jotai/react';
import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { atomWithSearchParams } from '../src/index.js';

afterEach(cleanup);

function resetWindow() {
  window.history.pushState(null, '', '/');
  window.location.search = '';
}

describe('atomWithSearchParams', () => {
  beforeEach(() => {
    resetWindow();
  });

  it('handles different value types', async () => {
    const stringAtom = atomWithSearchParams<string>('string', 'default');
    const numberAtom = atomWithSearchParams<number>('number', 0);
    const booleanAtom = atomWithSearchParams<boolean>('boolean', false);

    const Navigation = () => {
      const [stringValue, setStringValue] = useAtom(stringAtom);
      const [numberValue, setNumberValue] = useAtom(numberAtom);
      const [booleanValue, setBooleanValue] = useAtom(booleanAtom);

      return (
        <>
          <div>current searchParam in atomWithSearchParams: {stringValue}</div>
          <div>current searchParam in atomWithSearchParams: {numberValue}</div>
          <div>
            current searchParam in atomWithSearchParams:{' '}
            {booleanValue.toString()}
          </div>
          <button type="button" onClick={() => setStringValue('test')}>
            setString
          </button>
          <button type="button" onClick={() => setNumberValue(42)}>
            setNumber
          </button>
          <button type="button" onClick={() => setBooleanValue(true)}>
            setBoolean
          </button>
        </>
      );
    };

    render(
      <StrictMode>
        <Navigation />
      </StrictMode>,
    );

    await userEvent.click(await screen.findByText('setString'));
    await screen.findByText(
      'current searchParam in atomWithSearchParams: test',
    );
    expect(window.location.search).toContain('string=test');

    await userEvent.click(await screen.findByText('setNumber'));
    await screen.findByText('current searchParam in atomWithSearchParams: 42');
    expect(window.location.search).toContain('number=42');

    await userEvent.click(await screen.findByText('setBoolean'));
    await screen.findByText(
      'current searchParam in atomWithSearchParams: true',
    );
    expect(window.location.search).toContain('boolean=true');
  });

  it('handles function updates', async () => {
    const searchParamAtom = atomWithSearchParams<number>('count', 0);

    const Navigation = () => {
      const [value, setValue] = useAtom(searchParamAtom);
      return (
        <>
          <div>current searchParam in atomWithSearchParams: {value}</div>
          <button type="button" onClick={() => setValue((prev) => prev + 1)}>
            increment
          </button>
        </>
      );
    };

    render(
      <StrictMode>
        <Navigation />
      </StrictMode>,
    );

    await userEvent.click(await screen.findByText('increment'));
    await screen.findByText('current searchParam in atomWithSearchParams: 1');
    expect(window.location.search).toContain('count=1');

    await userEvent.click(await screen.findByText('increment'));
    await screen.findByText('current searchParam in atomWithSearchParams: 2');
    expect(window.location.search).toContain('count=2');
  });
});
