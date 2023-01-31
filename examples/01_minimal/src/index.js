import React from 'react';
import { createRoot } from 'react-dom/client';
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
          onClick={() => setLoc({ pathname: '/' })}
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
            fontWeight: loc.pathname === '/foo' ? 'bold' : 'normal',
          }}
          onClick={() => setLoc({ pathname: '/foo' })}
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
            fontWeight: loc.pathname === '/foo/bar' ? 'bold' : 'normal',
          }}
          onClick={() => setLoc({ pathname: '/foo/bar' })}
        >
          Foo/Bar
        </button>
      </li>
    </ul>
  );
};

createRoot(document.getElementById('app')).render(<App />);
