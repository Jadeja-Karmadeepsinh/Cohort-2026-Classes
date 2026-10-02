import { useState, useEffect } from 'react';

export default function useUser() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(
            `${import.meta.env.VITE_API_URL}/v1/public/quotes?page=1&limit=10&query=human`
        )
            .then((respose) => {
                if (!respose.ok) {
                    throw new Error('Network response was not ok');
                }
                return respose.json();
            })
            .then((data) => {
                setData(data);
                setLoading(false);
            })
            .catch((error) => {
                setError(error);
                setLoading(false);
            });
    }, []);

    return { data, loading, error };
}
