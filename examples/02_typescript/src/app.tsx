import React from 'react';
import { useAtom } from 'jotai/react';
import { atomWithLocation } from 'jotai-location';

const locationAtom = atomWithLocation();

const App = () => {
  const [loc, setLoc] = useAtom(locationAtom);
  return (
    <ul>
      <li>
        <button
          type="button"
          style={{
            cursor: 'pointer',
            border: 'none',
            background: 'none',
            fontWeight: loc.pathname === '/' ? 'bold' : 'normal',
          }}
          onClick={() => setLoc((prev) => ({ ...prev, pathname: '/' }))}
        >
          Home
        </button>
      </li>
      <li>
        <button
          type="button"
          style={{
            cursor: 'pointer',
            border: 'none',
            background: 'none',
            fontWeight:
              loc.pathname === '/foo' && !loc.searchParams?.get('bar')
                ? 'bold'
                : 'normal',
          }}
          onClick={() =>
            setLoc((prev) => ({
              ...prev,
              pathname: '/foo',
              searchParams: new URLSearchParams(),
            }))
          }
        >
          Foo
        </button>
      </li>
      <li>
        <button
          type="button"
          style={{
            cursor: 'pointer',
            border: 'none',
            background: 'none',
            fontWeight:
              loc.pathname === '/foo' && loc.searchParams?.get('bar') === '1'
                ? 'bold'
                : 'normal',
          }}
          onClick={() =>
            setLoc((prev) => ({
              ...prev,
              pathname: '/foo',
              searchParams: new URLSearchParams([['bar', '1']]),
            }))
          }
        >
          Foo?bar=1
        </button>
      </li>
    </ul>
  );
};

export default App;
