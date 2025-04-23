import { atomWithSearchParams } from 'jotai-location';
import { useAtom } from 'jotai/react';

const pageAtom = atomWithSearchParams<number>('page', 1);

const Page = () => {
  const [page, setPage] = useAtom(pageAtom);
  return (
    <div>
      <h1>Search Params Example</h1>
      <div>Page {page}</div>
      <button type="button" onClick={() => setPage((c) => c + 1)}>
        +1
      </button>
      <p>See the url hash, change it there</p>
    </div>
  );
};

const App = () => <Page />;

export default App;
