import { useState } from "react";
import heroImg from "./assets/hero.png";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import "./App.css";
import BrokenCup from "./BrokenCup.jsx";
import { ErrorBoundary } from "./ErrorBoundary.jsx";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <h1>Last chapter</h1>
      <ErrorBoundary>
        <BrokenCup />
      </ErrorBoundary>
    </>
  );
}

export default App;
