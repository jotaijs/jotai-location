import {
  unstable_HistoryRouter as UNSTABLE_HistoryRouter,
  Routes,
  Route,
  Link,
} from 'react-router-dom';
import { atomWithLocation } from 'jotai-location';
import { useAtomValue } from 'jotai';
import * as React from 'react';
import history from './routerHistory';

const Route1 = <h1>Hello</h1>;
const Route2 = <h1>World</h1>;
const location = atomWithLocation({
  getLocation: () => ({
    searchParams: new URLSearchParams(history.location.search),
    ...history.location,
  }),
  subscribe: (callback) => history.listen(callback),
});

const App = () => {
  const loc = useAtomValue(location);
  return (
    <div
      className="App"
      style={{
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      {/* @ts-expect-error */}
      <UNSTABLE_HistoryRouter history={history}>
        current pathname in atomWithLocation: &quot;{loc.pathname}&quot;
        <div style={{ display: 'flex', gap: '16px', placeContent: 'center' }}>
          <Link to="/1"> to 1</Link>
          <Link to="/1/123"> to 1/123</Link>
          <Link to="/2"> to 2</Link>
          <Link to="/2/123"> to 2/123</Link>
        </div>
        <Routes>
          <Route path="/1" element={Route1} />
          <Route path="/2" element={Route2} />
        </Routes>
      </UNSTABLE_HistoryRouter>
    </div>
  );
};
export default App;
