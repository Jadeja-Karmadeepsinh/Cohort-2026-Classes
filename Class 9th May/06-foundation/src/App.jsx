import { useState, useEffect } from 'react';
import { User } from './User.jsx';
import './App.css';
import useUser from './hooks/useUser.js';

function App() {
    // const [data, setData] = useState(null);
    console.log(`${import.meta.env.VITE_API_URL}`);
    const { data, loading, error } = useUser();

    if (loading) {
        return <p>Loading.....</p>;
    }

    if (error) {
        return <p>Error.......</p>;
    }

    return (
        <>
            <h1>Welcome to raw react</h1>
            {/* <User /> */}
            {data &&
                data.data.data.map((d) => <h1 key={d._id}>{d.content}</h1>)}
        </>
    );
}

export default App;
