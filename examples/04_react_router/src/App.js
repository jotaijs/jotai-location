import {
  unstable_HistoryRouter as BrowserRouter,
  Routes,
  Route,
  Link,
} from "react-router-dom";
import { atomWithLocation } from "jotai-location";
import { useAtom } from "jotai";
import history from "./routerHistory";
import * as React from "react";

const Route1 = <h1>Hello</h1>;
const Route2 = <h1>World</h1>;
const location = atomWithLocation();
location.onMount = (set) => {
  const callback = (arg) => {
    const searchParams = new URLSearchParams(arg.location.search);
    const loc = { searchParams, ...arg.location };
    console.warn(loc);
    set(loc);
  };
  const unlisten = history.listen(callback);
  callback(history);
  return unlisten;
};

export default function App() {
  const [loc, setLoc] = useAtom(location);
  return (
    <div className="App">
      <BrowserRouter history={history}>
        {loc.pathname}
        <div style={{ display: "flex", gap: "16px", placeContent: "center" }}>
          <Link to={"/1"}> to 1</Link>
          <Link to={"/1/123"}> to 1/123</Link>
          <Link to={"/2"}> to 2</Link>
          <Link to={"/2/123"}> to 2/123</Link>
        </div>
        <Routes>
          <Route path="/1" element={Route1}></Route>
          <Route path="/2" element={Route2}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}
