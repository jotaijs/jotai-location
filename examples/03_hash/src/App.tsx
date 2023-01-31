import React from 'react';
import { useAtom } from 'jotai/react';
import { atomWithHash } from 'jotai-location';

const countAtom = atomWithHash('count', 1);

const Counter = () => {
  const [count, setCount] = useAtom(countAtom);
  return (
    <div>
      <div>count {count}</div>
      <button type="button" onClick={() => setCount((c) => c + 1)}>
        +1
      </button>
      <p>See the url hash, change it there</p>
    </div>
  );
};

const App = () => <Counter />;

export default App;
