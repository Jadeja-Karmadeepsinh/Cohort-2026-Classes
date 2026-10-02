import { useState, useEffect } from 'react';
import useUser from './hooks/useUser';

export function User() {
    const [quote, setQuote] = useState(null);

    // const { data, loading, error } = useUser();
    setQuote(data);

    // useEffect(() => {
    //   async function getUsers() {
    //     const res = await fetch(
    //       `${import.meta.env.VITE_API_URL}/v1/public/quotes?page=1&limit=10&query=human`,
    //     );

    //     const data = await res.json();

    //     console.log(data);
    //     setUser(data);
    //   }

    //   getUsers();
    // }, []);

    return (
        <>
            <div>
                {quote &&
                    quote.data.data.map((user) => (
                        <h1 key={user._id}>{user.content}</h1>
                    ))}
            </div>
        </>
    );
}
