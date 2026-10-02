import { useState } from "react";

function BrokenCup(props) {
  const [broken, setBroken] = useState(false);

  if (broken) {
    throw new Error("Cup is broken");
  }
  return (
    <div>
      <p>Cup is intact</p>
      <button onClick={() => setBroken(true)}>Break the cup</button>
    </div>
  );
}

export default BrokenCup;
