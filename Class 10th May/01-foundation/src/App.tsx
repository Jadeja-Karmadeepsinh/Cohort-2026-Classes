// import { useRandomUser } from './hooks/userRandomUser.ts';
import * as React from 'react';
import { Counter } from './components/Counter.tsx';

function App() {
//   const { user, fetchUser, isFetching, error } = useRandomUser();

  const [counters, setCounters] = React.useState<number>(5);
  return (
    <>
      {/* <h1>01-foundation</h1> */}
      {/* {new Array(5).fill(null).map(() => <Counter />)} */}
      <button type="button" onClick={() => setCounters(counters => counters + 1)}>Add Counter</button>
      <button type="button" onClick={() => setCounters(counters => counters - 1)} disabled={counters <= 0}>Remove Counter</button>
      {new Array(counters).fill(null).map((_, index) => <Counter key={`counter-${index}`} />)}
      {/* <button type="button" onClick={fetchUser}>
        Fetch random user
      </button>
      {isFetching ? (
        <p>Fetching user...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : user ? (
        <p>
          {user.name.title} {user.name.first} {user.name.last}
        </p>
      ) : (
        <p>No user yet</p>
      )} */}
    </>
  );
}

export default App;