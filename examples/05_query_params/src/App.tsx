import { atomWithQueryParams } from 'jotai-location';
import { useAtom } from 'jotai/react';
import React from 'react';

const pageAtom = atomWithQueryParams('page', 1);

const Page = () => {
  const [Page, setPage] = useAtom(pageAtom);
  return (
    <div>
      <div>Page {Page}</div>
      <button type="button" onClick={() => setPage((c) => c + 1)}>
        +1
      </button>
      <p>See the url hash, change it there</p>
    </div>
  );
};

const App = () => <Page />;

export default App;
