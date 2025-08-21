import { atomWithSearchParams } from 'jotai-location';
import { useAtom } from 'jotai/react';

const oneAtom = atomWithSearchParams('one', 0);
const twoAtom = atomWithSearchParams('two', 0);
const threeAtom = atomWithSearchParams('three', 0);

const Page = () => {
  const [one, setOne] = useAtom(oneAtom);
  const [two, setTwo] = useAtom(twoAtom);
  const [three, setThree] = useAtom(threeAtom);
  return (
    <>
      <div>
        one: {one}, two: {two}, three: {three}
      </div>
      <button
        type="button"
        onClick={() => {
          setOne((c) => c + 1);
          setTwo((c) => c + 1);
          setThree((c) => c + 1);
        }}
      >
        update
      </button>
    </>
  );
};

const App = () => <Page />;

export default App;
